## The Tree

- double space with callout and multiple levels
	- bar \
	  baz
		- xaz
			- [ ] A task
		- zaz

		  > [!note]+ A callout
		  > With multiple lines
		  >
		  > and more

		  Even more
			- [ ] taz [foo::bar]
		- maz
	- second on second
	- [ ] Task on second level \
	      Second line of task.
		- A sub-bullet of task. [due::2022-12-16T18:21:35-05:00]  [defer::2022-12-17]  [bar::baz]
- second of top
- [ ] Task
	- [ ] Subtask 1
		- [ ] Subtask 1.1
		- [ ] Subtask 1.2
	- [ ] Subtask 2
		- [ ] Subtask 2.1
			- [ ] Subtask 2.1.1
- Examples of date formatting
	- [ ] Mon [added::2022-12-12T14:31:45-05:00]
	- [ ] Tue [added::2022-12-13T14:31:45-05:00]
	- [ ] Wed [added::2022-12-14T14:31:45-05:00]
	- [ ] Thu [added::2022-12-15T14:31:45-05:00]
	- [ ] Fri [added::2022-12-16T14:31:45-05:00]
	- [ ] Sat [added::2022-12-17T14:31:45-05:00]

## Dataview Task List

```dataviewjs
dv.taskList(dv.current().file.lists.where(x => x.parent == null));
```

## Dataview Object Tree for the List

```dataviewjs
function listJson(x) {
	let toRemove = ["symbol", "link", "section", "tags", "line", "lineCount", "outlinks", "path", "list", "position", "end", "header", "parent", "task", "real", "checked", "completed", "fullyCompleted", "annotated", "due", "defer", "created", "foo"];
	for(let i of toRemove) {
		delete x[i];
	}
	if(x.children === x.subtasks) {
		delete x.subtasks;
	}
	if(x.children) {
		x.children = Array.from(x.children.map(listJson));
		if(!x.children.length) {
			delete x.children;
		}
	}
	if(!x.annotated) {
		delete x.annotated;
	}
	let xx = {"status": x.status, text: x.text, children: x.children};
	delete x.status;
	delete x.text;
	delete x.children;
	Object.assign(xx, x);
	return xx;
}
// let theList = dv.current().file.lists.values.map(x => listJson(x));
let theList = dv.current().file.lists.values.filter(x => x.parent == null).map(listJson);
let theListJson = theList.map(x => JSON.stringify(x, undefined, "\t")).join("\n");
theListJson = theListJson.replace(
	/\{(?:\n\t*("status": [^\n]+)(,))?\n\t*("text": [^\n]+)(?:\n\t*(\})|(,)\n\t*("children": \[))/g,
	"{$1$2$3$4$5$6",
);
theListJson = theListJson.replace(/(,)(\S)/g, "$1 $2");
theListJson = theListJson.replace(/(\t*)\t\]\n\1\}/g, "$1]}");
dv.paragraph("```json\n" + theListJson + "\n```")
```

# Tasks

- [ ] Create a CSS snippet for custom callouts
	- https://help.obsidian.md/Editing+and+formatting/Callouts#Customize+callouts
