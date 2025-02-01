// const dateutils = (new Function(await dv.io.load("Views/Library/dateutils.js")))();
// const dateutils = await tp.user.library("Views/Library/dateutils.js");


function momentToYearWeekDay(m) {
	// https://momentjs.com/docs/#/displaying/format/
	let result = m.format("gg[W]ww[D]").toUpperCase();
	// https://momentjs.com/docs/#/get-set/weekday/
	result += (m.isoWeekday() % 7 + 1).toString();

	return result;
}


function yearWeekDayToMoment(str) {
	const m = /^(\d\dW\d\d)D(\d)/.exec(str);
	if(!m) {
		return null;
	}
	return moment(
		m[1],
		"gg[W]ww"
	).add(
		parseInt(m[2]) - 1,
		"d"
	);
}


return {
	momentToYearWeekDay,
	yearWeekDayToMoment,
}
