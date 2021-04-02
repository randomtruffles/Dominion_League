# /_data/processing

This contains scripts and data for producing and updating the files in the parent `_data` folder. I have primarily written them to run with `Node.js`. Contents include:

- `forum_standings`
	- Text files copy pasted from f.ds of each of the standings posts for seasons 1-25
- `old`
	- truffles' parsing and scripts, including the old current standings update
- `outputs`
	- Where the scripts dump files to not overwrite working versions. Move from here once checked for quality
- `Seasons`
	- JSON files for raw individual season standings and results
- `chartsDataUpdate.js`
	- Updates the chart data files for a season (named in the file), currently only for `chart_history.json` and `chart_counts.json`
	- Processes any name changes on these
- `forumStandingsProc.js`
	- Parses the forum standings data files and places the json outputs in the Seasons folder for seasons 1-25
	- Should not be needed unless an error is spotted in those past standings
- `leagueHistMaker.js`
	- Agglomerates the individual seasons into `league_history.json`
	- Processes any name changes on these
- `nameChanger.js`
	- Writes new versions of `league_history.json`, `player_seasons.json`, `chart_history.json`, `chart_transitions.json`, `chart_power.json` with all name changes in `namechanges.txt`
- `namechanges.txt`
	- All known name changes separated by tab
- `README.md`
	- This information page
- `s##divs.csv`
	- Downloaded from the "Season ## Divisions" spreadsheet for the published link for each division's standings
- `sheetsLinksUpdate.js`
	- Updates `sheet_links.json` based on `s##divs.csv` for a season (named in the file)
