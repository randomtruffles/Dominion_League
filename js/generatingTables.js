var champ = "";
var promoteIcon = "&#9651;";
var demoteIcon = "&#9661;";
var playerQuery = ""
var noLink = false;
var oddSchemes = {"38":{"D":["C","F"],"E":["E","G"],"F":["G",null]},"40":{"G":["F","I"],"H":["H",null]},"51":{"J":["H",null]}};
var testing = false;
/* Helper functions */
function decompactDivision(name, cDiv) {
	var out = {"name": name, "tier": name.charAt(0), "complete?": "Yes", "late drops": cDiv.drops, "members": {}, "by_player": {}};
	for (let i=0; i<cDiv.members.length; i++) {
		let pname = cDiv.members[i];
		out.members[pname] = {"name": pname, "rank": cDiv.ranks[i], "tiebreaker": cDiv.tbs[i], "next tier": cDiv.nexts[i], "returning": cDiv.returnings[i], "drop": cDiv.drops.includes(pname) ? "Yes" : "No"};
		out.members[pname].wins = cDiv.grid[i].map(x => x[0]).reduce((a, b) => a + b, 0);
		out.members[pname].losses = cDiv.grid[i].map(x => x[1]).reduce((a, b) => a + b, 0);
		out.members[pname].pct = Math.round(100*out.members[pname].wins/(out.members[pname].wins + out.members[pname].losses)) + "%";
		out.members[pname].color = matchColor(out.members[pname].wins, out.members[pname].wins + out.members[pname].losses);
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

function formatDbLink(playerName, className, drop = "No"){
	var champion_sym = " <img src=\"/img/icons/vp_with_trophy.png\" class=\"champion-trophy\" title=\"Championship Match between top 2 A division finishers\">";
	var link = noLink ? `<span class = "${className}">${playerName}</span>`: `<a class="${className}" href="/player_database?player=${playerName.replace(/ /g, "%20")}">${playerName}</a>`;
	link = (drop == "Yes") ? `<s>${link}</s>` : link;
	if (playerName.toLowerCase() == champ) {
		link += champion_sym;
	}
	if (playerName.toLowerCase() == playerQuery){
		link = `<b>${link}</b>`;
	}
	return link;
}

function matchColor(score, upper) {
	var score = parseFloat(score);
	var colors = ["E77B72", "E88372", "EA8C71", "EC956F", "EF9E6E", "F2A76D", "F4B06B", "F7B96B", "F9C269", "FCCB67", "FED467", "F2D467", "E2D26B", "D0CF6F", "C0CC73", "AFCA76", "9EC77A", "8CC47E", "7CC181", "6DBF84", "5BBC88"];
	var normalized = Math.floor((100/101)*colors.length*score/upper);
	var color = colors[normalized];
	return `#${color}`;
}

function matchGreyscaleColor(score, upper){
	var score = parseFloat(score);
	var colors = ["#ffffff", "#f4f4f5", "#ebebeb", "#e1e1e1", "#d7d7d7", "#cdcdcd", "#c4c4c4", "#bababa", "#b1b1b1", "#a7a7a7", "#9e9e9e", "#959595", "#8c8c8c", "#838383", "#7a7a7a"];
	var normalized = Math.floor((100/101)*colors.length*score/upper);
	var color = colors[normalized];
	return color;
}

function standingsColor(complete, cell, tier, next_tier, season, name, champmatch, drop) {
	if (complete == "No" || next_tier == "") {
		return;
	}
	var promotion = "#91eb9b";
	var protbd = "#e2f3a5";
	var demtbd = "#f4d7a4";
	var demotion = "#f0948d";
	if (/TBD/.test(next_tier)) {
		if (next_tier < tier) {
			cell.style.backgroundColor = protbd;
		} else {
			cell.style.backgroundColor = demtbd;
		}
	} else if (oddSchemes[season] && oddSchemes[season][tier]) {
		if (next_tier == oddSchemes[season][tier][0]) {
			cell.style.backgroundColor = promotion;
		} else if (next_tier == oddSchemes[season][tier][1]) {
			cell.style.backgroundColor = demotion;
		}
	} else if ((next_tier < tier || name.toLowerCase() == champ) && !drop) {
		cell.style.backgroundColor = promotion;
	} else if (next_tier > tier) {
		cell.style.backgroundColor = demotion;
	} else if (champ == "" && champmatch) {
		cell.style.backgroundColor = protbd;
	}
}

function rankColor(complete, cell, tier, rank, allRanks, ndRank, ndAllRanks, drop) {
	if (complete == "Yes") {
		return;
	}
	var promotion = "#91eb9b";
	var protbd = "#e2f3a5";
	var demtbd = "#f4d7a4"
	var demotion = "#f0948d";
	var nPlayers = allRanks.length;
	nPlayers = nPlayers < 6 ? 6 : nPlayers;
	var numtied = 0;
	for (let r of allRanks) {
		if (rank == r[1]) {numtied++;}
	}
	if (drop) {
		cell.style.backgroundColor = demotion;
	} else if (tier == "A" && rank <= 2) {
		cell.style.backgroundColor = protbd;
	} else if (ndRank !== null) {
		//adjustment scenarios
		let ndNumtied = 0;
		for (let r of ndAllRanks) {
			if (ndRank == r[1]) {ndNumtied++;}
		}
		let movementStatus = ["stay", "stay"];
		if (rank <= tierParams[tier]["promoters"]) {
			if (rank + numtied - 1 <= tierParams[tier]["promoters"]) {
				movementStatus[0] = "promotion";
			} else {
				movementStatus[0] = "protbd";
			}
		} else if (rank > nPlayers - tierParams[tier]["demoters"]) {
			movementStatus[0] = "demotion";
		} else if (rank + numtied - 1 > nPlayers - tierParams[tier]["demoters"]) {
			movementStatus[0] = "demtbd";
		}
		if (ndRank <= tierParams[tier]["promoters"]) {
			if (ndRank + ndNumtied - 1 <= tierParams[tier]["promoters"]) {
				movementStatus[1] = "promotion";
			} else {
				movementStatus[1] = "protbd";
			}
		} else if (ndRank > nPlayers - tierParams[tier]["demoters"]) {
			movementStatus[1] = "demotion";
		} else if (ndRank + ndNumtied - 1 > nPlayers - tierParams[tier]["demoters"]) {
			movementStatus[1] = "demtbd";
		}
		
		if (movementStatus[0] == movementStatus[1]) {
			switch (movementStatus[0]) {
				case "promotion":
					cell.style.backgroundColor = promotion;
					break;
				case "protbd":
					cell.style.backgroundColor = protbd;
					break;
				case "demtbd":
					cell.style.backgroundColor = demtbd;
					break;
				case "demotion":
					cell.style.backgroundColor = demotion;
					break;
			} 
		} else if (movementStatus[0] == "stay") {
			switch (movementStatus[1]) {
				case "promotion":
				case "protbd":
					cell.style.backgroundColor = protbd;
					break;
				case "demtbd":
				case "demotion":
					cell.style.backgroundColor = demtbd;
					break;
			}
		} else if (movementStatus[1] == "stay") {
			switch (movementStatus[0]) {
				case "promotion":
				case "protbd":
					cell.style.backgroundColor = protbd;
					break;
				case "demtbd":
				case "demotion":
					cell.style.backgroundColor = demtbd;
					break;
			}
		} else if ((movementStatus[0] == "protbd") || (movementStatus[1] == "protbd")) {
			cell.style.backgroundColor = protbd;
		} else if ((movementStatus[0] == "demtbd") || (movementStatus[1] == "demtbd")) {
			cell.style.backgroundColor = demtbd;
		}
	} else {
		if (rank <= tierParams[tier]["promoters"]) {
			if (rank + numtied - 1 <= tierParams[tier]["promoters"]) {
				cell.style.backgroundColor = promotion;
			} else {
				cell.style.backgroundColor = protbd;
			}
		} else if (rank > nPlayers - tierParams[tier]["demoters"]) {
			cell.style.backgroundColor = demotion;
		} else if (rank + numtied - 1 > nPlayers - tierParams[tier]["demoters"]) {
			cell.style.backgroundColor = demtbd;
		}
	}
}

function calcDroppedInfo(players, drops) {
	var numPlayers = Object.keys(players).length;
	var numDrops = drops.length;
	var droppedInfo = {};
	// Generate necessary information
	for (var d=0; d < numDrops; d++) {
		var droppedPlayer = drops[d];
		var droppedPlayerMatches = players[droppedPlayer];
		var droppedPlayerWins = droppedPlayerMatches["wins"];
		var droppedPlayerLosses = droppedPlayerMatches["losses"];
		var droppedPlayerPct;
		if (droppedPlayerWins == 0 && droppedPlayerLosses == 0) {
			droppedPlayerPct = 0;
		} else {
			droppedPlayerPct = droppedPlayerWins/(droppedPlayerWins+droppedPlayerLosses)
		}
		droppedInfo[droppedPlayer] = {}
		droppedInfo[droppedPlayer]["weight"] = (droppedPlayerWins+droppedPlayerLosses)/((numPlayers-1)*6);

		droppedInfo[droppedPlayer]["matches"] = {}
		for (var opp in players) {
			if (opp == droppedPlayer) continue;

			droppedInfo[droppedPlayer]["matches"][opp] = {"wins":{"total":0, "simulated":0, "real":0}, "losses":{"total":0, "simulated":0, "real":0}};
			var gamesToSimulate = 6;
			var oppPct = players[opp]["losses"]/(players[opp]["wins"]+players[opp]["losses"]);

			// Calculate "real" games
			if (opp in droppedPlayerMatches) {
				droppedPlayerWins_vs_Opp = droppedPlayerMatches[opp]["wins"];
				droppedPlayerLosses_vs_Opp = droppedPlayerMatches[opp]["losses"];
				gamesToSimulate = 6 - parseInt(droppedPlayerWins_vs_Opp + droppedPlayerLosses_vs_Opp);
				droppedInfo[droppedPlayer]["matches"][opp]["wins"]["real"] += droppedPlayerWins_vs_Opp;
				droppedInfo[droppedPlayer]["matches"][opp]["losses"]["real"] += droppedPlayerLosses_vs_Opp;
				droppedInfo[droppedPlayer]["matches"][opp]["wins"]["total"] += droppedPlayerWins_vs_Opp;
				droppedInfo[droppedPlayer]["matches"][opp]["losses"]["total"] += droppedPlayerLosses_vs_Opp
			}
			// Calculate "simulated' games"
			var simulatedWins = (oppPct+droppedPlayerPct)*gamesToSimulate/2;
			var simulatedLosses = gamesToSimulate - simulatedWins;
			droppedInfo[droppedPlayer]["matches"][opp]["wins"]["simulated"] = simulatedWins;
			droppedInfo[droppedPlayer]["matches"][opp]["losses"]["simulated"] = simulatedLosses;
			droppedInfo[droppedPlayer]["matches"][opp]["wins"]["total"] += simulatedWins;
			droppedInfo[droppedPlayer]["matches"][opp]["losses"]["total"] += simulatedLosses;
		}
	}
	return droppedInfo;
}

/* Interactive Buttons */
function checkSwitch(toggler){
	if (testing) console.log("Toggling switch");
	var parent = toggler.parentElement.parentElement.parentElement.parentElement.parentElement;
	var children = parent.children;

	if(toggler.checked) {
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.className == `raw-standings-table`) {
				child.style.display = "";
			} else if (child.className != 'header-table') {
				child.style.display = "none";
			}
		}
	} else {
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.className == `standings-table`) {
				child.style.display = "";
			} else if (child.className != 'header-table') {
				child.style.display = "none";
			}
		}
	}
}

