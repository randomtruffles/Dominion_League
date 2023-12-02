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
var screenKey = "divisions";
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
		overallDiv.innerHTML = "Coming Soon";
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
				}
			}
		}
	}
	
	activatePMtoggle(true);
	loadingDiv.style.display = "none";
}