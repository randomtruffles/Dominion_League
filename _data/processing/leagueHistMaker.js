var fs = require('fs');

var hist = {};

for (let s=1; s<=53; s++) {
	hist["s" + String(s)] = JSON.parse(fs.readFileSync(`Seasons/s${s}.json`));
}

hist = JSON.stringify(hist);

var aliases = fs.readFileSync("namechanges.txt", 'utf8').split('\n').map(x => x.replace('\r',''));
const aliascount = aliases.length;

for (let i=1; i<aliascount; i++) {
	let oldnew = aliases[i].split('\t');
	let oldReg = new RegExp(`"${oldnew[0]}"`, "ig");
	hist = hist.replace(oldReg, `"${oldnew[1]}"`);
}

fs.writeFileSync("outputs/league_history.json", hist);

hist = JSON.parse(hist);

var players = {};

for (const seasonKey in hist) {
	for (const div in hist[seasonKey]) {
		if (div == "season") {continue;}
		for (const player in hist[seasonKey][div].members) {
			if (players[player.toLowerCase()]) {
				players[player.toLowerCase()].seasons.push({"season": seasonKey.slice(1), "division": div});
			} else {
				players[player.toLowerCase()] = {"name": player, "seasons": [{"season": seasonKey.slice(1), "division": div}]};
			}
		}
	}
}

fs.writeFileSync("outputs/player_seasons.json", JSON.stringify(players));

//old sims: 29
//new sims: 42
//back to no sims: 50