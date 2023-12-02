---
---
// loading
var currentSeason = {{ site.data.current_season | jsonify }};
var tierParams = {{ site.data.season.tiers | jsonify }};
var leagueHist = {{ site.data.league_history | jsonify }};
var sheetsLinks = {{ site.data.sheet_links | jsonify }};
var champions = {{ site.data.champions | jsonify }};

var divisionsDiv = document.getElementById("divisions");
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
	tierKey = ev.target.innerHTML;
	setURLparams();
	loadTier();
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
		if (params.has('tier')) {tierKey = params.get('tier').toLowerCase();}
		if (params.has('display')) {screenKey = params.get('display').toLowerCase();}
	}
}

function setURLparams() {
	window.history.replaceState(null, null, `?tier=${tierKey}&display=${screenKey}`);
}

function loadTier() {
	console.log(tierKey);
}