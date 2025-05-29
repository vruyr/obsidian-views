const asynctools = (new Function("dv", await dv.io.load("Views/Library/asynctools.js")))(dv);


async function main() {
	const TASK_STATUSES_COMPLETED  = new Set(["x", "X"]);
	const TASK_STATUSES_DROPPED    = new Set(["-"]);
	const TASK_STATUSES_STARTED    = new Set(["/"]);
	const TASK_STATUSES_SELECTED   = new Set(["*"]);
	const TASK_STATUSES_DONE       = new Set([...TASK_STATUSES_COMPLETED, ...TASK_STATUSES_DROPPED])
	const TASK_STATUSES_NEW        = new Set([" "]);
	const TASK_STATUSES_INACTIVE   = new Set([...TASK_STATUSES_DONE, ...TASK_STATUSES_NEW])

	const PROJECT_PAGE_NAME_PATTERN = /\d\dW\d\d(D\d)?\b/;

	const currentPage = await asynctools.waitForCurrentPage();
	const currentPageDate = dv.date(currentPage.file.name);

	// This day plus six days is a week.
	const dueDateToShow = currentPageDate != null ? currentPageDate.plus({days: 6}) : null;

	dv.container.classList.add("no-task-highlight-started");

	function isActiveProjectPage(relativeToDate, page) {
		return (
			PROJECT_PAGE_NAME_PATTERN.test(page.file.name)
			&& !isPageDeferred(relativeToDate, page)
			&& isStatusActive(page)
		);
	}

	const now = dv.date("now");

	function getTaskStatusSortKey(taskStatus) {
		if(taskStatus == null) {
			return -1;
		}
		if(TASK_STATUSES_STARTED.has(taskStatus)) {
			return 1;
		}
		if(TASK_STATUSES_SELECTED.has(taskStatus)) {
			return 2;
		}
		if(TASK_STATUSES_NEW.has(taskStatus)) {
			return 3;
		}
		if(TASK_STATUSES_DONE.has(taskStatus)) {
			return 4;
		}
		return -1;
	}

	function getTaskSortKey(task) {
		return [task.due || now, task.started || now, getTaskStatusSortKey(task.status), task.added || now];
	}

	function getPageSortKey(page) {
		return [
			...(page.file.tasks.map(getTaskSortKey).sort().first()),
			page.file.path
		];
	}

	let numTaskListsRendered = 0;
	for(const page of dv.pages()
		.where(p => p.file?.tasks?.length || isActiveProjectPage(currentPageDate, p))
		// Sort pages by oldest to newest [due, started, added] of any task on the page, then by page path.
		.sort(getPageSortKey)
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

		//TODO Checking the PROJECT_PAGE_NAME_PATTERN the second time. Properly implement rendering project pages without tasks.
		if(!tasksAvailable.length && !isActiveProjectPage(currentPageDate, page)) {
			continue;
		}

		renderTheHeadingIfNotAlready(currentPageDate);
		dv.paragraph(`${input.pageHeadingPrefix}${page.file.folder ? page.file.folder + "/" : ""}[[/${page.file.path}|${page.file.name}]]`);
		//TODO Render tasksAvailable with their ancestor chain. This will require building a proper tree to group multiple available tasks of a single parent task.
		if(tasksAvailable.length) {
			dv.taskList(
				tasksAvailable.sort(getTaskSortKey),
				/*groupByFile*/ false
			);
		}
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

function isPageDeferred(relativeToDate, page) {
	if(relativeToDate == null) {
		return false;
	}
	const pageDeferDate = getPageDeferDate(page);
	if(pageDeferDate == null) {
		return false;
	}
	return dv.compare(relativeToDate, pageDeferDate) < 0;
}

function getPageDeferDate(page) {
	return [].concat(page.defer ?? []).sort().last();
}

function getStatusFields(obj) {
	return [].concat(
		getFieldValues(obj, "done"),
		getFieldValues(obj, "dropped"),
		getFieldValues(obj, "started"),
		getFieldValues(obj, "stopped"),
	).sort((a, b) => dv.compare(a[1], b[1]));
}

function isStatusActive(obj) {
	const mostRecentStatusField = getStatusFields(obj).last();
	if(mostRecentStatusField == null) {
		return true;
	}
	return !["done", "dropped"].includes(mostRecentStatusField[0]);
}

function getFieldValues(obj, fieldName) {
	if(!obj || !fieldName) {
		return null;
	}
	return [].concat(obj[fieldName] ?? []).map(x => [fieldName, x]);
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


try {
	main()
} catch(e) {
	console.log(e);
	throw e;
}
