---
---
// loading
var currentSeason = {{ site.data.current_season | jsonify }};
var tierParams = {{ site.data.season.tiers | jsonify }};
var players = {{ site.data.player_seasons | jsonify }};
var leagueHist = {{ site.data.league_history | jsonify }};
var sheetsLinks = {{ site.data.sheet_links | jsonify }};
var champions = {{ site.data.champions | jsonify }};
excludePlayers = {{ site.data.exclude_players | jsonify }};

var loadingDiv = document.getElementById("loading");
var divisionsDiv = document.getElementById("standings");
var statsDiv = document.getElementById("stats");
var overallDiv = document.getElementById("overall");

var tierKey = "";
var screenKey = "overall";
var overallStands = null;
var overallFilt = null;
var overallSort = {"variable": "won", "desc": true};
var seasonRange = null;
var tierSeasons = null;
var userSetRange = false;
var rangeSlides = {"overall": {'screen': overallDiv}, "stats": {'screen': statsDiv}};
var minSeasons = 1;
var seasonsText = null;
var seasonsSlide = null;
var statStore = null;
loadPage();

function makeButtons(div) {
	var tiers = [..."ABCDEFGHIJKP"];
	var container = document.getElementById("myBtnContainer");
	for (let t of tiers) {
		let butt = document.createElement("button");
		butt.classList.add("btn");
		if (t == div) {butt.classList.add("active");}
		butt.onclick = onTierButton;
		butt.appendChild(document.createTextNode(t));
		container.appendChild(butt);
	}
}

function onTierButton(ev) {
	document.getElementsByClassName("active")[0].classList.remove("active");
	ev.target.classList.add("active");
	let newTier =  ev.target.innerHTML;
	if (newTier != tierKey) {
		tierKey = newTier;
		setURLparams();
		divisionsDiv.innerHTML = "";
		statsDiv.innerHTML = "";
		overallDiv.innerHTML = "";
		loadingDiv.style.display = "block";
		setTimeout(() => {loadTier();}, 0);
	}
}

document.getElementById("divisionsSelect").onclick = function(ev) {
	ev.target.blur();
	divisionsDiv.style.display = "block";
	statsDiv.style.display = "none";
	overallDiv.style.display = "none";
	screenKey = "divisions";
	setURLparams();
};
document.getElementById("statsSelect").onclick = function(ev) {
	ev.target.blur();
	divisionsDiv.style.display = "none";
	statsDiv.style.display = "block";
	overallDiv.style.display = "none";
	screenKey = "stats";
	setURLparams();
};
document.getElementById("overallSelect").onclick = function(ev) {
	ev.target.blur();
	divisionsDiv.style.display = "none";
	statsDiv.style.display = "none";
	overallDiv.style.display = "block";
	screenKey = "overall";
	setURLparams();
};

function loadPage() {
	getURLparams();
	if (!tierKey) {
		tierKey = "A";
	}
	makeButtons(tierKey);
	loadTier();
	if (screenKey == "stats") {
		divisionsDiv.style.display = "none";
		statsDiv.style.display = "block";
		document.getElementById("statsSelect").checked = "checked";
		overallDiv.style.display = "none";
	} else if (screenKey == "divisions") {
		divisionsDiv.style.display = "block";
		statsDiv.style.display = "none";
		overallDiv.style.display = "none";
		document.getElementById("divisionsSelect").checked = "checked";
	}
}

// handle URL parameters
function getURLparams() {
	if (window.location.search) {
		let params = new URLSearchParams(window.location.search);
		if (params.has('tier')) {tierKey = params.get('tier').toUpperCase();}
		if (params.has('display')) {screenKey = params.get('display').toLowerCase();}
	}
}

function setURLparams() {
	window.history.replaceState(null, null, `?tier=${tierKey}&display=${screenKey}`);
}

