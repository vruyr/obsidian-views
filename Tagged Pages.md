---
search: '-"Templates" and #Shopping and -#Shopping/Research and -#Shopping/Consumables and -#Shopping/Services'
groupByTags:
  - "#Shopping"
hidePaths:
  - Notes
---

```dataviewjs
const current = dv.current();

if(typeof current.groupByTags === "string") {
	current.groupByTags = [current.groupByTags];
}

function renderPage(p, tagsToHide) {
	const parts = p.file.path.replace(/\.md$/, "").split("/");
	const name = parts.slice(-1);
	let folder = parts.slice(0, -1).join("/");
	if(current.hidePaths.includes(folder)) {
		folder = "";
	}
	folder = folder ? folder + "/" : folder;
	tagsToHide = new Set(tagsToHide);
	const tagsToShow = p.file.etags.where(i => !tagsToHide.has(i)).sort();
	return `- (mtime::${p.file.mtime}) ${folder}[[${name}]] ${tagsToShow.join(" ")}`;
}

function groupByTagsFilter(tag) {
	if(!current.groupByTags?.length) {
		return true;
	}
	if(tag.startsWith("#")) {
		tag = tag.substring(1);
	}
	for(let i of current.groupByTags) {
		if(i.startsWith("#")) {
			i = i.substring(1);
		}
		if(tag === i || tag.startsWith(i)) {
			return true;
		}
	}
	return false;
}

const pages = dv.pages(current.search)
	.where(p => p.file.path !== current.file.path)
	.sort(i => i.file.mtime, "desc");

let out;
if(current.groupByTags?.length) {
	out = pages.groupBy(p => Array.from(p.file.etags.where(groupByTagsFilter).sort()))
	.flatMap(({key, rows}) => ([
		`## ${key.join(" ")}`,
		...(rows.sort(i => i.file.mtime, "desc").map(p => renderPage(p, key))),
		""
	]));
} else {
	out = pages.map(p => renderPage(p));
}

dv.paragraph(out.join("\n"));

```
