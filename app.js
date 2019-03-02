var dataArray = [];
var circles = [];
var regioncnt = {};
var regionlist;
var dates = [];
var mapColors = ["#f7bff", "#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c", "#08306b"];
var currentDateMax;
var currentDateMin;
var selectedCat;
var categoryList;
var countyList;

//reads external svg file
d3.xml('./maps/mapLan.svg')
    .then(data => {
        d3.select('div#mapContainer').node().append(data.documentElement)  
})

//Dynamically added html
var divTooltip = d3.select("body").append("div")   // Define the div for the tooltip
    .attr("class", "tooltip")        
    .style("opacity", 0);

//Read regionList data form json file
d3.json("./data/regionlist.json").then(function(data){
    regionlist = data;
    countyList = data.region_list;
    categoryList = data.categories;
    createDropDown(); 
    populateCountyList(data.region_list);
});

var daten = new Date("2019-02-04");

d3.tsv("./data/data.tsv").then(function(data){
  data.forEach(d => {
    dateAdd(d);
  });
  currentDateMax = d3.max(dates);
  currentDateMin = d3.min(dates);
  data.forEach( d => {
    regionCount(d);
  });

  var maxvalue = 0;
  var minvalue = 10000;
  var average = 0;
  var counter = 0;
  for (var key in regioncnt) {
    average += parseInt(regioncnt[key]);
    counter ++;
      if (parseInt(regioncnt[key])>maxvalue) {
        maxvalue =parseInt(regioncnt[key]);
      }
      if (parseInt(regioncnt[key])<minvalue) {
        minvalue =parseInt(regioncnt[key]);
      }
    }
    average = (average/counter);

  var color_scale = d3.scaleLinear().domain([minvalue,average, maxvalue]).range(['#c6dbef','#6baed6', '#08306b']);

  d3.selectAll("g").datum((d,i,k) => { return k[i];}).attr("fill", function (d){      
    var regionalAds = regioncnt[d.id.replace("a", "")];
    console.log(d.id + " " + regionalAds + " " + maxvalue);
    if (maxvalue == 0){
      var colorIndex = 8;
    }
    else{
      var colorIndex = Math.round(((regionalAds/maxvalue)*8)+1);
    }
    if (colorIndex == 9){
      colorIndex = colorIndex - 1;
    }
    console.log(colorIndex);
    return color_scale(regionalAds)
      //return d3.interpolateBlues((Math.log(regioncnt[d.id.replace("a", "")])/Math.log(maxvalue)));
    })
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .on("mousemove", mousemove);

  d3.select("#transfer").on("mysel", ()=>{
    selectedCat = d3.event.detail;
    reDraw(data);
  })
  generateSlider2(data);
}).catch(error => console.error(error));

function populateCountyList(counties) {
  // sort?
  // var countyData = data.sort(function(a,b) {
  //   var col = d3.keys(a)[0];
  //   return a[col] < b[col] ? -1 : 1;
  // });
  var countyTable = d3.select("#countyContainer")
    .html("")
      .selectAll(".row")
      .data(counties)
      .enter().append("div")
        .attr("class", "county-text")
        .attr("id", function(d) {return d.name})
        .text(function(d) { return d.name})
        .on("click", function (d){
        //populateSelList(d.name);
        })
        .on("mouseover", highlight)
        .on("mouseout", unhighlight);
}

//Tooltip mouse-handling for map of sweden
// Kan använda d3.mouse[0][1] for x, resp y i d3 v5
//
var mouseover = function(d) {
  if (d.parentElement.id == "svg2"){
    let formatId = d.id.replace("a", "");
    let region = regionlist.region_list[formatId-1].name;
    //console.log(region);
  divTooltip.transition()   
    .duration(175)    
    .style("opacity", .85);
  divTooltip.html(region + "<br/> Antal Annonser: "  + regioncnt[formatId])
    .style("z-index", "10");
    // .style("left", (d3.event.pageX) + "px")     
    // .style("top", (d3.event.pageY) + "px");
  d3.select(this)
    .style("stroke", "black");
    console.log(this);
  }
}

var mouseout = function(d) {
  if (d.parentElement.id == "svg2"){  
    divTooltip.transition()   
      .duration(100)    
      .style("opacity", 0)
      .style("z-index", "-10");
    d3.select(this)
      .style("stroke", "none");    
 }
}

var mousemove = function(d) {
  if (d.parentElement.id == "svg2"){  
    divTooltip
      .style("left", (d3.mouse(this)[0]) + "px")
      .style("top", (d3.mouse(this)[1]) + "px") 
 }
}

