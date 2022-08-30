---
---

//data

const da = {{ site.data.chart_data | jsonify }}
const cur = {{ site.data.current_season | jsonify }}

//helpers

var ChartUtils = {};

ChartUtils.curString = String(cur.season);
ChartUtils.tierColors = ["#FF00FF","#9900FF","#0000FF","#4A85E8","#00FFFF","#00FF00","#FFFF00","#FF9800","#FF0000","#980000", "#B7B7B7"];
ChartUtils.standingsColors = ["#E77B72", "#E88372", "#EA8C71", "#EC956F", "#EF9E6E", "#F2A76D", "#F4B06B", "#F7B96B", "#F9C269", "#FCCB67", "#FED467", "#F2D467", "#E2D26B", "#D0CF6F", "#C0CC73", "#AFCA76", "#9EC77A", "#8CC47E", "#7CC181", "#6DBF84", "#5BBC88"];
ChartUtils.darkColors = ["#000000", "#D0D0D0", "#ABAB0C", "#09823B", "#AD5211", "#5E11B8"];
ChartUtils.lightColors = ["#B3B3B3", "#FFFFFF", "#FAFAB7", "#88F7B6", "#F6C5A2", "#C9A2F6"];
ChartUtils.clickableNames = null;
ChartUtils.widthcheck = document.getElementById('widthcheck');

ChartUtils.getURLparams = function() {
	if (window.location.search) {
		let params = new URLSearchParams(window.location.search);
		if (params.has('player')) {
			PlayerPlot.player = params.get('player').split(",");
			let psgiven = PlayerPlot.player.length;
			if (psgiven > 6) {
				PlayerPlot.player.splice(6, psgiven - 6);
			} else if (psgiven < 6) {
				for (let i = psgiven; i < 6; i++) {
					PlayerPlot.player.push(null);
				}
			}
		}
		PlayerPlot.proportion = Boolean(params.get('prop') === 'true');
		if (PlayerPlot.proportion) {document.getElementById('prop').checked = "checked";}
		if (params.has('seasons')) {
			let urlRange = params.get('seasons').split(",").map(x => Number(x));
			if (urlRange.length == 2 && urlRange[0] > 0) {
				urlRange = urlRange[0] > urlRange[1] ? urlRange.reverse() : urlRange;
				if(urlRange[0] <= cur.season) {
					if (urlRange[1] > cur.season) {urlRange[1] = cur.season;}
					PlayerPlot.seasonRange = urlRange;
					PlayerPlot.userSetRange = true;
					PlayerPlot.seasonslide1.value = PlayerPlot.seasonRange[0];
					PlayerPlot.seasontextmin.value = PlayerPlot.seasonRange[0]
					PlayerPlot.seasonslide2.value = PlayerPlot.seasonRange[1];
					PlayerPlot.seasontextmax.value = PlayerPlot.seasonRange[1];
				}
			}
		}
	}
};
ChartUtils.setURLparams = function() {
	let searchString = "?"
	if (PlayerPlot.getPlayerCount()) {
		searchString += "player=" + PlayerPlot.player.filter(x => x).join(",").replace(" ", "%20");
	}
	if (PlayerPlot.proportion) {
		searchString += "&".repeat(searchString.length > 1) + "prop=true";
	}
	if (PlayerPlot.userSetRange) {
		searchString += "&".repeat(searchString.length > 1) + "seasons=" + PlayerPlot.seasonRange.join(",");
	}
	if (searchString.length > 1) {
		window.history.replaceState(null, null, searchString);
	}
}

ChartUtils.openModal = function() {
	document.getElementById("charts-modal").style.display = "block";
};

ChartUtils.closeModal = function() {
	document.getElementById("charts-modal").style.display = "none";
};

document.getElementById('closemodal').onclick = ChartUtils.closeModal;

window.onclick = function(ev) {
	if (ev.target == document.getElementById('charts-modal')) {
		ChartUtils.closeModal();
	}
};

ChartUtils.setClickableNames = function() {
	ChartUtils.clickableNames = document.getElementsByClassName("clickable-name");
	for (let i=ChartUtils.clickableNames.length-1; i>=0; i--) {
		ChartUtils.clickableNames[i].onclick = function(ev) {
			PlayerPlot.addPlayer(ev.target.innerText);
			ChartUtils.closeModal();
		}
	}
};

//player history chart

var PlayerPlot = {};

PlayerPlot.counts = {};
for (let s in da.divisions) {
	PlayerPlot.counts[s] = {};
	let totalPlayers = 0;
	for (let d in da.divisions[s]) {
		let tier = d.charAt(0);
		let ps = da.divisions[s][d].length;
		if (PlayerPlot.counts[s][tier]) {
			PlayerPlot.counts[s][tier].divisions += 1;
			PlayerPlot.counts[s][tier].players += ps;
		} else {
			PlayerPlot.counts[s][tier] = {"divisions": 1, "players": ps, "countBase": totalPlayers};
		}
		totalPlayers += ps;
	}
	for (let tier in PlayerPlot.counts[s]) {
		PlayerPlot.counts[s][tier].lfrac = PlayerPlot.counts[s][tier].players/totalPlayers;
		PlayerPlot.counts[s][tier].propBase = PlayerPlot.counts[s][tier].countBase/totalPlayers;
	}
}
PlayerPlot.counts[ChartUtils.curString] = {};
PlayerPlot.curTotalPlayers = 0;
for (let d in cur) {
	if (/^[A-J]\d+$/.test(d)) {
		let tier = d.charAt(0);
		let ps = Object.keys(cur[d].members).length;
		if (PlayerPlot.counts[ChartUtils.curString][tier]) {
			PlayerPlot.counts[ChartUtils.curString][tier].divisions += 1;
			PlayerPlot.counts[ChartUtils.curString][tier].players += ps;
		} else {
			PlayerPlot.counts[ChartUtils.curString][tier] = {"divisions": 1, "players": ps, "countBase": PlayerPlot.curTotalPlayers};
		}
		PlayerPlot.curTotalPlayers += ps;
	}
}
for (let tier in PlayerPlot.counts[ChartUtils.curString]) {
	PlayerPlot.counts[ChartUtils.curString][tier].lfrac = PlayerPlot.counts[ChartUtils.curString][tier].players/PlayerPlot.curTotalPlayers;
	PlayerPlot.counts[ChartUtils.curString][tier].propBase = PlayerPlot.counts[ChartUtils.curString][tier].countBase/PlayerPlot.curTotalPlayers;
}


PlayerPlot.proportion = false;
PlayerPlot.allTiers = false;
PlayerPlot.player = [null,null,null,null,null,null];
PlayerPlot.seasonRange = [1,cur.season];
PlayerPlot.userSetRange = false;

PlayerPlot.plot = null;

PlayerPlot.getPlayerCount = function() {
	let out = 0;
	for (p of PlayerPlot.player) {
		if (p) {out += 1;}
	}
	return out;
}

