// ---addToDiv adds elements to a specificied div
function addToDiv(div, info, elementType, className="") {
  var divContent = document.createElement(elementType);
  divContent.innerHTML = info;
  if (className != "") divContent.classList.add(className);
  div.appendChild(divContent);
  return;
}

function customDisplay(playerDiv, headerInfo, bodyInfo) {
  addToDiv(playerDiv, headerInfo, "h4");
  addToDiv(playerDiv, bodyInfo, "p");
  return;
}

function computeStats(playerNameKey, playerStats, uniqueOpponents, currentSeasonPlayers) {
  var totalPlayed = playerStats["Total Seasons Played"];
  var firstSeason = playerStats["First Season"];
  var longestStreak = playerStats["Longest Streak"];
  if (currentSeasonPlayers[playerNameKey]) {
    totalPlayed += 1;
    if (longestStreak[2] == currentSeasonPlayers["seasons"] - 1){
      longestStreak[2] += 1;
      longestStreak[0] += 1;
    }
  }
  return {
    "Total Seasons Played": totalPlayed.toString(),
    "First Season Played": firstSeason.toString(),
    "Longest Streak": longestStreak[0].toString() + " (S"+longestStreak[1].toString()+"-S"+longestStreak[2].toString()+")",
    "Unique Opponents": (uniqueOpponents[playerNameKey.toLowerCase()].length).toString()
  };
}
