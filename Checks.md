# Checks

```dataviewjs
const PASS = "✅";
const FAIL = "❌"

const outputLines = [];

function indent(count, str) {
	const the_indent = "\t".repeat(count);
	return the_indent + str.replaceAll(/\n/g, "\n" + the_indent);
}

function trimSuffix(str, suffix) {
	if(!(suffix && suffix.length && str.endsWith(suffix))) {
		return str;
	}
	return str.substring(0, str.length - suffix.length);
}

const pagesConsidered = dv.pages().where(p => !(
	p.file.path.startsWith("Templates") || p.file.path.startsWith("Views")
));

let tags = new Set(pagesConsidered
	.where(p => p.file.tags.length)
	.map(p => p.file.etags).to("values")
);
let offenders = new Set();
for(const tag of tags) {
	let lastSlashIdx;
	let t = tag;
	while((lastSlashIdx = t.lastIndexOf("/")) >= 0) {
		t = t.slice(0, lastSlashIdx);
		if(tags.has(t) && !offenders.has(t)) {
			offenders.add(t);
		}
	}
}
if(offenders.size) {
	outputLines.push(`- ${FAIL} Tagged with a parent tag:`)
	for(const tag of offenders) {
		outputLines.push(indent(1, `- ${tag}`));
		outputLines.push(indent(2, dv.markdownList(
			pagesConsidered
			.where(p => p.file.etags.indexOf(tag) >= 0)
			.map(p => `[[${p.file.path.replace(/\.md$/, "")}]]`)
		)));
	}
} else {
	outputLines.push(`- ${PASS} No pages are tagged with a parent tag.`);
}

offenders = dv.pages(
	"#Inventory AND -\"Inventory\""
).map(
	p => `[[${trimSuffix(p.file.path, ".md")}]]`
);
if(offenders.length) {
	let opening = `- ${FAIL} ` + "Some pages are tagged `#Inventory` outside of the `Inventory` folder:";
	outputLines.push(opening + "\n" + indent(1, dv.markdownList(offenders)));
} else {
	outputLines.push(`- ${PASS} ` + "All pages tagged `#Inventory` are in the `Inventory` folder.");
}

dv.paragraph(outputLines.join("\n"));
```
- Find all images that do not have any pages using them.
