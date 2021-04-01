var fs = require('fs');

var hist = {};

for (let s=1; s<=44; s++) {
	hist[String(s)] = JSON.parse(fs.readFileSync(`Seasons/s${s}.json`));
}

hist = JSON.stringify(hist);

var aliases = fs.readFileSync("namechanges.txt", 'utf8').split('\n').map(x => x.replace('\r',''));
const aliascount = aliases.length;

for (let i=1; i<aliascount; i++) {
	oldnew = aliases[i].split('\t');
	oldReg = new RegExp(`"${oldnew[0]}"`, "ig");
	hist = hist.replace(oldReg, `"${oldnew[1]}"`);
}

fs.writeFileSync("league_history.json", hist);

hist = JSON.parse(hist);

var players = {};

for (const season in hist) {
	for (const div in hist[season]) {
		if (div == "season") {continue;}
		for (const player in hist[season][div].members) {
			if (players[player.toLowerCase()]) {
				players[player.toLowerCase()].seasons.push({"season": season, "division": div});
			} else {
				players[player.toLowerCase()] = {"name": player, "seasons": [{"season": season, "division": div}]};
			}
		}
	}
}

fs.writeFileSync("player_seasons.json", JSON.stringify(players));

//old sims: 29
//new sims: 42