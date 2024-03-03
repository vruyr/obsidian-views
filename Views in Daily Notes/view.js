async function main() {
	const currentPage = await waitForCurrentPage();
	const currentPageDate = moment(currentPage.file.name, "YYYY-MM-DD");

	// https://momentjs.com/docs/#/displaying/format/
	const dayByWeek = currentPageDate.format("gg[W]wwdd").toUpperCase();
	const dayByMonth = currentPageDate.format("MMMM D, YYYY")

	dv.paragraph(`# ${dayByWeek} – ${dayByMonth}`);

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
