---
---

//helpers

var ChartUtils = {};

ChartUtils.clickableNames = null;
ChartUtils.widthcheck = document.getElementById('widthcheck');

ChartUtils.getURLparams = function() {
	if (window.location.search) {
		let params = new URLSearchParams(window.location.search);
		PlayerPlot.player = params.get('player');
		PlayerPlot.proportion = Boolean(params.get('prop') == 'true');
		if (PlayerPlot.proportion) {document.getElementById('prop').checked = "checked";}
	}
};
ChartUtils.setURLparams = function() {
	let searchString = "?"
	if (PlayerPlot.player) {
		searchString += "player=" + PlayerPlot.player.replace(" ", "%20");
	}
	if (PlayerPlot.proportion) {
		searchString += "&".repeat(searchString.length > 1) + "prop=true";
	}
	window.history.replaceState(null, null, searchString);
}

ChartUtils.openModal = function() {
	document.getElementById("charts-modal").style.display = "block";
};

ChartUtils.closeModal = function() {
	document.getElementById("charts-modal").style.display = "none";
};

document.getElementById('closemodal').onclick = ChartUtils.closeModal;

window.onclick = function(ev) {
	if (event.target == document.getElementById('charts-modal')) {
		ChartUtils.closeModal();
	}
};

ChartUtils.setClickableNames = function() {
	ChartUtils.clickableNames = document.getElementsByClassName("clickable-name");
	for (let i=ChartUtils.clickableNames.length-1; i>=0; i--) {
		ChartUtils.clickableNames[i].onclick = function() {
			PlayerPlot.player = ChartUtils.clickableNames[i].innerHTML;
			ChartUtils.setURLparams();
			PlayerPlot.makePlot();
			ChartUtils.closeModal();
		}
	}
};

//player history chart

var PlayerPlot = {};

PlayerPlot.currentStandings = {{ site.data.current_season | jsonify }};
PlayerPlot.currentSeason = PlayerPlot.currentStandings.season;
PlayerPlot.divStandings = null;
PlayerPlot.counts = {{ site.data.chart_counts | jsonify }};
PlayerPlot.getCurrentCounts = function() {
	var tiers = "ABCDEFGHIJ";
	var currentCounts = {};
	for (let i=0; i<10; i++) {
		currentCounts[tiers[i]] = {"season": String(PlayerPlot.currentSeason), "tier": tiers[i], "divisions": 0, "players": 0};
	}
	var totalPlayers = 0;
	var divisions = Object.keys(PlayerPlot.currentStandings);
	for (let i = divisions.length-1; i>=0; i--) {
		if (/^[A-J]\d+$/.test(divisions[i])) {
			currentCounts[PlayerPlot.currentStandings[divisions[i]].tier].divisions += 1;
			let divPlayers = Object.keys(PlayerPlot.currentStandings[divisions[i]].members).length;
			currentCounts[PlayerPlot.currentStandings[divisions[i]].tier].players += divPlayers;
			totalPlayers += divPlayers;
		}
	}
	currentCounts = Object.keys(currentCounts).map(key => currentCounts[key]);
	for (let i=0; i<10; i++) {
		currentCounts[i].lfrac = String(currentCounts[i].players/totalPlayers);
		currentCounts[i].divisions = String(currentCounts[i].divisions);
		currentCounts[i].players = String(currentCounts[i].players);
	}
	return currentCounts;
};
if (PlayerPlot.counts[PlayerPlot.counts.length-1].season != PlayerPlot.currentSeason) {PlayerPlot.counts = PlayerPlot.counts.concat(PlayerPlot.getCurrentCounts())};
PlayerPlot.countsLength = PlayerPlot.counts.length;
PlayerPlot.placeHistory = {{ site.data.chart_history | jsonify }};
PlayerPlot.placeHistoryLength = PlayerPlot.placeHistory.length;
PlayerPlot.tierColors = ["#FF00FF","#9900FF","#0000FF","#4A85E8","#00FFFF","#00FF00","#FFFF00","#FF9800","#FF0000","#980000", "#B7B7B7"];

PlayerPlot.proportion = false;
PlayerPlot.allTiers = false;
PlayerPlot.player = null;
PlayerPlot.seasonRange = [1,PlayerPlot.currentSeason];
PlayerPlot.userSetRange = false;

PlayerPlot.plot = null;
	
