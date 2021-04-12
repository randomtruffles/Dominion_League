---
---

// loading
var currentSeason = {{ site.data.current_season | jsonify }};
var players = {{ site.data.player_seasons | jsonify }};
var leagueHist = {{ site.data.league_history | jsonify }};
var sheetsLinks = {{ site.data.sheet_links | jsonify }};
var champions = {{ site.data.champions | jsonify }};
//var championshipVideos = {{ site.data.championship_videos | jsonify }};
var youtubeChannels = {{ site.data.youtube_channels | jsonify }};
noLink = true;

var loadingDiv = document.getElementById("loading");
var databaseDiv = document.getElementById("player-database");
var playerDiv = document.getElementById("player-heading");
var standingsDiv = document.getElementById("standings");
var statsDiv = document.getElementById("stats");
var versusDiv = document.getElementById("versus");
var playerInput = document.getElementById("input_player_search");

var playerKey = "";
var playerVersus = null;
var filtVersus = null;
var versusTotal = null;
var versusSort = {"variable": "games", "desc": true};
var tiersPlayed = null;
var selectedTiers = null;
var seasonRange = [currentSeason.season, currentSeason.season];
var textmin = null;
var textmax = null;
var slide1 = null;
var slide2 = null;
loadPage();

document.getElementById("standingsSelect").onclick = function(ev) {
	ev.target.blur();
	standingsDiv.style.display = "block";
	statsDiv.style.display = "none";
	versusDiv.style.display = "none";
};
document.getElementById("versusSelect").onclick = function(ev) {
	ev.target.blur();
	standingsDiv.style.display = "none";
	statsDiv.style.display = "none";
	versusDiv.style.display = "block";
};

function loadPage() {
	getURLparams();
	if (playerKey) {
		searchHistory();
	} else {
		let instructionElements = ["url-instructions", "search-instructions", "spacing-for-instructions"];
		instructionElements.forEach(el => document.getElementById(el).style.display = "block");
		document.getElementById("loading").style.display = "none";
	}
}

// handle URL parameters
function getURLparams() {
	if (window.location.search) {
		let params = new URLSearchParams(window.location.search);
		playerKey = params.get('player').toLowerCase();
	}
}

function setURLparams() {
	if (playerKey) {
		window.history.replaceState(null, null, `?player=${playerKey.replace(/ /g, "%20")}`);
	}
}

// create displays

