---
aliases: [Started Tasks]
---

```dataviewjs
dv.paragraph("## Started Tasks");
dv.taskList((dv.pages().where(p => !p.file.path.startsWith("Templates/")).file.tasks.where(t => t.status === "/")));
```
