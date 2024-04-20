async function main() {
	const TASK_STATUSES_COMPLETED  = new Set(["x", "X"]);
	const TASK_STATUSES_DROPPED    = new Set(["-"]);
	const TASK_STATUSES_DONE       = new Set([...TASK_STATUSES_COMPLETED, ...TASK_STATUSES_DROPPED])
	const TASK_STATUSES_NEW        = new Set([" "]);
	const TASK_STATUSES_INACTIVE   = new Set([...TASK_STATUSES_DONE, ...TASK_STATUSES_NEW])

	while(!dv.current()) {
		await sleep(100);
	}
	const currentPage = dv.current();
	const currentPageDate = dv.date(currentPage.file.name);
	const dueDateToShow = currentPageDate.plus({days: 6}); // This day plus six is a week.

	if(currentPageDate == null) {
		dv.paragraph("> [!ERROR] Current page title is not a date. Probably it's a template.");
		return;
	}

	dv.container.classList.add("no-task-highlight-started");

	let numTaskListsRendered = 0;
	for(const page of dv.pages()
		.where(p => p.file?.tasks?.length)
		.sort(p => p.file.name, "asc") //TODO Sort by task dates ascending using [due, started, added] as key.
	) {
		let tasksPending;

		let showAllPendingTasks = page.showAllPendingTasks || false;

		if(
			/^\d{4}-\d{2}-\d{2}$/.test(page.file.name) &&             // This is a daily journal page
			dv.compare(dv.date(page.file.name), currentPageDate) < 0  // ... for a prior day
		) {
			showAllPendingTasks = true;
		}

		if(showAllPendingTasks) {
			// Take all pending tasks
			tasksPending = page.file.tasks.where(t => !TASK_STATUSES_DONE.has(t.status));
		} else {
			// For all other pages, take all pending but not untouched tasks.
			tasksPending = page.file.tasks.where(t => (
				!TASK_STATUSES_INACTIVE.has(t.status) ||
				(
					!TASK_STATUSES_DONE.has(t.status) &&
					t.due && dv.compare(dv.date(t.due), dueDateToShow) <= 0
				)
			));
		}

		//TODO Ignore the defer date for tasks that were picked because of the due date.
		// Available tasks either should have no defer date or all the defer dates should be in the past.
		const tasksAvailable = tasksPending.where(t => (!t.defer ||
			dv.compare(
				(dv.isArray(t.defer) ? t.defer : dv.array([t.defer])).sort().last(),
				currentPageDate
			) <= 0
		));

		if(!tasksAvailable.length) {
			continue;
		}

		renderTheHeadingIfNotAlready();
		dv.paragraph(`${input.pageHeadingPrefix}${page.file.folder ? page.file.folder + "/" : ""}[[/${page.file.path}|${page.file.name}]]`);
		//TODO Render tasksAvailable with their ancestor chain. This will require building a proper tree to group multiple available tasks of a single parent task.
		dv.taskList(tasksAvailable, false);
		numTaskListsRendered += 1;
	}

	if(numTaskListsRendered == 0 && input.alwaysShow) {
		renderTheHeadingIfNotAlready();
		dv.paragraph("(none)");
	}
}


let headingAlreadyRendered = false;

function renderTheHeadingIfNotAlready() {
	if(headingAlreadyRendered || !input.heading) {
		return;
	}
	headingAlreadyRendered = true;
	dv.paragraph(input.heading);
}


async function sleep(milliseconds) {
	await new Promise(resolve => {
		setTimeout(resolve, milliseconds);
	});
}

try {
	main()
} catch(e) {
	console.log(e);
	throw e;
}
