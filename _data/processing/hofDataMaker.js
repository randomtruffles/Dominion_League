var fs = require('fs')

var players = JSON.parse(fs.readFileSync("../player_seasons.json"));
var leagueHist = JSON.parse(fs.readFileSync("../league_history.json"));
var champions = JSON.parse(fs.readFileSync("../champions.json"));

const currentSeason = 54;
const thresholdForOverallPct = 10;
const thresholdForTierPct = 3;
const oddSchemes = {"38":{"D":["C","F"],"E":["E","G"],"F":["G",null]},"40":{"G":["F","I"],"H":["H",null]},"51":{"J":["H",null]}};
const nondemTiers = {};
for (let s=1; s<=26; s++) {
	nondemTiers[String(s)] = ["D","E"];
}
for (let s=27; s<=38; s++) {
	nondemTiers[String(s)] = ["F"];
}
for (let s=39; s<=40; s++) {
	nondemTiers[String(s)] = ["H"];
}
for (let s=41; s<=51; s++) {
	nondemTiers[String(s)] = ["J"];
}
for (let s=52; s<=currentSeason; s++) {
	nondemTiers[String(s)] = ["I"];
}

var allTiers = {"A": [], "B": [], "C": [], "D": [], "E": [], "F": [], "G": [], "H": [], "I": [], "J": [], "P": []};
var allStats = [];
var allStreaks = {"played": [], "nondem": [], "promote": []};
const notPlayers = ["games_nondrop","losses","losses_nondrop","wins","wins_nondrop"];

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

for (playerKey in players) {
	let player = players[playerKey].name;
	console.log(player);
	let tiersPlayed = {};
	let stats = {"divWins": [], "seasons": players[playerKey].seasons, "six": 0, "five": 0, "opponents": []};
	let totalWins = 0;
	let totalLosses = 0;
	let streaks = {
		"played": {"current": {"count": 0, "start": Infinity, "end": Infinity}},
		"nondem": {"current": {"count": 0, "start": Infinity, "end": Infinity}},
		"promote": {"current": {"count": 0, "start": Infinity, "end": Infinity}}
	};
	for (let i = players[playerKey].seasons.length - 1; i >= 0; i--) {
		let season = players[playerKey].seasons[i];
		let seasonKey = "s" + season;
		let division = players[playerKey].divisions[i];
		let divisionData = decompactDivision(division, leagueHist[seasonKey][division]);
		let tier = division.charAt(0);
		totalWins += divisionData.by_player[player].wins;
		totalLosses += divisionData.by_player[player].losses;
		//stats
		if (tiersPlayed[tier]) {
			tiersPlayed[tier].seasons.push(season);
			tiersPlayed[tier].wins += divisionData.by_player[player].wins;
			tiersPlayed[tier].losses += divisionData.by_player[player].losses;
			let seaspct = divisionData.by_player[player].wins/(divisionData.by_player[player].wins + divisionData.by_player[player].losses);
			if (seaspct >= tiersPlayed[tier].best.pct) {
				tiersPlayed[tier].best = {"season": season, "pct": seaspct};
			}
		} else {
			tiersPlayed[tier] = {"seasons": [season], "wins": divisionData.by_player[player].wins, "losses": divisionData.by_player[player].losses};
			tiersPlayed[tier].best = {"season": season, "pct": tiersPlayed[tier].wins/(tiersPlayed[tier].wins + tiersPlayed[tier].losses)};
		}
		if (divisionData.members[player].rank == 1) {
			stats.divWins.push(season);
		}
		if (streaks.played.current.start == Number(season) + 1) {
			streaks.played.current.count += 1;
			streaks.played.current.start = Number(season);
		} else {
			allStreaks.played.push({"player": player, "streak": JSON.parse(JSON.stringify(streaks.played.current))});
			streaks.played.current = {"count": 1, "start": Number(season), "end": Number(season)};
		}
		let promotion = false;
		let demotion = false;
		let next_tier = divisionData.members[player]["next tier"];
		if (oddSchemes[season] && oddSchemes[season][tier]) {
			if (next_tier == oddSchemes[season][tier][0]) {
				promotion = true;
			} else if (next_tier == oddSchemes[season][tier][1]) {
				demotion = true;
			}
		} else if (((next_tier < tier) || (playerKey == champions.seasons[season])) && (divisionData.members[player].drop == "No")) {
			promotion = true;
		} else if (next_tier > tier) {
			demotion = true;
		}
		if (promotion) {
			if (streaks.promote.current.start == Number(season) + 1) {
				streaks.promote.current.count += 1;
				streaks.promote.current.start = Number(season);
			} else {
				allStreaks.promote.push({"player": player, "streak": JSON.parse(JSON.stringify(streaks.promote.current))});
				streaks.promote.current = {"count": 1, "start": Number(season), "end": Number(season)};
			}
		}
		if (!demotion && !nondemTiers[season].includes(tier)) {
			if (streaks.nondem.current.start == Number(season) + 1) {
				streaks.nondem.current.count += 1;
				streaks.nondem.current.start = Number(season);
			} else {
				allStreaks.nondem.push({"player": player, "streak": JSON.parse(JSON.stringify(streaks.nondem.current))});
				streaks.nondem.current = {"count": 1, "start": Number(season), "end": Number(season)};
			}
		}
		//versus (and some stats)
		for (opp in divisionData.by_player[player]) {
			if (!notPlayers.includes(opp)) {
				stats.opponents.push(opp);
				if (divisionData.by_player[player][opp].wins >= 5) {
					stats.five += 1;
					if (divisionData.by_player[player][opp].wins == 6) {
						stats.six += 1;
					}
				}
			}
		}
	}
	
	for (t in tiersPlayed) {
		tiersPlayed[t].player = player;
		tiersPlayed[t].pct = (tiersPlayed[t].seasons.length >= thresholdForTierPct) ? tiersPlayed[t].wins/(tiersPlayed[t].wins + tiersPlayed[t].losses) : 0;
		allTiers[t].push(JSON.parse(JSON.stringify(tiersPlayed[t])));
	}
	
	stats.player = player;
	stats.pct = (players[playerKey].seasons.length >= thresholdForOverallPct) ? totalWins/(totalWins + totalLosses) : 0;
	stats.opponents = [...new Set(stats.opponents)].length;
	allStats.push(JSON.parse(JSON.stringify(stats)));
	
	allStreaks.played.push({"player": player, "streak": JSON.parse(JSON.stringify(streaks.played.current))});
	allStreaks.promote.push({"player": player, "streak": JSON.parse(JSON.stringify(streaks.promote.current))});
	allStreaks.nondem.push({"player": player, "streak": JSON.parse(JSON.stringify(streaks.nondem.current))});
}