PlayerPlot.seasonslide1 = document.getElementById("seasonslide1");
PlayerPlot.seasonslide2 = document.getElementById("seasonslide2");
PlayerPlot.seasontextmin = document.getElementById("seasontextmin");
PlayerPlot.seasontextmax = document.getElementById("seasontextmax");
PlayerPlot.rangeReset = document.getElementById('rangereset');
PlayerPlot.playerChange = document.getElementById('playerchange');
PlayerPlot.playerClear = document.getElementById('clearplayer');
PlayerPlot.countRadio = document.getElementById('count');
PlayerPlot.propRadio = document.getElementById('prop');
PlayerPlot.allTiersCheck = document.getElementById('allTiers');
PlayerPlot.prepControls = function() {
	PlayerPlot.seasonslide1.max = PlayerPlot.currentSeason;
	PlayerPlot.seasonslide2.max = PlayerPlot.currentSeason;
	PlayerPlot.seasonslide2.value = PlayerPlot.currentSeason;
	PlayerPlot.seasontextmax.value = PlayerPlot.currentSeason;

	PlayerPlot.seasonslide1.oninput = PlayerPlot.slideinput;
	PlayerPlot.seasonslide2.oninput = PlayerPlot.slideinput;
	PlayerPlot.seasontextmax.oninput = PlayerPlot.textinput;
	PlayerPlot.seasontextmin.oninput = PlayerPlot.textinput;
	PlayerPlot.seasontextmax.onblur = PlayerPlot.slideinput;
	PlayerPlot.seasontextmin.onblur = PlayerPlot.slideinput;
	
	PlayerPlot.rangeReset.onclick = PlayerPlot.resetRange;
	PlayerPlot.playerChange.onclick = PlayerPlot.changePlayer;
	PlayerPlot.playerClear.onclick = PlayerPlot.clearPlayer;
	PlayerPlot.countRadio.onclick = PlayerPlot.toCount;
	PlayerPlot.propRadio.onclick = PlayerPlot.toProp;
	PlayerPlot.allTiersCheck.onclick = PlayerPlot.toAllTiers;
};
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
	PlayerPlot.makePlot();
};
PlayerPlot.textinput = function() {
	if ((Number(PlayerPlot.seasontextmin.value) <= Number(PlayerPlot.seasontextmax.value)) && (Number(PlayerPlot.seasontextmin.value) >= Number(PlayerPlot.seasonslide1.min)) && (Number(PlayerPlot.seasontextmax.value) <= Number(PlayerPlot.seasonslide1.max))) {
		if (Number(seasonslide1.value) <= Number(seasonslide2.value)) {
			PlayerPlot.seasonslide1.value = PlayerPlot.seasontextmin.value;
			PlayerPlot.seasonslide2.value = PlayerPlot.seasontextmax.value;
		} else {
			PlayerPlot.seasonslide1.value = PlayerPlot.seasontextmax.value;
			PlayerPlot.seasonslide2.value = PlayerPlot.seasontextmin.value;
		}
		
		PlayerPlot.seasonRange = [Number(PlayerPlot.seasontextmin.value), Number(PlayerPlot.seasontextmax.value)];
		PlayerPlot.userSetRange = true;
		PlayerPlot.makePlot();
	}
};
PlayerPlot.resetRange = function() {
	PlayerPlot.seasonRange = [1,PlayerPlot.currentSeason];
	PlayerPlot.userSetRange = false;
	PlayerPlot.seasontextmin.value = 1;
	PlayerPlot.seasontextmax.value = PlayerPlot.currentSeason;
	PlayerPlot.seasonslide1.value = 1;
	PlayerPlot.seasonslide2.value = PlayerPlot.currentSeason;
	PlayerPlot.makePlot();
};
PlayerPlot.changePlayer = function() {
	PlayerPlot.player = document.getElementById('player-input').value;
	PlayerPlot.allTiers = PlayerPlot.allTiersCheck.checked;
	ChartUtils.setURLparams();
	PlayerPlot.makePlot();
};
PlayerPlot.clearPlayer = function() {
	document.getElementById('player-input').value = "";
	PlayerPlot.player = null;
	ChartUtils.setURLparams();
	if (PlayerPlot.userSetRange) {PlayerPlot.makePlot();} else {PlayerPlot.resetRange();};
};
PlayerPlot.toCount = function() {
	PlayerPlot.countRadio.blur();
	if (PlayerPlot.proportion) {
		PlayerPlot.proportion = false;
		PlayerPlot.allTiers = PlayerPlot.allTiersCheck.checked;
		ChartUtils.setURLparams();
		PlayerPlot.makePlot();
	}
};
PlayerPlot.toProp = function() {
	PlayerPlot.propRadio.blur();
	if (!PlayerPlot.proportion) {
		PlayerPlot.proportion = true;
		ChartUtils.setURLparams();
		PlayerPlot.makePlot();
	}
};
PlayerPlot.toAllTiers = function() {
	PlayerPlot.allTiersCheck.blur();
	allTiers = PlayerPlot.allTiersCheck.checked;						
	PlayerPlot.makePlot();
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
	var seasons = [];
	var fCounts = [];
	
	if (PlayerPlot.player) {
		//data slicing
		//isolate records for relevant player
		let lowerplayer = PlayerPlot.player.toLowerCase();
		for (let i = 0; i < PlayerPlot.placeHistoryLength; i++) {
			if ((PlayerPlot.placeHistory[i].player.toLowerCase() == lowerplayer) && (Number(PlayerPlot.placeHistory[i].season) >= PlayerPlot.seasonRange[0]) && (Number(PlayerPlot.placeHistory[i].season) <= PlayerPlot.seasonRange[1])) {
				pHist.push(PlayerPlot.placeHistory[i]);
				pHist[pHist.length-1].chart = 'point';
				seasons.push(PlayerPlot.placeHistory[i].season);
				tiers.push(PlayerPlot.placeHistory[i].tier);
			}
		}
		
		//add information for current season if player is in it
		if ((PlayerPlot.currentSeason <= PlayerPlot.seasonRange[1]) && Object.keys(PlayerPlot.currentStandings.players).includes(lowerplayer) && (!pHist.length || (pHist[pHist.length-1].season != PlayerPlot.currentSeason))) {
			let pname = PlayerPlot.currentStandings.players[lowerplayer].name;
			var currentHistory = {"player": pname, "tier": PlayerPlot.currentStandings.players[lowerplayer].tier, "division": PlayerPlot.currentStandings.players[lowerplayer].division};
			PlayerPlot.divStandings = Object.keys(PlayerPlot.currentStandings[currentHistory.division].members).map(key => PlayerPlot.currentStandings[currentHistory.division].members[key]);
			PlayerPlot.divStandings.sort((a,b) => a.rank - b.rank);
			let rank = (Number(PlayerPlot.currentStandings[currentHistory.division].members[pname].wins) + Number(PlayerPlot.currentStandings[currentHistory.division].members[pname].losses)) ? PlayerPlot.currentStandings[currentHistory.division].members[pname].rank : "";
			currentHistory.place = String(rank) + " (in progress)";
			currentHistory.season = String(PlayerPlot.currentSeason);
			let countBase = 0;
			let countMult = 0;
			let propBase = 0;
			let propMult = 0;
			for (let i = PlayerPlot.countsLength-1; i >= 0; i--) {
				if (Number(PlayerPlot.counts[i].season) < PlayerPlot.currentSeason) {
					break;
				} else if (PlayerPlot.counts[i].tier == currentHistory.tier) {
					countMult = Number(PlayerPlot.counts[i].players);
					propMult = Number(PlayerPlot.counts[i].lfrac);
				} else if (PlayerPlot.counts[i].tier < currentHistory.tier) {
					countBase += Number(PlayerPlot.counts[i].players);
					propBase += Number(PlayerPlot.counts[i].lfrac);
				}
			}
			currentHistory.countPlacement = String(rank ? countBase + (rank-0.5)*countMult/PlayerPlot.divStandings.length : countBase + 0.5*countMult);
			currentHistory.propPlacement = String(rank ? propBase + (rank-0.5)*propMult/PlayerPlot.divStandings.length : propBase + 0.5*propMult);
			currentHistory.champ = "in progress";
			currentHistory.chart = "point";
			pHist.push(currentHistory);
			seasons.push(currentHistory.season);
			tiers.push(currentHistory.tier);
		}
		
		var played2MostRecent = (seasons[seasons.length - 1] == PlayerPlot.currentSeason) && (seasons[seasons.length - 2] == PlayerPlot.currentSeason - 1) && (pHist[pHist.length - 1].champ == "in progress");
		
		if (pHist.length) {
			//correct capitalization
			player = pHist[0].player;
			document.getElementById('player-input').value = player;
			
			//set allTiers to true if proportion is true
			if (PlayerPlot.proportion) {PlayerPlot.allTiers = true;}
		
			//find missing seasons and insert nulls
			let start = PlayerPlot.userSetRange ? PlayerPlot.seasonRange[0] : Number(seasons[0]);
			let end = PlayerPlot.userSetRange ? PlayerPlot.seasonRange[1] : Number(seasons[seasons.length-1]);
			var toadd = [];
			for (let s = start; s <= end; s++) {
				if (!(seasons.includes(String(s)))) {
					pHist.push({"player":player, "tier":null, "division":null, "place":null, "season":String(s), "countPlacement":null, "propPlacement":null, "champ":null});
					toadd.push(String(s));
				}
			}
			pHist.sort(function(a,b){return a.season - b.season});
			seasons = seasons.concat(toadd).sort(function(a,b){return a - b});
			
			//show range on sliders if it changes upon plot making
			if (!PlayerPlot.userSetRange) {
				PlayerPlot.seasontextmin.value = seasons[0];
				PlayerPlot.seasontextmax.value = seasons[seasons.length - 1];
				PlayerPlot.seasonslide1.value = seasons[0];
				PlayerPlot.seasonslide2.value = seasons[seasons.length - 1];
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
			var colors = PlayerPlot.tierColors.slice(0,tiers.length).concat(["#000000", "#000000", "#FFFF00", "#FFFFFF"]);
			
			//filter counts to desired 
			if (PlayerPlot.allTiers) {
				for (let i = 0; i < PlayerPlot.countsLength; i++) {
					if (seasons.includes(PlayerPlot.counts[i].season)) {
						fCounts.push(PlayerPlot.counts[i]);
						fCounts[fCounts.length - 1].chart = "bar";
					}
				}
			} else {
				for (let i = 0; i < PlayerPlot.countsLength; i++) {
					if (seasons.includes(PlayerPlot.counts[i].season) && tiers.includes(PlayerPlot.counts[i].tier)) {
						fCounts.push(PlayerPlot.counts[i]);
						fCounts[fCounts.length - 1].chart = "bar";
					}
				}
			}
			
			//filter out later E seasons if player was in E before season 27
			if (tiers[tiers.length - 1] == "E") {
				let oldOnly = true;
				for (let i = pHist.length - 1; i >= 0; i--) {
					if (pHist[i].tier == "E" && Number(pHist[i].season > 26)) {
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
			
			//duplicate player history for line chart
			lHist = JSON.parse(JSON.stringify(pHist));
			for (let i=lHist.length-1; i>=0; i--) {
				lHist[i].chart = "line";
			}
			//make row for lines if played last two seasons
			if (played2MostRecent) {
				lHist.push(JSON.parse(JSON.stringify(lHist[lHist.length - 2])));
				lHist[lHist.length - 1].champ = "in progress";
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
					"mark": {"type": "line", "stroke": "#000000"},
					"encoding" : {
						"x": {"field": "season", "type": "ordinal"},
						"y": {
							"field": PlayerPlot.proportion ? "propPlacement" : "countPlacement",
							"type": "quantitative"
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
						"stroke": "#000000",
						"strokeWidth": "1"
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
						"size": {"condition": {"selection": "hovered", "value": "60"}, "value": "40"},
						"tooltip": (ChartUtils.widthcheck.clientWidth < 540) ? null : [
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
		"title": PlayerPlot.player ? ("League History: " + PlayerPlot.player) : "League History",
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
					let roi = pHist[value[0].values[0]-1];						
					PlayerPlot.showStandingsModal(roi.season, roi.division);
				}
			})
		}
	});
	
	function nullPlotLayer(fCounts) {
		let seasons = [];
		let start = PlayerPlot.userSetRange ? PlayerPlot.seasonRange[0] : 1;
		let end = PlayerPlot.userSetRange ? PlayerPlot.seasonRange[1] : PlayerPlot.currentSeason;
		for (let s = start; s <= end; s++) {seasons.push(String(s));}
		for (let i = 0; i < PlayerPlot.countsLength; i++) {
			if ((Number(PlayerPlot.counts[i].season) >= start) && (Number(PlayerPlot.counts[i].season) <= end)) {
				fCounts.push(PlayerPlot.counts[i]);
				fCounts[fCounts.length - 1].chart = "bar";
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
						"range": PlayerPlot.tierColors
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
	document.getElementById('modal-header').innerHTML = '<a href="/' + ((season == PlayerPlot.currentSeason) ? 'current_standings' : 'past_standings/season' + season) + '?div=' + division + '" target="_blank">Season ' + season + ' Division ' + division + ' Standings</a>';
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
	if ((season == PlayerPlot.currentSeason) && PlayerPlot.divStandings) {
		for (let i=0; i < PlayerPlot.divStandings.length; i++) {
			let row = document.createElement('tr');
			row.classList.add('rows-past-standings')
			let names = ['rank', 'name', 'wins', 'losses', 'pct'];
			for (let j = 0; j < 5; j++) {
				let cell = document.createElement('td');
				cell.classList.add('cells-past-standings');
				if (j == 1) {
					cell.classList.add('clickable-name');
				} else if (j == 4) {
					cell.style.cssText = 'background-color:' + PlayerPlot.divStandings[i].color;
				}
				cell.appendChild(document.createTextNode(PlayerPlot.divStandings[i][names[j]]));
				row.appendChild(cell);
			}
			tableBody.appendChild(row);
		}
	} else {
		for (let i=0; i < PlayerPlot.placeHistoryLength; i++) {
			if ((PlayerPlot.placeHistory[i].season == season) && (PlayerPlot.placeHistory[i].division == division)) {
				let row = document.createElement('tr');
				row.classList.add('rows-past-standings')
				let names = ['place', 'player', 'wins', 'losses', 'pct']
				for (let j = 0; j < 5; j++) {
					let cell = document.createElement('td');
					cell.classList.add('cells-past-standings');
					if (j == 1) {
						cell.classList.add('clickable-name');
					} else if (j == 4) {
						cell.style.cssText = 'background-color:' + PlayerPlot.placeHistory[i].standingsColor;
					}
					cell.appendChild(document.createTextNode(PlayerPlot.placeHistory[i][names[j]]));
					row.appendChild(cell);
				}
				tableBody.appendChild(row);
			}
		}
	}
	table.appendChild(tableBody);
	modalBody.appendChild(table);
	ChartUtils.setClickableNames();
	ChartUtils.openModal();
};

//A Division power chart

var PowerPlot = {};

PowerPlot.data = {{ site.data.chart_power | jsonify }};
PowerPlot.dataLength = PowerPlot.data.data.length;

PowerPlot.zoom = false;

PowerPlot.plot = null;

PowerPlot.resize = function() {
	PowerPlot.plot.width(ChartUtils.widthcheck.clientWidth - 78);
	PowerPlot.plot.height((PowerPlot.zoom ? 3 : 1) * (ChartUtils.widthcheck.clientWidth - 78));
	PowerPlot.plot.runAsync();
}

PowerPlot.zoomControl = document.getElementById('powerzoom');
PowerPlot.prepControls = function() {
	PowerPlot.zoomControl.onclick = PowerPlot.toggleZoom;
}
PowerPlot.toggleZoom = function() {
	PowerPlot.zoom = PowerPlot.zoom ? false : true;
	PowerPlot.makePlot();
}

PowerPlot.makePlot = function() {
	var widthOffset = PowerPlot.zoom ? 0.1 : 0.61;
		
	const powerSpec = {
		"title": "A Division History",
		"width": ChartUtils.widthcheck.clientWidth - 78, //little bit off with scrollbar, worry when doing resizing for window
		"height": (PowerPlot.zoom ? 3 : 1) * (ChartUtils.widthcheck.clientWidth - 78),
		"data": {"values": PowerPlot.data.data},
		"layer": [
			{
				"mark": {"type": "area"},
				"transform": [{"calculate": "indexof(" + JSON.stringify(PowerPlot.data.players) + ", datum.player)", "as": "order"}],
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
							"domain": PowerPlot.data.players,
							"range": PowerPlot.data.colors
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
				PlayerPlot.player = PowerPlot.data.data[value[0].values[0]-1].player;
				PlayerPlot.allTiers = document.getElementById('allTiers').checked;
				ChartUtils.setURLparams();
				PlayerPlot.makePlot();
			}
		})
	});
}