function selectTab(btn) {
	var tab = btn.innerHTML;
	var tabToOpen = btn;
	var parent = btn.parentElement.parentElement.parentElement.parentElement;
	if (testing) console.log(`Opening ${tab} button`);

	/*var toggler = checkSwitch(curTab.children[0]);*/
	// Remove active from button siblings
	var curTab = tabToOpen;
	var toggler;
	while (curTab = curTab.nextSibling) {
		curTab.classList.remove('active');
		if(curTab.className == "switch") {
			toggler = curTab;
		}
	}
	curTab = tabToOpen;
	while (curTab = curTab.previousSibling) {
		curTab.classList.remove('active');
	}
	tabToOpen.classList.add('active');

	// Open the right table and hide others
	var children = parent.children;
	if (tab.toLowerCase() == "matches" || tab.toLowerCase() == "sims"){
		parent.style.overflow = "auto";
	} else {
		parent.style.overflow = "visible";
	}

	for (var i = 0; i < children.length; i++) {
		var child = children[i];
		if (tab == "Standings" && toggler && child.className.includes(`${tab.toLowerCase()}`)) {
			if (toggler.children[0].checked && child.className == `raw-standings-table`) {
				child.style.display = "";
			} else if (!toggler.children[0].checked && child.className == `standings-table`){
				child.style.display = "";
			}
		} else if (child.className == `${tab.toLowerCase()}-table`) {
			child.style.display = "";
			if (toggler) toggler.style.display = "none";
		} else if (child.className != 'header-table') {
			child.style.display = "none";
			if (toggler) toggler.style.display = "none";
		}
	}
	if (tab == "Standings" && toggler) {
		toggler.style.display = "";
	}
}