PlayerPlot.seasonslide1 = document.getElementById("pseasonslide1");
PlayerPlot.seasonslide2 = document.getElementById("pseasonslide2");
PlayerPlot.seasontextmin = document.getElementById("pseasontextmin");
PlayerPlot.seasontextmax = document.getElementById("pseasontextmax");
PlayerPlot.rangeReset = document.getElementById('rangereset');
PlayerPlot.playerChange = document.getElementById('playerchange');
PlayerPlot.playerClear = document.getElementById('clearplayer');
PlayerPlot.playerButtons = document.getElementById('playerbuttons');
PlayerPlot.countRadio = document.getElementById('count');
PlayerPlot.propRadio = document.getElementById('prop');
PlayerPlot.allTiersCheck = document.getElementById('allTiers');
PlayerPlot.prepControls = function() {
	PlayerPlot.seasonslide1.max = ChartUtils.curString;
	PlayerPlot.seasonslide2.max = ChartUtils.curString;
	PlayerPlot.seasonslide2.value = ChartUtils.curString;
	PlayerPlot.seasontextmax.value = ChartUtils.curString;

	PlayerPlot.seasonslide1.oninput = PlayerPlot.slideinput;
	PlayerPlot.seasonslide2.oninput = PlayerPlot.slideinput;
	PlayerPlot.seasontextmax.oninput = PlayerPlot.textinput;
	PlayerPlot.seasontextmin.oninput = PlayerPlot.textinput;
	PlayerPlot.seasontextmax.onblur = PlayerPlot.slideinput;
	PlayerPlot.seasontextmin.onblur = PlayerPlot.slideinput;
	
	PlayerPlot.rangeReset.onclick = PlayerPlot.resetRange;
	PlayerPlot.playerChange.onclick = function() {
		PlayerPlot.addPlayer(document.getElementById('player-input').value);
	};
	PlayerPlot.playerClear.onclick = function() {
		document.getElementById('player-input').value = "";
		PlayerPlot.player = [];
		PlayerPlot.playerButtons.innerHTML = "";
		ChartUtils.setURLparams();
		if (PlayerPlot.userSetRange) {PlayerPlot.makePlot();} else {PlayerPlot.resetRange();};
	};
	PlayerPlot.countRadio.onclick = function() {
		PlayerPlot.countRadio.blur();
		if (PlayerPlot.proportion) {
			PlayerPlot.proportion = false;
			PlayerPlot.allTiers = PlayerPlot.allTiersCheck.checked;
			ChartUtils.setURLparams();
			PlayerPlot.makePlot();
		}
	};
	PlayerPlot.propRadio.onclick = function() {
		PlayerPlot.propRadio.blur();
		if (!PlayerPlot.proportion) {
			PlayerPlot.proportion = true;
			ChartUtils.setURLparams();
			PlayerPlot.makePlot();
		}
	};
	PlayerPlot.allTiersCheck.onclick = function() {
		PlayerPlot.allTiersCheck.blur();
		if (PlayerPlot.allTiersCheck.classList.contains("fixed-check")) {
			PlayerPlot.allTiersCheck.checked = !PlayerPlot.allTiersCheck.checked;
		} else {
			PlayerPlot.allTiers = PlayerPlot.allTiersCheck.checked;						
			PlayerPlot.makePlot();
		}
	};
};
PlayerPlot.makePlayerButtons = function() {
	PlayerPlot.playerButtons.innerHTML = "";
	for (let i=0; i<6; i++) {
		if (PlayerPlot.player[i]) {
			let container = document.createElement('div');
			container.classList.add('chart-player');
			container.style.backgroundColor = ChartUtils.lightColors[i];
			container.style.borderColor = ChartUtils.darkColors[i];
			let remover = document.createElement('span');
			remover.classList.add('player-close');
			remover.appendChild(document.createTextNode('\u00d7'));
			remover.onclick = PlayerPlot.removePlayer;
			container.appendChild(remover);
			let playertext = document.createElement('span');
			playertext.classList.add('player-name');
			playertext.appendChild(document.createTextNode(PlayerPlot.player[i]));
			container.appendChild(playertext);
			PlayerPlot.playerButtons.appendChild(container);
		}
	}
}
PlayerPlot.addPlayer = function(newname) {
	if (PlayerPlot.getPlayerCount() < 6) {
		if (!PlayerPlot.player.filter(x => x).map(x => x.toLowerCase()).includes(newname.toLowerCase())) {
			for (let i=0; i<6; i++) {
				if (!PlayerPlot.player[i]) {
					PlayerPlot.player.splice(i,1,newname);
					break;
				}
			}
		}
		document.getElementById('player-input').value = "";
		PlayerPlot.allTiers = PlayerPlot.allTiersCheck.checked;
		ChartUtils.setURLparams();
		PlayerPlot.makePlot();
	}
}
PlayerPlot.removePlayer = function(ev) {
	let toRemove = ev.target.parentElement.lastElementChild.textContent;
	PlayerPlot.player.splice(PlayerPlot.player.indexOf(toRemove), 1, null);
	ChartUtils.setURLparams();
	if (PlayerPlot.userSetRange) {PlayerPlot.makePlot();} else {PlayerPlot.resetRange();}
}
PlayerPlot.slideinput = function() {
	if (Number(PlayerPlot.seasonslide1.value) <= Number(PlayerPlot.seasonslide2.value)) {
		PlayerPlot.seasontextmin.value = PlayerPlot.seasonslide1.value;
		PlayerPlot.seasontextmax.value = PlayerPlot.seasonslide2.value;
	} else {
		PlayerPlot.seasontextmin.value = PlayerPlot.seasonslide2.value;
		PlayerPlot.seasontextmax.value = PlayerPlot.seasonslide1.value;
	}
	
	PlayerPlot.seasonRange = [Number(PlayerPlot.seasontextmin.value), Number(PlayerPlot.seasontextmax.value)];
	PlayerPlot.userSetRange = true;
	ChartUtils.setURLparams();
	PlayerPlot.makePlot();
};
PlayerPlot.textinput = function() {
	if ((Number(PlayerPlot.seasontextmin.value) <= Number(PlayerPlot.seasontextmax.value)) && (Number(PlayerPlot.seasontextmin.value) >= Number(PlayerPlot.seasonslide1.min)) && (Number(PlayerPlot.seasontextmax.value) <= Number(PlayerPlot.seasonslide1.max))) {
		if (Number(PlayerPlot.seasonslide1.value) <= Number(PlayerPlot.seasonslide2.value)) {
			PlayerPlot.seasonslide1.value = PlayerPlot.seasontextmin.value;
			PlayerPlot.seasonslide2.value = PlayerPlot.seasontextmax.value;
		} else {
			PlayerPlot.seasonslide1.value = PlayerPlot.seasontextmax.value;
			PlayerPlot.seasonslide2.value = PlayerPlot.seasontextmin.value;
		}
		
		PlayerPlot.seasonRange = [Number(PlayerPlot.seasontextmin.value), Number(PlayerPlot.seasontextmax.value)];
		PlayerPlot.userSetRange = true;
		ChartUtils.setURLparams();
		PlayerPlot.makePlot();
	}
};
PlayerPlot.resetRange = function() {
	PlayerPlot.seasonRange = [1,cur.season];
	PlayerPlot.userSetRange = false;
	PlayerPlot.seasontextmin.value = 1;
	PlayerPlot.seasontextmax.value = cur.season;
	PlayerPlot.seasonslide1.value = 1;
	PlayerPlot.seasonslide2.value = cur.season;
	ChartUtils.setURLparams();
	PlayerPlot.makePlot();
};
PlayerPlot.blankButtons = function() {
	PlayerPlot.rangeReset.classList.remove("blank-button");
	PlayerPlot.playerClear.classList.remove("blank-button");
	PlayerPlot.playerChange.classList.remove("blank-button");
	PlayerPlot.allTiersCheck.classList.remove("fixed-check");
	if (!PlayerPlot.userSetRange) {
		PlayerPlot.rangeReset.classList.add("blank-button");
	}
	if (!PlayerPlot.getPlayerCount()) {
		PlayerPlot.playerClear.classList.add("blank-button");
	}
	if (PlayerPlot.getPlayerCount() == 6) {
		PlayerPlot.playerChange.classList.add("blank-button");
	}
	if (PlayerPlot.proportion) {
		PlayerPlot.allTiersCheck.classList.add("fixed-check");
	}
};
	
PlayerPlot.resize = function() {
	PlayerPlot.plot.width(ChartUtils.widthcheck.clientWidth - 94);
	PlayerPlot.plot.height(0.6 * (ChartUtils.widthcheck.clientWidth - 94));
	PlayerPlot.plot.runAsync();
};
	
