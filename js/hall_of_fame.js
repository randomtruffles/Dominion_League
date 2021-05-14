---
---

var hof = {{ site.data.hall_of_fame | jsonify }};
var lastSeason = {{ site.data.season.number }} - 1;

function dbLink(name) {
	let out = document.createElement('a');
	out.href = `{{site.baseurl}}/player_database?player=${name.replace(/ /g, "%20")}`
	out.appendChild(document.createTextNode(name));
	return out;
}

function seasonLink(s) {
	let out = document.createElement('a');
	out.href = `{{site.baseurl}}/past_standings/season${s}`;
	out.classList.add("link-secondary");
	out.appendChild(document.createTextNode(`S${s}`));
	return out;
}

function champSeasons(el, seasons) {
	el.appendChild(seasonLink(seasons[0]));
	for (let i=1; i<seasons.length; i++) {
		el.appendChild(document.createTextNode(", "));
		el.appendChild(seasonLink(seasons[i]));
	}
}

function collapseSeasonList(seasons) {
	let numbered = seasons.map(s => Number(s));
	numbered.sort((a,b) => a-b);
	out = "";
	bounds = [numbered[0], numbered[0]];
	for (let i=1; i<numbered.length; i++) {
		if (numbered[i] == bounds[1] + 1) {
			bounds[1] = numbered[i];
		} else {
			if (bounds[0] == bounds [1]) {
				out += ", " + bounds[0];
			} else {
				out += ", " + bounds[0] + "-" + bounds[1];
			}
			bounds = [numbered[i], numbered[i]];
		}
	}
	if (bounds[0] == bounds [1]) {
		out += ", " + bounds[0];
	} else {
		out += ", " + bounds[0] + "-" + bounds[1];
	}
	return out.slice(2)
}

let champTable = document.getElementById("champions");
champTable.innerHTML = `<tr><th  width="15%"><img src="{{site.baseurl}}/img/icons/vp_with_trophy.png" class="champion-trophy" title="League Championships Won"></th><th  width="30%">Player</th><th  width="55%" style="text-align:center">Season(s)</th></tr>`
hof.champions.sort((a,b) => b.seasons.length - a.seasons.length);
for (let i=0; i<hof.champions.length; i++) {
	let row = document.createElement('tr');
	let count = document.createElement('td');
	count.appendChild(document.createTextNode(hof.champions[i].seasons.length));
	row.appendChild(count);
	let player = document.createElement('td');
	player.appendChild(dbLink(hof.champions[i].player));
	row.appendChild(player);
	let seasons = document.createElement('td');
	seasons.style.textAlign = "center";
	champSeasons(seasons, hof.champions[i].seasons);
	row.appendChild(seasons);
	champTable.appendChild(row);
}