function loadTier() {
	tierSeasons = [null, null];
	overallStands = {};
	
	// get current season if exists
	const currentSeasonNumber = currentSeason.season;
	let currentSeasonDivisions = Object.keys(currentSeason).filter(x => /[A-Z]\d+/.test(x));
	let stats = {'season': currentSeasonNumber, 'winners': {}, 'safes': [], 'promoters': [], 'demoters': [], 'stayers': [], 'firsts': [], 'new': []};
	if (tierKey == 'A') {stats.runups = {}};
	if (currentSeasonDivisions.map(d => d.charAt(0)).includes(tierKey)) {
		tierSeasons = [currentSeasonNumber, currentSeasonNumber];
		for (let division of currentSeasonDivisions) {
			if (division.charAt(0) == tierKey) {
				let title = `<a href="current_standings?div=${division}"> S${currentSeasonNumber}</a> ${division} Division`;
				let params = {"headerText":title, "playerNameKey": true};
				if (champions.seasons[currentSeasonNumber]) {params["champ"] = champions.seasons[currentSeasonNumber];}
				loadDivision(divisionsDiv, currentSeason[division], sheetsLinks[String(currentSeasonNumber)][division], division, String(currentSeasonNumber), params);
				for (let player in currentSeason[division].by_player) {
					let playerKey = player.toLowerCase();
					overallStands[player] = {'seasons': [currentSeasonNumber], 'wins': [currentSeason[division].by_player[player].wins], 'losses': [currentSeason[division].by_player[player].losses], 'won': []};
					if (currentSeason[division]['complete?'] == 'Yes') {
						let winpct = currentSeason[division].by_player[player].wins/(currentSeason[division].by_player[player].wins + currentSeason[division].by_player[player].losses);
						let status = (tierKey == 'A' && champions.seasons[currentSeasonNumber] == playerKey) ? 'p' : ((currentSeasonNumber in oddSchemes) && (tierKey in oddSchemes[currentSeasonNumber])) ? (currentSeason[division].members[player]['next tier'] == oddSchemes[currentSeasonNumber][tierKey][0] ? 'p' : (currentSeason[division].members[player]['next tier'] == oddSchemes[currentSeasonNumber][tierKey][1] ? 'd' : 'o')) : (currentSeason[division].members[player]['next tier'] > tierKey ? 'd' : (currentSeason[division].members[player]['next tier'] < tierKey ? 'p' : 'o'));
						if (division == 'A1') {
							if (champions.seasons[currentSeasonNumber] == playerKey) {
								overallStands[player].won.push(currentSeasonNumber);
								stats.winners[player] = winpct;
							} else if (champions.runner_ups[currentSeasonNumber] == playerKey) {
								stats.runups[player] = winpct;
							}
						} else if (currentSeason[division].members[player].rank == 1) {
							overallStands[player].won.push(currentSeasonNumber);
							stats.winners[player] = winpct;
						}
						if (!(playerKey in players)) {
							stats.new.push([winpct, status]);
						} else {
							let previousSeasonIdx = players[playerKey].seasons.length - 1
							let previousSeason = Number(players[playerKey].seasons[previousSeasonIdx]);
							let previousTier = players[playerKey].divisions[previousSeasonIdx].charAt(0);
							let previousTiers = players[playerKey].divisions.map(d => d.charAt(0));
							if (previousTiers.filter(t => t <= tierKey).length == 0) {
								stats.firsts.push([winpct, status]);
							}
							if (previousSeason == currentSeasonNumber - 1) {
								if ((previousSeason in oddSchemes) && (previousTier in oddSchemes[previousSeason])) {
									if (tierKey == oddSchemes[previousSeason][previousTier][0]) {
										stats.promoters.push([winpct, status]);
									} else if (tierKey == oddSchemes[previousSeason][previousTier][1]) {
										stats.demoters.push([winpct, status]);
									} else {
										stats.stayers.push([winpct, status]);
									}
								} else {
									if (previousTier < tierKey) {
										stats.demoters.push([winpct, status]);
									} else if (previousTier > tierKey) {
										stats.promoters.push([winpct, status]);
									} else {
										stats.stayers.push([winpct, status]);
									}
								}
							}
						}
					}
				}
			}
		}
	}
	statStore = [stats];
	
	for (let season = currentSeasonNumber - 1; season > 0; season--) {
		let seasonKey = 's' + season;
		let seasonHist = leagueHist[seasonKey];
		let seasonDivisions = Object.keys(seasonHist).filter(x => /[A-Z]\d+/.test(x));
		let stats = {'season': season, 'winners': {}, 'safes': [], 'promoters': [], 'demoters': [], 'stayers': [], 'firsts': [], 'new': []};
		if (tierKey == 'A') {stats.runups = {}};
		if (seasonDivisions.map(d => d.charAt(0)).includes(tierKey)) {
			tierSeasons[0] = season;
			if (!tierSeasons[1]) {tierSeasons[1] = season;}
			for (let division of seasonDivisions) {
				if (division.charAt(0) == tierKey) {
					let title = `<a href="past_standings/season${season}?div=${division}"> S${season}</a> ${division} Division`;
					let params = {"headerText":title, "playerNameKey": true, "champ": champions.seasons[season]};
					let divisionData = decompactDivision(division, leagueHist[seasonKey][division])
					loadDivision(divisionsDiv, divisionData, sheetsLinks[String(season)][division], division, String(season), params);
					for (let player in divisionData.by_player) {
						let playerKey = player.toLowerCase();
						if (excludePlayers.includes(playerKey)) {continue;}
						let winpct = divisionData.by_player[player].wins/(divisionData.by_player[player].wins + divisionData.by_player[player].losses);
						let status = (tierKey == 'A' && champions.seasons[season] == playerKey) ? 'p' : ((season in oddSchemes) && (tierKey in oddSchemes[season])) ? (divisionData.members[player]['next tier'] == oddSchemes[season][tierKey][0] ? 'p' : (divisionData.members[player]['next tier'] == oddSchemes[season][tierKey][1] ? 'd' : 'o')) : (divisionData.members[player]['next tier'] > tierKey ? 'd' : (divisionData.members[player]['next tier'] < tierKey ? 'p' : 'o'));
						if (player in overallStands) {
							overallStands[player].seasons.push(season);
							overallStands[player].wins.push(divisionData.by_player[player].wins);
							overallStands[player].losses.push(divisionData.by_player[player].losses);
						} else {
							overallStands[player] = {'seasons': [season], 'wins': [divisionData.by_player[player].wins], 'losses': [divisionData.by_player[player].losses], 'won': []};
						}
						if (division == 'A1') {
							if (champions.seasons[season] == playerKey) {
								overallStands[player].won.push(season);
								stats.winners[player] = winpct;
							} else if (champions.runner_ups[season] == playerKey) {
								stats.runups[player] = winpct;
							}
						} else if (divisionData.members[player].rank == 1) {
							overallStands[player].won.push(season);
							stats.winners[player] = winpct;
						}
						let plidx = players[playerKey].seasons.indexOf(String(season));
						if (plidx == 0) {
							if (season > 1) {stats.new.push([winpct, status])};
						} else {
							let previousSeason = Number(players[playerKey].seasons[plidx-1]);
							let previousTier = players[playerKey].divisions[plidx-1].charAt(0);
							let previousTiers = players[playerKey].divisions.slice(0, plidx).map(d => d.charAt(0));
							if (previousTiers.filter(t => t <= tierKey).length == 0) {
								stats.firsts.push([winpct, status]);
							}
							if (previousSeason == season - 1) {
								if ((previousSeason in oddSchemes) && (previousTier in oddSchemes[previousSeason])) {
									if (tierKey == oddSchemes[previousSeason][previousTier][0]) {
										stats.promoters.push([winpct, status]);
									} else if (tierKey == oddSchemes[previousSeason][previousTier][1]) {
										stats.demoters.push([winpct, status]);
									} else {
										stats.stayers.push([winpct, status]);
									}
								} else {
									if (previousTier < tierKey) {
										stats.demoters.push([winpct, status]);
									} else if (previousTier > tierKey) {
										stats.promoters.push([winpct, status]);
									} else {
										stats.stayers.push([winpct, status]);
									}
								}
							}
						}
					}
					let divPlayers = Object.keys(divisionData.members);
					if (!((season in oddSchemes) && (tierKey in oddSchemes[season]))) {
						if (divPlayers.filter(p => divisionData.members[p].drop == "No" && divisionData.members[p]['next tier'] > tierKey).length > 0) {
							stats.safes.push(Math.min(...divPlayers.filter(p => divisionData.members[p]['next tier'] <= tierKey).map(p => divisionData.by_player[p].wins/(divisionData.by_player[p].wins + divisionData.by_player[p].losses))));
						}
					}
				}
			}
		}
		statStore.unshift(stats);
	}
	
	activatePMtoggle(true);
	
	// add controls to overall and stats pages
	if (!userSetRange) {seasonRange = tierSeasons;}
	if (tierSeasons[0] > seasonRange[0]) {seasonRange[0] = tierSeasons[0];}
	if (tierSeasons[1] < seasonRange[1]) {seasonRange[1] = tierSeasons[1];}
	initControls();					   
	
	// build overall table
	let overallTable = document.createElement('div');
	overallTable.id = "overall-table";
	overallDiv.appendChild(overallTable);
	filtOverall();
	
	// build stats page
	let disclaimer = document.createElement('p');
	disclaimer.style.fontStyle = 'italic';
	disclaimer.appendChild(document.createTextNode("Note that stats do not include incomplete divisions in the current season"));
	statsDiv.appendChild(disclaimer);
	statsLine('best-season', "Best Season");
	statsLine('avg-win', tierKey == 'A' ? "Average Highest Win Percentage" : "Average Division Winner Win Percentage");
	if (tierKey == 'A') {
		statsLine('avg-sec', "Average Second Highest Win Percentage");
		statsLine('comeback', "Number of Championship Match Comebacks");
	}
	statsLine('avg-safe', "Average Lowest Non-Demotion Win Percentage");
	let statsTable = document.createElement('table');
	statsTable.classList.add('table-past-standings');
	let statsBody = document.createElement('tbody');
	let headerRow = document.createElement('tr');
	headerRow.classList.add('rows-past-standings');
	let cols = ['Player Type', 'Avg Win %', tierKey == 'A' ? 'Champion %' : 'Promotion %', 'Demotion %'];
	let colpcts = ['40%', '20%', '20%', '20%'];
	for (let j=0; j<4; j++) {
		let hc = document.createElement('th');
		hc.setAttribute('width', colpcts[j]);
		hc.classList.add('cells-past-standings');
		hc.appendChild(document.createTextNode(cols[j]));
		headerRow.appendChild(hc);
	}
	statsBody.appendChild(headerRow);
	let ptypes = ['Promoters', 'Stayers', 'Demoters', 'New', 'First Time'];
	let pvars = ['promoters', 'stayers', 'demoters', 'new', 'firsts'];
	let typedescs = ['Promoted from below the previous season', 'Were in the same tier the previous season', 'Demoted from above the previous season', 'Were new to league', 'Were in that tier for the first time after some time in league'];
	for (let i=0; i<5; i++) {
		let row = document.createElement('tr');
		row.classList.add('rows-past-standings');
		row.id = 'row-' + pvars[i];
		let ptype = document.createElement('td');
		ptype.classList.add('cells-past-standings');
		ptype.title = typedescs[i];
		ptype.appendChild(document.createTextNode(ptypes[i]));
		row.appendChild(ptype);
		statsBody.appendChild(row);
	}
	
	statsTable.appendChild(statsBody);
	statsDiv.appendChild(statsTable);
	
	filtStats();
	
	loadingDiv.style.display = "none";
}

