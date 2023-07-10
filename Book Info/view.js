const READING_SPEEDS_WPM = [150, 300];
const CALIBRE_LIBRARY = "Calibre";

const page = dv.current();
const book = page.book;
const bookEditionSelected = book.editions[0];

const summaryTable = [
	["Title", book.title],
	["Author(s)", book.authors.join(", ")],
	["Edition", bookEditionSelected.label],
];

const statsPages = dv.array(book.editions).stats.pages.where(x => x)[0];
const statsWords = dv.array(book.editions).stats.words.where(x => x)[0];

if(statsPages || statsWords) {
	summaryTable.push(["---", "---"]);
}
if(statsPages) {
	summaryTable.push(["Total pages", statsPages.toLocaleString()]);
	if(statsWords) {
		summaryTable.push(["Words per page", Math.round(statsWords / statsPages)]);
	}
}
if(statsWords) {
	summaryTable.push(["Total words", statsWords.toLocaleString()])
	const speedMin = Math.min(...READING_SPEEDS_WPM);
	const speedMax = Math.max(...READING_SPEEDS_WPM);
	const timeMin = Math.floor(statsWords / (speedMax * 60));
	const timeMax = Math.ceil(statsWords / (speedMin * 60))
	summaryTable.push(["Time to read",
		`${timeMin}-${timeMax} hours at ${speedMin}-${speedMax} wpm`
	])
}

summaryTable.push(["---", "---"]);

// {label: {("start"|"finish"): timestamp_string|[timestamp_string]}}
const readingTimeline = Object.getOwnPropertyNames(
	page
).map(k => {
	const m = /^(Start|Finish)ed Reading\s*(.*)/.exec(k);
	if(m == null) {
		return null;
	}
	return [m[1], m[2], page[k]];
}).filter(
	x => x
).reduce(
	((result, [startOrFinish, label, date]) => {
		if(!result.hasOwnProperty(label)) {
			result[label] = {start: null, finish:null};
		}
		result[label][startOrFinish.toLowerCase()] = Array.isArray(date) ? date : [date];
		return result;
	}),
	{}
);

for(const [label, times] of Object.entries(readingTimeline)) {
	const formatDate = d => d.toLocaleString({dateStyle: "medium"});
	const formatDuration = d => d.shiftTo("days").toHuman({listStyle: "short", unitDisplay: "short"})

	times.start?.sort();
	times.finish?.sort();

	while(times.start?.length) {
		const timeStart = times.start.shift();
		const timeFinish = times.finish?.length ? times.finish.shift() : null;
		if(timeStart && timeFinish) {
			summaryTable.push([`Read: ${label}`,
				`${formatDate(timeStart)} to ${formatDate(timeFinish)} (${formatDuration(timeFinish.diff(timeStart))}; ${timeFinish.toRelativeCalendar({unit: "days"})})`
			])
		} else if(timeStart) {
			summaryTable.push([`Started reading: ${label}`, `${timeStart.toRelativeCalendar({unit: "days"})}`]);
		} else if(timeFinish){
			summaryTable.push([`Finished reading: ${label}`,
				`${formatDate(timeFinish)} (${timeFinish.toRelativeCalendar({unit: "days"})})`
			]);
		}
	}
}

dv.el("span", "", {cls: "next-table-no-header"});
dv.table(["", ""], summaryTable);


const references = [];

function isObsidianMobile() {
	// Incidentally, in the mobile app, the Buffer API is not available.
	return typeof this["Buffer"] === "undefined";
}

if(!isObsidianMobile()) {
	//TODO:vruyr Rethink the Calibre search. Perhaps search all the identifier of all editions.
	const firstId = bookEditionSelected.identifiers[0];
	const calibreSearch = `identifiers:"=${firstId.type}:${firstId.id}"`;
	const l = new Buffer(CALIBRE_LIBRARY).toString("hex");
	const q = new Buffer(calibreSearch).toString("hex");
	references.push(`- [Open in Calibre](calibre://search/_hex_-${l}?eq=${q})`);
}

for(const e of book.editions) {
	const editionReferences = (
		e.identifiers.filter(
			i => i.type === "url" && i.id
		).map(
			i => `[${i.label}](${i.id})`
		)
	).join("\n\t- ");
	if(editionReferences) {
		references.push(`- ${e.label || "(blank)"} Edition\n\t- ` + editionReferences);
	}
}

if(references.length) {
	dv.paragraph("References");
	dv.paragraph(references.join("\n"));
}
