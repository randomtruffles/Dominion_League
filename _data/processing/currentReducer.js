var fs = require('fs');

var current = JSON.parse(fs.readFileSync('../current_season.json'));

delete current.players
for (div in current) {
	delete current[div].results;
	delete current[div].returningForms
}

fs.writeFileSync(`Seasons/s${current.season}.json`, JSON.stringify(current));