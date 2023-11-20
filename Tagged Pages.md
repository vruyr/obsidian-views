---
cssclasses:
  - dataview-inline-field-key-monospace
  - dataview-inline-field-value-monospace
  - dataview-inline-field-standalone-monospace
search: '-"Templates" and #Shopping and -#Shopping/Research and -#Shopping/Consumables and -#Shopping/Services'
---

```dataviewjs
const current = dv.current();

console.log("Searching for", JSON.stringify(current.search));

let out = dv.pages(current.search)
	.where(p => p.file.path !== current.file.path)
	.groupBy(p => Array.from(p.file.etags).toSorted().join(" "))
	.flatMap(({key, rows}) => ([
		`## ${key}`,
		...(rows.sort(i => i.file.mtime, "desc").map(p => {
			const parts = p.file.path.replace(/\.md$/, "").split("/");
			let folder = parts.slice(0, -1).join("/");
			folder = folder ? folder + "/" : folder;
			const name = parts.slice(-1);
			return `- (mtime::${p.file.mtime}) ${folder}[[${name}]]`;
		})),
		""
	]));

dv.paragraph(out.join("\n"));

```
