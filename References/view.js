const asynctools = (new Function("dv", await dv.io.load("Views/Library/asynctools.js")))(dv);


async function main() {
	const currentPage = await asynctools.waitForCurrentPage();
	const currentPageDate = dv.date(currentPage.file.name);

	const pagesReferring = dv.pages().where(
		p => (
			p.file.path !== currentPage.file.path
			&&
			(
				p.file.outlinks.path.includes(currentPage.file.path)
				||
				pageHasFieldsForDay(p, currentPageDate)
			)
		)
	).map(
		p => [p.file.folder, p.file.link].filter(x => x).join("/")
	);

	if(pagesReferring.length) {
		renderTheHeadingIfNotAlready(currentPageDate);
		dv.list(pagesReferring);
	} else if(input.alwaysShow) {
		renderTheHeadingIfNotAlready(currentPageDate);
		dv.paragraph("(none)");
	}
}


let headingAlreadyRendered = false;

function renderTheHeadingIfNotAlready(currentPageDate) {
	if(headingAlreadyRendered) {
		return;
	}

	headingAlreadyRendered = true;
	if(input.heading) {
		dv.paragraph(input.heading);
	}
	if(currentPageDate == null) {
		dv.paragraph("> [!ERROR] Current page name is not a date. Probably a template. Skipping date-based references.");
	}
}


function areDatesOnSameDay(d1, d2) {
	return d1.year == d2.year && d1.month == d2.month && d1.day == d2.day;
}


const NON_DATETIME_TYPES = new Set(["boolean", "number"]);
const NON_DATETIME_TASK_PROPS = new Set([
	"symbol",
	"link",
	"section",
	"line",
	"lineCount",
	"list",
	"outlinks",
	"path",
	"children",
	"task",
	"annotated",
	"position",
	"subtasks",
	"real",
	"header",
	"status",
	"checked",
	"completed",
	"fullyCompleted",
]);

function convertToDateTime(key, value) {
	try {
		if(value instanceof dv.luxon.DateTime) {
			return value;
		}
		if(NON_DATETIME_TYPES.has(typeof value)) {
			return null;
		}
		return dv.date(value);
	} catch(e) {
		//DEBUG: console.log("Value", value, "at key", [key], "could not be converted to DateTime", e);
		return null;
	}
}

function pageHasFieldsForDay(page, date) {
	if(date == null) {
		return false;
	}

	for(let [key, value] of Object.entries(page)) {
		if(key === "file" || key === "settings") {
			continue;
		}
		let dates = Array.isArray(value) ? value.map(i => convertToDateTime(key, i)) : [convertToDateTime(key, value)];
		dates = dates.filter(x => x != null);
		if(dates.length === 0) {
			continue;
		}

		for(const d of dates) {
			if(areDatesOnSameDay(d, date)) {
				return true;
			}
		}
	}

	const moreDates = page.file.tasks
		.flatMap(t => Object.entries(t)
		.filter(([k, v]) => !NON_DATETIME_TASK_PROPS.has(k))
		.map(([k, v]) => convertToDateTime(k, v)))
		.filter(
			i => !(i == null || (Array.isArray(i) && i.length == 0))
		);
	for(const d of moreDates) {
		if(areDatesOnSameDay(d, date)) {
			return true;
		}
	}

	return false;
}


try {
	await main()
} catch(e) {
	console.log(e);
	throw e;
}
