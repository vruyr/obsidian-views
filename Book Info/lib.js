const READING_SPEEDS_WPM = [150, 300];
const CALIBRE_LIBRARY = "Calibre";
const PROGRESS_LOG_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const PROGRESS_LOG_VAL_REGEX = /^\s*(?:(?:on\s*)?page)?\s*(?<page>\d+)\s*\/\s*(?<total>\d+)(?:(?!\d)[\s-:]*(?<note>.*))?\s*$/i;

function makeArray(o) {
	return Array.isArray(o) ? o : [o]
}

function ProgressLog(params) {
	Object.assign(this, params);
}

ProgressLog.prototype.percentage = function() {
	return this.page / this.total;
}

ProgressLog.prototype.pctstr = function() {
	return this.percentage().toLocaleString(undefined, {style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1});
}

const FancyArrayPrototype = Object.create(Array.prototype, {
	first: {
		enumerable: false,
		configurable: false,
		get: function() {
			return this[0];
		},
	},
	last: {
		enumerable: false,
		configurable: false,
		get: function() {
			return this[this.length - 1];
		},
	},
});

function getProgressLogs(page) {
	const resultFlat = Object.entries(
		page
	).flatMap(([k, v]) => {
		if(!PROGRESS_LOG_KEY_REGEX.test(k)) {
			return [];
		}
		k = dv.date(k);
		v = makeArray(v).flatMap(x => {
			const m = PROGRESS_LOG_VAL_REGEX.exec(x);
			if(!m) {
				return [];
			}
			return m.groups;
		});
		if(!v.length) {
			return [];
		}
		v = v.reduce((a, b) => ((a.page/a.total) < (b.page/b.total) ? b : a));
		return [new ProgressLog(Object.assign({date: k}, v))];
	}).sort((a, b) => (
		a.date.valueOf() - b.date.valueOf() || a.percentage() - b.percentage()
	));

	if(resultFlat.length < 2) {
		return [resultFlat]
	}

	const result = Object.create(FancyArrayPrototype);
	result.push(Object.create(FancyArrayPrototype));
	result.last.push(resultFlat[0]);

	for(let i = 1; i < resultFlat.length; i++) {
		if(resultFlat[i - 1].percentage() > resultFlat[i].percentage()) {
			result.push(Object.create(FancyArrayPrototype));
		}
		result.last.push(resultFlat[i]);
	}

	return result;
}

function isObsidianMobile() {
	// Incidentally, in the mobile app, the Buffer API is not available.
	return typeof this["Buffer"] === "undefined";
}

function formatDate(d) {
	return d.toFormat(dv.settings.defaultDateFormat);
}

function formatDuration(d) {
	return d.shiftTo("days").toHuman({listStyle: "short", unitDisplay: "short"});
}

function formatDateRange(start, end, options) {
	options = Object.assign({
		showRelativeStart: false,
		showRelativeEnd: false
	}, options);

	if(start.valueOf() === end.valueOf()) {
		return `on ${formatDate(start)} (${start.toRelativeCalendar({unit: "days"})})`;
	}

	let result = [
		"in ", formatDuration(end.diff(start)),
		" from ", formatDate(start),
	];

	if(options.showRelativeStart) {
		result.push(` (${start.toRelativeCalendar({unit: "days"})})`);
	}
	result.push(" to ");
	result.push(formatDate(end));

	if(options.showRelativeEnd) {
		result.push(` (${end.toRelativeCalendar({unit: "days"})})`);
	}
	return result.join("");
}

return {
	READING_SPEEDS_WPM,
	CALIBRE_LIBRARY,
	getProgressLogs,
	isObsidianMobile,
	formatDateRange,
	formatDate,
	formatDuration,
}