PlayerPlot.makePlot = function() {
	var pHist = [];
	var lHist = [];
	var tiers = [];
	var allSeasons = [];
	var fCounts = [];
	
	if (PlayerPlot.getPlayerCount()) {
		var seasons = Array.from({ length: 6 }, () => []);
		//isolate records for relevant players
		for (let p = 5; p >= 0; p--) {
			let plkey = PlayerPlot.player[p] ? PlayerPlot.player[p].toLowerCase() : null;
			if (!plkey || (!da.players[plkey] && !cur.players[plkey])) {
				PlayerPlot.player.splice(p,1,null);
				continue;
			}
			
			if (da.players[plkey]) {
				let nplayed = da.players[plkey].seasons.length;
				for (let i=0; i<nplayed; i++) {
					if ((da.players[plkey].seasons[i] >= PlayerPlot.seasonRange[0]) && (da.players[plkey].seasons[i] <= PlayerPlot.seasonRange[1])) {
						let tier = da.players[plkey].divs[i].charAt(0);
						let sKey = String(da.players[plkey].seasons[i]);
						let divPs = da.divisions[sKey][da.players[plkey].divs[i]].length;
						pHist.push({
							"player": da.players[plkey].name,
							"season": da.players[plkey].seasons[i],
							"division": da.players[plkey].divs[i],
							"place": da.players[plkey].places[i],
							"countPlacement": PlayerPlot.counts[sKey][tier].countBase + PlayerPlot.counts[sKey][tier].players * (da.players[plkey].places[i] - 0.5) / divPs,
							"propPlacement": PlayerPlot.counts[sKey][tier].propBase + PlayerPlot.counts[sKey][tier].lfrac * (da.players[plkey].places[i] - 0.5) / divPs,
							"champ": da.players[plkey].places[i] == 1 ? (da.players[plkey].divs[i] == "A1" ? "league" : "division") : "no",
							"chart": "point"
						});
						seasons[p].push(da.players[plkey].seasons[i]);
						tiers.push(tier);
					}
				}
				PlayerPlot.player[p] = da.players[plkey].name;
			}
			
			//add information for current season if player is in it
			if ((cur.season <= PlayerPlot.seasonRange[1]) && cur.players[plkey] && (!pHist.length || (pHist[pHist.length-1].season != cur.season))) {
				let pname = cur.players[plkey].name;
				PlayerPlot.player[p].name = pname;
				var currentHistory = {"player": pname, "tier": cur.players[plkey].tier, "division": cur.players[plkey].division};
				let divplayers = Object.keys(cur[currentHistory.division].members).length;
				let rank = (Number(cur[currentHistory.division].members[pname].wins) + Number(cur[currentHistory.division].members[pname].losses)) ? cur[currentHistory.division].members[pname].rank : "";
				currentHistory.place = String(rank) + (cur[currentHistory.division]["complete?"] == "Yes" ? "" : " (in progress)");
				currentHistory.season = cur.season;
				currentHistory.countPlacement = rank ? PlayerPlot.counts[ChartUtils.curString][cur.players[plkey].tier].countBase + (rank-0.5)*PlayerPlot.counts[ChartUtils.curString][cur.players[plkey].tier].players/divplayers : PlayerPlot.counts[ChartUtils.curString][cur.players[plkey].tier].countBase + 0.5*PlayerPlot.counts[ChartUtils.curString][cur.players[plkey].tier].players;
				currentHistory.propPlacement = rank ? PlayerPlot.counts[ChartUtils.curString][cur.players[plkey].tier].propBase + (rank-0.5)*PlayerPlot.counts[ChartUtils.curString][cur.players[plkey].tier].lfrac/divplayers : PlayerPlot.counts[ChartUtils.curString][cur.players[plkey].tier].propBase + 0.5*PlayerPlot.counts[ChartUtils.curString][cur.players[plkey].tier].lfrac;
				currentHistory.champ = cur[currentHistory.division]["complete?"] == "Yes" ? (cur[currentHistory.division].members[pname]["next tier"].length > 1 ? "in progress" : (currentHistory.tier == "A" ? (rank <= 2 ? "in progress" : "no") : (rank == 1 ? "division" : "no"))) : "in progress";
				currentHistory.chart = "point";
				pHist.push(currentHistory);
				seasons[p].push(currentHistory.season);
				tiers.push(currentHistory.tier);
			}
		}
		
		tiers = [...new Set(tiers)];
		allSeasons = [...new Set(seasons.flat())].sort((a,b) => a-b);
		
		var played2MostRecent = seasons.map(s => (s[s.length - 1] == cur.season) && (s[s.length - 2] == cur.season - 1));
		
		if (pHist.length) {
			//set allTiers to true if proportion is true
			if (PlayerPlot.proportion) {PlayerPlot.allTiers = true;}
			
			//find missing seasons and insert nulls
			let start = PlayerPlot.userSetRange ? PlayerPlot.seasonRange[0] : allSeasons[0];
			let end = PlayerPlot.userSetRange ? PlayerPlot.seasonRange[1] : allSeasons[allSeasons.length-1];
			var toadd = [];
			for (let p = 5; p>=0; p--) {
				for (let s = start; s <= end; s++) {
					if (!seasons[p].includes(s)) {
						pHist.push({"player":PlayerPlot.player[p], "tier":null, "division":null, "place":null, "season":s, "countPlacement":null, "propPlacement":null, "champ":null});
						toadd.push(s);
					}
				}
			}
			pHist.sort(function(a,b){return a.season - b.season});
			allSeasons = [...new Set(allSeasons.concat(toadd))].sort((a,b) => a-b);
			
			//show range on sliders if it changes upon plot making
			if (!PlayerPlot.userSetRange) {
				PlayerPlot.seasontextmin.value = allSeasons[0];
				PlayerPlot.seasontextmax.value = allSeasons[allSeasons.length - 1];
				PlayerPlot.seasonslide1.value = allSeasons[0];
				PlayerPlot.seasonslide2.value = allSeasons[allSeasons.length - 1];
			}
			
			//find needed tiers
			var minTier = tiers.sort()[tiers.length - 1]
			if (PlayerPlot.allTiers) {
				tiers = ["A","B","C","D","E","F","G","H","I","J","P"];
			} else {
				let potTiers = ["A","B","C","D","E","F","G","H","I","J","P"];
				let tempTiers = [];
				for (let i = 0; i < potTiers.length; i++) {
					if (potTiers[i] <= minTier) {tempTiers.push(potTiers[i]);} else {break;}
				}
				tiers = tempTiers;
			}
			
			//cut colors because layers with same encoding annoyingly union their domains
			var colors = ChartUtils.tierColors.slice(0,tiers.length).concat(["#000000", "#000000", "#FFFF00", "#FFFFFF"]);
			
			//create chartable counts
			for (let s of allSeasons) {
				for (let t of tiers) {
					if (PlayerPlot.counts[String(s)][t]) {
						fCounts.push({
							"season": s,
							"tier": t,
							"players": PlayerPlot.counts[String(s)][t].players,
							"lfrac": PlayerPlot.counts[String(s)][t].lfrac,
							"chart": "bar"
						});
					}
				}
			}
			
			//filter out later E seasons if players were in E only before season 27
			if (tiers[tiers.length - 1] == "E") {
				let oldOnly = true;
				for (let i = pHist.length - 1; i >= 0; i--) {
					if (pHist[i].division && pHist[i].division.charAt(0) == "E" && pHist[i].season > 26) {
						oldOnly = false;
						break;
					}
				}
				if (oldOnly) {
					for (let i = fCounts.length - 1; i >= 0; i--) {
						if ((Number(fCounts[i].season) > 26) && (fCounts[i].tier == "E")) {
							fCounts.splice(i,1);
						}
					}
				}
			}
			
			//duplicate player history for line chart and add extra if needed
			lHist = JSON.parse(JSON.stringify(pHist));
			for (let i=lHist.length-1; i>=0; i--) {
				lHist[i].chart = "line";
				if ((lHist[i].season == cur.season - 1) && played2MostRecent[PlayerPlot.player.indexOf(lHist[i].player)]) {
					lHist.push(JSON.parse(JSON.stringify(lHist[i])));
					lHist[lHist.length - 1].champ = "in progress";
				}
			}
			if (minTier == "P") {
				for (let i = lHist.length - 1; i >= 0; i--) {
					if (lHist[i].tier == "P") {
						lHist.splice(i,1);
					}
				}
			}
			
			var layers = [
				{
					"transform": [{"filter": "datum.chart == 'bar'"}],
					"mark": "bar",
					"encoding": {
						"x": {
							"field": "season",
							"type": "ordinal",
							"scale": {
								"domain": allSeasons
							},
							"axis": {"title": "Season"}
						},
						"y": {
							"field": PlayerPlot.proportion ? "lfrac" : "players",
							"type": "quantitative",
							"scale": {
								"reverse": true,
								"domain": PlayerPlot.proportion ? [0,1] : null
							},
							"axis": {"title": "Position"}
						},
						"color": {
							"field": "tier",
							"type": "nominal",
							"scale": {
								"domain": tiers,
								"range": colors
							},
							"legend": {
								"title": "Tier",
								"values": tiers,
								"symbolType": "square",
								"symbolStrokeWidth": 0,
								"symbolSize": 200
							}
						},
						"order": {"field":"tier", "sort":"ascending"}
					}
				},
				{
					"transform": [
						{"filter": "datum.chart == 'line'"},
						{"calculate": "if(datum.season.length == 1, '0' + datum.season, datum.season)", "as": "order"},
						{"calculate": "if(datum.champ == 'in progress', 'yes', 'no')", "as": "future"}
					],
					"mark": {"type": "line"},
					"encoding" : {
						"x": {"field": "season", "type": "ordinal"},
						"y": {
							"field": PlayerPlot.proportion ? "propPlacement" : "countPlacement",
							"type": "quantitative"
						},
						"stroke": {
							"field": "player",
							"type": "nominal",
							"scale" : {
								"domain": PlayerPlot.player.filter(x => x),
								"range": ChartUtils.darkColors.filter((x,i) => PlayerPlot.player[i])
							},
							"legend": null
						},
						"strokeDash": {
							"field": "future",
							"type": "nominal",
							"scale": {
								"domain": ["no", "yes"],
								"range": [[1,0], [8,8]]
							},
							"legend": null
						},
						"order": {"field": "order", "type": "ordinal"}
					}
				},
				{
					"transform": [
						{"filter": "datum.chart == 'point'"},
						{"calculate": "'click'", "as": "Standings"}
					],
					"selection": {
						"hovered": {"type": "single", "on": "mouseover", "empty": "none"},
						"clicked": {"type": "single", "on": "click", "empty": "none"}
					},
					"mark": {
						"type": "point",
						"filled": true,
						"opacity": "1",
						"strokeWidth": PlayerPlot.getPlayerCount() > 1 ? "2" : "1"
					},
					"encoding": {
						"x": {"field": "season", "type": "ordinal"},
						"y": {
							"field": PlayerPlot.proportion ? "propPlacement" : "countPlacement",
							"type": "quantitative"
						},
						"color": {
							"field": "champ",
							"type": "nominal",
							"scale": {
								"domain": ["no", "division", "league", "in progress"]
							}
						},
						"stroke": {
							"field": "player",
							"type": "nominal",
							"scale" : {
								"domain": PlayerPlot.player.filter(x => x),
								"range": ChartUtils.darkColors.filter((x,i) => PlayerPlot.player[i])
							}
						},
						"shape": {
							"field": "champ",
							"type": "nominal",
							"scale": {
								"domain": ["no", "division", "league", "in progress"],
								"range": [
									"M 0 -1 A 1 1 0 1 1 0 1 A 1 1 0 1 1 0 -1", 
									"M 0 -2 L -0.36327126400268 -0.5 L -1.90211303259031 -0.618033988749895 L -0.587785252292473 0.190983005625053 L -1.17557050458495 1.61803398874989 L -7.56848349501309e-17 0.618033988749895 L 1.17557050458495 1.6180339887499 L 0.587785252292473 0.190983005625053 L 1.90211303259031 -0.618033988749894 L 0.363271264002681 -0.5 L 4.89842541528951e-16 -2 L -0.36327126400268 -0.5",
									"M 0 -2.4 L -0.435925516803217 -0.6 L -2.28253563910837 -0.741640786499874 L -0.705342302750968 0.229179606750063 L -1.41068460550194 1.94164078649987 L -9.0821801940157e-17 0.741640786499874 L 1.41068460550194 1.94164078649987 L 0.705342302750968 0.229179606750063 L 2.28253563910837 -0.741640786499873 L 0.435925516803217 -0.6 L 5.87811049834741e-16 -2.4 L -0.435925516803216 -0.600000000000001",
									"M 0 -1 A 1 1 0 1 1 0 1 A 1 1 0 1 1 0 -1"
								]
							},
							"legend": null
						},
						"size": {"condition": {"selection": "hovered", "value": "60"}, "value": PlayerPlot.getPlayerCount() > 1 ? "30" : "40"},
						"tooltip": (ChartUtils.widthcheck.clientWidth < 540) ? null : [
							{"field": "player", "type": "nominal", "title": "Player"},
							{"field": "season", "type": "nominal", "title": "Season"},
							{"field": "division", "type": "nominal", "title": "Division"},
							{"field": "place", "type": "nominal", "title": "Place"},
							{"field": "Standings", "type": "nominal", "title": "Standings"}
						]
					}
				}
			];
		} else {
			//add message saying not found at some point
			var layers = nullPlotLayer(fCounts);
		}
	} else {
		var layers = nullPlotLayer(fCounts);
	}
	
	const playerSpec = {
		"title": null,
		"width": ChartUtils.widthcheck.clientWidth - 94, //little bit off with scrollbar, worry when doing resizing for window
		"height": 0.6 * (ChartUtils.widthcheck.clientWidth - 94),
		"data": {"values": pHist.concat(lHist, fCounts)},
		"layer": layers
	};
	vegaEmbed("#player-history", playerSpec, {"actions": false}).then(function(res) {
		PlayerPlot.plot = res.view;
		if (pHist.length) {
			PlayerPlot.plot.addDataListener('clicked_store', function(name, value){
				if (value.length) {
					let roi = pHist[value[0]._vgsid_-1];						
					PlayerPlot.showStandingsModal(roi.season, roi.division);
				}
			})
		}
	});
	
	PlayerPlot.blankButtons();
	PlayerPlot.makePlayerButtons();
	
	function nullPlotLayer(fCounts) {
		let seasons = [];
		let start = PlayerPlot.userSetRange ? PlayerPlot.seasonRange[0] : 1;
		let end = PlayerPlot.userSetRange ? PlayerPlot.seasonRange[1] : cur.season;
		for (let s = start; s <= end; s++) {seasons.push(s);}
		for (let s of seasons) {
			for (t in PlayerPlot.counts[String(s)]) {
				fCounts.push({
					"season": s,
					"tier": t,
					"players": PlayerPlot.counts[String(s)][t].players,
					"lfrac": PlayerPlot.counts[String(s)][t].lfrac,
					"chart": "bar"
				});
			}
		}
		
		return [{
			"transform": [{"filter": "datum.chart == 'bar'"}],
			"mark": "bar",
			"encoding": {
				"x": {
					"field": "season",
					"type": "ordinal",
					"scale": {
						"domain": seasons
					},
					"axis": {"title": "Season"}
				},
				"y": {
					"field": PlayerPlot.proportion ? "lfrac" : "players",
					"type": "quantitative",
					"scale": {
						"reverse": true,
						"domain": PlayerPlot.proportion ? [0,1] : null
					},
					"axis": {"title": PlayerPlot.proportion ? "Proportion" : "Position"}
				},
				"color": {
					"field": "tier",
					"type": "nominal",
					"scale": {
						"domain": ["A","B","C","D","E","F","G","H","I","J","P"],
						"range": ChartUtils.tierColors
					},
					"legend": {
						"title": "Tier",
						"values": ["A","B","C","D","E","F","G","H","I","J","P"],
						"symbolType": "square",
						"symbolStrokeWidth": 0,
						"symbolSize": 200
					}
				},
				"order": {"field":"tier", "sort":"ascending"}
			}
		}];
	}
};
	
