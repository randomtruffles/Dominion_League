Steps to run for end of season:
1. Update `_data/aliases.json` if necessary.
2. Update `_data/champions.json` and the "seasons" field.
3. Update `_data/championship_videos.json` with the new season championship video.
4. Update the leagueHistory file used and then run `generate_friendly_past_seasons_json.py`
5. Update the season and run `generate_champions_json.py`
6. Then run `generate_player_seasons_json.py`, `generate_past_seasons_hyperlines.py`, `generate_past_seasons_page.py`
7. Update the season and ongoing in `generate_hall_of_fame.py`, then run it.
8. Archive "current season" data. Set current_season_players to be empty {}.
