const lib = (new Function(
	"dv",
	//TODO Figure out how to make relative paths work for Dataview "view"s.
	await dv.io.load("Views/Book Info/lib.js"))
)(
	dv
);

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
	const speedMin = Math.min(...lib.READING_SPEEDS_WPM);
	const speedMax = Math.max(...lib.READING_SPEEDS_WPM);
	const timeMin = Math.floor(statsWords / (speedMax * 60));
	const timeMax = Math.ceil(statsWords / (speedMin * 60))
	summaryTable.push(["Time to read",
		`${timeMin}-${timeMax} hours at ${speedMin}-${speedMax} wpm`
	])
}

summaryTable.push(["---", "---"]);

let progressLogs = lib.getProgressLogs(page).last;

if(progressLogs?.length) {
	const first = progressLogs.first;
	const last = progressLogs.last;
	const pct = last.percentage();
	let wordsPerDay = null;
	if(pct && statsWords) {
		wordsPerDay = statsWords * last.percentage() / (last.date.diff(first.date).shiftTo("days").days);
	}
	let wordsPerDayMsg = "";
	if(wordsPerDay) {
		wordsPerDayMsg = `\nOn average ${wordsPerDay.toLocaleString(undefined, {maximumFractionDigits: 0})} words per day`;
	}
	if(last.page == last.total) {
		summaryTable.push([
			"Last read",
			(
				lib.formatDateRange(first.date, last.date, {
					showRelativeEnd: true,
				})
				+
				wordsPerDayMsg
			)
		]);
	} else {
		let note = last.note ? ` - ${last.note}` : "";
		summaryTable.push([
			`Read to ${last.pctstr()}${note}`,
			(
				lib.formatDateRange(first.date, last.date, {
					showRelativeStart: false,
					showRelativeEnd: true,
				})
				+
				wordsPerDayMsg
			)
		]);
	}
}

dv.el("span", "", {cls: "next-table-no-header"});
dv.table(["", ""], summaryTable);


const references = [];

if(!lib.isObsidianMobile()) {
	//TODO Rethink the Calibre search. Perhaps search all the identifier of all editions.
	const firstId = bookEditionSelected.identifiers[0];
	const calibreSearch = `identifiers:"=${firstId.type}:${firstId.id}"`;
	const l = new Buffer(lib.CALIBRE_LIBRARY).toString("hex");
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