PlayerPlot.showStandingsModal = function(season, division) {
	document.getElementById('modal-header').innerHTML = '<a href="/' + ((season == cur.season) ? 'current_standings' : 'past_standings/season' + season) + '?div=' + division + '" target="_blank">Season ' + season + ' Division ' + division + ' Standings</a>';
	var modalBody = document.getElementById('modal-body');
	modalBody.innerHTML = '';
	var table = document.createElement('table');
	table.classList.add('table-past-standings');
	var tableBody = document.createElement('tbody');
	var topRow = document.createElement('tr');
	topRow.classList.add('rows-past-standings');
	let names = ["Rank", "Player", "W", "L", "Win %"];
	let pcts = ["10%", "55%", "10%", "10%", "15%"];
	for (let j=0; j<5; j++) {
		let cell = document.createElement('th');
		cell.setAttribute('width', pcts[j]);
		cell.classList.add('cells-past-standings');
		cell.appendChild(document.createTextNode(names[j]));
		topRow.appendChild(cell);
	}
	tableBody.appendChild(topRow);
	if (season == cur.season) {
		let ordered = Object.keys(cur[division].members).sort((a,b) => cur[division].members[a].rank - cur[division].members[b].rank);
		for (let pl of ordered) {
			let row = document.createElement('tr');
			row.classList.add('rows-past-standings')
			let names = ['rank', 'name', 'wins', 'losses', 'pct'];
			for (let j = 0; j < 5; j++) {
				let cell = document.createElement('td');
				cell.classList.add('cells-past-standings');
				if (j == 1) {
					cell.classList.add(PlayerPlot.getPlayerCount() == 6 ? 'clickable-off' : 'clickable-name');
				} else if (j == 4) {
					cell.style.cssText = 'background-color:' + cur[division].members[pl].color;
				}
				cell.appendChild(document.createTextNode(cur[division].members[pl][names[j]]));
				row.appendChild(cell);
			}
			tableBody.appendChild(row);
		}
	} else {
		for (player of da.divisions[String(season)][division]) {
			let plkey = player.toLowerCase();
			let sindex = da.players[plkey].seasons.indexOf(season);
			let row = document.createElement('tr');
			row.classList.add('rows-past-standings');
			let pcell = document.createElement('td');
			pcell.classList.add('cells-past-standings');
			pcell.appendChild(document.createTextNode(da.players[plkey].places[sindex]));
			row.appendChild(pcell);
			let ncell = document.createElement('td');
			ncell.classList.add('cells-past-standings');
			ncell.appendChild(document.createTextNode(da.players[plkey].name));
			ncell.classList.add(PlayerPlot.getPlayerCount() == 6 ? 'clickable-off' : 'clickable-name');
			row.appendChild(ncell);
			let wcell = document.createElement('td');
			wcell.classList.add('cells-past-standings');
			wcell.appendChild(document.createTextNode(da.players[plkey].wins[sindex]));
			row.appendChild(wcell);
			let lcell = document.createElement('td');
			lcell.classList.add('cells-past-standings');
			lcell.appendChild(document.createTextNode(da.players[plkey].losses[sindex]));
			row.appendChild(lcell);
			let fcell = document.createElement('td');
			fcell.classList.add('cells-past-standings');
			let pct = Number(da.players[plkey].wins[sindex]) / (Number(da.players[plkey].wins[sindex]) + Number(da.players[plkey].losses[sindex]));
			fcell.appendChild(document.createTextNode(String(Math.round(100 * pct)) + "%"));
			fcell.style.cssText = 'background-color:' + ChartUtils.standingsColors[Math.floor(2000*pct/101)];
			row.appendChild(fcell);
			tableBody.appendChild(row);
		}
	}
	table.appendChild(tableBody);
	modalBody.appendChild(table);
	ChartUtils.setClickableNames();
	ChartUtils.openModal();
};

