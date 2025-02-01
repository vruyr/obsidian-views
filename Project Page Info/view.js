const asynctools = (new Function("dv", await dv.io.load("Views/Library/asynctools.js")))(dv);
const dateutils = (new Function(await dv.io.load("Views/Library/dateutils.js")))();


async function main() {
	const [date, title] = parsePageName(await asynctools.waitForCurrentPage());
	if(!date) {
		dv.paragraph(`# Current page doesn't look like a project page.`);
		return;
	}

	dv.paragraph(`# ${title}`);

	dv.table(
		["", ""],
		[
			["Project date", date.format("dddd, MMMM D, YYYY")],
			["Project title", title],
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
