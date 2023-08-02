
```dataviewjs

const libBookInfo = (new Function(
	"dv",
	//TODO Figure out how to make relative paths work for Dataview "view"s.
	await dv.io.load("Views/Book Info/lib.js"))
)(
	dv
);

// https://forum.obsidian.md/t/possible-to-apply-css-class-cards-not-to-every-dataview-table/47563/4
dv.container.classList.add("cards");
dv.container.classList.add("cards-2-3");
dv.container.classList.add("cards-align-bottom");

function formatDate(t, showDuration) {
	if(!t) {
		return null;
	}
	if(!(t instanceof dv.luxon.DateTime)) {
		try {
			t = dv.date(t);
		} catch {
			return t;
		}
	}
	let f = dv.settings.defaultDateTimeFormat;
	if(t.second == 0 && t.minute == 0 && t.hour == 0) {
		f = dv.settings.defaultDateFormat;
	}


	let result = libBookInfo.formatDate(t.toLocal());
	if(showDuration) {
		result += "\n" + t.toRelativeCalendar({unit: "weeks"});
	}
	return result;
}

dv.paragraph("# Books")


const books = dv
	.pages('"Catalog/Books"')
	.where(i => i.book)
	.map(page => {
		const progressLogs = libBookInfo.getProgressLogs(page);
		const lastUpdate = progressLogs.last?.last;
		const lastUpdateDate = formatDate(lastUpdate?.date, true);

		let status = null;
		let statusSort = 0;
		if(progressLogs.last.length === 0) {
			statusSort = 1;
			status = "Never Read";
		} else if(progressLogs.last.last.page === progressLogs.last.last.total) {
			statusSort = 1 + progressLogs.length;
			if(progressLogs.length === 1) {
				status = `Read Once\nFinished ${lastUpdateDate}`
			} else {
				status = `Read ${progressLogs.length} Times\nLast finished ${lastUpdateDate} times`;
			}
		} else {
			statusSort = 1 - lastUpdate.percentage();
			status = [
				"Reading",
				`${progressLogs.last.last.pctstr()} on ${lastUpdateDate}`,
				`Started ${formatDate(progressLogs.last.first.date, true)}`
			].join("\n");
		}

		page.bookStatus = status;
		page.bookStatusSort = statusSort;

		return page;
	})
	.sort(
		(page) => {
			return page.bookStatusSort;
		},
		"asc"
	);


const basicFieldNames = [
	"Cover", "Title", "Authors", "Edition", "Words", "Pages", "Status",
];
function basicFieldValuesGen(page) {
	let ee = dv.array(page?.book?.editions);
	return [
		`![](${ee.cover[0]})`,
		dv.fileLink(page.file.path, false, page.book.title),
		"By: " + page.book.authors.join("; "),
		"Edition: " + ee.label[0],
		"Words: " + (ee.stats?.words[0] || "-"),
		"Pages: " + (ee.stats?.pages[0] || "-"),
		page?.bookStatus,
	];
}
dv.table(
	[...basicFieldNames],
	books
	.map(i => [
		...basicFieldValuesGen(i),
	])
);


```

---

- [ ] Format numbers in the Words column to have thousand separators.
- [ ] Align the Words column right.

```dataviewjs
dv.table(
	["Title", "Words", "Author"],
	[
		["One Up on Wall Street_ How to Use What You Already Know to Make Money In", 100879, "Peter Lynch"],
		["Refactoring_ Improving the Design of Existing Code", 105814, "Martin Fowler"],
		["OpenGL Programming Guide_ The Official Guide to Learning OpenGL, Version 4.3, Eighth Edition", 231762, "Dave Shreiner"],
		["FreeBSD Handbook", 266618, "The FreeBSD Documentation Project"],
		["Thinking in Java", 362385, "Bruce Eckel"],
	]
)
```

---

Building A Book Library In Obsidian - YouTube
https://www.youtube.com/watch?v=7PFFJlyiv28

---
