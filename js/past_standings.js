---
---

var divisions = {{ site.data.league_history | jsonify }};
var sheetLinks = {{ site.data.sheet_links | jsonify }};
var champions = {{ site.data.champions | jsonify }};
var simType = "new";

function singleDivision(division){
	var singleDivisionDiv = document.getElementById("single-division");
	singleDivisionDiv.style.display = "";
	singleDivisionDiv.scrollIntoView(true);
	document.getElementById("all-divisions").style.display = "none";
	console.log(`Showing single division: ${division.toLowerCase()}-standings`);
	loadDivision(singleDivisionDiv, divisions[division], sheetLinks[division], division, {"champ":champion, "sims": simType});
	var divisionDiv = document.getElementById(`${division.toLowerCase()}-standings`);
	w3AddClass(divisionDiv, "show");
}

function allDivisions(){
	var curTierIdx = 0;
	var curDiv = 1;
	var divisionDiv = document.getElementById("all-divisions");
	console.log("Showing all divisions");
	document.getElementById("single-division").style.display = "none";
	for (var division in sheetLinks) {
		if (!divisions[division]) {
			console.log(`${division} data not found. Continuing...`);
			continue;
		}
		loadDivision(divisionDiv, divisions[division], sheetLinks[division], division, {"champ":champion, "sims": simType});
	}
	return;
}

function loadPage(season) {
	divisions = divisions[season];
	sheetLinks = sheetLinks[season];
	champion = champions.seasons[season];
	if (Number(season) < 29) {
		simType = "none";
	} else if (Number(season) < 42) {
		simType = "old";
	}
	var division = getParam('div');
	var tier = getParam('tier');
	if (division.length > 0) {
		singleDivision(division.toUpperCase());
	} else {
		allDivisions();
		filterSelection("all");
	}
}