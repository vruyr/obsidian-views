// const taskStatuses = (new Function(await dv.io.load("Views/Library/taskStatuses.js")))();
// const taskStatuses = await tp.user.library("Views/Library/taskStatuses.js");

const TASK_STATUSES_COMPLETED  = new Set(["x", "X"]);
const TASK_STATUSES_DROPPED    = new Set(["-"]);
const TASK_STATUSES_STARTED    = new Set(["/"]);
const TASK_STATUSES_SELECTED   = new Set(["*"]);
const TASK_STATUSES_NEW        = new Set([" "]);
const TASK_STATUSES_DONE       = new Set([...TASK_STATUSES_COMPLETED, ...TASK_STATUSES_DROPPED])
const TASK_STATUSES_INACTIVE   = new Set([...TASK_STATUSES_DONE, ...TASK_STATUSES_NEW])

return {
	COMPLETED:  TASK_STATUSES_COMPLETED,
	DROPPED:    TASK_STATUSES_DROPPED,
	STARTED:    TASK_STATUSES_STARTED,
	SELECTED:   TASK_STATUSES_SELECTED,
	NEW:        TASK_STATUSES_NEW,
	DONE:       TASK_STATUSES_DONE,
	INACTIVE:   TASK_STATUSES_INACTIVE,
};
