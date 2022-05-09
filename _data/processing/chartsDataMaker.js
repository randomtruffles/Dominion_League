//does not yet do power chart

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
			if (players[plkey]) {
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
				if (oldData.players[plkey].powcol) {
					players[plkey].powcol = oldData.players[plkey].powcol;
				}
			}
		}
	}
}

fs.writeFileSync("outputs/chart_data.json", JSON.stringify({"players": players, "divisions": divisions}));

/*
counts = Object.keys(counts).map(season => Object.keys(counts[season]).map(tier => counts[season][tier])).flat();
fs.writeFileSync("outputs/chart_counts.json", JSON.stringify(counts));

fs.writeFileSync("outputs/chart_history.json", JSON.stringify(hist));

//transitions chart

const players = JSON.parse(fs.readFileSync("../player_seasons.json"));
const links = JSON.parse(fs.readFileSync("../sheet_links.json"));
const current = JSON.parse(fs.readFileSync("../current_season.json"));

var playerlist = [...new Set(Object.keys(players).concat(Object.keys(current.players)))];
playerlist.sort((a,b) => a.localeCompare(b, 'en', {'sensitivity': 'base'}));
nplayer = playerlist.length;

var schemes = [];

for (let i=0; i<nplayer; i++) {
	let sch = Array.from({length: current.season}, x => "-");
	if (players[playerlist[i]]) {
		for (let infs of players[playerlist[i]].seasons) {
			sch[Number(infs.season)-1] = infs.division.charAt(0);
		}
		if (!current.players[playerlist[i]]) {
			playerlist[i] = players[playerlist[i]].name;
		}
	}
	if (current.players[playerlist[i]]) {
		sch[current.season-1] = current.players[playerlist[i]].tier;
		playerlist[i] = current.players[playerlist[i]].name;
	}
	schemes.push(sch.join(""));
}

var tiers = [];

for (let i=0; i<current.season; i++) {
	tiers.push([...new Set(Object.keys(links[String(i+1)]).map(d => d.charAt(0)))].sort().join(""));
}

fs.writeFileSync("outputs/chart_transitions.json", JSON.stringify({"schemes": schemes, "players": playerlist, "tiers": tiers}));
*/