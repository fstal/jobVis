# JobVis
Project work in [Information Visualization](https://www.kth.se/student/kurser/kurs/DH2321) at KTH, created for Blocket Job. A live version of the project with dummy data can be found here: https://fstal.github.io/jobVis/

## Developers
Filip Stål, Alexander Nordh, Carl Svedhag, Joel Weidenmark, Oskar Norinder, Carl Kernell.

## About the project
The team was asked to develop and design a fully functioning analysis tool for the sales department at Blocket Jobb, mapping huge amounts of raw employment-ad-data extracted from their website over the years, with a primary focus on geographical place of employment, line of business and sub-categories of lines - as well as trends in employment advertisements over time.

This data visualization tool provides two modes of comparison:

  * In the first mode, the user can compare the amount of job ads active in different Swedish regions at any time or span of time, filtered by line of business or specific profession.
  * In the second mode, the user can view regional changes in job ad distributions.

Filtering of data is done by adjusting the slider boundaries of the time span, grabbing and dragging the selected span along the slider, selecting line of business or specific professions in the dropdown menu and through selecting region of interest either on the map itself or from the list of regions.

## Demo

[![jobVis](http://img.youtube.com/vi/oab5VxdsL1k/0.jpg)](http://www.youtube.com/watch?v=oab5VxdsL1k "jobVis")

---------------------------------------------------------------------------------------------
# Project Dashboard

## Currently working on:
* Alex - 
* Filip - 
* Joel -
* Calle - 
* Oskar - 
* Carl - 

## Prioritized issues and implementions
- [ ] ~~Loader for comparemode (Will not work satisfactory with current slider lib, need to reimplement slider entirely)~~
- [x] Improved mouseover for the lineplot with y-value
- [x] Aiding lines for x/y-axes while mouseover in lineplot
- [x] Fix the disabled look on the semantic dropdown
- [ ] Bug: Dropdown may get wonky if submenues extend outside original window size

## Suggested improvements if we have the time
- [ ] Go over variable and functions names and unify them
- [ ] Some DRY:ing and refactoring, modularity
- [ ] Persisting stroke for selected county
- [x] Summary of current filters and brushes in text
- [x] Axis ledger for lineplot

## Feedback from Final Presentation
- [x] Button for reset of time span
- [x] Button for reset of profession-filtering
- [ ] Ledger clarification for color-mapping
- [x] Incresed contrast in county list
