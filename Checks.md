# Checks

```dataviewjs
const PASS = "✅";
const FAIL = "❌"

const outputLines = [];

function indent(count, str) {
	return "\t".repeat(count) + str.replaceAll(/\n/g, "\t".repeat(count) + "\n");
}

function trimSuffix(str, suffix) {
	if(!(suffix && suffix.length && str.endsWith(suffix))) {
		return str;
	}
	return str.substring(0, str.length - suffix.length);
}

let tags = new Set(dv.pages()
	.where(p => !p.file.path.startsWith("Templates"))
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
			dv.pages()
			.where(p => !p.file.path.startsWith("Templates"))
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
