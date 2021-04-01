var fs = require('fs');

var season = "44";

var news = JSON.parse(fs.readFileSync(`Seasons/s${season}.json`));
var counts = JSON.parse(fs.readFileSync("../chart_counts.json"));
var hist = JSON.parse(fs.readFileSync("../chart_history.json"));

var countadd = {};
var histadd = [];
var totalPlayers = 0;
for (const div in news) {
	if (div != "season") {
		let ps = Object.keys(news[div].members).length;
		totalPlayers += ps;
		if (countadd[news[div].tier]) {
			countadd[news[div].tier].divisions += 1;
			countadd[news[div].tier].players += ps;
		} else {
			countadd[news[div].tier] = {"season": season, "tier": news[div].tier, "divisions": 1, "players": ps};
		}
	}
}
countadd = Object.keys(countadd).map(key => countadd[key]);
for (tier of countadd) {
	tier.lfrac = tier.players/totalPlayers;
}

for (const div in news) {
	if (div == "season") {continue;}
	let players = Object.keys(news[div].members);
	const nplayer = players.length;
	let countBase = 0;
	let propBase = 0;
	let countMult = null;
	let propMult = null;
	for (tier of countadd) {
		if (tier.tier == news[div].tier) {
			countMult = tier.players;
			propMult = tier.players;
			break;
		}
		countBase += tier.players;
		propBase += tier.lfrac;
	}
	for (let i=0; i<nplayer; i++) {
		histadd.push({
			"player": players[i],
			"tier": news[div].tier,
			"division": div,
			"place": String(news[div].members[players[i]].rank),
			"wins": news[div].members[players[i]].wins,
			"losses": news[div].members[players[i]].losses,
			"pct": news[div].members[players[i]].pct,
			"standingsColor": news[div].members[players[i]].color,
			"season": season,
			"countPlacement": String(countBase + countMult*(news[div].members[players[i]].rank - 0.5)/nplayer),
			"propPlacement": String(propBase + propMult*(news[div].members[players[i]].rank - 0.5)/nplayer),
			"champ": (news[div].members[players[i]].rank == 1) ? ((news[div].tier == "A") ? "league" : "division") : "no"
		})
	}
}

hist = JSON.stringify(hist.concat(histadd));

for (tier of countadd) {
	tier.lfrac = String(tier.lfrac);
	tier.players = String(tier.players);
	tier.divisions = String(tier.divisions);
}

counts = counts.concat(countadd);
fs.writeFileSync("chart_counts.json", JSON.stringify(counts));

var aliases = fs.readFileSync("namechanges.txt", 'utf8').split('\n').map(x => x.replace('\r',''));
const aliascount = aliases.length;

for (let i=1; i<aliascount; i++) {
	oldnew = aliases[i].split('\t');
	oldReg = new RegExp(`"${oldnew[0]}"`, "ig");
	hist = hist.replace(oldReg, `"${oldnew[1]}"`);
}

fs.writeFileSync("chart_history.json", hist);
