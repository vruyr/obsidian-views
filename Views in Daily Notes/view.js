async function main() {
	const currentPage = await waitForCurrentPage();
	const currentPageDate = moment(currentPage.file.name, "YYYY-MM-DD");

	// https://momentjs.com/docs/#/displaying/format/
	const DAILY_NOTE_PAGE_TITLE_MOMENT_FORMAT = "dddd gg[W]ww, MMMM D, YYYY";

	dv.paragraph(`# ${currentPageDate.format(DAILY_NOTE_PAGE_TITLE_MOMENT_FORMAT)}`);

	dv.paragraph("## Pending");
	await dv.view("Views/Pending Tasks in Daily Notes");
	dv.paragraph("&nbsp;");
	dv.paragraph("## References");
	await dv.view("Views/References");
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