function searchHistory() {
	seasonRange = [currentSeason.season, currentSeason.season];
	var inCurrent = false;
	var enteredPlayerName = playerInput.value;
	if (enteredPlayerName) {
		playerKey = enteredPlayerName.toLowerCase().trim();
		if (playerKey) {
			let instructionElements = ["url-instructions", "search-instructions", "spacing-for-instructions"];
			instructionElements.forEach(el => document.getElementById(el).style.display = "none");
			loadingDiv.style.display = "block";
		} else {
			return;
		}
	}
	
	var player = "";
	playerDiv.innerHTML = "";
	standingsDiv.innerHTML = "";
	versusDiv.innerHTML = "";
	
	if (currentSeason.players[playerKey]) {
		inCurrent = true;
		player = currentSeason.players[playerKey].name;
		playerInput.value = player;
	} else if (players[playerKey]) {
		player = players[playerKey].name;
		playerInput.value = player;
	} else {
		customDisplay(playerDiv, "Error: Player Does Not Exist", "<b>" + (enteredPlayerName || playerKey) + "</b>" + " does not exist or has not completed a league season yet. <br> Enter another name (eg. 'kaplane').");
		loadingDiv.style.display = "none";
		return;
	}
	
	setURLparams();
	
	// **************
	// Standings + make list for versus
	// **************
	playerVersus = {};
	tiersPlayed = {};
	const notPlayers = ["games_nondrop","losses","losses_nondrop","wins","wins_nondrop"];
	
	if (inCurrent) {
		let season = currentSeason.season;
		let division = currentSeason.players[playerKey].division;
		let title = `<a href="current_standings?div=${division}"> S${season}</a> ${division} Division`;
		let params = {"headerText":title, "playerNameKey":playerKey, "sims": "new"};
		loadDivision(standingsDiv, currentSeason[division], sheetsLinks[String(season)][division], division, String(season), params);
		for (opp in currentSeason[division].by_player[player]) {
			if (!notPlayers.includes(opp)) {
				playerVersus[opp] = [{"season": season, "tier": division.charAt(0), "wins": currentSeason[division].by_player[player][opp].wins, "losses": currentSeason[division].by_player[player][opp].losses}];
			}
		}
		tiersPlayed[division.charAt(0)] = 1;
	}
	
	if (players[playerKey]) {
		seasonRange[0] = Number(players[playerKey].seasons[0].season);
		if (!inCurrent) {seasonRange[1] = Number(players[playerKey].seasons[players[playerKey].seasons.length - 1].season);}
		for (let i = players[playerKey].seasons.length - 1; i >= 0; i--) {
			let season = players[playerKey].seasons[i].season;
			let division = players[playerKey].seasons[i].division;
			let title = `<a href="past_standings/season${season}?div=${division}"> S${season}</a> ${division} Division`;
			let params = {"headerText":title, "playerNameKey":playerKey, "champ": champions.seasons[season]};
			loadDivision(standingsDiv, leagueHist[season][division], sheetsLinks[season][division], division, season, params);
			for (opp in leagueHist[season][division].by_player[player]) {
				if (!notPlayers.includes(opp)) {
					if (playerVersus[opp]) {
						playerVersus[opp].push({"season": season, "tier": division.charAt(0), "wins": leagueHist[season][division].by_player[player][opp].wins, "losses": leagueHist[season][division].by_player[player][opp].losses});
					} else {
						playerVersus[opp] = [{"season": season, "tier": division.charAt(0), "wins": leagueHist[season][division].by_player[player][opp].wins, "losses": leagueHist[season][division].by_player[player][opp].losses}];
					}
				}
			}
			if (tiersPlayed[division.charAt(0)]) {
				tiersPlayed[division.charAt(0)] += 1;
			} else {
				tiersPlayed[division.charAt(0)] = 1;
			}
		}
	}
	
	selectedTiers = Object.keys(tiersPlayed).sort();
	
	// **************
	// Player Heading
	// **************
	
	// ---Player heading
	addToDiv(playerDiv, player, "h4");
	// ---League Champion Heading
	if (champions.players[playerKey]) {
		addToDiv(playerDiv, `${champions.players[playerKey].length} x League Champion`, "p", "champion-information");
	}
	// ---Seasons played
	playedString = `Seasons played: ${players[playerKey] ? players[playerKey].seasons.length + inCurrent : 1} (`
	for (let t of selectedTiers) {
		playedString += `${t}: ${tiersPlayed[t]}, `;
	}
	playedString = playedString.slice(0, -2) + ")";
	addToDiv(playerDiv, playedString, "h5")
	// ---Links heading
	var player_chart_link = "<a href=\"" + "{{site.baseurl}}/charts?player="+ playerKey.replace(/ /g, "%20") +"\">Player Chart</a> "
	if (youtubeChannels[playerKey]) {
		addToDiv(playerDiv, "<a href=\"" + youtubeChannels[playerKey]["channel"] +"\">Youtube Channel</a> | " + player_chart_link, "h5");
	} else {
		addToDiv(playerDiv, player_chart_link, "h5");
	}
	// ---Aesthetic Line Break
	addToDiv(playerDiv, "", "hr", "hr-database");
	
	// **************
	// Versus
	// **************
	
	makeVersus(true);
	
	// **************
	// Stats
	// **************
	
	// tbd
	
	document.getElementById("content-controls").style.display = "block";
	loadingDiv.style.display = "none";
}