/* Generative Functions */
function genHeader(division, members, complete, link, drops, customText="", noSims){
	var table = document.createElement("table");
	table.classList.add('header-table');

	var seasonRow = document.createElement("tr");
	var seasonHeader = document.createElement("td");
	table.appendChild(seasonRow);
	seasonRow.appendChild(seasonHeader);
	var text = customText == "" ? `Division ${division}` : customText;
	text = complete == "Yes" ? text + " (complete)" : text;
	var chartsLink = `<a href="/charts?player=${members.join(",")}" target="_blank"><img src="/img/icons/charts.png" class="sheets-icon" title="Player Charts for this Division"></a>`
	var sheetsLink = link ? `<a href="${link}" target="_blank"><img src="/img/icons/sheets.png" class="sheets-icon" title="View on Google Sheets"></a>` : "";
	seasonHeader.innerHTML = `<p>${text} ${sheetsLink} ${chartsLink}</p>`;
	seasonHeader.style.backgroundColor = "lightgrey";
	seasonHeader.setAttribute('colspan', 10);
	seasonHeader.classList.add('division-header');

	var buttons = ["Standings", "Grid", "Matches"];
	if((drops.length > 0) && !noSims) buttons.push("Sims");
	for (var b=0; b < buttons.length; b++){
		var button = document.createElement("button");
		button.innerHTML = buttons[b];
		button.setAttribute("onclick", "selectTab(this)");
		if (buttons[b] == "Standings") {
			button.classList.add("active");
		}
		seasonHeader.appendChild(button);
	}
	if (drops.length > 0) {
		var switchLabel = document.createElement("label");
		switchLabel.classList.add("switch");
		var switchInput = document.createElement("input");
		switchInput.classList.add("checked");
		switchInput.setAttribute("onclick", "checkSwitch(this)");
		switchInput.setAttribute("type", "checkbox");
		var switchSlider = document.createElement("div");
		switchSlider.classList.add("slider");
		switchSlider.classList.add("round");
	if (noSims) {switchSlider.classList.add("nosim");}
		switchLabel.appendChild(switchInput);
		switchLabel.appendChild(switchSlider);

		seasonHeader.appendChild(switchLabel);
	}
	return table;
}