//Mouseovers for countylist
var highlight = function(d) {
  let mousedCounty = document.getElementById(d.name);
  mousedCounty.style.textDecoration = "underline";

  d3.select(highlightCountyHelper(d))
    .style("stroke", "black");
  //console.log("#" +countyGroupName);
}

var unhighlight = function(d) {
    let mousedCounty = document.getElementById(d.name);
    mousedCounty.style.textDecoration = "";
    d3.select(highlightCountyHelper(d))
      .style("stroke", "none");
}

function highlightCountyHelper(d) {
  var countyIdx = countyList.findIndex(i => i.name === d.name);
  let countyGroupIdx = countyIdx + 1;
  let countyGroupName = "#a" + countyGroupIdx;
  return countyGroupName
}



function regionCount(data) {
  //console.log(data.region);
  var firstDate = new Date(data.first_date.replace(/\s+/g, ""));
  var lastDate = new Date(data.last_date.replace(/\s+/g, ""));
  //lastDate får aldrig vara mindre än det valde minDate
  //console.log("dafds",selectedCat,"bell")
  if (data.region in regioncnt && !(firstDate > currentDateMax) && !(lastDate < currentDateMin) && (selectedCat== "Alla" ||selectedCat==undefined || data.category == selectedCat)  ) {
    //console.log("hej " + data.region);
    regioncnt[data.region] = regioncnt[data.region] + 1;
  }
  else if (!(firstDate > currentDateMax) && !(lastDate < currentDateMin) && (selectedCat=="Alla"|| selectedCat==undefined || data.category == selectedCat)) {
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

function reDraw(data) {
  for (alla in regioncnt){
    regioncnt[alla]= 0;
  }
//regioncnt= {};
  data.forEach(d => {
    regionCount(d);
  });

  var maxvalue = 0;
  var minvalue = 10000;
  var average = 0;
  var counter = 0;
  for (var key in regioncnt) {
    average += parseInt(regioncnt[key]);
    counter ++;
      if (parseInt(regioncnt[key])>maxvalue) {
        maxvalue =parseInt(regioncnt[key]);
      }
      if (parseInt(regioncnt[key])<minvalue) {
        minvalue =parseInt(regioncnt[key]);
      }
    }
    average = (average/counter);
    //console.log(maxvalue,minvalue,average);
    var color_scale = d3.scaleLinear().domain([minvalue,average, maxvalue]).range(['#c6dbef','#6baed6', '#08306b']);
  d3.selectAll("g").datum((d,i,k) => { return k[i];}).attr("fill", function (d){
    var regionalAds = regioncnt[d.id.replace("a", "")];
    //console.log(d.id + " " + regionalAds + " " + maxvalue);
    return color_scale(regionalAds)
    //return d3.interpolateBlues((Math.log(regioncnt[d.id.replace("a", "")])/Math.log(maxvalue)));
        //return d3.color("lightblue").darker(-1*(1-(regioncnt[d.id.replace("a", "")]*(20/(maxvalue)))));
        //return "green";
  })
}

function generateSlider(dates,data) {
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

function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp);
  var time = new Date(a);
  return time;
}

function generateSlider2(data){
  var dateMin = Number(d3.min(dates));
  var dateMax = Number(d3.max(dates));
  var slider = createD3RangeSlider(dateMin, dateMax, "#slider-container");
  slider.range(dateMin, dateMax);
  
  var months = ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];
  d3.select("#range-label").text(timeConverter(dateMin).getDate() + " " + months[timeConverter(dateMin).getMonth()] + " " + timeConverter(dateMin).getFullYear() + " - " + timeConverter(dateMax).getDate() + " " + months[timeConverter(dateMax).getMonth()] + " " + timeConverter(dateMax).getFullYear());
  slider.onChange(function(newRange){
      d3.select("#range-label").text(timeConverter(newRange.begin).getDate() + " " + months[timeConverter(newRange.begin).getMonth()] + " " + timeConverter(newRange.begin).getFullYear() + " - " + timeConverter(newRange.end).getDate() + " " + months[timeConverter(newRange.end).getMonth()] + " " + timeConverter(newRange.end).getFullYear());
      currentDateMin = timeConverter(timeConverter(timeConverter(newRange.begin).setHours(00,00,00)).setMilliseconds(000));
      currentDateMax = timeConverter(timeConverter(timeConverter(newRange.end).setHours(24,59,59)).setMilliseconds(999));
      reDraw(data);
      diffDraw(data);
  });
  d3.select(".slider-container").attr("id","sc");
  d3.select(".slider").attr("id","dumt");
  d3.select(".slider").style("left","0px").style("width", "350px");
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
  document.getElementById("myDiv").style.display =  "initial";
  d3.select("#transfer").dispatch('other',{detail:"loaded"});
  document.getElementById("dumt").style.width = "350px";
  document.getElementById("sc").style.height = "30px";
};
function diffDraw(data){
  compareregionlist = {};
 const oneday = 24*60*60*1000;
  var diffDays = Math.ceil(Math.abs((currentDateMax.valueOf() - currentDateMin.valueOf())/(oneday)));
  console.log(diffDays);
  var formatTime = d3.timeFormat("%d %b, %Y");
  daycounter = currentDateMin.valueOf();
  console.log(formatTime(new Date(daycounter)));
for (i=0; i<=diffDays; i++){
  compareregionlist[""+formatTime(new Date(daycounter+(i*oneday)))] = {'day':(new Date(daycounter+(i*oneday))),'count': 0}
}

comparedayslist = d3.keys(compareregionlist).map( d =>  dayCount(compareregionlist[d],data) );

console.log(comparedayslist);

// 2. Use the margin convention practice 
var margin = {top: 50, right: 50, bottom: 50, left: 50}
  , width = 600 - margin.left - margin.right // Use the window's width 
  , height = 400 - margin.top - margin.bottom; // Use the window's height

var n = comparedayslist.length;
// 5. X scale will use the index of our data
var xScale = d3.scaleTime()
    .domain([d3.min(comparedayslist, function(d) { return d.day; }),d3.max(comparedayslist, function(d) { return d.day; })]) // input
    .range([0, width]); // output
    xScale.tickFormat(9,d3.timeFormat("%d %b, %Y"));

// 6. Y scale will use the randomly generate number 
var yScale = d3.scaleLinear()
    .domain(d3.extent(comparedayslist, function(d) { return d.count; })) // input 
    .range([height, 0]); // output 

// 7. d3's line generator
var line = d3.line()
    .x(function(d, i) { return xScale(d.day); }) // set the x values for the line generator
    .y(function(d) { return yScale(d.count); }) // set the y values for the line generator 
    .curve(d3.curveMonotoneX) // apply smoothing to the line




// 1. Add the SVG to the page and employ #2
d3.select("#linegraph").select("svg").remove();
var svg = d3.select("#linegraph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 3. Call the x axis in a group tag
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

// 4. Call the y axis in a group tag
svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

// 9. Append the path, bind the data, and call the line generator 
svg.append("path")
    .datum(comparedayslist) // 10. Binds data to the line 
    .attr("class", "line") // Assign a class for styling 
    .attr("d", line); // 11. Calls the line generator 

// 12. Appends a circle for each datapoint 
svg.selectAll(".dot")
    .data(comparedayslist)
  .enter().append("circle") // Uses the enter().append() method
    .attr("class", "dot") // Assign a class for styling
    .attr("cx", function(d, i) { return xScale(d.day) })
    .attr("cy", function(d) { return yScale(d.count) })
    .attr("r", 5)
      .on("mouseover", function(a, b, c) { 
  			console.log(a) 
		})
      .on("mouseout", function() {  })
//       .on("mousemove", mousemove);

//   var focus = svg.append("g")
//       .attr("class", "focus")
//       .style("display", "none");

//   focus.append("circle")
//       .attr("r", 4.5);

//   focus.append("text")
//       .attr("x", 9)
//       .attr("dy", ".35em");

//   svg.append("rect")
//       .attr("class", "overlay")
//       .attr("width", width)
//       .attr("height", height)
//       .on("mouseover", function() { focus.style("display", null); })
//       .on("mouseout", function() { focus.style("display", "none"); })
//       .on("mousemove", mousemove);
  
//   function mousemove() {
//     var x0 = x.invert(d3.mouse(this)[0]),
//         i = bisectDate(data, x0, 1),
//         d0 = data[i - 1],
//         d1 = data[i],
//         d = x0 - d0.date > d1.date - x0 ? d1 : d0;
//     focus.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");
//     focus.select("text").text(d);
//   }

}

function dayCount(dayitem,data) {
  //console.log(data.region);
  var formatTime = d3.timeFormat("%d %b, %Y");
  todaysDateasDate = dayitem.day;
  data.forEach(d=> {
  var firstDate = new Date(d.first_date.replace(/\s+/g, ""));
  var lastDate = new Date(d.last_date.replace(/\s+/g, ""));

  //lastDate får aldrig vara mindre än det valde minDate
  //console.log("dafds",selectedCat,"bell")
  //console.log(firstDate,todaysDateasDate,lastDate);
  if (d.region == "1" && (firstDate <= todaysDateasDate ) && (lastDate >= todaysDateasDate) && (selectedCat== "Alla" ||selectedCat==undefined || d.category == selectedCat) )  {
    //console.log("hej " + data.region);
    dayitem.count += 1;
  }
 });
 return dayitem;
};