//A Division power chart

var PowerPlot = {};

PowerPlot.pointMap = {"A1": 10, "A2": 5, "A3": 3, "A4": 3, "A5": 1, "A6": 1, "B1": 2, "B2": 0, "B3": 0, "B4": 0, "B5": -2, "B6": -2};
PowerPlot.pointDecay = [1, 0.9, 0.7, 0.4];
PowerPlot.propCutoff = 0.02;

PowerPlot.makeData = function() {
	PowerPlot.data = [];
	PowerPlot.players = Object.keys(da.players).filter(p => da.players[p].divs.includes("A1")).sort();
	PowerPlot.nplayers = PowerPlot.players.length;
	PowerPlot.points = PowerPlot.players.map(plkey => {
		let out = Array.from({ length:cur.season }, () => 0);
		for (let s=0; s<cur.season; s++) {
			let sp = null;
			if (s == 0 && da.divisions["1"]["A1"].includes(da.players[plkey].name)) {
				sp = 2;
			} else {
				let sloc = da.players[plkey].seasons.indexOf(s);
				if (sloc == -1) {
					sp = 0;
				} else {
					let sdiv = da.players[plkey].divs[sloc];
					let stier = sdiv.charAt(0);
					let trank = null;
					if (da.divisions[String(s)][sdiv].length == 7 && da.players[plkey].places[sloc] >= 5) {
						trank = stier + (da.players[plkey].places[sloc] - 1);
					} else {
						trank = stier + da.players[plkey].places[sloc]
					}
					sp = Object.keys(PowerPlot.pointMap).includes(trank) ? PowerPlot.pointMap[trank] : -1;
				}
			}
			for (let i=0; i<PowerPlot.pointDecay.length; i++) {
				if (s+i < cur.season) {
					out[s+i] += sp * PowerPlot.pointDecay[i];
				}
			}
		}
		return out;
	});

	PowerPlot.players = PowerPlot.players.map(p => da.players[p].name);

	for (let s=0; s<cur.season; s++) {
		for (let i=0; i<PowerPlot.nplayers; i++) {
			if (PowerPlot.points[i][s] < 0) {
				PowerPlot.points[i][s] = 0;
			}
		}
		let stotal = PowerPlot.points.reduce((p,c) => p + c[s], 0);
		for (let i=0; i<PowerPlot.nplayers; i++) {
			if (PowerPlot.points[i][s]/stotal < PowerPlot.propCutoff) {
				PowerPlot.points[i][s] = 0;
			}
		}
		stotal = PowerPlot.points.reduce((p,c) => p + c[s], 0);
		for (let i=0; i<PowerPlot.nplayers; i++) {
			PowerPlot.data.push({
				"player": PowerPlot.players[i],
				"season": s,
				"prop": PowerPlot.points[i][s]/stotal
			});
		}
	}
};

PowerPlot.makeData();

PowerPlot.zoom = false;

PowerPlot.plot = null;

PowerPlot.resize = function() {
	PowerPlot.plot.width(ChartUtils.widthcheck.clientWidth - 78);
	PowerPlot.plot.height((PowerPlot.zoom ? 3 : 1) * (ChartUtils.widthcheck.clientWidth - 78));
	PowerPlot.plot.runAsync();
}

PowerPlot.zoomControl = document.getElementById('powerzoom');
PowerPlot.prepControls = function() {
	PowerPlot.zoomControl.onclick = function() {
		PowerPlot.zoom = PowerPlot.zoom ? false : true;
		PowerPlot.makePlot();
	};
}

PowerPlot.makePlot = function() {
	var widthOffset = PowerPlot.zoom ? 0.1 : 0.61;
		
	const powerSpec = {
		"title": "A Division History",
		"width": ChartUtils.widthcheck.clientWidth - 78, //little bit off with scrollbar, worry when doing resizing for window
		"height": (PowerPlot.zoom ? 3 : 1) * (ChartUtils.widthcheck.clientWidth - 78),
		"data": {"values": PowerPlot.data},
		"layer": [
			{
				"mark": {"type": "area"},
				"transform": [{"calculate": "indexof(" + JSON.stringify(PowerPlot.players) + ", datum.player)", "as": "order"}],
				"selection": {
					"hovered": {"type": "single", "on": "mouseover", "empty": "all"},
					"clicked": {"type": "single", "on": "click", "empty": "none"}
				},
				"encoding": {
					"y": {
						"field": "season",
						"type": "ordinal",
						"axis": {
							"grid": true,
							"orient": "left"
						}
					},
					"x": {
						"field": "prop",
						"type": "quantitative",
						"scale": {
							"domain": [0-widthOffset,1+widthOffset]
						},
						"axis": {
							"title": null,
							"grid": false,
							"ticks": false,
							"values": []
						}
					},
					"color": {
						"field": "player",
						"type": "nominal",
						"scale": {
							"domain": PowerPlot.players,
							"range": PowerPlot.players.map(p => da.players[p.toLowerCase()].powcol)
						},
						"legend": null
					},
					"order": {"field": "order", "type": "quantitative"},
					"opacity": {"condition": {"selection": "hovered", "value": 1}, "value": 0.3},
					"tooltip": {"field": "player", "type": "nominal"}
				}
			},
			{
				"mark": {"type": "point", "strokeWidth": 0},
				"encoding": {"y": {"field": "season", "axis": {"orient": "right"}}}
			}
		]
	};
	
	vegaEmbed("#ADiv-power", powerSpec, {"actions": false}).then(function(res) {
		PowerPlot.plot = res.view;
		PowerPlot.plot.addDataListener('clicked_store', function(name, value){
			if (value.length) {
				PlayerPlot.addPlayer(PowerPlot.data[value[0]._vgsid_-1].player);
			}
		})
	});
	
}