function filtOverall() {
	overallFilt = [];
	for (let player in overallStands) {
		let nex = {'player': player, 'seasons': [], 'wins': 0, 'losses': 0, 'won': []}
		for (let i = overallStands[player].seasons.length-1; i>=0; i--) {
			let s = overallStands[player].seasons[i];
			if (s > seasonRange[1]) {break;}
			if (s < seasonRange[0]) {continue;}
			nex.seasons.push(s);
			nex.wins += overallStands[player].wins[i];
			nex.losses += overallStands[player].losses[i];
			if (overallStands[player].won.includes(s)) {nex.won.push(s);}
		}
		if (nex.seasons.length > 0) {
			nex.pct = (nex.wins + nex.losses) ? nex.wins/(nex.wins + nex.losses) : 0;
			nex.color = numericStandingsColor(nex.pct);
			overallFilt.push(nex);
		}
	}
	for (let v of ['seasons', 'won']) {overallFilt.sort((a,b) => b[v].length - a[v].length);}
	
	let maxSeasons = Math.max(...overallFilt.map(x => x.seasons.length));
	if (minSeasons > maxSeasons) {
		minSeasons = maxSeasons;
		seasonsSlide.value = minSeasons;
		seasonsText.value = minSeasons;
	}
	seasonsSlide.max = maxSeasons;
	overallFilt = overallFilt.filter(x => x.seasons.length >= minSeasons);
	
	genOverallTable();
}

