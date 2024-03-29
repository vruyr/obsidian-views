async function main() {
	const currentPage = await waitForCurrentPage();
	const currentPageDate = moment(currentPage.file.name, "YYYY-MM-DD");
	const currentDate = moment().startOf("day");

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
	const dayByWeek = currentPageDate.format("gg[W]wwdd").toUpperCase();
	const dayByMonth = currentPageDate.format("MMMM D, YYYY")

	dv.paragraph(`# ${dayByWeek} – ${dayByMonth} – ${dateLabel}`);

	if(currentPageDate.diff(currentDate) >= 0) {
		await dv.view("Views/Pending Tasks in Daily Notes", {
			heading: "## Pending",
			pageHeadingPrefix: "### ",
			alwaysShow: false,
		});
	}

	await dv.view("Views/References", {
		heading: "## References",
		alwaysShow: true,
	});
}

async function waitForCurrentPage() {
	let currentPage;
	while(!(currentPage = dv.current())) {
		await sleep(100);
	}
	return currentPage;
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
