var fs = require('fs');

for (let s = 1; s <= 25; s++) {
	console.log(s);
	const post = fs.readFileSync(`forum_standings/s${s}.txt`, {"encoding": "utf8"});
	const lines = post.split("\n");
	const nlines = lines.length;
	let out = {"season": s};
	let curr = {"name": "", "tier": "", "members": {}, "by_player": {}, "late drops": [], "complete?": "Yes"};
	let retIdx = 7;
	if (((s>5) && (s<11)) || ((s>15) && (s<19)) || (s>20)) {retIdx = 8;}
	for (let i=0; i<nlines; i++) {
		const line = lines[i];
		if (line.includes("%")) {
			//division line
			let div = line.split(" ")[0];
			if (div.length === 1) {div += "1";}
			console.log(div);
			curr["name"] = div;
			curr["tier"] = div.charAt(0);
		} else if (/^\d\.\t/.test(line)) {
			//in rankings
			let info = line.split("\t");
			info[3] = info[3].replace(",", ".");
			info[5] = info[5].replace(",", ".");
			info[retIdx] = info[retIdx].replace(/ /g,"").replace('\r', "");
			curr.members[info[1]] = {
				"name": info[1],
				"pct": Math.round(100*Number(info[3])/(6*Number(info[4]))) + "%",
				"color": numericStandingsColor(Number(info[3])/(6*Number(info[4]))),
				"wins": info[3],
				"losses": (6*Number(info[4]) - Number(info[3])).toFixed(1).replace(".0", "").replace(".2",".3").replace(".7",".8"),
				"tiebreaker": Number(info[5]),
				"next tier": nextTierDetermine(curr.tier, Number(info[0][0])),
				"rank": Number(info[0][0]),
				"returning": info[retIdx] ? ((info[retIdx] === "-") ? "N" : info[retIdx].charAt(0)) : "?",
				"drop": (info[retIdx] === "-") ? "Yes" : "No"
			};
			if (info[retIdx] === "-") {curr["late drops"].push(info[1]);}
			curr.by_player[info[1]] = {"games_nondrop": 0, "losses": 0, "losses_nondrop": 0, "wins": 0, "wins_nondrop": 0};
		} else if (/^rank\t/.test(line)) {
			//header line
			continue;
		} else if (line.includes(":")) {
			if (/^Remaining:/.test(line)) {continue;}
			//in results
			let players = line.split(": ")[0].split(" - ");
			let scores = line.split(": ")[1].split(" - ").map(x => Number(x.replace(",",".")));
			
			curr.by_player[players[0]][players[1]] = {"wins": scores[0], "losses": scores[1], "complete": "Yes", "sessions": 1};
			curr.by_player[players[0]].wins += scores[0];
			curr.by_player[players[0]].losses += scores[1];
			if (!curr["late drops"].includes(players[1])) {
				curr.by_player[players[0]].games_nondrop += scores[0] + scores[1];
				curr.by_player[players[0]].wins_nondrop += scores[0];
				curr.by_player[players[0]].losses_nondrop += scores[1];
			}
			
			curr.by_player[players[1]][players[0]] = {"wins": scores[1], "losses": scores[0], "complete": "Yes", "sessions": 1};
			curr.by_player[players[1]].wins += scores[1];
			curr.by_player[players[1]].losses += scores[0];
			if (!curr["late drops"].includes(players[0])) {
				curr.by_player[players[1]].games_nondrop += scores[0] + scores[1];
				curr.by_player[players[1]].wins_nondrop += scores[1];
				curr.by_player[players[1]].losses_nondrop += scores[0];
			}
		} else {
			// blank line -> reset
			if (curr["name"]) {
				let players = Object.keys(curr.members);
				for (const p of players) {
					curr.members[p].games_wdrop = curr.by_player[p].wins + curr.by_player[p].losses;
					curr.members[p].wins_wdrop = curr.by_player[p].wins;
					curr.members[p].losses_wdrop = curr.by_player[p].losses;
					curr.members[p].games_nondrop = curr.by_player[p].games_nondrop;
					curr.members[p].wins_nondrop = curr.by_player[p].wins_nondrop;
					curr.members[p].losses_nondrop = curr.by_player[p].losses_nondrop;
				}
				out[curr["name"]] = curr;
			}
			curr = {"name": "", "tier": "", "members": {}, "by_player": {}, "late drops": [], "complete?": "Yes"};
		}
		
	}
	fs.writeFileSync(`Seasons/s${s}.json`, JSON.stringify(out));
}

function numericStandingsColor(pct) {
	var gradient = ["#E77B72", "#E88372", "#EA8C71", "#EC956F", "#EF9E6E", "#F2A76D", "#F4B06B", "#F7B96B", "#F9C269", "#FCCB67", "#FED467", "#F2D467", "#E2D26B", "#D0CF6F", "#C0CC73", "#AFCA76", "#9EC77A", "#8CC47E", "#7CC181", "#6DBF84", "#5BBC88"];
	return gradient[Math.floor(2000*pct/101)];
}

function nextTierDetermine(tier, rank) {
	var tiers = "ABCDE";
	if ((rank == 1) && (tier != "A")) {
		return tiers[tiers.search(tier)-1];
	}
	if ((rank > 4) && (tier < "D")) {
		return tiers[tiers.search(tier)+1];
	}
	return tier;
}