function makeVersus(init = false) {
	if (init) {
		let tierChecks = document.createElement('div');
		tierChecks.classList.add("db-control-container");
		let tiersLabel = document.createElement('span');
		tiersLabel.appendChild(document.createTextNode("Tiers: "));
		tierChecks.appendChild(tiersLabel);
		for (let t of selectedTiers) {
			let check = document.createElement('input');
			check.setAttribute('type', 'checkbox');
			check.classList.add(`${t}tier`);
			check.classList.add('dbSelector');
			check.classList.add('singleFilter');
			check.onclick = versusFilter;
			tierChecks.appendChild(check);
		}
		// all
		let check = document.createElement('input');
		check.setAttribute('type', 'checkbox');
		check.id = "versusTierReset";
		check.classList.add('dbSelector');
		check.checked = "checked";
		check.onclick = versusFilter;
		tierChecks.appendChild(check);
		versusDiv.appendChild(tierChecks);
		
		let seasonSlider =  document.createElement('div');
		seasonSlider.classList.add("db-control-container");
		let seasonsLabel = document.createElement('span');
		seasonsLabel.appendChild(document.createTextNode("Seasons: "));
		seasonsLabel.style.position = "relative";
		seasonsLabel.style.top = "-15px";
		seasonSlider.appendChild(seasonsLabel);
		textmin = document.createElement('input');
		textmin.setAttribute('type', 'text');
		textmin.classList.add('slidertext');
		textmin.classList.add('slidePiece');
		textmin.value = String(seasonRange[0]);
		textmin.oninput = seasonTextInput;
		seasonSlider.appendChild(textmin);
		slideContain = document.createElement('div');
		slideContain.classList.add('slidePiece');
		slideContain.classList.add('slider-container');
		slide1 = document.createElement('input');
		slide1.setAttribute('type', 'range');
		slide1.classList.add('dslider');
		slide1.min = seasonRange[0];
		slide1.max = seasonRange[1];
		slide1.value = seasonRange[0];
		slide1.oninput = seasonSlideInput;
		slide2 = document.createElement('input');
		slide2.setAttribute('type', 'range');
		slide2.classList.add('dslider');
		slide2.min = seasonRange[0];
		slide2.max = seasonRange[1];
		slide2.value = seasonRange[1];
		slide2.oninput = seasonSlideInput;
		slideContain.appendChild(slide1);
		slideContain.appendChild(slide2);
		seasonSlider.appendChild(slideContain);
		textmax = document.createElement('input');
		textmax.setAttribute('type', 'text');
		textmax.classList.add('slidertext');
		textmax.classList.add('slidePiece');
		textmax.value = String(seasonRange[1]);
		textmax.oninput = seasonTextInput;
		seasonSlider.appendChild(textmax);
		versusDiv.appendChild(seasonSlider)
		
		let tableDiv = document.createElement('div');
		tableDiv.id = "versusTable";
		versusDiv.appendChild(tableDiv);
	}
	
	filtVersus = [];
	var opps = Object.keys(playerVersus);
	var nopps = opps.length;
	
	//get data
	versusTotal = {"games": 0, "wins": 0, "losses": 0, "tiers": []}
	for (let i=0; i<nopps; i++) {
		let opp = playerVersus[opps[i]];
		let filtered = {"player": opps[i], "games": 0, "wins": 0, "losses": 0, "tiers": [], "seasons": []};
		for (let j=0; j<opp.length; j++) {
			if ((opp[j].season >= seasonRange[0]) && (opp[j].season <= seasonRange[1]) && selectedTiers.includes(opp[j].tier)) {
				filtered.games += Math.round(opp[j].wins + opp[j].losses);
				filtered.wins += opp[j].wins;
				filtered.losses += opp[j].losses;
				filtered.tiers.push(opp[j].tier);
				filtered.seasons.push(opp[j].season);
				versusTotal.games += Math.round(opp[j].wins + opp[j].losses);
				versusTotal.wins += opp[j].wins;
				versusTotal.losses += opp[j].losses;
				versusTotal.tiers.push(opp[j].tier);
			}
		}
		if (filtered.games) {
			filtered.pct = filtered.wins/filtered.games;
			filtered.color = numericStandingsColor(filtered.wins/filtered.games);
			filtered.tiers = [...new Set(filtered.tiers)].sort();
			filtVersus.push(filtered);
		}
	}
	
	//make table
	if (init) {filtVersus.sort((a,b) => Math.max(...b.seasons) - Math.max(...a.seasons));}
	genVersusTable();
}