var out = {};

out['champions'] = Object.keys(champions.players).map(key => {return {"player": players[key].name, "seasons": champions.players[key]}});

out['div-wins'] = allStats.sort((a,b) => b.divWins.length - a.divWins.length).slice(0,30).map(k => {return {"player": k.player, "seasons": k.divWins}});
out['win-pct'] = allStats.sort((a,b) => b.pct - a.pct).slice(0,30).map(k => {return {"player": k.player, "num": k.pct, "disp": Math.round(100*k.pct) + "%"}});
out['sixes'] = allStats.sort((a,b) => b.six - a.six).slice(0,30).map(k => {return {"player": k.player, "num": k.six, "disp": String(k.six)}});
out['opponents'] = allStats.sort((a,b) => b.opponents - a.opponents).slice(0,30).map(k => {return {"player": k.player, "num": k.opponents, "disp": String(k.opponents)}});
out['seasons'] = allStats.sort((a,b) => b.seasons.length - a.seasons.length).slice(0,30).map(k => {return {"player": k.player, "seasons": k.seasons}});

out['a-seasons'] = allTiers["A"].sort((a,b) => b.seasons.length - a.seasons.length).slice(0,30).map(k => {return {"player": k.player, "seasons": k.seasons}});
out['tier-record'] = Object.keys(allTiers).map(key => {return {"tier": key, "best-pct": allTiers[key].sort((a,b) => b.pct - a.pct).slice(0,3)}});
out['tier-best'] = Object.keys(allTiers).map(key => {return {"tier": key, "best-season": allTiers[key].sort((a,b) => b.best.pct - a.best.pct).slice(0,3)}});

out['played-streak'] = allStreaks.played.sort((a,b) => b.streak.count - a.streak.count).slice(0,30);
out['promote-streak'] = allStreaks.promote.sort((a,b) => b.streak.count - a.streak.count).slice(0,30);
out['nondem-streak'] = allStreaks.nondem.sort((a,b) => b.streak.count - a.streak.count).slice(0,30);

fs.writeFileSync("outputs/hall_of_fame.json", JSON.stringify(out));

