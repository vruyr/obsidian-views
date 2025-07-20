const asynctools = (new Function("dv", await dv.io.load("Views/Library/asynctools.js")))(dv);
const dateutils = (new Function(await dv.io.load("Views/Library/dateutils.js")))();


async function main() {
	const currentDate = moment().startOf("day");
	const currentPage = await asynctools.waitForCurrentPage();
	const currentPageDate = moment(currentPage.file.name, "YYYY-MM-DD");

	let currentPageTitle = `# ${currentPage.file.name}`;
	let mustShowPendingTasks = true;

	if(currentPageDate.isValid()) {
		const dateLabels = {
			[-1]: "Yesterday",
			[0]: "Today",
			[1]: "Tomorrow",
		};
		const MILLISECONDS_IN_A_DAY = 86400000;
		const relativeDays = Math.floor(currentPageDate.diff(currentDate) / MILLISECONDS_IN_A_DAY);
		let dateLabel = dateLabels[relativeDays];
		if(!dateLabel) {
			dateLabel = "";
			const suffix = relativeDays < 0 ? " ago" : " from today";
			let days = Math.abs(relativeDays);
			const weeks = Math.floor(days / 7);
			days = days % 7;
			if(weeks) {
				dateLabel += weeks.toLocaleString() + " week";
				if(weeks > 1) {
					dateLabel += "s";
				}
			}
			if(days) {
				dateLabel += " ";
				dateLabel += days.toLocaleString() + " day";
				if(days > 1) {
					dateLabel += "s";
				}
			}
			dateLabel += suffix;
		}

		// https://momentjs.com/docs/#/displaying/format/
		const dayByWeek = dateutils.momentToYearWeekDay(currentPageDate);
		const dayByMonth = currentPageDate.format("dddd, MMMM D, YYYY");

		currentPageTitle = `# ${dayByWeek} – ${dayByMonth} – ${dateLabel}`;

		mustShowPendingTasks = currentPageDate.diff(currentDate) >= 0;
	}


	dv.paragraph(currentPageTitle);

	// Note that because all the subsequent `dv.paragraph();` calls are done from async functions,
	// in order to preserve the correct order, any calls to `dv.paragraph()` after the first async
	// call must be done after an explicit `await asynctools.sleep(0);`. Otherwise all the
	// syncronous calls to `dv.paragraph();` from here will complete before the calls from async
	// functions called from here.

	if(mustShowPendingTasks) {
		await dv.view("Views/Pending Tasks in Daily Notes", {
			headingLevel: 2,
		});
	}

	await dv.view("Views/References", {
		heading: "## References",
		alwaysShow: true,
	});
}


try {
	await main()
} catch(e) {
	console.log(e);
	throw e;
}
