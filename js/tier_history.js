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
var seasonRange = null;
var tierSeasons = null;
var rangeSlides = {"overall": {'screen': overallDiv}, "stats": {'screen': statsDiv}};
var minSeasons = 1;
var seasonsText = null;
var seasonsSlide = null;
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
	tierSeasons = [null, null];
	overallStands = {};
	
	// get current season if exists
	const currentSeasonNumber = currentSeason.season;
	let currentSeasonDivisions = Object.keys(currentSeason).filter(x => /[A-Z]\d+/.test(x));
	if (currentSeasonDivisions.map(d => d.charAt(0)).includes(tierKey)) {
		tierSeasons = [currentSeasonNumber, currentSeasonNumber];
		for (let division of currentSeasonDivisions) {
			if (division.charAt(0) == tierKey) {
				let title = `<a href="current_standings?div=${division}"> S${currentSeasonNumber}</a> ${division} Division`;
				let params = {"headerText":title, "playerNameKey": true};
				if (champions.seasons[currentSeasonNumber]) {params["champ"] = champions.seasons[currentSeasonNumber];}
				loadDivision(divisionsDiv, currentSeason[division], sheetsLinks[String(currentSeasonNumber)][division], division, String(currentSeasonNumber), params);
				for (let player in currentSeason[division].by_player) {
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
			tierSeasons[0] = season;
			if (!tierSeasons[1]) {tierSeasons[1] = season;}
			for (let division of seasonDivisions) {
				if (division.charAt(0) == tierKey) {
					let title = `<a href="past_standings/season${season}?div=${division}"> S${season}</a> ${division} Division`;
					let params = {"headerText":title, "playerNameKey": true, "champ": champions.seasons[season]};
					let divisionData = decompactDivision(division, leagueHist[seasonKey][division])
					loadDivision(divisionsDiv, divisionData, sheetsLinks[String(season)][division], division, String(season), params);
					for (let player in divisionData.by_player) {
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
	
	// add controls to overall and stats pages
	if (!seasonRange) {seasonRange = tierSeasons;}
	if (tierSeasons[0] > seasonRange[0]) {seasonRange[0] = tierSeasons[0];}
	if (tierSeasons[1] < seasonRange[1]) {seasonRange[1] = tierSeasons[1];}
	initControls();					   
	
	// build overall table
	let overallTable = document.createElement('div');
	overallTable.id = "overall-table";
	overallDiv.appendChild(overallTable);
	filtOverall();
	
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
			filtOverall();
			break
		case rangeSlides.stats.slide1:
		case rangeSlides.stats.slide2:
			seasonRange = [Number(rangeSlides.stats.slide1.value), Number(rangeSlides.stats.slide2.value)].sort((a,b) => a-b);
			rangeTextBlur([rangeSlides.stats.slide1, rangeSlides.stats.slide2]);
			filtOverall();
			break
	}
}

function rangeTextMinInput(ev) {
	let newmin = Number(ev.target.value);
	if ((newmin >= tierSeasons[0]) && (newmin <= seasonRange[1])) {
		seasonRange[0] = newmin;
		rangeTextBlur([ev.target]);
		filtOverall();
	}
}

function rangeTextMaxInput(ev) {
	let newmax = Number(ev.target.value);
	if ((newmax <= tierSeasons[1]) && (newmax >= seasonRange[0])) {
		seasonRange[1] = newmax;
		rangeTextBlur([ev.target]);
		filtOverall();
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