function genOverallTable() {
	const listvars = ["seasons", "won"];
	const numvars = ["wins", "losses"];
	champ = "";
	
	let ordering = overallSort.desc ? 1 : -1;
	if (overallSort.variable == "player") {
		overallFilt.sort((a,b) => ordering * a.player.localeCompare(b.player, 'en', {'sensitivity': 'base'}));
	} else if (["seasons", "won"].includes(overallSort.variable)) {
		overallFilt.sort((a,b) => ordering * (b[overallSort.variable].length - a[overallSort.variable].length));
	} else {
		overallFilt.sort((a,b) => ordering * (b[overallSort.variable] - a[overallSort.variable]));
	}
	
	var table = document.createElement('table');
	table.classList.add('table-past-standings');
	var tableBody = document.createElement('tbody');
	var topRow = document.createElement('tr');
	topRow.classList.add('rows-past-standings');
	let names = ["Player", "Seasons", "Wins", "W", "L", "Win %"];
	let sortedName = {"player":"Player","seasons":"Seasons","won":"Wins","wins":"W","losses":"L","pct":"Win %"}[overallSort.variable];
	let pcts = ["50%", "12%", "10%", "9%", "9%", "10%"];
	for (let j=0; j<6; j++) {
		let cell = document.createElement('th');
		cell.setAttribute('width', pcts[j]);
		cell.classList.add('cells-past-standings');
		cell.classList.add('sortable-header');
		cell.onclick = sortOverall;
		if (sortedName == names[j]) {
			names[j] += overallSort.desc ? " ▼" : " ▲";
		}
		cell.appendChild(document.createTextNode(names[j]));
		topRow.appendChild(cell);
	}
	tableBody.appendChild(topRow);
	
	const nplayers = overallFilt.length;
	for (let i=0; i<nplayers; i++) {
		let row = document.createElement('tr');
		row.classList.add('rows-past-standings');
		let pc = document.createElement('td');
		pc.classList.add('cells-past-standings');
		
		pc.innerHTML = formatDbLink(overallFilt[i].player, 'db-link');
		row.appendChild(pc);
		for (let v of listvars) {
			let sc = document.createElement('td');
			sc.classList.add('cells-past-standings')
			sc.appendChild(document.createTextNode(overallFilt[i][v].length));
			if (overallFilt[i][v].length) {
				sc.classList.add('cellWithDetail');
				let sd = document.createElement('div');
				sd.classList.add('cellDetail');
				sd.classList.add('flexWide');
				let slist = document.createElement('p');
				slist.appendChild(document.createTextNode("Seasons: " + overallFilt[i][v].sort((a,b) => a - b).toString().replace(/,/g, ", ")));
				sd.appendChild(slist);
				sc.appendChild(sd);
			}
			row.appendChild(sc);
		}
		for (let v of numvars) {
			let sc = document.createElement('td');
			sc.classList.add('cells-past-standings')
			sc.appendChild(document.createTextNode(overallFilt[i][v].toFixed(1).replace(".0", "")));
			row.appendChild(sc);
		}
		let pct = document.createElement('td');
		pct.classList.add('cells-past-standings');
		pct.style.cssText = `background-color:${overallFilt[i].color}`;
		pct.appendChild(document.createTextNode(Math.round(100*overallFilt[i].pct) + "%"));
		row.appendChild(pct);
		tableBody.appendChild(row);
	}
	table.appendChild(tableBody);
	var tableDiv = document.getElementById("overall-table");
	tableDiv.innerHTML = "";
	tableDiv.appendChild(table);
}

