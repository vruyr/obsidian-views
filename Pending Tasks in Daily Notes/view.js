function main() {
	const COMPLETED_TASK_STATUSES = new Set(["x", "-"]);
	const currentPage = dv.current();
	const currentPageDate = dv.date(currentPage.file.name);
	if(currentPageDate == null) {
		dv.paragraph("> [!ERROR] Current page title is not a date. Probably it's a template.");
		return;
	}
	let numTaskListsRendered = 0;
	for(const p of dv.pages()
		.where(p => (
			/\d{4}-\d{2}-\d{2}/.test(p.file.name) &&
			dv.compare(dv.date(p.file.name), currentPageDate) <= 0 &&
			p.file.path != dv.current().file.path &&
			p.file.tasks.where(t => !t.completed).length
		))
		.sort(p => p.file.name, "asc")
	) {
		const pending = p.file.tasks.where(t => !COMPLETED_TASK_STATUSES.has(t.status));
		const available = pending.where(t => !(t.defer && dv.compare(t.defer, currentPageDate) > 0));

		if(available.length) {
			dv.taskList(available);
			numTaskListsRendered += 1;
		}
	}

	if(numTaskListsRendered == 0) {
		dv.paragraph("(none)");
	}
}


try {
	main()
} catch(e) {
	console.log(e);
	throw e;
}
