var dataArray = [];
var circles = [];
var regioncnt = {};
var regionlist;
var dates = [];
var currentDateMax;
var currentDateMin;
var selectedCat;
var categoryList;

//reads external svg file
d3.xml('./maps/mapLan.svg')
    .then(data => {
        d3.select('div#mapContainer').node().append(data.documentElement)  
})

//Read regionList data form json file
d3.json("./data/regionlist.json").then(function(data){
    regionlist = data;
    categoryList = data.categories;
    createDropDown(); 

});

//list_id ;  platform  ; first_date ; last_date  ; region ; category;sub_category; subject_full ;  area  ; zipcode ;
var daten = new Date("2019-02-04");
console.log(daten.toDateString());
d3.tsv("./data/data.tsv").then(function(data){
  data.forEach( d => {
    dateAdd(d);

    //console.log(dates);
  });
  currentDateMax = d3.max(dates);
  currentDateMin = d3.min(dates);
  data.forEach( d => {
    regionCount(d);
  });
  generateSlider(dates,data);
  //console.log(regioncnt);

  var maxvalue = 0;
  for (var key in regioncnt){
    //console.log("tjoao " + regioncnt[key] + " " + key  );
      if (parseInt(regioncnt[key])>maxvalue){
        maxvalue =parseInt(regioncnt[key]);
      }
    }

//Dynamically added html
var divTooltip = d3.select("body").append("div")   // Define the div for the tooltip
    .attr("class", "tooltip")        
    .style("opacity", 0);
    


  d3.selectAll("g").datum((d,i,k) => { return k[i];}).attr("fill", function (d){

        return d3.interpolateBlues((Math.log(regioncnt[d.id.replace("a", "")])/Math.log(maxvalue)));
 

  })
  .on("mouseover", function(d) {
    if (d.parentElement.id == "sweden_svg"){
        let formatId = d.id.replace("a", "");
        let region = regionlist.region_list[formatId-1].name;
    divTooltip.transition()   
            .duration(175)    
            .style("opacity", .85);
        divTooltip.html(region + "<br/> Antal Annonser: "  + regioncnt[formatId])  
          .style("left", (d3.event.pageX) + "px")     
          .style("top", (d3.event.pageY - 28) + "px");
        d3.select(this)
          .style("stroke", "black") 
        }})        
    .on("mouseout", function(d) {
      if (d.parentElement.id == "sweden_svg"){  
        divTooltip.transition()   
            .duration(500)    
            .style("opacity", 0);
        d3.select(this)
          .style("stroke", "none")    
     }})

  d3.select("#transfer").on("mysel", ()=>{
  selectedCat = d3.event.detail;
  reDraw(data);
  })


}).catch(error => console.error(error));

function regionCount(data) {
  //console.log(data.region);
  var firstDate = new Date(data.first_date.replace(/\s+/g, ""));
  var lastDate = new Date(data.last_date.replace(/\s+/g, ""));
  //lastDate får aldrig vara mindre än det valde minDate
  console.log("dafds",selectedCat,"bell")
  if (data.region in regioncnt && !(firstDate >= currentDateMax) && !(lastDate <= currentDateMin) && (selectedCat== "Alla" ||selectedCat==undefined || data.category == selectedCat)  ) {
    //console.log("hej " + data.region);
    regioncnt[data.region] = regioncnt[data.region] + 1;
  }
  else if (firstDate <= currentDateMax && lastDate >= currentDateMin && (selectedCat=="Alla"|| selectedCat==undefined || data.category == selectedCat)) {
    regioncnt[data.region] = 1;
  }
//  colorMap(regioncnt);
}

function dateAdd(d) {
  var firstDate = new Date(d.first_date.replace(/\s+/g, ""));
  var lastDate = new Date(d.last_date.replace(/\s+/g, ""));
  var unmatched = true;
  for (i=0; i < dates.length; i++) {
    if (dates[i].toDateString() == firstDate.toDateString()) {
      unmatched = false;
      break;
    }
  }
  if (unmatched) {dates.push(new Date(d.first_date.replace(/\s+/g, "")));}
  var unmatched = true;
  for (i=0; i < dates.length; i++) {
    if (dates[i].toDateString() == lastDate.toDateString()) {
      unmatched = false;
      break;
    }
  }
  if (unmatched) {dates.push(new Date(d.last_date.replace(/\s+/g, "")));}
}
function reDraw(data){
  for (alla in regioncnt){
    regioncnt[alla]= 0;
  }
//regioncnt= {};
data.forEach( d => {
  regionCount(d);
});
//console.log(regioncnt);

var maxvalue = 0;
for (var key in regioncnt){
  //console.log("tjoao " + regioncnt[key] + " " + key  );
    if (parseInt(regioncnt[key])>maxvalue){
      maxvalue =parseInt(regioncnt[key]);
    }
  }

//console.log(maxvalue,"ble");
d3.selectAll("g").datum((d,i,k) => { return k[i];}).attr("fill", function (d){
  //console.log(d.id.replace("a", ""));
    return d3.interpolateBlues((Math.log(regioncnt[d.id.replace("a", "")])/Math.log(maxvalue)));
      //return d3.color("lightblue").darker(-1*(1-(regioncnt[d.id.replace("a", "")]*(20/(maxvalue)))));
      //return "green";

})
}


function generateSlider(dates,data){
  var sliderRange = d3
      .sliderBottom()
      .min(d3.min(dates))
      .max(d3.max(dates))
      .width(300)
      //.tickFormat(d3.format('.2%'))
      .ticks(5)
      .default([d3.min(dates), d3.max(dates)])
      .fill('#2196f3')
      .on('onchange', val => {
        currentDateMin = val[0];
        currentDateMax = val[1];
        reDraw(data);
        console.log(val);
        d3.select('p#value-range').text(val.map(d3.format('.2%')).join('-'));
      });

    var gRange = d3
      .select('div#slider-range')
      .append('svg')
      .attr('width', 500)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(30,30)');

    gRange.call(sliderRange);

    d3.select('p#value-range').text(
      sliderRange
        .value()
        .map(d3.format('.2%'))
        .join('-')
    );
}

//Creates dynamic dropdown with categries
function createDropDown() {
  var select = document.getElementById('cat');
  for (var i = 0; i < categoryList.length; i++) {
    var opt = document.createElement('option');
    opt.value = categoryList[i].cgID;
    opt.innerHTML = categoryList[i].name;
    select.appendChild(opt);
  }
  // Makes the dropdown searchable
  $('.ui.dropdown').dropdown({
    allowAdditions: true
  });
}

function filterCategories(data) {
  var selector = document.getElementById("cat");
  var value = selector[selector.selectedIndex].value;
  d3.select("#transfer").dispatch('mysel',{detail:value});
}

function myFunction() {
  myVar = setTimeout(showPage, 1000);
};

function showPage() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("myDiv").style.display = "block";
};
