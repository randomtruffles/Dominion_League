---
---

var hof = {{ site.data.hall_of_fame | jsonify }};
var lastSeason = {{ site.data.season.number }} - 1;

function dbLink(name) {
	if (name.search('~') == -1) {
		let out = document.createElement('a');
		out.href = `{{site.baseurl}}/player_database?player=${name.replace(/ /g, "%20")}`
		out.appendChild(document.createTextNode(name));
		return out;
	} else {
		let names = name.split(' ~ ');
		let out = document.createElement('span');
		let link0 = document.createElement('a');
		link0.href = `{{site.baseurl}}/player_database?player=${names[0].replace(/ /g, "%20")}`
		link0.appendChild(document.createTextNode(names[0]));
		let link1 = document.createElement('a');
		link1.href = `{{site.baseurl}}/player_database?player=${names[1].replace(/ /g, "%20")}`
		link1.appendChild(document.createTextNode(names[1]));
		out.appendChild(link0);
		out.appendChild(document.createTextNode(' vs. '));
		out.appendChild(link1);
		return out;
	}
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

function addNumRow(table, rank, data, extra = false) {
	let row = document.createElement('tr');
	let r = document.createElement('td');
	r.appendChild(document.createTextNode(rank + "."));
	row.appendChild(r);
	let p = document.createElement('td');
	if (extra) {
		p.style.fontStyle = 'italic';
		p.appendChild(document.createTextNode(data.player));
	} else {
		p.appendChild(dbLink(data.player));
	}
	row.appendChild(p);
	let n = document.createElement('td');
	n.appendChild(document.createTextNode(data.disp));
	row.appendChild(n);
	table.appendChild(row);
}

function addArrRow(table, rank, data, extra = false) {
	let row = document.createElement('tr');
	let r = document.createElement('td');
	r.appendChild(document.createTextNode(rank + "."));
	row.appendChild(r);
	let p = document.createElement('td');
	if (extra) {
		p.style.fontStyle = 'italic';
		p.appendChild(document.createTextNode(data.player));
	} else {
		p.classList.add("CellWithComment");
		p.appendChild(dbLink(data.player));
		let comment = document.createElement('span');
		comment.classList.add("CellComment");
		comment.appendChild(document.createTextNode("Seasons " + collapseSeasonList(data.seasons)));
		p.appendChild(comment);
	}
	row.appendChild(p);
	let n = document.createElement('td');
	n.appendChild(document.createTextNode(data.seasons.length));
	row.appendChild(n);
	table.appendChild(row);
}

function addStrRow(table, rank, data, extra = false) {
	let row = document.createElement('tr');
	let r = document.createElement('td');
	r.appendChild(document.createTextNode(rank + "."));
	row.appendChild(r);
	let p = document.createElement('td');
	if (extra) {
		p.style.fontStyle = 'italic';
		p.appendChild(document.createTextNode(data.player));
	} else {
		p.classList.add("CellWithComment");
		p.appendChild(dbLink(data.player));
		let comment = document.createElement('span');
		comment.classList.add("CellComment");
		comment.appendChild(document.createTextNode(`Seasons ${data.streak.start}-${data.streak.end}`));
		p.appendChild(comment);
	}
	row.appendChild(p);
	let n = document.createElement('td');
	n.appendChild(document.createTextNode(data.streak.count + ((data.streak.end == lastSeason) ? "*" : "")));
	row.appendChild(n);
	table.appendChild(row);
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

let numTables = document.getElementsByClassName('numtable');
for (tab of numTables) {
	let data = hof[tab.id];
	let dispcount = 0;
	let ranks = [];
	while (dispcount < 10) {
		let tiecount = 1;
		for (let i = dispcount+1; i<30; i++) {
			if (data[i].num == data[dispcount].num) {
				tiecount += 1;
			} else {
				break;
			}
		}
		if (tiecount == 1) {
			ranks.push(String(dispcount + 1));
		} else {
			ranks = ranks.concat(Array.from({length:tiecount}, () => "T" + (dispcount + 1)));
		}
		dispcount += tiecount
	}
	let cutoff = false;
	if (dispcount > 12) {
		cutoff = true;
		for (let i=0; i<10; i++) {
			if (ranks[i] == ranks[9]) {
				dispcount = i;
				break;
			}
		}
	}
	for (let i=0; i<dispcount; i++) {
		addNumRow(tab, ranks[i], data[i]);
	}
	if (cutoff) {
		addNumRow(tab, ranks[dispcount], {"player": `${ranks.length - dispcount} players`, "disp": data[dispcount].disp}, true)
	}
}

let arrTables = document.getElementsByClassName('arrtable');
for (tab of arrTables) {
	let data = hof[tab.id];
	let dispcount = 0;
	let ranks = [];
	while (dispcount < 10) {
		let tiecount = 1;
		for (let i = dispcount+1; i<30; i++) {
			if (data[i].seasons.length == data[dispcount].seasons.length) {
				tiecount += 1;
			} else {
				break;
			}
		}
		if (tiecount == 1) {
			ranks.push(String(dispcount + 1));
		} else {
			ranks = ranks.concat(Array.from({length:tiecount}, () => "T" + (dispcount + 1)));
		}
		dispcount += tiecount
	}
	let cutoff = false;
	if (dispcount > 12) {
		cutoff = true;
		for (let i=0; i<10; i++) {
			if (ranks[i] == ranks[9]) {
				dispcount = i;
				break;
			}
		}
	}
	for (let i=0; i<dispcount; i++) {
		addArrRow(tab, ranks[i], data[i]);
	}
	if (cutoff) {
		addArrRow(tab, ranks[dispcount], {"player": `${ranks.length - dispcount} players`, "seasons": data[dispcount].seasons}, true)
	}
}

let strTables = document.getElementsByClassName('streaktable');
for (tab of strTables) {
	let data = hof[tab.id];
	let dispcount = 0;
	let ranks = [];
	while (dispcount < 10) {
		let tiecount = 1;
		for (let i = dispcount+1; i<30; i++) {
			if (data[i].streak.count == data[dispcount].streak.count) {
				tiecount += 1;
			} else {
				break;
			}
		}
		if (tiecount == 1) {
			ranks.push(String(dispcount + 1));
		} else {
			ranks = ranks.concat(Array.from({length:tiecount}, () => "T" + (dispcount + 1)));
		}
		dispcount += tiecount
	}
	let cutoff = false;
	if (dispcount > 12) {
		cutoff = true;
		for (let i=0; i<10; i++) {
			if (ranks[i] == ranks[9]) {
				dispcount = i;
				break;
			}
		}
	}
	for (let i=0; i<dispcount; i++) {
		addStrRow(tab, ranks[i], data[i]);
	}
	if (cutoff) {
		addStrRow(tab, ranks[dispcount], {"player": `${ranks.length - dispcount} players`, "streak": {"count": data[dispcount].streak.count}}, true)
	}
}

tierBestTable = document.getElementById('tier-best');
for (tiers of hof['tier-best']) {
	let row = document.createElement('tr');
	let t = document.createElement('td');
	t.style.textAlign = "center";
	t.appendChild(document.createTextNode(tiers.tier));
	row.appendChild(t);
	let p = document.createElement('td');
	p.style.textAlign = "center";
	for (let i=0; i<3; i++) {
		if (tiers['best-season'][i].best.pct == tiers['best-season'][0].best.pct) {
			if (i > 0) {p.appendChild(document.createTextNode(", "));}
			p.appendChild(dbLink(tiers['best-season'][i].player));
			p.appendChild(document.createTextNode(" ("));
			p.appendChild(seasonLink(tiers['best-season'][i].best.season));
			p.appendChild(document.createTextNode(")"));
		}
	}
	row.appendChild(p);
	let pct = document.createElement('td');
	pct.style.textAlign = "center";
	pct.appendChild(document.createTextNode(Math.round(100 * tiers['best-season'][0].best.pct) + "%"));
	row.appendChild(pct);
	tierBestTable.appendChild(row);
}

tierPctTable = document.getElementById('tier-record');
for (tiers of hof['tier-record']) {
	if (tiers['best-pct'][0].seasons.length >= 3) {
		let row = document.createElement('tr');
		let t = document.createElement('td');
		t.style.textAlign = "center";
		t.appendChild(document.createTextNode(tiers.tier));
		row.appendChild(t);
		let p = document.createElement('td');
		p.style.textAlign = "center";
		for (let i=0; i<3; i++) {
			if (tiers['best-pct'][i].pct == tiers['best-pct'][0].pct) {
				if (i > 0) {p.appendChild(document.createTextNode(", "));}
				p.appendChild(dbLink(tiers['best-pct'][i].player));
				p.appendChild(document.createTextNode(" ("));
				champSeasons(p, tiers['best-pct'][i].seasons.reverse());
				p.appendChild(document.createTextNode(")"));
			}
		}
		row.appendChild(p);
		let pct = document.createElement('td');
		pct.style.textAlign = "center";
		pct.appendChild(document.createTextNode(Math.round(100 * tiers['best-pct'][0].pct) + "%"));
		row.appendChild(pct);
		tierPctTable.appendChild(row);
	}
}