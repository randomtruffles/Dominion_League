---
title: League Timer Specification
layout: rules_faq
date: 2029-09-08
---
The league table setting enforces a timer to ensure reasonable pace of play. Currently, it has the following specification:
- If a player runs out of time, their turn is forced to end
   - All optional decisions are declined
   - All forced decisions have a default; for gains this will usually be Copper
- Players start their first turn with 3 minutes on their timer
- When a player is prompted to make a decision, they are given 5 seconds of free decision time to make the decision before their timer is impacted
   - When the active player shifts (for example at the start of a turn or during another player's turn), the player is given double this free decision time
- At the start of each turn, a player's timer will increment 20 seconds plus 2.5 seconds times the maximum number of decisions they made on any of their 3 previous turns
   - For these purposes, a player is considered to have always made at least 10 decisions, meaning that at a minimum, the timer will increment 45 seconds
   - A player's timer will be set to a minimum of 1 minute if it would otherwise be below that at this time
   - A player's timer may not exceed 4 minutes at any time
- The timer can be paused by requesting an undo
   - This pause is to allow discussion of the undo should there be any dispute without worrying about running out of time
   - These pauses can also be used in case of temporary mid-game emergency; you should let your opponent know what is happening and how soon you expect to return