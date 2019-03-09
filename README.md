# jobVis

* Alex - show and hide karta, zoom på kommuner
* Filip - 
* Joel - Ta bort "disabled" från dropdown-elementet när man valt något (så den inte längre är greyed out)
* Calle - Mecka legender, kanske se över färgvalen osv.
* Oskar - kolla på subkategorier för comparemode och elsticsearch för regioncount
* Carl - 

## Behöver (typ) göras
* Loader för comparemode
* Mouseover för linegraph plot points (förbättrad)
* Stödlinjer för mouseover på plot points i linepraph
* Indikator på att det finns submenyer on mouseover för huvudkategorierna
* Loader eller förtydligad animation på att en re-render sker när man trycker på en kategori. Ofta är det knapp skillnad och då märker man inte om ny data har renderat eller ej

## Borde kanske göras
### Städa kod och DRY:a lite
* Bestående stroke för SelectedCounty på karta och i lista medan du har den plottad i linegraph
* Knapp, snappval eller default för senaste dagens data för slidern (gårdagens) (bara för icke-compare mode)
* Kort summering ovanför kartan om vad den visar, ex "Antal annonser för 1jan19-16jan19", eller "Administrativa jobb för 1jan10-16jan19"
* Mer enhetlighet i variabel- och funktionsnamn, ex. inte ha "county" "lan" och "region" för samma sak.
* Separera konvertering från kartelement "id", ex. "#a1" eller "#a15" till "Norrbotten" osv och andra hållet skall separeras till separata hjälpfunktioner

## Feedback från Final Presentation
* Knapp för snappreset av tidsspann
* Knapp / funktionalitet för snappreset av categorifilters
* Mer tydligen och intiutiv color-mapping
* Ökad kontrast på länlistan