function sortOverall(ev) {
	var colHeader = ev.target.innerHTML;
	if (colHeader.includes("▼")) {
		overallSort.desc = false;
	} else if (colHeader.includes("▲")) {
		overallSort.desc = true;
	} else {
		overallSort.variable = {"Player": "player", "Seasons": "seasons", "Wins": "won", "W": "wins", "L": "losses", "Win %": "pct"}[colHeader];
		overallSort.desc = true;
	}
	genOverallTable();
}

function initControls() {
	for (let tab in rangeSlides) {
		let rangeSlider = document.createElement('div');
		rangeSlider.classList.add("db-control-container");
		let rangeLabel = document.createElement('span');
		rangeLabel.appendChild(document.createTextNode("Seasons: "));
		rangeLabel.style.position = "relative";
		rangeLabel.style.top = "-15px";
		rangeSlider.appendChild(rangeLabel);
		rangeSlides[tab].textmin = document.createElement('input');
		rangeSlides[tab].textmin.setAttribute('type', 'text');
		rangeSlides[tab].textmin.classList.add('slidertext');
		rangeSlides[tab].textmin.classList.add('slidePiece');
		rangeSlides[tab].textmin.value = String(seasonRange[0]);
		rangeSlides[tab].textmin.oninput = rangeTextMinInput;
		rangeSlides[tab].textmin.onblur = () => rangeTextBlur();
		rangeSlider.appendChild(rangeSlides[tab].textmin);
		let slideContain = document.createElement('div');
		slideContain.classList.add('slidePiece');
		slideContain.classList.add('slider-container');
		rangeSlides[tab].slide1 = document.createElement('input');
		rangeSlides[tab].slide1.setAttribute('type', 'range');
		rangeSlides[tab].slide1.classList.add('dslider');
		rangeSlides[tab].slide1.min = tierSeasons[0];
		rangeSlides[tab].slide1.max = tierSeasons[1];
		rangeSlides[tab].slide1.value = seasonRange[0];
		rangeSlides[tab].slide1.oninput = rangeSlideInput;
		rangeSlides[tab].slide2 = document.createElement('input');
		rangeSlides[tab].slide2.setAttribute('type', 'range');
		rangeSlides[tab].slide2.classList.add('dslider');
		rangeSlides[tab].slide2.min = tierSeasons[0];
		rangeSlides[tab].slide2.max = tierSeasons[1];
		rangeSlides[tab].slide2.value = seasonRange[1];
		rangeSlides[tab].slide2.oninput = rangeSlideInput;
		slideContain.appendChild(rangeSlides[tab].slide1);
		slideContain.appendChild(rangeSlides[tab].slide2);
		rangeSlider.appendChild(slideContain);
		rangeSlides[tab].textmax = document.createElement('input');
		rangeSlides[tab].textmax.setAttribute('type', 'text');
		rangeSlides[tab].textmax.classList.add('slidertext');
		rangeSlides[tab].textmax.classList.add('slidePiece');
		rangeSlides[tab].textmax.value = String(seasonRange[1]);
		rangeSlides[tab].textmax.oninput = rangeTextMaxInput;
		rangeSlides[tab].textmax.onblur = () => rangeTextBlur();
		rangeSlider.appendChild(rangeSlides[tab].textmax);
		rangeSlides[tab].screen.appendChild(rangeSlider);
	}
	
	let seasonSlider = document.createElement('div');
	seasonSlider.classList.add("db-control-container");
	let seasonLabel = document.createElement('span');
	seasonLabel.appendChild(document.createTextNode("Min. Seasons: "));
	seasonLabel.style.position = "relative";
	seasonLabel.style.top = "-15px";
	seasonSlider.appendChild(seasonLabel);
	seasonsText = document.createElement('input');
	seasonsText.setAttribute('type', 'text');
	seasonsText.classList.add('slidertext');
	seasonsText.classList.add('slidePiece');
	seasonsText.value = String(minSeasons);
	seasonsText.oninput = seasonsTextInput;
	seasonsText.onblur = seasonsTextBlur;
	seasonSlider.appendChild(seasonsText);								 
	let slideContain = document.createElement('div');
	slideContain.classList.add('slidePiece');
	slideContain.classList.add('slider-container');
	seasonsSlide = document.createElement('input');
	seasonsSlide.setAttribute('type', 'range');
	seasonsSlide.classList.add('dslider');
	seasonsSlide.min = 1;
	seasonsSlide.max = tierSeasons[1];
	seasonsSlide.value = minSeasons;
	seasonsSlide.oninput = seasonsSlideInput;
	slideContain.appendChild(seasonsSlide);
	seasonSlider.appendChild(slideContain);
	overallDiv.appendChild(seasonSlider);
}

