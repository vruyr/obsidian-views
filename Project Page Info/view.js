const asynctools    = (new Function("dv", await dv.io.load("Views/Library/asynctools.js")))(dv);
const dateutils     = (new Function(await dv.io.load("Views/Library/dateutils.js")))();
const taskStatuses  = (new Function("dv", await dv.io.load("Views/Library/taskStatuses.js")))(dv);


async function main() {
	const projectPage = await asynctools.waitForCurrentPage();
	const [date, title] = parsePageName(projectPage);

	if(!date) {
		dv.paragraph(`# Current page doesn't look like a project page.`);
		return;
	}

	const tasks = projectPage.file.tasks;
	const numTasksAll = tasks.length;
	const numTasksStarted = tasks.filter(t => taskStatuses.STARTED.has(t.status)).length;
	const numTasksSelected = tasks.filter(t => taskStatuses.SELECTED.has(t.status)).length;
	const numTasksDone = tasks.filter(t => taskStatuses.DONE.has(t.status)).length;
	const numTasksPending = numTasksAll - numTasksDone - numTasksStarted - numTasksSelected;

	dv.paragraph(`# ${title}`);

	dv.table(
		["", ""],
		[
			["Project date", date.format("dddd, MMMM D, YYYY")],
			["Project title", title],
			["Tasks Done", `${numTasksDone} of ${numTasksAll} – ${Math.round(numTasksDone / numTasksAll * 100)}%`],
			["Tasks Pending", ` ${numTasksStarted} started, ${numTasksSelected} selected, ${numTasksPending} pending`],
		]
	)
}


function parsePageName(page) {
	const m = /^(\d\dW\d\dD\d) (.+)/.exec(page.file.name);
	if(!m) {
		return [null, null];
	}
	return [dateutils.yearWeekDayToMoment(m[1]), m[2]]
}


try {
	main()
} catch(e) {
	console.log(e);
	throw e;
}
