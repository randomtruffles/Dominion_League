---
---

var sheetLinks = {{ site.data.sheet_links | jsonify }};
var champions = {{ site.data.champions | jsonify }};

function makeButtons(div) {
	var tiers = [...new Set(Object.keys(sheetLinks).map(x => x.charAt(0)))].sort();
	var container = document.getElementById("myBtnContainer");
	for (let t of tiers) {
		let butt = document.createElement("button");
		butt.classList.add("btn");
		butt.onclick = onFiltButton;
		butt.appendChild(document.createTextNode(t));
		container.appendChild(butt);
	}
	let allFilt = document.createElement("button");
	allFilt.classList.add("btn");
	if (div.length == 0) {allFilt.classList.add("active");}
	allFilt.onclick = onFiltButton;
	allFilt.appendChild(document.createTextNode("Show All"));
	container.appendChild(allFilt);
}

function onFiltButton(ev) {
	document.getElementsByClassName("active")[0].classList.remove("active");
	ev.target.classList.add("active");
	var divClass = "div" + ev.target.innerHTML;
	if (divClass.length > 4) {
		filtDivs(false);
	} else {
		filtDivs(divClass);
	}
}

function filtDivs(cl) {
	if (document.getElementById("all-divisions").style.display == "none") {allDivisions();}
	var divs = document.getElementsByClassName("filterDiv");
	const ndiv = divs.length;
	if (cl) {
		for (let i=0; i<ndiv; i++) {
			if (divs[i].classList.contains(cl)) {
				divs[i].style.display = "block";
			} else {
				divs[i].style.display = "none";
			}
		}
	} else {
		for (let i=0; i<ndiv; i++) {
			divs[i].style.display = "block";
		}
	}
}

function singleDivision(season, division) {
	var singleDivisionDiv = document.getElementById("single-division");
	singleDivisionDiv.style.display = "";
	singleDivisionDiv.scrollIntoView(true);
	document.getElementById("all-divisions").style.display = "none";
	console.log(`Showing single division: ${division.toLowerCase()}-standings`);
	loadDivision(singleDivisionDiv, decompactDivision(division, divisions[division]), sheetLinks[division], division, season, {"champ":champion});
	var divisionDiv = document.getElementById(`${division.toLowerCase()}-standings`);
	w3AddClass(divisionDiv, "show");
}

function allDivisions(season) {
	var divisionDiv = document.getElementById("all-divisions");
	console.log("Showing all divisions");
	divisionDiv.style.display = "block";
	document.getElementById("single-division").style.display = "none";
	for (var division in divisions) {
		if (/^[A-Z]\d+$/.test(division)) {
			loadDivision(divisionDiv, decompactDivision(division, divisions[division]), sheetLinks[division], division, season, {"champ":champion});
		}
	}
	return;
}

function loadPage(season) {
	sheetLinks = sheetLinks[season];
	champion = champions.seasons[season];
	var division = getParam('div');
	var tier = getParam('tier');
	makeButtons(division);
	if (division.length > 0) {
		singleDivision(season, division.toUpperCase());
	} else {
		allDivisions(season);
		filtDivs(false);
	}
}