function rangeSlideInput(ev) {
	switch(ev.target) {
		case rangeSlides.overall.slide1:
		case rangeSlides.overall.slide2:
			seasonRange = [Number(rangeSlides.overall.slide1.value), Number(rangeSlides.overall.slide2.value)].sort((a,b) => a-b);
			rangeTextBlur([rangeSlides.overall.slide1, rangeSlides.overall.slide2]);
			break
		case rangeSlides.stats.slide1:
		case rangeSlides.stats.slide2:
			seasonRange = [Number(rangeSlides.stats.slide1.value), Number(rangeSlides.stats.slide2.value)].sort((a,b) => a-b);
			rangeTextBlur([rangeSlides.stats.slide1, rangeSlides.stats.slide2]);
			break
	}
	userSetRange = true;
	filtOverall();
	filtStats();
}

function rangeTextMinInput(ev) {
	let newmin = Number(ev.target.value);
	if ((newmin >= tierSeasons[0]) && (newmin <= seasonRange[1])) {
		seasonRange[0] = newmin;
		rangeTextBlur([ev.target]);
		userSetRange = true;
		filtOverall();
		filtStats();
	}
}

function rangeTextMaxInput(ev) {
	let newmax = Number(ev.target.value);
	if ((newmax <= tierSeasons[1]) && (newmax >= seasonRange[0])) {
		seasonRange[1] = newmax;
		rangeTextBlur([ev.target]);
		userSetRange = true;
		filtOverall();
		filtStats();
	}
}