//transitions plot

var TransitionsPlot = {};

TransitionsPlot.data = {
	"players": [...new Set(Object.keys(da.players).concat(Object.keys(cur.players)))].sort(),
	"tiers": Array.from({ length: cur.season - 1 }, (v, i) => [...new Set(Object.keys(da.divisions[String(i+1)]).map(dv => dv.charAt(0)))].sort().join(""))
};
TransitionsPlot.data.tiers.push([...new Set(Object.keys(cur.players).map(key => cur.players[key].tier))].sort().join(""));
TransitionsPlot.data.schemes = TransitionsPlot.data.players.map(plkey => {
	let sch = Array.from({ length: cur.season }, () => "-");
	if (da.players[plkey]) {
		for (let i=0; i<da.players[plkey].seasons.length; i++) {
			sch[da.players[plkey].seasons[i] - 1] = da.players[plkey].divs[i].charAt(0);
		}
	}
	if (cur.players[plkey]) {
		sch[cur.season - 1] = cur.players[plkey].tier;
	}
	return sch.join("");
});
TransitionsPlot.data.players = TransitionsPlot.data.players.map(plkey => {
	if (cur.players[plkey]) {
		return cur.players[plkey].name;
	} else {
		return da.players[plkey].name;
	}
});
TransitionsPlot.schemesLength = TransitionsPlot.data.schemes.length;
TransitionsPlot.props = null;

TransitionsPlot.seasonRange = [1, cur.season];
TransitionsPlot.seasons = cur.season;
TransitionsPlot.startTier = "";
TransitionsPlot.first = false;
TransitionsPlot.plotType = 0;
TransitionsPlot.exact = false;
TransitionsPlot.offset = false;
TransitionsPlot.plus = true;

TransitionsPlot.plot = null;

TransitionsPlot.seasonslide1 = document.getElementById("tseasonslide1");
TransitionsPlot.seasonslide2 = document.getElementById("tseasonslide2");
TransitionsPlot.seasontextmin = document.getElementById("tseasontextmin");
TransitionsPlot.seasontextmax = document.getElementById("tseasontextmax");
TransitionsPlot.tierSelect = document.getElementById("tierSelect");
TransitionsPlot.firstPlayed = document.getElementById("firstPlayed");
TransitionsPlot.typeSelect = document.getElementById("typeSelect");
TransitionsPlot.numberslide = document.getElementById("tnumberslider");
TransitionsPlot.numbertext = document.getElementById("tnumberbox");
TransitionsPlot.prepControls = function() {
	TransitionsPlot.seasonslide1.max = cur.season;
	TransitionsPlot.seasonslide2.max = cur.season;
	TransitionsPlot.seasonslide2.value = cur.season;
	TransitionsPlot.seasontextmax.value = cur.season;

	TransitionsPlot.seasonslide1.oninput = TransitionsPlot.slideinput;
	TransitionsPlot.seasonslide2.oninput = TransitionsPlot.slideinput;
	TransitionsPlot.seasontextmax.oninput = TransitionsPlot.textinput;
	TransitionsPlot.seasontextmin.oninput = TransitionsPlot.textinput;
	TransitionsPlot.seasontextmax.onblur = TransitionsPlot.slideinput;
	TransitionsPlot.seasontextmin.onblur = TransitionsPlot.slideinput;
	
	TransitionsPlot.setTierOptions();
	TransitionsPlot.tierSelect.addEventListener('change', function(ev) {
		TransitionsPlot.startTier = ev.target.value;
		TransitionsPlot.makePlot();
	});
	
	TransitionsPlot.firstPlayed.onclick = function() {
		TransitionsPlot.firstPlayed.blur();
		TransitionsPlot.first = TransitionsPlot.first ? false : true;
		TransitionsPlot.makePlot();
	};
	
	TransitionsPlot.typeSelect.addEventListener('change', function(ev) {
		TransitionsPlot.plotType = Number(ev.target.value);
		TransitionsPlot.typeToVars();
		TransitionsPlot.makePlot();
	});
	
	TransitionsPlot.numberslide.max = cur.season;
	TransitionsPlot.numberslide.value = cur.season;
	TransitionsPlot.numbertext.value = cur.season;
	
	TransitionsPlot.numberslide.oninput = function() {
		TransitionsPlot.numbertext.value = TransitionsPlot.numberslide.value;
		TransitionsPlot.seasons = Number(TransitionsPlot.numberslide.value);
		TransitionsPlot.makePlot();
	};
	TransitionsPlot.numbertext.oninput = function() {
		if ((Number(TransitionsPlot.numbertext.value) >= Number(TransitionsPlot.numberslide.min)) && (Number(TransitionsPlot.numbertext.value) <= Number(TransitionsPlot.numberslide.max))) {
			TransitionsPlot.numberslide.value = TransitionsPlot.numbertext.value;
			TransitionsPlot.seasons = Number(TransitionsPlot.numberslide.value);
			TransitionsPlot.makePlot();
		}
	};
	TransitionsPlot.numbertext.onblur = function() {
		TransitionsPlot.numbertext.value = TransitionsPlot.numberslide.value;
	};
};
TransitionsPlot.setTierOptions = function() {
	var opts = ["any"].concat([...new Set(TransitionsPlot.data.tiers.slice(TransitionsPlot.seasonRange[0]-1, TransitionsPlot.seasonRange[1]).join(""))]);
	if (!opts.includes(TransitionsPlot.startTier)) {TransitionsPlot.startTier = "any";}
	TransitionsPlot.tierSelect.innerHTML = '';
	for (let i=0; i<opts.length; i++) {
		let opt = document.createElement('option');
		opt.value = opts[i];
		opt.classList.add('tierOption');
		if (opts[i] == TransitionsPlot.startTier) {
			opt.selected = true;
		}
		opt.appendChild(document.createTextNode(opts[i]));
		TransitionsPlot.tierSelect.appendChild(opt);
	}
};
TransitionsPlot.slideinput = function() {
	if (Number(TransitionsPlot.seasonslide1.value) <= Number(TransitionsPlot.seasonslide2.value)) {
		TransitionsPlot.seasontextmin.value = TransitionsPlot.seasonslide1.value;
		TransitionsPlot.seasontextmax.value = TransitionsPlot.seasonslide2.value;
	} else {
		TransitionsPlot.seasontextmin.value = TransitionsPlot.seasonslide2.value;
		TransitionsPlot.seasontextmax.value = TransitionsPlot.seasonslide1.value;
	}
	
	TransitionsPlot.seasonRange = [Number(TransitionsPlot.seasontextmin.value), Number(TransitionsPlot.seasontextmax.value)];
	TransitionsPlot.setTierOptions();
	TransitionsPlot.makePlot();
};
TransitionsPlot.textinput = function() {
	if ((Number(TransitionsPlot.seasontextmin.value) <= Number(TransitionsPlot.seasontextmax.value)) && (Number(TransitionsPlot.seasontextmin.value) >= Number(TransitionsPlot.seasonslide1.min)) && (Number(TransitionsPlot.seasontextmax.value) <= Number(TransitionsPlot.seasonslide1.max))) {
		if (Number(TransitionsPlot.seasonslide1.value) <= Number(TransitionsPlot.seasonslide2.value)) {
			TransitionsPlot.seasonslide1.value = TransitionsPlot.seasontextmin.value;
			TransitionsPlot.seasonslide2.value = TransitionsPlot.seasontextmax.value;
		} else {
			TransitionsPlot.seasonslide1.value = TransitionsPlot.seasontextmax.value;
			TransitionsPlot.seasonslide2.value = TransitionsPlot.seasontextmin.value;
		}
		
		TransitionsPlot.seasonRange = [Number(TransitionsPlot.seasontextmin.value), Number(TransitionsPlot.seasontextmax.value)];
		TransitionsPlot.setTierOptions();
		TransitionsPlot.makePlot();
	}
};
TransitionsPlot.typeToVars = function() {
	switch(TransitionsPlot.plotType) {
		case 0:
			//had been by a season
			TransitionsPlot.exact = false;
			TransitionsPlot.offset = false;
			TransitionsPlot.plus = true;
			break;
		case 1:
			//exactly were in a season
			TransitionsPlot.exact = true;
			TransitionsPlot.offset = false;
			TransitionsPlot.plus = true; //dummy
			break;
		case 2:
			//went after a season
			TransitionsPlot.exact = false;
			TransitionsPlot.offset = false;
			TransitionsPlot.plus = false;
			break;
		case 3:
			//had been between then and a season
			TransitionsPlot.exact = true; //dummy
			TransitionsPlot.offset = false;
			TransitionsPlot.plus = false; //dummy
			break;
		case 4:
			//had been after a number of seasons
			TransitionsPlot.exact = false;
			TransitionsPlot.offset = true;
			TransitionsPlot.plus = true;
			break;
		case 5:
			//were after exactly a number of seasons
			TransitionsPlot.exact = true;
			TransitionsPlot.offset = true;
			TransitionsPlot.plus = true;
			break;
		case 6:
			//had been since a number of seasons before
			TransitionsPlot.exact = false;
			TransitionsPlot.offset = true;
			TransitionsPlot.plus = false;
			break;
		case 7:
			//had been exactly a number of seasons before
			TransitionsPlot.exact = true;
			TransitionsPlot.offset = true;
			TransitionsPlot.plus = false;
			break;
	}
}

