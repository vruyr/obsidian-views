---
aliases: [All Tasks]
---

```dataviewjs

const taskStatuses = (new Function("dv", await dv.io.load("Views/Library/taskStatuses.js")))(dv);

const allPagesWithTasks = (
	dv.pages().file.tasks
).map(
	t => t.path
).where(
	p => !p.startsWith("Templates/")
).distinct(
).map(
	p => dv.page(p)
);

const result = (
	allPagesWithTasks
).sort(
	p => p.file.path, "asc"
).map(
	p => {
		const alltasks = p.file.tasks;
		const pending = p.file.tasks.where(t => !taskStatuses.DONE.has(t.status));
		const deferred = pending.where(t => (t.defer && dv.compare(t.defer, dv.date("now")) > 0));
		return [
			dv.fileLink(
				p.file.path,
				false,
				[p.file.folder, p.file.name].filter(x => x).join("/")
			),
			(100 * (alltasks.length - pending.length) / alltasks.length).toFixed(0),
			alltasks.length,
			pending.length,
			pending.length - deferred.length,
			deferred.length,
			p.file.mtime.toRelative({style: "short", unit: ["years", "weeks", "days", "hours", "minutes"]}),
		];
	}
);

dv.table(
	["Page", "Done %", "Tasks", "Pending", "Available", "Deferred", "Modified"],
	result,
);
```
