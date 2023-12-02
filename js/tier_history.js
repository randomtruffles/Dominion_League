---
---
// loading
var currentSeason = {{ site.data.current_season | jsonify }};
var tierParams = {{ site.data.season.tiers | jsonify }};
var leagueHist = {{ site.data.league_history | jsonify }};
var sheetsLinks = {{ site.data.sheet_links | jsonify }};
var champions = {{ site.data.champions | jsonify }};

var loadingDiv = document.getElementById("loading");
var divisionsDiv = document.getElementById("standings");
var statsDiv = document.getElementById("stats");
var overallDiv = document.getElementById("overall");

var tierKey = "";
var screenKey = "overall";
var overallStands = null;
var overallFilt = null;
var overallSort = {"variable": "won", "desc": true};
loadPage();

function makeButtons(div) {
	var tiers = [..."ABCDEFGHIJP"];
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
		statsDiv.innerHTML = "Coming Soon";
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
	} else if (screenKey == "overall") {
		divisionsDiv.style.display = "none";
		statsDiv.style.display = "none";
		overallDiv.style.display = "block";
		document.getElementById("overallSelect").checked = "checked";
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
	overallStands = {};
	
	// get current season if exists
	const currentSeasonNumber = currentSeason.season;
	let currentSeasonDivisions = Object.keys(currentSeason).filter(x => /[A-Z]\d+/.test(x));
	if (currentSeasonDivisions.map(d => d.charAt(0)).includes(tierKey)) {
		for (let division of currentSeasonDivisions) {
			if (division.charAt(0) == tierKey) {
				let title = `<a href="current_standings?div=${division}"> S${currentSeasonNumber}</a> ${division} Division`;
				let params = {"headerText":title, "playerNameKey": true};
				if (champions.seasons[currentSeasonNumber]) {params["champ"] = champions.seasons[currentSeasonNumber];}
				loadDivision(divisionsDiv, currentSeason[division], sheetsLinks[String(currentSeasonNumber)][division], division, String(currentSeasonNumber), params);
				for (player in currentSeason[division].by_player) {
					overallStands[player] = {'seasons': [currentSeasonNumber], 'wins': [currentSeason[division].by_player[player].wins], 'losses': [currentSeason[division].by_player[player].losses], 'won': []};
					if (division == 'A1') {
						if (champions.seasons[currentSeasonNumber] == player.toLowerCase()) {overallStands[player].won.push(currentSeasonNumber);}
					} else if (currentSeason[division].members[player].rank == 1) {overallStands[player].won.push(currentSeasonNumber);}
				}
			}
		}
	}
	
	for (let season = currentSeasonNumber - 1; season > 0; season--) {
		let seasonKey = 's' + season;
		let seasonHist = leagueHist[seasonKey];
		let seasonDivisions = Object.keys(seasonHist).filter(x => /[A-Z]\d+/.test(x));
		if (seasonDivisions.map(d => d.charAt(0)).includes(tierKey)) {
			for (let division of seasonDivisions) {
				if (division.charAt(0) == tierKey) {
					let title = `<a href="past_standings/season${season}?div=${division}"> S${season}</a> ${division} Division`;
					let params = {"headerText":title, "playerNameKey": true, "champ": champions.seasons[season]};
					let divisionData = decompactDivision(division, leagueHist[seasonKey][division])
					loadDivision(divisionsDiv, divisionData, sheetsLinks[String(season)][division], division, String(season), params);
					for (player in divisionData.by_player) {
						if (player in overallStands) {
							overallStands[player].seasons.push(season);
							overallStands[player].wins.push(divisionData.by_player[player].wins);
							overallStands[player].losses.push(divisionData.by_player[player].losses);
						} else {
							overallStands[player] = {'seasons': [season], 'wins': [divisionData.by_player[player].wins], 'losses': [divisionData.by_player[player].losses], 'won': []};
						}
						if (division == 'A1') {
							if (champions.seasons[season] == player.toLowerCase()) {overallStands[player].won.push(season);}
						} else if (divisionData.members[player].rank == 1) {overallStands[player].won.push(season);}
					}
				}
			}
		}
	}
	
	activatePMtoggle(true);
	
	// build overall table
	let overallTable = document.createElement('div');
	overallTable.id = "overall-table";
	overallDiv.appendChild(overallTable);
	filtOverall();
	genOverallTable();
	
	loadingDiv.style.display = "none";
}

function filtOverall() {
	overallFilt = [];
	for (player in overallStands) {
		let nex = overallStands[player];
		nex.player = player;
		nex.wins = nex.wins.reduce((a,b) => a+b);
		nex.losses = nex.losses.reduce((a,b) => a+b);
		nex.pct = nex.wins/(nex.wins + nex.losses);
		nex.color = numericStandingsColor(nex.pct);
		overallFilt.push(nex);
	}
	for (v of ['seasons', 'won']) {overallFilt.sort((a,b) => b[v].length - a[v].length);}
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
		for (v of listvars) {
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
		for (v of numvars) {
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