function genIndividualMatch(player, players, scores, isRaw, drops) {
	var span = document.createElement("div");
	span.classList.add("cellDetail");
	var table = document.createElement("table");
	table.classList.add("individual-match-table");
	span.appendChild(table);
	var tableHeadings = ["Match", "Result"];

	var headingRow = document.createElement("tr");
	headingRow.style.backgroundColor = "rgb(224, 224, 224)";
	for (let j = 0; j < tableHeadings.length; j++) {
			var th = document.createElement("th");
			th.innerHTML = tableHeadings[j];
			//th.style.width = headingWidths[j];");
			headingRow.appendChild(th);
	}
	table.appendChild(headingRow);

	for (var p=0; p < players.length; p++) {
		var row = document.createElement("tr");
		var opponent = players[p];
		var match = `${player} vs. ${opponent}`;
		var strike = isRaw && (drops.includes(opponent) || drops.includes(players[p]));
		match = strike ? `${match} (drop)` : match;
		var score;
		if (player == players[p]) continue;
		if (opponent in scores[player]) {
			score = `${scores[player][opponent]["wins"]} - ${scores[player][opponent]["losses"]}`;
		} else {
			score = "0 - 0";
		}
		score = strike ? `<s>${score}</s>` : score;
		var cell1 = document.createElement("td");
		cell1.innerHTML = match;
		var cell2 = document.createElement("td");
		cell2.innerHTML = score;
		row.append(cell1);
		row.append(cell2);
		table.append(row);
	}
	return span;
}

function genSimulations(players, drops, sorted, simType){
	var table = document.createElement("table");
	table.classList.add('sims-table');
	table.style.display = "none";

	if (testing) console.log("Generating Simulations table...");
	var droppedInfo = calcDroppedInfo(players, drops);
	var noWeighting = (simType == "old");

	var tableHeadings = noWeighting ? ["Opponent", "Played", "Simmed", "Total"] : ["Opponent", "Played", "Simmed", "Total", "W. Total"];

	for (var d=0; d < drops.length; d++) {
		var droppedPlayer = drops[d];
		var droppedPlayerInfo = droppedInfo[droppedPlayer];
		var droppedRow = document.createElement("tr");
		var droppedHeader = document.createElement("td");
		droppedHeader.setAttribute('colspan', 5);
		droppedHeader.classList.add('dropped-header');
		droppedHeader.innerHTML = `Dropped Player: ${droppedPlayer}` + (noWeighting ? "" : ` (weight: ${Math.round(droppedPlayerInfo["weight"]*100)}%)`);
		droppedRow.appendChild(droppedHeader);
		table.appendChild(droppedRow);
		var headingRow = document.createElement("tr");
		headingRow.style.backgroundColor = "rgb(224, 224, 224)";
		for (let j = 0; j < tableHeadings.length; j++) {
				var th = document.createElement("th");
				th.innerHTML = tableHeadings[j];
				headingRow.appendChild(th);
		}
		table.appendChild(headingRow);
		for (var s=0; s < sorted.length; s++) {
			var opponent = sorted[s];
			if (droppedPlayer == opponent) continue;

			var droppedPlayerInfo_vs_Opponent = droppedPlayerInfo["matches"][opponent];
			var weight = droppedPlayerInfo["weight"];
			var realLosses = droppedPlayerInfo_vs_Opponent["wins"]["real"].toFixed(1).replace(".0", "");
			var realWins = droppedPlayerInfo_vs_Opponent["losses"]["real"].toFixed(1).replace(".0", "");
			var simLosses = droppedPlayerInfo_vs_Opponent["wins"]["simulated"].toFixed(1).replace(".0", "");
			var simWins = droppedPlayerInfo_vs_Opponent["losses"]["simulated"].toFixed(1).replace(".0", "");
			var totalLosses = droppedPlayerInfo_vs_Opponent["wins"]["total"].toFixed(1).replace(".0", "");
			var totalWins = droppedPlayerInfo_vs_Opponent["losses"]["total"].toFixed(1).replace(".0", "");
			var weightedLosses = (droppedPlayerInfo_vs_Opponent["wins"]["total"]*droppedPlayerInfo["weight"])
			var weightedWins = (weight*6 - weightedLosses).toFixed(1).replace(".0", "");
			weightedLosses = weightedLosses.toFixed(1).replace(".0", "");

			var row = document.createElement("tr");
			var info = noWeighting ? [formatDbLink(opponent, "db-link"), `${realWins} - ${realLosses}`, `${simWins} - ${simLosses}`, `${totalWins} - ${totalLosses}`] : [formatDbLink(opponent, "db-link"), `${realWins} - ${realLosses}`, `${simWins} - ${simLosses}`, `${totalWins} - ${totalLosses}`, `${weightedWins} - ${weightedLosses}`];
			for (i=0; i<info.length; i++) {
				var infoCell = document.createElement("td");
				infoCell.innerHTML = info[i];
				row.append(infoCell);
			}

			table.appendChild(row);
		}
	}
	return table;
}


