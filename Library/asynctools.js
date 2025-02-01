// const asynctools = (new Function("dv", await dv.io.load("Views/Library/asynctools.js")))(dv);


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


return {
	waitForCurrentPage,
	sleep,
}
