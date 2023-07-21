---
onlyInPages:
notOlderThan: 3 days
onlyTaggedWith: [StatusUpdate, Achievement]
---

```dataviewjs
const pageSearch = dv.current().onlyInPages;
const notOlderThan = dv.duration(dv.current().notOlderThan);
const cutoffDate = dv.date("now").startOf("day").minus(notOlderThan);
const anyTags = new Set(dv.array(dv.current().onlyTaggedWith).filter(t => t).map(t => `#${t}`));

function hasTheTags(listItem) {
	return (anyTags.size === 0 || listItem.tags.filter(t => anyTags.has(t)).length)
}

function isDateWithinRange(listItem) {
	if(!(listItem.theDate = listItem.date ? listItem.date : dv.date(dv.page(listItem.path).file.name))) {
		return false;
	}
	return listItem.theDate >= cutoffDate;
}

function renderList(list, indentLevel, outputArray) {
	indentLevel = indentLevel || 0;
	for(const i of list) {
		outputArray.push(`${"\t".repeat(indentLevel)}- ${i.text}`);
		if(!(i.children && i.children.length)) {
			continue;
		}
		renderList(i.children, indentLevel + 1, outputArray);
	}
}

function toTitleCase(s) {
	return s.charAt(0).toUpperCase() + s.substr(1);
}

let dayToPageToListItems = dv
	.pages(pageSearch)
	.file.lists
	.where(i => hasTheTags(i) && isDateWithinRange(i))
	.groupBy(i => i.theDate.startOf("day").toISODate())
	.sort(i => i.key, "asc")
	.map(i => ({
		key: i.key,
		rows: i.rows.groupBy(ii => ii.path)
	}));

const markdown = [];

for(let {key: day, rows: pageToListItems} of dayToPageToListItems) {
	day = dv.date(day);
	markdown.push(`## ${toTitleCase(day.toRelativeCalendar())}, ${day.toFormat("EEEE, MMMM d, y")}`)
	for(const {key: path, rows: listItems} of pageToListItems) {
		markdown.push(`- [[${path.replace(/\.md$/, "")}]]`);
		renderList(listItems, 1, markdown);
	}
}

if(markdown.length) {
	dv.paragraph(markdown.join("\n"));
} else {
	dv.paragraph("(empty)");
}
```
