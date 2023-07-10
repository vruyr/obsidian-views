```dataviewjs
const cutoffDate = dv.date("today") + dv.duration("13 days");
const pagesWithExpirations = dv.pages().where(p => (
	!p.file.path.startsWith("Templates/") &&
	(p.file.lists.where(i => i.expires).length || p.expires)
));
for(const p of pagesWithExpirations) {
	p.earliestExpiration = Array.from(p.file.lists).map(i => i.expires).reduce((a, c) => (a < c ? a : c), null);
}

for(const p of pagesWithExpirations.sort(p => p.earliestExpiration, "asc")) {
	const fileLink = dv.fileLink(
		p.file.path,
		false,
		[p.file.folder, p.file.name].filter(x => x).join("/")
	);
	if(p.expires) {
		const fileExpirations = Array.isArray(p.expires) ? p.expires : [p.expires];
		dv.paragraph(fileLink)
		//TODO:vruyr This is unfinished
		for(const d of fileExpirations) {
			dv.span("- ");
			dv.span(d);
			dv.span(", ");
			dv.span(d.toRelative({style: "short", unit: ["years", "weeks", "days"]}));

		}
	}
	const expiring = p.file.lists.where(i => i.expires && dv.date(i.expires) <= cutoffDate);

	if(expiring.length) {
		dv.taskList(expiring.sort(i => i.expires));
	}
}
```