TransitionsPlot.resize = function() {
	TransitionsPlot.plot.width(ChartUtils.widthcheck.clientWidth - 52);
	TransitionsPlot.plot.height(0.5 * (ChartUtils.widthcheck.clientWidth - 52));
	TransitionsPlot.plot.runAsync();
};

TransitionsPlot.makePlot = function() {
	var allTiers = (TransitionsPlot.startTier == "any");
	var tiers = TransitionsPlot.offset ? [...new Set(TransitionsPlot.data.tiers.slice(Math.max(0,TransitionsPlot.seasonRange[0] - 1 + (!TransitionsPlot.plus ? -TransitionsPlot.seasons : (TransitionsPlot.exact ? TransitionsPlot.seasons : 1))), TransitionsPlot.seasonRange[1] + (TransitionsPlot.plus ? TransitionsPlot.seasons : (TransitionsPlot.exact ? -TransitionsPlot.seasons : 0))).join(""))] : 
		(TransitionsPlot.exact ? (TransitionsPlot.plus ? TransitionsPlot.data.tiers[TransitionsPlot.seasons-1].split('') : 
			[...new Set(TransitionsPlot.data.tiers.slice(((TransitionsPlot.seasons < TransitionsPlot.seasonRange[0]) ? TransitionsPlot.seasons : TransitionsPlot.seasonRange[0]) - 1, (TransitionsPlot.seasonRange[1] < TransitionsPlot.seasons) ? TransitionsPlot.seasons : TransitionsPlot.seasonRange[1]).join(""))]) :
			(TransitionsPlot.plus ? [...new Set(TransitionsPlot.data.tiers.slice(0,TransitionsPlot.seasons).join(""))] : [...new Set(TransitionsPlot.data.tiers.slice(TransitionsPlot.seasons-1,cur.season).join(""))]));
	tiers.sort();
	
	TransitionsPlot.props = {};
	for (let j=0; j<tiers.length; j++) {
		TransitionsPlot.props[tiers[j]] = {"tier": tiers[j], "ids": [], "count": 0};
	}
	var colors = ChartUtils.tierColors.slice(0, tiers.length);
	if (TransitionsPlot.exact && (TransitionsPlot.offset || TransitionsPlot.plus)) {
		tiers.push("-");
		TransitionsPlot.props["-"] = {"tier": "Out", "ids": [], "count": 0};
		colors.push("#000000");
	}
	
	var total = 0;
	
	if (TransitionsPlot.first) {
		for (let i=0; i<TransitionsPlot.schemesLength; i++) {
			let reg = new RegExp(allTiers ? "[^-]" : TransitionsPlot.startTier);
			let info = reg.exec(TransitionsPlot.data.schemes[i]);
			if (info && (info.index + 1 >= TransitionsPlot.seasonRange[0]) && (info.index +1 <= TransitionsPlot.seasonRange[1])) {
				total += 1;
				if (TransitionsPlot.offset) {
					if (TransitionsPlot.exact) {
						for (let j=tiers.length-1; j>=0; j--) {
							if (TransitionsPlot.data.schemes[i][info.index + (TransitionsPlot.plus ? TransitionsPlot.seasons : -TransitionsPlot.seasons)] == tiers[j]) {
								TransitionsPlot.props[tiers[j]].count += 1;
								TransitionsPlot.props[tiers[j]].ids.push(i);
							}
						}
					} else {
						for (let j=tiers.length-1; j>=0; j--) {
							if (TransitionsPlot.data.schemes[i].slice((TransitionsPlot.plus ? info.index + 1 : info.index - TransitionsPlot.seasons), (TransitionsPlot.plus ? info.index + TransitionsPlot.seasons + 1 : info.index)).includes(tiers[j])) {
								TransitionsPlot.props[tiers[j]].count += 1;
								TransitionsPlot.props[tiers[j]].ids.push(i);
							}
						}
					}
				} else {
					for (let j=tiers.length-1; j>=0; j--) {
						if (TransitionsPlot.exact) {
							if (TransitionsPlot.plus) {
								if (TransitionsPlot.data.schemes[i][TransitionsPlot.seasons - 1] == tiers[j]) {
									TransitionsPlot.props[tiers[j]].count += 1;
									TransitionsPlot.props[tiers[j]].ids.push(i);
								}
							} else {
								let after = (TransitionsPlot.seasons > info.index);
								if (TransitionsPlot.data.schemes[i].slice(after ? info.index : TransitionsPlot.seasons - 1, after ? TransitionsPlot.seasons : info.index + 1).includes(tiers[j])) {
									TransitionsPlot.props[tiers[j]].count += 1;
									TransitionsPlot.props[tiers[j]].ids.push(i);
								}
							}
						} else {
							if (TransitionsPlot.data.schemes[i].slice(TransitionsPlot.plus ? 0 : TransitionsPlot.seasons - 1, TransitionsPlot.plus ? TransitionsPlot.seasons : cur.season).includes(tiers[j])) {
								TransitionsPlot.props[tiers[j]].count += 1;
								TransitionsPlot.props[tiers[j]].ids.push(i);
							}
						}
					}
				}
			}
		}
	} else {
		if (TransitionsPlot.offset) {
			for (let i=0; i<TransitionsPlot.schemesLength; i++) {
				let nPossible = regExpCounter(allTiers ? "[^-]" : TransitionsPlot.startTier, TransitionsPlot.data.schemes[i], TransitionsPlot.seasonRange[0]-1, TransitionsPlot.seasonRange[1], true);
				if (nPossible) {
					total += nPossible;
					for (let j=tiers.length-1; j>=0; j--) {
						let reg = (TransitionsPlot.plus ? (allTiers ? "[^-]" : TransitionsPlot.startTier) : tiers[j]) + ".{" + (TransitionsPlot.exact ? "" : "0,") + (TransitionsPlot.seasons-1) + "}" + (TransitionsPlot.plus ? tiers[j] : (allTiers ? "[^-]" : TransitionsPlot.startTier));
						let nMatches = regExpCounter(reg, TransitionsPlot.data.schemes[i], TransitionsPlot.seasonRange[0]-1, TransitionsPlot.seasonRange[1], TransitionsPlot.plus);
						if (nMatches) {
							TransitionsPlot.props[tiers[j]].count += nMatches;
							TransitionsPlot.props[tiers[j]].ids.push(i);
						}
					}
				}
			}
		} else {
			for (let i=0; i<TransitionsPlot.schemesLength; i++) {
				if (regExpChecker(allTiers ? "[^-]" : TransitionsPlot.startTier, TransitionsPlot.data.schemes[i], TransitionsPlot.seasonRange[0]-1, TransitionsPlot.seasonRange[1], true)) {
					total += 1;
					for (let j=tiers.length-1; j>=0; j--) {
						if (TransitionsPlot.exact) {
							if (TransitionsPlot.plus) {
								if (TransitionsPlot.data.schemes[i][TransitionsPlot.seasons-1] == tiers[j]) {
									TransitionsPlot.props[tiers[j]].count += 1;
									TransitionsPlot.props[tiers[j]].ids.push(i);
								}
							} else {
								if ((TransitionsPlot.seasons >= TransitionsPlot.seasonRange[0]) && (TransitionsPlot.seasons <= TransitionsPlot.seasonRange[1])) {
									if (regExpChecker(tiers[j], TransitionsPlot.data.schemes[i], TransitionsPlot.seasonRange[0]-1, TransitionsPlot.seasonRange[1], true)) {
										TransitionsPlot.props[tiers[j]].count += 1;
										TransitionsPlot.props[tiers[j]].ids.push(i);
									}
								} else if (TransitionsPlot.seasons < TransitionsPlot.seasonRange[0]) {
									if (regExpChecker(tiers[j], TransitionsPlot.data.schemes[i], TransitionsPlot.seasons-1, TransitionsPlot.seasonRange[1], true)) {
										TransitionsPlot.props[tiers[j]].count += 1;
										TransitionsPlot.props[tiers[j]].ids.push(i);
									}
								} else {
									if (regExpChecker(tiers[j], TransitionsPlot.data.schemes[i], TransitionsPlot.seasonRange[0]-1, TransitionsPlot.seasons, false)) {
										TransitionsPlot.props[tiers[j]].count += 1;
										TransitionsPlot.props[tiers[j]].ids.push(i);
									}
								}
							}
						} else {
							if (TransitionsPlot.plus) {
								if (TransitionsPlot.data.schemes[i].slice(0, TransitionsPlot.seasons).includes(tiers[j])) {
									TransitionsPlot.props[tiers[j]].count += 1;
									TransitionsPlot.props[tiers[j]].ids.push(i);
								}
							} else {
								if (TransitionsPlot.data.schemes[i].slice(TransitionsPlot.seasons - 1, cur.season).includes(tiers[j])) {
									TransitionsPlot.props[tiers[j]].count += 1;
									TransitionsPlot.props[tiers[j]].ids.push(i);
								}
							}
						}
					}
				}
			}
		}
	}
	
	TransitionsPlot.props = Object.keys(TransitionsPlot.props).map(key => TransitionsPlot.props[key]);
	for (let i=0; i<TransitionsPlot.props.length; i++) {
		TransitionsPlot.props[i].prop = TransitionsPlot.props[i].count/total;
	}
	
	if (tiers[tiers.length-1] == "-") {tiers[tiers.length-1] = "Out";}
	
	
	var plotSpec = {
		"width": ChartUtils.widthcheck.clientWidth - 52,
		"height": 0.5 * (ChartUtils.widthcheck.clientWidth - 52),
		"data": {"values": TransitionsPlot.props},
		"transform": [{"calculate": "indexof(" + JSON.stringify(tiers) + ", datum.player)", "as": "order"}],
		"selection": {"clicked": {"type": "single", "on": "click", "empty": "none"}},
		"mark": {"type": "bar"},
		"encoding": {
			"x": {"field": "tier", "type": "ordinal", "sort": "order", "axis": {"title": "Tier", "labelAngle": 0}},
			"y": {"field": "prop", "type": "quantitative", "axis": {"title": "Proportion"}},
			"color": {
				"field": "tier",
				"type": "ordinal",
				"scale": {
					"domain": tiers,
					"range": colors
				},
				"legend": null
			},
			"tooltip": [{"field": "count", "type": "quantitative", "title": (TransitionsPlot.offset && !TransitionsPlot.first) ? "Seasons" : "Players"}]
		},
		"config": {"axisX": {"labelAngle": 0}}
	}
	
	vegaEmbed("#transitions", plotSpec, {"actions": false}).then(function(res) {
		TransitionsPlot.plot = res.view;
		TransitionsPlot.plot.addDataListener('clicked_store', function(name, value){
			if (value.length) {
				TransitionsPlot.showPlayersModal(value[0]._vgsid_-1);
			}
		})
	});
	
	function regExpCounter(regex, string, start, end, forward) {
		var r = forward ? new RegExp("^" + regex) : new RegExp(regex + "$");
		var count = 0;
		if (forward) {
			for (let i=start; i<end; i++) {
				let k = string.slice(i);
				count += r.test(k);
			}
		} else {
			for (let i=end; i>start; i--) {
				let k = string.slice(0,i);
				count += r.test(k);
			}
		}
		return count;
	}
	
	function regExpChecker(regex, string, start, end, forward) {
		var r = forward ? new RegExp("^" + regex) : new RegExp(regex + "$");
		if (forward) {
			for (let i=start; i<end; i++) {
				if (r.test(string.slice(i))) {
					return true;
				}
			}
		} else {
			for (let i=end; i>start; i--) {
				if (r.test(string.slice(0,i))) {
					return true;
				}
			}
		}
		return false;
	}
};