function rangeTextBlur(exceptions = []) {
	for (let tab in rangeSlides) {
		if (!exceptions.includes(rangeSlides[tab].textmin)) {rangeSlides[tab].textmin.value = String(seasonRange[0]);}
		if (!exceptions.includes(rangeSlides[tab].textmax)) {rangeSlides[tab].textmax.value = String(seasonRange[1]);}
		if (!exceptions.includes(rangeSlides[tab].slide1)) {rangeSlides[tab].slide1.value = String(seasonRange[0]);}
		if (!exceptions.includes(rangeSlides[tab].slide2)) {rangeSlides[tab].slide2.value = String(seasonRange[1]);}
	}
}

function seasonsSlideInput() {
	minSeasons = Number(seasonsSlide.value);
	seasonsText.value = minSeasons;
	filtOverall();
}

function seasonsTextInput() {
	let newSeasons = Number(seasonsText.value);
	if (newSeasons >= 1 && newSeasons <= seasonsSlide.max) {
		minSeasons = newSeasons;
		filtOverall();
	}
}

function seasonsTextBlur() {
	seasonsSlide.value = minSeasons;
	seasonsText.value = minSeasons;
}

function statsLine(resid, label) {
	let out = document.createElement('p');
	let lab = document.createElement('span');
	lab.style.fontWeight = "bold";
	lab.appendChild(document.createTextNode(label));
	out.appendChild(lab);
	out.appendChild(document.createTextNode(": "));
	let res = document.createElement('span');
	res.id = resid;
	out.appendChild(res);
	statsDiv.appendChild(out);	
}

