---
title: League Timer Specification
layout: rules_faq
date: 2029-09-08
---
The league table setting uses an experimental timer that is being evaluated for future use in ensuring reasonable pace of play. Currently, it has the following specification:
- Players start their first turn with 4 minutes on their timer
- When a player is prompted to make a decision, they are given 4 seconds of free decision time to make the decision before their timer is impacted
   - When the active player shifts (for example at the start of a turn or during another player's turn), the player is given double this free decision time
- At the end of each turn, a player's timer will increment 4 seconds times the maximum number of decisions they made on any of their 3 previous turns
   - A player's timer will be set to a minimum of 10 seconds if it would otherwise be below that at this time
   - A player's timer may not exceed 4 minutes at any time
- The timer can be paused by requesting an undo
   - This pause is to allow discussion of the undo should there be any dispute without worrying about running out of time
   - These pauses can also be used in case of temporary mid-game emergency; you should let your opponent know what is happening and how soon you expect to return