//does not yet do power chart

var fs = require('fs');

//player chart
const fullHist = JSON.parse(fs.readFileSync("../league_history.json"));
const champs = JSON.parse(fs.readFileSync("../champions.json"));

var counts = {};
var hist = [];

for (let s in fullHist) {
	counts[s] = {};
	let totalPlayers = 0;
	for (let div in fullHist[s]) {
		if (div != "season") {
			let ps = Object.keys(fullHist[s][div].members).length;
			totalPlayers += ps;
			if (counts[s][fullHist[s][div].tier]) {
				counts[s][fullHist[s][div].tier].divisions += 1;
				counts[s][fullHist[s][div].tier].players += ps;
			} else {
				counts[s][fullHist[s][div].tier] = {"season": s.slice(1), "tier": div.charAt(0), "divisions": 1, "players": ps};
			}
		}
	}
	for (let tier in counts[s]) {
		counts[s][tier].lfrac = counts[s][tier].players/totalPlayers;
	}
	
	for (let div in fullHist[s]) {
		if (div != "season") {
			let players = Object.keys(fullHist[s][div].members);
			const nplayer = players.length;
			let countBase = 0;
			let propBase = 0;
			let countMult = null;
			let propMult = null;
			for (tier in counts[s]) {
				if (tier == fullHist[s][div].tier) {
					countMult = counts[s][tier].players;
					propMult = counts[s][tier].lfrac;
					break;
				}
				countBase += counts[s][tier].players;
				propBase += counts[s][tier].lfrac;
			}
			for (let i=0; i<nplayer; i++) {
				let champ = (fullHist[s][div].members[players[i]].rank == 1) ? "division" : "no";
				let place = String(fullHist[s][div].members[players[i]].rank);
				if (fullHist[s][div].tier == "A") {
					if (champs.seasons[s.slice(1)] == players[i].toLowerCase()) {
						champ = "league";
						place = "1";
					} else if (champs.runner_ups[s.slice(1)] == players[i].toLowerCase()) {
						champ = "no";
						place = "2";
					}
				}
				hist.push({
					"player": players[i],
					"tier": fullHist[s][div].tier,
					"division": div,
					"place": place,
					"wins": fullHist[s][div].members[players[i]].wins,
					"losses": fullHist[s][div].members[players[i]].losses,
					"pct": fullHist[s][div].members[players[i]].pct,
					"standingsColor": fullHist[s][div].members[players[i]].color,
					"season": s.slice(1),
					"countPlacement": String(countBase + countMult*(Number(place) - 0.5)/nplayer),
					"propPlacement": String(propBase + propMult*(Number(place) - 0.5)/nplayer),
					"champ": champ
				})
			}
		}
	}
	
	for (let tier in counts[s]) {
		counts[s][tier].lfrac = String(counts[s][tier].lfrac);
		counts[s][tier].players = String(counts[s][tier].players);
		counts[s][tier].divisions = String(counts[s][tier].divisions);
	}
}

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