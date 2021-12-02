var fs = require('fs');

var aliases = fs.readFileSync("namechanges.txt", 'utf8').split('\n').map(x => {
	let oldNew = x.replace('\r','').split('\t');
	return [new RegExp(`"${oldNew[0]}"`, "ig"), `"${oldNew[1]}"`]
});
const aliascount = aliases.length;

const nameFiles = ["league_history.json", "chart_history.json", "chart_transitions.json", "chart_power.json"];

for (let i=0; i<nameFiles.length; i++) {
	let fileString = fs.readFileSync(`../${nameFiles[i]}`, 'utf8');
	for (let j=1; j<aliascount; j++) {
		fileString = fileString.replace(aliases[j][0], aliases[j][1]);
	}
	fs.writeFileSync(`outputs/${nameFiles[i]}`, fileString);
}
