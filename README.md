# jobVis

* Alex - show and hide karta, zoom på kommuner
* Filip - Title på linegraph
* Joel - 
* Calle - Mecka legender, kanske se över färgvalen osv.
* Oskar - kolla på subkategorier för comparemode och elsticsearch för regioncount

## Behöver göras innan redivisning
* Loader för comparemode
* Mouseover för linegraph plot points?
* CSS:a compare mode checkbox
* Enhetlighet i språk, svenska eller engelska (i det visuella för användaren)
* Indikator på att det finns submenyer on mouseover för huvudkategorierna
* Loader eller förtydligad animation på att en re-render sker när man trycker på en kategori. Ofta är det knapp skillnad och då märker man inte om ny data har renderat eller ej
* Välja län genom att trycka i länlistan
* Ta bort "disabled" från dropdown-elementet när man valt något (så den inte längre är greyed out)

## Behöver göras för framtiden
# Städa kod och DRY:a lite
* Separera konvertering från kartelement "id", ex. "#a1" eller "#a15" till "Norrbotten" osv och andra hållet skall separeras till separata hjälpfunktioner
* Mer enhetlighet i variabel- och funktionsnamn, ex. inte ha "county" "lan" och "region" för samma sak.
* Bestående stroke för SelectedCounty på karta och i lista medan du har den plottad i linegraph
* Knapp, snappval eller default för senaste dagens data för slidern (gårdagens) (bara för icke-compare mode)
* Stödlinjer för mouseover på plot points i linepraph
* Kort summering ovanför kartan om vad den visar, ex "Antal annonser för 1jan19-16jan19", eller "Administrativa jobb för 1jan10-16jan19"