function genStandings(data, tier, season, players, sorted, drops, complete, isRaw) {
	if (testing) console.log("Generating standings...");
	var table = document.createElement("table");
	var tableClass = isRaw ? 'raw-standings-table' : 'standings-table';
	if (isRaw) table.style.display = "none";
	table.classList.add(tableClass);

	var sortedRankedMembers = Object.keys(data).map(function(key) {
		return [key, data[key]];
	});
	sortedRankedMembers.sort(function(x, y) {
		return x[1]["rank"] - y[1]["rank"];
	});
	var sortedRanks = sortedRankedMembers.map(x => [x[0], x[1]["rank"]]);
	var numDrops = drops.length;
	var numPlayers = sortedRankedMembers.length;

	var tbValues = {};
	var promotion = "";
	var demotion = "";
	
	var noDropRanks = {};
	for (player in data) {noDropRanks[player] = null;}
	var sortedNoDropRanks = null;

	/* helper functions*/
	function isReturning(name){
		if (data[name]["drop"] == "Yes") {
			return "N";
		}
		return data[name]["returning"];
	}

	function calcTiebreakers() {
		for (var member in data) {
			if (data[member].tiebreaker) {
				tbValues[member] = data[member].tiebreaker;
			}
		}	
	}
	
	calcTiebreakers();
	
	//get adjusted standings - untested
	/*
	if (numDrops && complete == "No") {
		sortedNoDropRanks = [];
		for (player of players) {
			if (data[player][drop] == "No") {
				sortedNoDropRanks.push({"player": player, "pct": players[player]["wins_nondrop"]/players[player]["games_nondrop"], tb: -1});
			}
		}
		for (let i = sortedNoDropRanks.length - 1; i >= 0; i--) {
			if (sortedNoDropRanks[i].tb == -1) {
				let tieds = [i];
				for (let j=0; j<i; j++) {
					if (sortedNoDropRanks[i].pct == sortedNoDropRanks[j].pct) {
						tieds.push(j);
					}
				}
				let tcount = tieds.length;
				for (let j=0; j<tcount; j++) {
					sortedNoDropRanks[tieds[j]].tb = 0;
					for (let k=0; k<tcount; k++) {
						if (j != k) {
							sortedNoDropRanks[tieds[j]].tb += (sortedNoDropRanks[tieds[k]].name in players[sortedNoDropRanks[tieds[j]].name]) ? players[sortedNoDropRanks[tieds[j]]][sortedNoDropRanks[tieds[k]].name].wins : 0;
						}
					}
				}
			}
		}
		sortedNoDropRanks.sort((a,b) => {
			let wpd = b.pct - a.pct;
			if (wpd) {
				return wpd;
			} else {
				return b.tb - a.tb;
			}
		});
		sortedNoDropRanks[0].rank = 1;
		for (let i=1; i<sortedNoDropRanks.length; i++) {
			if ((sortedNoDropRanks[i].pct == sortedNoDropRanks[i-1].pct) && (sortedNoDropRanks[i].tb == sortedNoDropRanks[i-1].tb)) {
				sortedNoDropRanks[i].rank = sortedNoDropRanks[i-1].rank;
			} else {
				sortedNoDropRanks[i].rank = i+1;
			}
		}
		for (let rs of sortedNoDropRanks) {
			noDropRanks[rs.name] = rs.rank;
		}
		sortedNoDropRanks = noDropRanks.map(x => [x.name, x.rank]);
	}
	*/

	var tableHeadings, tableDescriptions, headingWidths;
	var tierIcon = "<img src='/img/icons/tier.png' title='Tier next season'>";
	var returningIcon = "<img src='/img/icons/returning.png' title='Returning next season?'>";
	if (isRaw) {
		tableHeadings = ["#", "Player", "Wnd%", "Wnd", "Lnd", "Wd%", "Wd", "Ld"];
	tableDecriptions = ["Rank", "", "Win Percentage without games of dropped players", "Wins without games of dropped players", "Losses without games of dropped players", "Win Percentage with all games", "Wins with all games", "Losses with all games"];
		headingWidths = ["6%", "35%", "10%", "10%", "10%", "10%", "10%","9%"];
	} else if (Object.keys(tbValues).length > 0) {
		if (complete == "Yes") {
			tableHeadings = ["#", "Player", "W%", "W", "L", "TB", tierIcon, returningIcon];
		tableDecriptions = ["Rank", "", "Win Percentage", "Wins", "Losses", "Tiebreaker (head-to-head)", "Tier next season", "Returning next season?"];
			headingWidths = ["6%", "35%", "11%", "11%", "11%", "10%", "8%","8%"];
		} else {
			tableHeadings = ["#", "Player", "W%", "W", "L", "TB", "MC", returningIcon];
		tableDecriptions = ["Rank", "", "Win Percentage", "Wins", "Losses", "Tiebreaker (head-to-head)", "Matches Completed", "Returning next season?"];
			headingWidths = ["6%", "35%", "11%", "11%", "11%", "8%", "11%","7%"];
		}
	} else {
		if (complete == "Yes") {
			tableHeadings = ["#", "Player", "W%", "W", "L", tierIcon, returningIcon];
		tableDecriptions = ["Rank", "", "Win Percentage", "Wins", "Losses", "Tier next season", "Returning next season?"];
			headingWidths = ["6%", "35%", "14%", "14%", "14%", "8%", "8%"];
		} else {
			tableHeadings = ["#", "Player", "W%", "W", "L", "MC", returningIcon];
		tableDecriptions = ["Rank", "", "Win Percentage", "Wins", "Losses", "Matches Completed", "Returning next season?"];
			headingWidths = ["6%", "35%", "14%", "12%", "12%", "13%", "8%"];
		}
	}

	var headingRow = document.createElement("tr");
	headingRow.style.backgroundColor = "rgb(224, 224, 224)";
	for (let j = 0; j < headingWidths.length; j++) {
			var th = document.createElement("th");
			th.innerHTML = tableHeadings[j];
		if (tableDecriptions[j]) {th.title = tableDecriptions[j];}
			th.style.width = headingWidths[j];
			if (tableHeadings[j].length > 10) {
				th.classList.add("header-icon");
			}
			headingRow.appendChild(th);
	}
	table.appendChild(headingRow);


	function tierOrMatches(playerData, cell) {
		if (complete == "Yes") {
			cell.innerHTML = playerData["next tier"];
			cell.classList.add("center-text");
		} else {
			if (playerData["drop"] == "Yes" && isRaw) {
				games = playerData["wins"] + playerData["losses"];
			}
			var games = playerData["games_nondrop"];
			var matches = isRaw ? Math.floor(games/6) : numDrops + Math.floor(games/6);
			var remainder;
			if (!isRaw && playerData["drop"] == "Yes") {
				remainder = "";
				games = 6*(numPlayers - numDrops - 1);
				matches = numPlayers -1;
			} else if (games%6 == 0) {
				remainder = "";
			} else if (games%3 == 0) {
				remainder = " &#189;";
			} else if (games%2 == 0) {
				var gamesLeft = games%6;
				if (gamesLeft/2 == 1) {
					remainder = " &#8531;";
				} else { // gamesLeft/2 == 2
					remainder = " &#8532;"
				}
			} else if (games%6 == 1) {
				remainder = " &#8537;"
			} else if (games%6 == 5) {
				remainder = " &#8538;"
			}
			var text = matches == 0 && games > 0 ? remainder : `${matches}` + remainder;
			cell.innerHTML = text;
			cell.style.backgroundColor =  matchGreyscaleColor(6*numDrops + games, 6*(numPlayers-1));
		}
	}

	for (var keypair of sortedRankedMembers) {
		var playerData = data[keypair[0]];
		var name = playerData["name"];

		function calcPct(wins, losses) {
			if (wins == 0 && losses == 0) {
				return "0%";
			} else {
				return `${Math.round(wins/(wins + losses)*100)}%`;
			}
		}

		var droppedInfo = {
			"rank" : playerData["rank"] ,
			"name" : formatDbLink(name, "db-link", playerData["drop"]),
			"pct" : calcPct(playerData["wins_nondrop"],playerData["losses_nondrop"]),
			"wins" : playerData["wins_nondrop"].toFixed(1).replace(".0", ""),
			"losses" : playerData["losses_nondrop"].toFixed(1).replace(".0", ""),
			"pctAll" : calcPct(playerData["wins_wdrop"],playerData["losses_wdrop"]),
			"winsAll" : playerData["wins_wdrop"].toFixed(1).replace(".0", ""),
			"lossesAll" : playerData["losses_wdrop"].toFixed(1).replace(".0", "")
		}

		var err = false; //playerData["wins"] == 0 && playerData["losses_wdrop"] + playerData["wins_wdrop"] > 0 ? true : false;

		var nonDroppedInfo = {
			"rank" : playerData["rank"] ,
			"name" : formatDbLink(name, "db-link", playerData["drop"]),
			"pct" : playerData["pct"],
			"wins" : playerData["wins"],
			"losses" : playerData["losses"],
			"tierOrMatches" : err ? "Err" : "",
			"returning" : isReturning(name)
		}

		var rowInfo = isRaw ? droppedInfo : nonDroppedInfo;
		var row = document.createElement("tr");
		for (var info in rowInfo) {
			var cell = document.createElement("td");
			cell.innerHTML = rowInfo[info];
			switch (info) {
				case "rank":
					rankColor(complete, cell, tier, playerData["rank"], sortedRanks, noDropRanks[name], sortedNoDropRanks, playerData["drop"] == "Yes");
					break;
				case "name":
					standingsColor(complete, cell, tier, playerData["next tier"], season, playerData["name"], tier == "A" && playerData["rank"] <= 2, playerData["drop"] == "Yes");
					cell.classList.add("cellWithDetail");
					cell.append(genIndividualMatch(playerData["name"], sorted, players, isRaw, drops));
					break;
				case "wins":
					if (drops.includes(name) && isRaw) {
						cell.innerHTML = "";
						cell.style.backgroundColor = "gray";
					}
					break;
				case "losses":
					if (drops.includes(name) && isRaw) {
						cell.innerHTML = "";
						cell.style.backgroundColor = "gray";
					}
					break;
				case "pct" :
					if (playerData["wins"] + playerData["losses"] == 0) {
						cell.style.backgroundColor = "#f1f1f1";
					} else if (!isRaw) {
						cell.style.backgroundColor = playerData["color"];
					} else if (drops.includes(name)) {
						cell.innerHTML = "";
						cell.style.backgroundColor = "gray";
					} else {
						cell.style.backgroundColor = matchColor(parseInt(rowInfo[info]), 100);
					}
					break;
				case "pctAll":
					cell.style.backgroundColor = matchColor(parseInt(rowInfo[info]), 100);
					break;
				case "tierOrMatches":
					tierOrMatches(playerData, cell);
					if (Object.keys(tbValues).length > 0) {
						var tbCell = document.createElement("td");
						tbCell.style.color = "darkgray";
						if (isRaw) {
							var rawWins = playerData["wins_nondrop"];
							var rawLosses = playerData["losses_nondrop"];
							var diff = ((rawWins - rawLosses)/2).toFixed(1).replace(".0", "");
							tbCell.innerHTML = diff;
						} else if (name in tbValues) {
							tbCell.innerHTML = tbValues[name].toString();
						} else {
							tbCell.innerHTML = "0";
						}
						row.append(tbCell);
					}
					break;
			}
			row.append(cell);
		}
		table.append(row);
	}
	return table;
}

