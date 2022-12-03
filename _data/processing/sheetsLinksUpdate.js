//Download file for this off of the new season's divisions sheet, put it in this folder, and relabel "s<season>divs.csv"

var fs = require('fs');

const season = "55";

var out = JSON.parse(fs.readFileSync("../sheet_links.json"));
out[season] = {};
var curr = fs.readFileSync(`s${season}divs.csv`, 'utf8').split('\n');
const ndiv = curr.length;

for (let i=1; i<ndiv; i++) {
	let parts = curr[i].split(',');
	out[season][parts[0]] = parts[8];
}

fs.writeFileSync("outputs/sheet_links.json", JSON.stringify(out));