TransitionsPlot.showPlayersModal = function(propidx) {
	var titleInfo = null;
	switch (TransitionsPlot.plotType) {
		case 0:
			titleInfo = " before season " + TransitionsPlot.seasons;
			break;
		case 1:
			titleInfo = " in season " + TransitionsPlot.seasons;
			break;
		case 2:
			titleInfo = " after season " + TransitionsPlot.seasons;
			break;
		case 3:
			titleInfo = " between then and season " + TransitionsPlot.seasons;
			break;
		case 4:
			titleInfo = " within " + TransitionsPlot.seasons + " seasons after"
			break;
		case 5:
			titleInfo = " exactly " + TransitionsPlot.seasons + " seasons after"
			break;
		case 6:
			titleInfo = " within " + TransitionsPlot.seasons + " seasons before"
			break;
		case 7:
			titleInfo = " exactly " + TransitionsPlot.seasons + " seasons before"
			break;
	}
	document.getElementById('modal-header').innerHTML = "Players who played in " + TransitionsPlot.startTier + " tier " + (TransitionsPlot.first ? " for the first time " : " ") + ((TransitionsPlot.seasonRange[0] == TransitionsPlot.seasonRange[1]) ? "in season " + TransitionsPlot.seasonRange[0] : "between seasons " + TransitionsPlot.seasonRange[0] + " and " + TransitionsPlot.seasonRange[1]) + " who " + ((TransitionsPlot.props[propidx].tier == "Out") ? "were out of the league " : "played in tier " + TransitionsPlot.props[propidx].tier) + titleInfo;
	let idxs = TransitionsPlot.props[propidx].ids;
	let nplayer = idxs.length;
	var modalBody = document.getElementById('modal-body');
	modalBody.innerHTML = '';
	var table = document.createElement('table');
	table.classList.add('table-past-standings');
	var tableBody = document.createElement('tbody');
	var topRow = document.createElement('tr');
	for (let i=0; i<2; i++) {
		let cell = document.createElement('th');
		cell.setAttribute('width', '50%');
		topRow.appendChild(cell);
	}
	tableBody.appendChild(topRow);
	for (let i=0; i<nplayer-1; i+= 2) {
		let row = document.createElement('tr');
		let cell1 = document.createElement('td');
		cell1.classList.add(PlayerPlot.getPlayerCount() == 6 ? 'clickable-off' : 'clickable-name');
		cell1.appendChild(document.createTextNode(TransitionsPlot.data.players[idxs[i]]));
		row.appendChild(cell1);
		let cell2 = document.createElement('td');
		cell2.classList.add(PlayerPlot.getPlayerCount() == 6 ? 'clickable-off' : 'clickable-name');
		cell2.appendChild(document.createTextNode(TransitionsPlot.data.players[idxs[i+1]]));
		row.appendChild(cell2);
		tableBody.appendChild(row);
	}
	if (nplayer % 2) {
		let row = document.createElement('tr');
		let cell1 = document.createElement('td');
		cell1.classList.add(PlayerPlot.getPlayerCount() == 6 ? 'clickable-off' : 'clickable-name');
		cell1.appendChild(document.createTextNode(TransitionsPlot.data.players[idxs[nplayer-1]]));
		row.appendChild(cell1);
		let cell2 = document.createElement('td');
		row.appendChild(cell2);
		tableBody.appendChild(row);
	}
	table.appendChild(tableBody);
	modalBody.appendChild(table);
	ChartUtils.setClickableNames();
	ChartUtils.openModal();
};