function genResults(results) {
	var table = document.createElement("table");
	table.classList.add('matches-table');
	table.style.display = "none";
}

function genMatches(data, drops, sorted) {
	if (testing) console.log("Generating matches table...");

	var table = document.createElement("table");
	table.classList.add('matches-table');
	table.style.display = "none";

	var numMatches = {1: 0, 2: 1, 3: 3, 4: 6, 5: 10, 6: 15, 7: 21};
	var split = 1;//sorted.length >= 5 ? 2 : 1;
	var matches = numMatches[sorted.length];

	//var tableHeadings = ["Match", "Result", "Sessions", "Done?"];
	//var headingWidths = ["48%", "22%", "17%", "13%"];
	var tableHeadings = ["Match", "Result", "Done?"];
	//var headingWidths = ["64%", "28%", "18%"];
	//tableHeadings = split == 2 ? tableHeadings.concat(tableHeadings) : tableHeadings;
	// headingWidths = split == 2 ? ["30%", "12%", "8%", "30%", "12%", "8%"] : headingWidths;
	var headingRow = document.createElement("tr");
	headingRow.style.backgroundColor = "rgb(224, 224, 224)";
	for (let j = 0; j < tableHeadings.length; j++) {
			var th = document.createElement("th");
			th.innerHTML = tableHeadings[j];
			//th.style.width = headingWidths[j];
			headingRow.appendChild(th);
	}
	table.appendChild(headingRow);

	var matches = [];
	for (var i=0; i < sorted.length; i++) {
		for (var j=i+1; j<sorted.length; j++){
			var player = sorted[i];
			var opponent = sorted[j];
			var match = `${player} vs. ${opponent}`;
			var result = "0 - 0";
			var sessions = 0;
			var completed = "No";
			if (opponent in data[player]) {
				result = `${data[player][opponent]["wins"].toString()} - ${data[player][opponent]["losses"].toString()}`;
				completed = data[player][opponent]["complete"];
				sessions = data[player][opponent]["sessions"];
			} else if (drops.includes(opponent) || drops.includes(player)) {
				match = `<s>${match}</s>`;
				completed = "N/A";
				sessions = "N/A";
			}
			matches.push({"match":match, "result":result, "completed":completed})
		}
	}

	var halfpoint = matches.length //split == 2 ?  Math.ceil(matches.length/2) : matches.length;

	for (var i=0; i < halfpoint; i++) {
		var row = document.createElement("tr");
		var info = matches[i];
		for (var key in info) {
			var cell = document.createElement("td");
			cell.innerHTML = info[key];
			row.append(cell);
		}
		table.append(row)
	}

	return table;
}