function genVersusTable() {
	let numbers = ["games", "wins", "losses"];
	
	let ordering = versusSort.desc ? 1 : -1;
	if (versusSort.variable == "player") {
		filtVersus.sort((a,b) => ordering * a.player.localeCompare(b.player, 'en', {'sensitivity': 'base'}));
	} else if (versusSort.variable == "tiers") {
		filtVersus.sort((a,b) => ordering * a.tiers.toString().localeCompare(b.tiers.toString(), 'en'));
		filtVersus.sort((a,b) => ordering * (b.tiers.length - a.tiers.length));
	} else {
		filtVersus.sort((a,b) => ordering * (b[versusSort.variable] - a[versusSort.variable]));
	}
	
	var table = document.createElement('table');
	table.classList.add('table-past-standings');
	var tableBody = document.createElement('tbody');
	var topRow = document.createElement('tr');
	topRow.classList.add('rows-past-standings');
	let names = ["Opponent", "Games", "W", "L", "Win %", "Tiers"];
	let sortedName = {"player":"Opponent","games":"Games","wins":"W","losses":"L","pct":"Win %","tiers":"Tiers"}[versusSort.variable];
	let pcts = ["50%", "10%", "10%", "10%", "10%", "10%"];
	for (let j=0; j<6; j++) {
		let cell = document.createElement('th');
		cell.setAttribute('width', pcts[j]);
		cell.classList.add('cells-past-standings');
		cell.classList.add('sortable-header');
		cell.onclick = sortVersus;
		if (sortedName == names[j]) {
			names[j] += versusSort.desc ? " ▼" : " ▲";
		}
		cell.appendChild(document.createTextNode(names[j]));
		topRow.appendChild(cell);
	}
	tableBody.appendChild(topRow);
	
	nopps = filtVersus.length;
	for (let i=0; i<nopps; i++) {
		let row = document.createElement('tr');
		row.classList.add('rows-past-standings')
		let oc = document.createElement('td');
		oc.classList.add('cells-past-standings');
		oc.classList.add('cellWithDetail');
		let playerName = document.createElement('p');
		playerName.classList.add('db-link');
		playerName.appendChild(document.createTextNode(filtVersus[i].player));
		oc.appendChild(playerName)
		let hoverer = document.createElement('div');
		hoverer.classList.add('cellDetail');
		hoverer.classList.add('flexWide');
		let slist = document.createElement('p');
		slist.appendChild(document.createTextNode("Seasons: " + filtVersus[i].seasons.sort((a,b) => a - b).toString().replace(/,/g, ", ")));
		hoverer.appendChild(slist);
		oc.appendChild(hoverer);
		row.appendChild(oc);
		for (let j=0; j<3; j++) {
			let cell = document.createElement('td');
			cell.classList.add('cells-past-standings');
			cell.appendChild(document.createTextNode(filtVersus[i][numbers[j]].toFixed(1).replace(".0", "")));
			row.appendChild(cell);
		}
		let pct = document.createElement('td');
		pct.classList.add('cells-past-standings');
		pct.style.cssText = `background-color:${filtVersus[i].color}`;
		pct.appendChild(document.createTextNode(Math.round(100*filtVersus[i].pct) + "%"));
		row.appendChild(pct);
		let trs = document.createElement('td');
		trs.classList.add('cells-past-standings');
		trs.appendChild(document.createTextNode(filtVersus[i].tiers.toString().replace(/,/g, ", ")));
		row.appendChild(trs);
		tableBody.appendChild(row);
	}
	
	// put totals at bottom
	versusTotal.pct = versusTotal.games ? Math.round(100*versusTotal.wins/versusTotal.games) + "%" : "0%";
	versusTotal.color = versusTotal.games ? numericStandingsColor(versusTotal.wins/versusTotal.games) : null;
	versusTotal.tiers = [...new Set(versusTotal.tiers)].sort();
	let totalRow = document.createElement('tr');
	totalRow.classList.add('rows-past-standings')
	let oc = document.createElement('th');
	oc.classList.add('cells-past-standings');
	oc.appendChild(document.createTextNode("Total"));
	totalRow.appendChild(oc);
	for (let j=0; j<3; j++) {
		let cell = document.createElement('th');
		cell.classList.add('cells-past-standings');
		if (j == 3) {cell.style.cssText = `background-color:${versusTotal.color}`;}
		cell.appendChild(document.createTextNode(versusTotal[numbers[j]].toFixed(1).replace(".0", "")));
		totalRow.appendChild(cell);
	}
	let pct = document.createElement('td');
	pct.classList.add('cells-past-standings');
	pct.style.cssText = `background-color:${versusTotal.color}`;
	pct.appendChild(document.createTextNode(versusTotal.pct));
	totalRow.appendChild(pct);
	let trs = document.createElement('th');
	trs.classList.add('cells-past-standings');
	trs.appendChild(document.createTextNode(versusTotal.tiers.toString().replace(/,/g, ", ")));
	totalRow.appendChild(trs);
	tableBody.appendChild(totalRow);
	
	table.appendChild(tableBody);
	var tableDiv = document.getElementById("versusTable");
	tableDiv.innerHTML = "";
	tableDiv.appendChild(table);
	
	setFakeLinks();
}

function setPlayer(ev) {
	playerInput.value = ev.target.innerHTML.toLowerCase();
	searchHistory();
}

