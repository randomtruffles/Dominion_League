var fs = require('fs');

//player chart
const fullHist = JSON.parse(fs.readFileSync("../league_history.json"));
const champs = JSON.parse(fs.readFileSync("../champions.json"));
const oldData = JSON.parse(fs.readFileSync("../chart_data.json"));

var players = {};
var divisions = {};

function decompactDivision(name, cDiv) {
	var out = {"name": name, "tier": name.charAt(0), "complete?": "Yes", "late drops": cDiv.drops, "members": {}, "by_player": {}};
	for (let i=0; i<cDiv.members.length; i++) {
		let pname = cDiv.members[i];
		out.members[pname] = {"name": pname, "rank": cDiv.ranks[i], "tiebreaker": cDiv.tbs[i], "next tier": cDiv.nexts[i], "returning": cDiv.returnings[i], "drop": cDiv.drops.includes(pname) ? "Yes" : "No"};
		out.members[pname].wins = cDiv.grid[i].map(x => x[0]).reduce((a, b) => a + b, 0);
		out.members[pname].losses = cDiv.grid[i].map(x => x[1]).reduce((a, b) => a + b, 0);
		out.members[pname].pct = Math.round(100*out.members[pname].wins/(out.members[pname].wins + out.members[pname].losses)) + "%";
		out.members[pname].wins = out.members[pname].wins.toFixed(1).replace(".0", "");
		out.members[pname].losses = out.members[pname].losses.toFixed(1).replace(".0", "");
		out.members[pname].wins_wdrop = cDiv.grid[i].filter((x,j) => i != j).map(x => x[0]).reduce((a, b) => a + b, 0);
		out.members[pname].losses_wdrop = cDiv.grid[i].filter((x,j) => i != j).map(x => x[1]).reduce((a, b) => a + b, 0);
		out.members[pname].games_wdrop = out.members[pname].wins_wdrop + out.members[pname].losses_wdrop;
		out.members[pname].wins_nondrop = cDiv.grid[i].filter((x,j) => i != j && !(cDiv.members[j] in cDiv.drops)).map(x => x[0]).reduce((a, b) => a + b, 0);
		out.members[pname].losses_nondrop = cDiv.grid[i].filter((x,j) => i != j && !(cDiv.members[j] in cDiv.drops)).map(x => x[1]).reduce((a, b) => a + b, 0);
		out.members[pname].games_nondrop = out.members[pname].wins_nondrop + out.members[pname].losses_nondrop;
		out.by_player[pname] = {"wins": out.members[pname].wins_wdrop, "losses": out.members[pname].losses_wdrop, "wins_nondrop": out.members[pname].wins_nondrop, "losses_nondrop": out.members[pname].losses_nondrop, "games_nondrop": out.members[pname].games_nondrop};
		for (let j=0; j<cDiv.members.length; j++) {
			if (i == j || cDiv.grid[i][j][0] + cDiv.grid[i][j][1] == 0) {continue;}
			let oname = cDiv.members[j];
			out.by_player[pname][oname] = {"wins": cDiv.grid[i][j][0], "losses": cDiv.grid[i][j][1], "complete": (cDiv.grid[i][j][0] + cDiv.grid[i][j][1] >= 6) ? "Yes" : "No", "sessions": 1}
		}
	}
	return out;
}

for (let s in fullHist) {
	let sn = s.slice(1);
	divisions[sn] = {};
	for (let div in fullHist[s]) {
		if (div == "season") {continue;}
		
		let divisionData = decompactDivision(div, fullHist[s][div]);
		
		divisions[sn][div] = Object.keys(divisionData.members).sort((a,b) => {
			if (champs.seasons[sn] == a.toLowerCase()) {
				return -1;
			} else if (champs.seasons[sn] == b.toLowerCase()) {
				return 1;
			} else {
				return a.rank - b.rank;
			}
		});
		
		for (let pl in divisionData.members) {
			let plkey = pl.toLowerCase();
			if (plkey in players) {
				players[plkey].seasons.push(Number(sn));
				players[plkey].divs.push(div);
				players[plkey].places.push(plkey == champs.seasons[sn] ? 1 : plkey == champs.runner_ups[sn] ? 2 : divisionData.members[pl].rank);
				players[plkey].wins.push(divisionData.members[pl].wins);
				players[plkey].losses.push(divisionData.members[pl].losses);
			} else {
				players[plkey] = {
					"name": pl,
					"seasons": [Number(sn)],
					"divs": [div],
					"places": [plkey == champs.seasons[sn] ? 1 : plkey == champs.runner_ups[sn] ? 2 : divisionData.members[pl].rank],
					"wins": [divisionData.members[pl].wins],
					"losses": [divisionData.members[pl].losses]
				};
				if ((plkey in oldData.players) && ("powcol" in oldData.players[plkey])) {
					players[plkey].powcol = oldData.players[plkey].powcol;
				}
			}
		}
	}
}

fs.writeFileSync("outputs/chart_data.json", JSON.stringify({"players": players, "divisions": divisions}));
