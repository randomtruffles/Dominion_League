var fs = require('fs');

//player chart
const fullHist = JSON.parse(fs.readFileSync("../league_history.json"));
const champs = JSON.parse(fs.readFileSync("../champions.json"));
const oldData = JSON.parse(fs.readFileSync("../chart_data.json"));

var players = {};
var divisions = {};

for (let s in fullHist) {
	let sn = s.slice(1);
	divisions[sn] = {};
	for (let div in fullHist[s]) {
		if (div == "season") {continue;}
		
		divisions[sn][div] = Object.keys(fullHist[s][div].members).sort((a,b) => {
			if (champs.seasons[sn] == a.toLowerCase()) {
				return -1;
			} else if (champs.seasons[sn] == b.toLowerCase()) {
				return 1;
			} else {
				return a.rank - b.rank;
			}
		});
		
		for (let pl in fullHist[s][div].members) {
			let plkey = pl.toLowerCase();
			if (plkey in players) {
				players[plkey].seasons.push(Number(sn));
				players[plkey].divs.push(div);
				players[plkey].places.push(plkey == champs.seasons[sn] ? 1 : plkey == champs.runner_ups[sn] ? 2 : fullHist[s][div].members[pl].rank);
				players[plkey].wins.push(fullHist[s][div].members[pl].wins);
				players[plkey].losses.push(fullHist[s][div].members[pl].losses);
			} else {
				players[plkey] = {
					"name": pl,
					"seasons": [Number(sn)],
					"divs": [div],
					"places": [plkey == champs.seasons[sn] ? 1 : plkey == champs.runner_ups[sn] ? 2 : fullHist[s][div].members[pl].rank],
					"wins": [fullHist[s][div].members[pl].wins],
					"losses": [fullHist[s][div].members[pl].losses]
				};
				if ((plkey in oldData.players) && ("powcol" in oldData.players[plkey])) {
					players[plkey].powcol = oldData.players[plkey].powcol;
				}
			}
		}
	}
}

fs.writeFileSync("outputs/chart_data.json", JSON.stringify({"players": players, "divisions": divisions}));
