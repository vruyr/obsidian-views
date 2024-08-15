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

	// This day plus six days is a week.
	const dueDateToShow = currentPageDate != null ? currentPageDate.plus({days: 6}) : null;

	dv.container.classList.add("no-task-highlight-started");

	let numTaskListsRendered = 0;
	for(const page of dv.pages()
		.where(p => p.file?.tasks?.length)
		.sort(p => p.file.name, "asc") //TODO Sort by task dates ascending using [due, started, added] as key.
	) {
		let tasksPending;

		let showAllPendingTasks = page.showAllPendingTasks || false;

		if(isADailyJournalPageForPriorDay(currentPageDate, page)) {
			showAllPendingTasks = true;
		}

		if(showAllPendingTasks) {
			// Take all pending tasks
			tasksPending = page.file.tasks.where(t => !TASK_STATUSES_DONE.has(t.status));
		} else {
			// For all other pages, take all pending but not untouched tasks.
			tasksPending = page.file.tasks.where(t => (
				!TASK_STATUSES_INACTIVE.has(t.status) ||
				(!TASK_STATUSES_DONE.has(t.status) && isTaskDue(dueDateToShow, t))
			));
		}

		//TODO Ignore the defer date for tasks that were picked because of the due date.
		// Available tasks either should have no defer date or all the defer dates should be in the past.
		const tasksAvailable = tasksPending.where(t => !isTaskDeferred(currentPageDate, t, page));

		if(!tasksAvailable.length) {
			continue;
		}

		renderTheHeadingIfNotAlready(currentPageDate);
		dv.paragraph(`${input.pageHeadingPrefix}${page.file.folder ? page.file.folder + "/" : ""}[[/${page.file.path}|${page.file.name}]]`);
		//TODO Render tasksAvailable with their ancestor chain. This will require building a proper tree to group multiple available tasks of a single parent task.
		dv.taskList(tasksAvailable, false);
		numTaskListsRendered += 1;
	}

	if(numTaskListsRendered == 0 && input.alwaysShow) {
		renderTheHeadingIfNotAlready(currentPageDate);
		dv.paragraph("(none)");
	}
}


function isADailyJournalPageForPriorDay(relativeToDate, page) {
	if(!/^\d{4}-\d{2}-\d{2}$/.test(page.file.name)) {
		return false;
	}

	if(relativeToDate == null) {
		return true;
	}

	return dv.compare(dv.date(page.file.name), relativeToDate) < 0;
}


function isTaskDue(relativeToDate, task) {
	if(!task.due) {
		return false;
	}
	if(relativeToDate == null) {
		return true;
	}
	return dv.compare(dv.date(task.due), relativeToDate) <= 0;
}


function isTaskDeferred(relativeToDate, task, page) {
	if(relativeToDate == null) {
		return false;
	}
	const taskDeferDate = getTaskDeferDate(task, page);
	if(taskDeferDate == null) {
		return false;
	}
	return dv.compare(relativeToDate, taskDeferDate) < 0;
}


function getTaskDeferDate(task, page) {
	// https://blacksmithgu.github.io/obsidian-dataview/annotation/metadata-tasks/
	if(!page) {
		page = dv.page(task.path);
	}
	//TODO Only consider page deferrals from the same heading as the task itself.
	return [].concat(page.defer ?? [], task.defer ?? []).sort().last();
}


let headingAlreadyRendered = false;

function renderTheHeadingIfNotAlready(currentPageDate) {
	if(headingAlreadyRendered) {
		return;
	}

	headingAlreadyRendered = true;
	if(input.heading) {
		dv.paragraph(input.heading);
	}
	if(currentPageDate == null) {
		dv.paragraph("> [!ERROR] Current page name is not a date. Probably a template. Showing everything.");
	}
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
