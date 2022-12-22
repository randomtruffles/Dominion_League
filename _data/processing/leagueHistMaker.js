var fs = require('fs');

var hist = {};

for (let s=1; s<=54; s++) {
	let bigHist = JSON.parse(fs.readFileSync(`Seasons/s${s}.json`));
	let smallHist = {"season": s};
	for (const div in bigHist) {
		if (div == "season") {continue};
		smallHist[div] = {"members": Object.keys(bigHist[div].members), "drops": bigHist[div]["late drops"]};
		smallHist[div].ranks = smallHist[div].members.map(p => bigHist[div].members[p].rank);
		smallHist[div].tbs = smallHist[div].members.map(p => bigHist[div].members[p].tiebreaker);
		smallHist[div].nexts = smallHist[div].members.map(p => bigHist[div].members[p]["next tier"]);
		smallHist[div].returnings = smallHist[div].members.map(p => bigHist[div].members[p]["returning"]);
		smallHist[div].grid = smallHist[div].members.map(p => {
			let line = [];
			for (opponent of smallHist[div].members) {
				if (!(opponent in bigHist[div].by_player[p])) {
					line.push([0,0]);
				} else {
					line.push([bigHist[div].by_player[p][opponent].wins, bigHist[div].by_player[p][opponent].losses]);
				}
			}
			// sim accounting on match with self
			line[smallHist[div].members.indexOf(p)] = [Number(bigHist[div].members[p].wins) - line.map(x => x[0]).reduce((a, b) => a + b, 0), Number(bigHist[div].members[p].losses) - line.map(x => x[1]).reduce((a, b) => a + b, 0)];
			return line;
		});
	}
	hist["s" + String(s)] = smallHist;
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
		for (const player of hist[seasonKey][div].members) {
			if (players[player.toLowerCase()]) {
				players[player.toLowerCase()].seasons.push(seasonKey.slice(1));
				players[player.toLowerCase()].divisions.push(div);
			} else {
				players[player.toLowerCase()] = {"name": player, "seasons": [seasonKey.slice(1)], "divisions": [div]};
			}
		}
	}
}

fs.writeFileSync("outputs/player_seasons.json", JSON.stringify(players));

//old sims: 29
//new sims: 42
//back to no sims: 50