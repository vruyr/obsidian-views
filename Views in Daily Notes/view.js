async function main() {
	dv.paragraph("## Pending");
	await dv.view("Views/Pending Tasks in Daily Notes");
	dv.paragraph("&nbsp;");
	dv.paragraph("## References");
	await dv.view("Views/References");
}

try {
	main()
} catch(e) {
	console.log(e);
	throw e;
}