function genGrid(data, drops, sorted) {
	if (testing) console.log("Generating grid...");
	var table = document.createElement("table");
	table.classList.add('grid-table');
	table.style.display = "none";


	var tableHeadings = [""]; //Placeholder for match completion rate.
	for (var m=0; m < sorted.length; m++) {
		tableHeadings[tableHeadings.length] = sorted[m];
	}
	var widths = {1: "50%", 2:"25%", 3:"20%", 4:"18%", 5:"14%", 6:"12%", 7:"10%"};
	//var firstWidths = {1: "50%", 2:"50%", 3:"40%", 4:"28%", 5:"30%", 6:"28%", 7:"30%"};
	var numPlayers = tableHeadings.length - 1;
	var headingRow = document.createElement("tr");
	for (let j = 0; j < tableHeadings.length; j++) {
			var th = document.createElement("th");
			if (j == 0) {
				th.innerHTML = tableHeadings[j];
				//th.style.width = firstWidths[numPlayers];
			} else {
				th.innerHTML = formatDbLink(tableHeadings[j], "db-link");
				//th.style.width = widths[numPlayers];
				//th.classList.add("verticalTableHeader");
			}
			headingRow.appendChild(th);
	}
	table.appendChild(headingRow);

	for (var m=0; m < sorted.length; m++) {
		var playerName = sorted[m];
		var row = document.createElement("tr");
		var playerCell = document.createElement("td");
		playerCell.innerHTML = formatDbLink(playerName, "db-link");
		row.append(playerCell);
		for (var opp=0; opp < sorted.length; opp++) {
			var opponent = sorted[opp];
			var cell = document.createElement("td");
			cell.innerHTML = "";
			cell.style.backgroundColor = "lightgrey";
			if (playerName == opponent) {
				cell.style.backgroundColor = "gray";
			} else if (opponent in data[playerName]){
				cell.innerHTML = data[playerName][opponent]["wins"];
				cell.style.backgroundColor = matchColor(data[playerName][opponent]["wins"], 6);
			} else if (drops.includes(opponent)) {
				//cell.classList.add("crossed");
			} else if (drops.includes(playerName)) {
				//cell.classList.add("crossed");
			} else {
			}
			row.append(cell);
		}
		table.appendChild(row);
	}
	return table;
}


