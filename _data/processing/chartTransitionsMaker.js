var fs = require("fs");

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
		for (infs of players[playerlist[i]].seasons) {
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