function versusFilter(ev) {
	ev.target.blur();
	var allTiers = document.getElementById("versusTierReset");
	if (ev.target.id) {
		selectedTiers = Object.keys(tiersPlayed).sort();
		var singles = document.getElementsByClassName('singleFilter');
		for (let c of singles) {
			c.checked = allTiers.checked ? null : "check";
		}
	} else {
		var tier = ev.target.className.match(/[A-P]tier/)[0].charAt(0);
		if (allTiers.checked) {
			allTiers.checked = null;
			selectedTiers = [tier];
		} else {
			if (selectedTiers.includes(tier)) {
				selectedTiers.splice(selectedTiers.indexOf(tier), 1);
			} else {
				selectedTiers.push(tier);
			}
		}
		if (!selectedTiers.length) {
			allTiers.checked = "check";
			selectedTiers = Object.keys(tiersPlayed).sort();
		}
	}
	makeVersus();
}

function sortVersus(ev) {
	var colHeader = ev.target.innerHTML;
	if (colHeader.includes("▼")) {
		versusSort.desc = false;
	} else if (colHeader.includes("▲")) {
		versusSort.desc = true;
	} else {
		versusSort.variable = {"Opponent": "player", "Games": "games", "W": "wins", "L": "losses", "Win %": "pct", "Tiers": "tiers"}[colHeader];
		versusSort.desc = true;
	}
	genVersusTable();
}

function seasonTextInput() {
	var minval = Number(textmin.value);
	var maxval = Number(textmax.value);
	if ((minval <= maxval) && (minval >= Number(slide1.min)) && (maxval <= Number(slide1.max))) {
		if (Number(PlayerPlot.seasonslide1.value) <= Number(PlayerPlot.seasonslide2.value)) {
			PlayerPlot.seasonslide1.value = minval;
			PlayerPlot.seasonslide2.value = maxval;
		} else {
			PlayerPlot.seasonslide1.value = maxval;
			PlayerPlot.seasonslide2.value = minval;
		}
		
		seasonRange = [minval, maxval];
		makeVersus();
	}
}

function seasonSlideInput() {
	if (Number(slide1.value) <= Number(slide2.value)) {
		textmin.value = slide1.value;
		textmax.value = slide2.value;
	} else {
		textmin.value = slide2.value;
		textmax.value = slide1.value;
	}
	
	seasonRange = [Number(textmin.value), Number(textmax.value)];
	makeVersus();
}

function setFakeLinks() {
	var fakeLinks = document.getElementsByClassName('db-link');
	for (let li of fakeLinks) {
		li.onclick = setPlayer;
	}
}

// search box

// Get dropdown selection
function openDropdown() {
	console.log("opening dropdown");
	// Get the modal, button and close button
	var dropdown = document.getElementById('search-dropdown');
	dropdown.style.display = "block";
}

function selectDropdown(choice) {
	var selection = choice.innerHTML;
	console.log("select dropdown");
	console.log(selection);
	var dropdown = document.getElementById('search-dropdown');
	dropdown.style.display = "none";
	var defaultOption = document.getElementById('default-option');
	defaultOption.innerHTML = selection + ` <i class="fa fa-caret-down" aria-hidden="true"></i>`;
}

// Event listener for input with enter key
input_player_search.addEventListener("keyup", function(event) {
	// Number 13 is the "Enter" key on the keyboard
	if (event.keyCode === 13) {
		// Cancel the default action, if needed
		event.preventDefault();
		// Trigger the button element with a click
		document.getElementById("search_player_history_btn").click();
	}
});

/*An array containing all the player names*/
var playersList = [...new Set(Object.keys(players).sort((a,b) => players[b].seasons.length - players[a].seasons.length).map(key => players[key].name).concat(Object.keys(currentSeason.players).map(key => currentSeason.players[key].name)))];

/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
autocomplete(document.getElementById("input_player_search"), playersList);

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      p = document.getElementsByClassName("autocomplete")[0];
      a = document.createElement("div");
      p.appendChild(a);
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      var num_matches = 0;
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;

              /* automatically search */
              searchHistory();

              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);

          num_matches++;
          if (num_matches == 8) break;
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}

function numericStandingsColor(pct) {
	var gradient = ["#E77B72", "#E88372", "#EA8C71", "#EC956F", "#EF9E6E", "#F2A76D", "#F4B06B", "#F7B96B", "#F9C269", "#FCCB67", "#FED467", "#F2D467", "#E2D26B", "#D0CF6F", "#C0CC73", "#AFCA76", "#9EC77A", "#8CC47E", "#7CC181", "#6DBF84", "#5BBC88"];
	return gradient[Math.floor(2000*pct/101)];
}