function filtStats() {
	var statFilt = statStore.slice(seasonRange[0]-1, seasonRange[1]);
	var bestSeason = {'players': [], 'seasons': [], 'pct': 0};
	var sumPcts = 0;
	var sumSafePct = 0;
	var total = 0;
	var totalSafe = 0;
	if (tierKey == 'A') {
		var comebacks = 0;
		var sum2nds = 0
		for (let s of statFilt) {
			if (Object.keys(s.winners).length == 0) {continue;}
			total += 1;
			let champ = Object.keys(s.winners)[0];
			let cpct = s.winners[champ];
			let runup = Object.keys(s.runups)[0];
			let rpct = s.runups[runup];
			if (rpct > cpct || (rpct == cpct && leagueHist['s' + s.season]['A1'].grid[leagueHist['s' + s.season]['A1'].members.indexOf(champ)][leagueHist['s' + s.season]['A1'].members.indexOf(runup)][0] < 3)) {
				comebacks += 1;
				sumPcts += rpct;
				sum2nds += cpct;
				if (rpct > bestSeason.pct) {
					bestSeason = {'players': [runup], 'seasons': [s.season], 'pct': rpct};
				} else if (rpct == bestSeason.pct) {
					bestSeason.players.push(runup);
					bestSeason.seasons.push(s.season);
				}
			} else {
				sumPcts += cpct;
				sum2nds += rpct;
				if (cpct > bestSeason.pct) {
					bestSeason = {'players': [champ], 'seasons': [s.season], 'pct': cpct};
				} else if (cpct == bestSeason.pct) {
					bestSeason.players.push(champ);
					bestSeason.seasons.push(s.season);
				}
			}
			let safeCount = s.safes.length;
			totalSafe += safeCount;
			if (safeCount > 0) {sumSafePct += s.safes.reduce((a,b) => a+b);}
		}
	} else {
		for (let s of statFilt) {
			for (let p in s.winners) {
				sumPcts += s.winners[p];
				total += 1;
				if (s.winners[p] > bestSeason.pct) {
					bestSeason = {'players': [p], 'seasons': [s.season], 'pct': s.winners[p]};
				} else if (s.winners[p] == bestSeason.pct) {
					bestSeason.players.push(p);
					bestSeason.seasons.push(s.season);
				}
			}
			let safeCount = s.safes.length;
			totalSafe += safeCount;
			if (safeCount > 0) {sumSafePct += s.safes.reduce((a,b) => a+b);}
		}
	}
	let bestList = [];
	for (let i=0; i<bestSeason.players.length; i++) {bestList.push(`<a href="/player_database?player=${bestSeason.players[i].toLowerCase().replace(/ /g,'%20')}">${bestSeason.players[i]}</a> (<a href="/past_standings/season${bestSeason.seasons[i]}">S${bestSeason.seasons[i]}</a>)`);}
	document.getElementById('best-season').innerHTML = total ? Math.round(100*bestSeason.pct) + "% by " + bestList.join(", ") : "No completed divisions";
	document.getElementById('avg-win').innerHTML = total ? (100*sumPcts/total).toFixed(1) + '%' : "No completed divisions";
	document.getElementById('avg-safe').innerHTML = totalSafe > 0 ? (100*sumSafePct/totalSafe).toFixed(1) + '%' : "No demotions";
	if (tierKey == 'A') {
		document.getElementById('avg-sec').innerHTML = total ? (100*sum2nds/total).toFixed(1) + '%' : "No completed divisions";
		document.getElementById('comeback').innerHTML = comebacks;
	}
	
	let pvars = ['promoters', 'stayers', 'demoters', 'new', 'firsts'];
	let vardesc = {'promoters': 'promoters into ' + tierKey, 'stayers': 'players who stayed in ' + tierKey, 'demoters': 'demoters into ' + tierKey, 'new': 'new league players in ' + tierKey, 'firsts': 'players playing in ' + tierKey + ' for the first time'};
	for (let v of pvars) {
		let total = 0;
		let pro = 0;
		let dem = 0;
		let pctSum = 0;
		for (let s of statFilt) {
			for (let oc of s[v]) {
				total += 1;
				pctSum += oc[0];
				pro += oc[1] == 'p';
				dem += oc[1] == 'd';
			}
		}
		let row = document.getElementById('row-' + v);
		for (let c of [...row.children].slice(1)) {row.removeChild(c);}
		if (total == 0) {
			let singc = document.createElement('td');
			singc.classList.add('cells-past-standings');
			singc.colSpan = 3;
			let singcm = document.createElement('span');
			singcm.style.fontStyle = 'italic';
			singcm.appendChild(document.createTextNode('No ' + vardesc[v] + ' during those seasons'));
			singc.appendChild(singcm);
			row.appendChild(singc);
		} else {
			let wpc = document.createElement('td');
			wpc.classList.add('cells-past-standings');
			let wpcn = pctSum/total;
			wpc.style.cssText = `background-color:${numericStandingsColor(wpcn)}`;
			wpc.appendChild(document.createTextNode(Math.round(100*wpcn) + '%'));
			row.appendChild(wpc);
			let ppc = document.createElement('td');
			ppc.classList.add('cells-past-standings');
			ppc.appendChild(document.createTextNode(Math.round(100*pro/total) + '%'));
			row.appendChild(ppc);
			let dpc = document.createElement('td');
			dpc.classList.add('cells-past-standings');
			dpc.appendChild(document.createTextNode(Math.round(100*dem/total) + '%'));
			row.appendChild(dpc);
		}
	}
}