function loadDivision(divisionDiv, divisionData, link, division, season, params) {
	console.log(`Loading ${division} standings...`);

	// Get information
	var name = divisionData["name"];
	var tier = divisionData["tier"];
	//var results = divisionData["results"];
	var standings = divisionData["members"];
	var players = divisionData["by_player"];
	var drops = divisionData["late drops"];
	var complete = divisionData["complete?"];
	//var tiebreaker = divisionData["tiebreaker"];
	var simType = (Number(season) >= 50) ? "none" : (Number(season) >= 42) ? "new" : (Number(season) >= 28) ? "old" : "none";

	// Compute sorted player list with drops last
	var sorted = Object.keys(players);
	sorted.sort(
		function(a, b) {
			if (drops.includes(a) && !(drops.includes(b))) {
				return 1;
			} else if (drops.includes(b)) {
				return -1;
			} else {
				if (a.toLowerCase() < b.toLowerCase()) return -1;
				if (a.toLowerCase() > b.toLowerCase()) return 1;
				return 0;
			}
		}
	);

	var standingsDiv = document.createElement("div");
	standingsDiv.classList.add(`standings`);
	divisionDiv.appendChild(standingsDiv);


	var headerText = params["headerText"] ? params["headerText"] : "";
	playerQuery = params["playerNameKey"] ? params["playerNameKey"] : playerQuery;
	champ = params["champ"] ? params["champ"] : champ;
	var header = genHeader(division, sorted, complete, link, drops, headerText, simType == "none");
	var standingsTable = genStandings(standings, tier, season, players, sorted, drops, complete, false);

	if (!params["playerNameKey"]) {
		standingsDiv.setAttribute("id", `${division.toLowerCase()}-standings`);
		standingsDiv.classList.add(`filterDiv`);
		standingsDiv.classList.add(`div${tier}`);
	}
	var gridTable = genGrid(players, drops, sorted);
	var matchesTable = genMatches(players, drops, sorted);
	standingsDiv.appendChild(header);
	standingsDiv.appendChild(standingsTable);
	if (drops.length > 0 ){
		var rawStandingsTable = genStandings(standings, tier, season, players, sorted, drops, complete, true);
		standingsDiv.appendChild(rawStandingsTable);
	}
	standingsDiv.appendChild(gridTable);
	standingsDiv.appendChild(matchesTable);
	if((drops.length > 0) && (simType != "none")) {
		standingsDiv.appendChild(genSimulations(players, drops, sorted, simType));
	}
}
