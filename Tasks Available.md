---
aliases: [Available Tasks]
---

```dataviewjs
const COMPLETED_TASK_STATUSES = new Set(["x", "-"]);

for(const p of dv.pages()
	.where(p => !p.file.path.startsWith("Templates/") && p.file.tasks.where(t => !t.completed).length)
	.sort(p => p.file.mtime, "desc")
) {
	const fileLink = dv.fileLink(
		p.file.path,
		false,
		[p.file.folder, p.file.name].filter(x => x).join("/")
	);
	const mtime = p.file.mtime.toRelative({style: "short", unit: ["years", "weeks", "days", "hours", "minutes"]});

	const pending = p.file.tasks.where(t => !COMPLETED_TASK_STATUSES.has(t.status));
	const available = pending.where(t => !(t.defer && dv.compare(t.defer, dv.date("now")) > 0));
	const deferred = pending.where(t => (t.defer && dv.compare(t.defer, dv.date("now")) > 0));

	if(available.length) {
		dv.taskList(available);
	}
}
```

---

- File Structure
	- [ ] Section: Due. Show tasks that are overdue or will be in set amount of time.
	- [ ] Section: Available. Tasks that are not overdue or deferred.
	- [ ] Section: Deferred. Tasks that are not actionable currently as they are deferred to some future date.
- [ ] Trim the nested list items from tasks.
