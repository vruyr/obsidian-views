---
search: '-"Templates" and #Shopping and -#Shopping/Research and -#Shopping/Consumables and -#Shopping/Services'
groupByTags: false
---

```dataviewjs
const current = dv.current();

console.log("Searching for", JSON.stringify(current.search));

function renderPage(p) {
	const parts = p.file.path.replace(/\.md$/, "").split("/");
	let folder = parts.slice(0, -1).join("/");
	folder = folder ? folder + "/" : folder;
	const name = parts.slice(-1);
	const tags = Array.from(p.file.etags).toSorted().join(" ");
	return `- (mtime::${p.file.mtime}) ${folder}[[${name}]] ${tags}`;
}

const pages = dv.pages(current.search)
	.where(p => p.file.path !== current.file.path)
	.sort(i => i.file.mtime, "desc");

let out;
if(current.groupByTags) {
	out = pages.groupBy(p => Array.from(p.file.etags).toSorted().join(" "))
	.flatMap(({key, rows}) => ([
		`## ${key}`,
		...(rows.sort(i => i.file.mtime, "desc").map(renderPage)),
		""
	]));
} else {
	out = pages.map(renderPage);
}

dv.paragraph(out.join("\n"));

```
