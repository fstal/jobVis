# jobVis

* Alex - show and hide karta, zoom på kommuner
* Filip - LAbel på linegraph
* Joel - Snyggar till län-listan vid sidan om kartan samt lägger till tooltips för dessa - Pretty much done, finns det annat man kan göra just nu?
* Calle - Mecka legender, kanske se över färgvalen osv.
* Oskar - kolla på subkategorier för comparemode och elsticsearch för regioncount


## Behöver göras innan redivisning
* Loader för comparemode
* Mouseover för linegraph plot points?

## Behöver göras för framtiden
* Städa kod och DRY:a lite
- Separera konvertering från kartelement "id", ex. "#a1" eller "#a15" till "Norrbotten" osv och andra hållet skall separeras till separata hjälpfunktioner
- Mer enhetlighet i variabel- och funktionsnamn, ex. inte ha "county" "lan" och "region" för samma sak.
