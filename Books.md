---
cssClass: cards, cards-2-3, cards-align-bottom
---

```dataviewjs
function formatDate(t, showDuration) {
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

	let result = t.toLocal().toFormat(f);
	if(showDuration) {
		let days = Math.floor(t.diffNow().as("days")) * -1;
		result += `\n${days} days ago`;
	}
	return result;
}

const basicFieldNames = [
	["Cover", "Title", "Authors", "Edition", "Words", "Pages"],
];
function basicFieldValuesGen(page) {
	console.log(page);
	let ee = dv.array(page?.book?.editions);
	return [
		`![](${ee.cover[0]})`,
		dv.fileLink(page.file.path, false, page.book.title),
		"By: " + page.book.authors.join("; "),
		"Edition: " + ee.label[0],
		"Words: " + (ee.stats?.words[0] || "-"),
		"Pages: " + (ee.stats?.pages[0] || "-"),
	];
}

const books = dv.pages('"Catalog/Books"').where(i => i.book);

dv.table(
	[...basicFieldNames, "Started"],
	books
	.where(i => i["started-reading"] && !i["finished-reading"])
	.sort(i => i.file.mtime, "desc")
	.map(i => [
		...basicFieldValuesGen(i),
		"Started: " + (formatDate(i["started-reading"], true))
	])
);

dv.table(
	[...basicFieldNames],
	books
	.where(i => !i["started-reading"])
	.sort(i => i.file.mtime, "desc")
	.map(i => [
		...basicFieldValuesGen(i),
	])
);

function readingDuration(page) {
	return page["finished-reading"].diff(page["started-reading"]).as("days");
}

function renderReadingStats(page) {
	const days = readingDuration(page);
	const result = [
		`${formatDate(page["started-reading"])} to ${formatDate(page["finished-reading"])}`,
		`${days} days`,
	]
	const words = dv.array(page.book.editions).stats.words[0];
	if(words) {
		result.push(`${Math.floor(words / days).toLocaleString()} words per day`)
	}
	return result.join("; ");
	 to

}

dv.table(
	[...basicFieldNames, "Finished"],
	books
	.where(i => i["finished-reading"])
	.sort(i => i.file.mtime, "desc")
	.map(i => [
		...basicFieldValuesGen(i),
		`Read: ${renderReadingStats(i)}`
	])
);
```

---

- [ ] Format numbers in the Words column to have thousand separators.
- [ ] Align the Words column right.

| Title                                                                                        |   Words | Author                            |
| -------------------------------------------------------------------------------------------- | -------:| --------------------------------- |
| One Up on Wall Street_ How to Use What You Already Know to Make Money In                     | 100,879 | Peter Lynch                       |
| Refactoring_ Improving the Design of Existing Code                                           | 105,814 | Martin Fowler                     |
| OpenGL Programming Guide_ The Official Guide to Learning OpenGL, Version 4.3, Eighth Edition | 231,762 | Dave Shreiner                     |
| FreeBSD Handbook                                                                             | 266,618 | The FreeBSD Documentation Project |
| Thinking in Java                                                                             | 362,385 | Bruce Eckel                       |


---

Building A Book Library In Obsidian - YouTube
https://www.youtube.com/watch?v=7PFFJlyiv28

---
