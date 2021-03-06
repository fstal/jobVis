var dataArray;
var circles = [];
var regioncnt = {};
var regionlist;
var dates = [];
var mapColors = ["#f7bff", "#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c", "#08306b"];
var currentDateMax;
var currentDateMin;
var selectedCat;
var selectedCatName = "Alla";
var categoryList;
var countyList;
var selectedLan;
var diffPainter;
var diffMode = false;
var selectedCounty;
var months = ['Jan','Feb','Mar','Apr','Maj','Jun','Jul','Aug','Sep','Okt','Nov','Dec'];

/*
Att en annons är aktiv under ett tidsspann =

Att annonsens start datum är mindre eller samma som vårat valda slutdatum 
och slutdatumet av annonsen är större eller samma som valda start datumet. 
Med andra ord alla annonser som börjar, slutar eller  både slutar och börjar 
innom de datumen som är valda
*/

//reads external svg file
d3.xml('./maps/mapLan.svg')
    .then(data => {
        d3.select('div#mapContainer').node().append(data.documentElement)  
})


//Dynamically added html
var divTooltip = d3.select("body").append("div")   // Define the div for the tooltip
    .attr("class", "tooltip")        
    .style("opacity", 0);

var daten = new Date("2019-02-04");

const checkbox = document.getElementById('modeChange')


d3.tsv("./data/data.tsv").then(function(data){
  data.forEach(d => {
    dateAdd(d);
  });

  //Read regionList data from json file (contains categories as well)
  d3.json("./data/regionlist.json").then(function(data2){
    regionlist = data2;
    countyList = data2.region_list;
    categoryList = data2.categories;
    createDropDown(); 
    populateCountyList(data2.region_list, data);
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
  drawLegend1(minvalue, average, maxvalue);

  d3.selectAll("g").datum((d,i,k) => { return k[i];}).attr("fill", function (d){      
    var regionalAds = regioncnt[d.id.replace("a", "")];
    if (maxvalue == 0){
      var colorIndex = 8;
    }
    else{
      var colorIndex = Math.round(((regionalAds/maxvalue)*8)+1);
    }
    if (colorIndex == 9){
      colorIndex = colorIndex - 1;
    }
    return color_scale(regionalAds)
      //return d3.interpolateBlues((Math.log(regioncnt[d.id.replace("a", "")])/Math.log(maxvalue)));
    })
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .on("mousemove", mousemove)
      .on("click",(d) => {
        selectedLan  = parseInt(d.id.replace("a", ""));
        setSelectCounty(d.id);
        diffDraw(data);
      });

  d3.select("#transfer").on("mysel", ()=>{
    selectedCat = d3.event.detail;
    reDraw(data);
  })
  generateSlider2(data);

  checkbox.addEventListener('change', (event) => {
    if (event.target.checked) {
      document.getElementById("legend1").style.display = "none";
      document.getElementById("legend2").style.display = "block";
      diffMode = true;
      reDraw(data);
    } else {
      document.getElementById("legend2").style.display = "none";
      document.getElementById("legend1").style.display = "block";
      diffMode = false;
      reDraw(data);
      d3.select("#linegraph").select("svg").remove();
      // document.getElementById("dumt").style.background = "#BCE";
    }
  })
}).catch(error => console.error(error));

function populateCountyList(counties, data) {
  for (i = 0; i < counties.length; i++) {
    if (counties[i].rID > 40){
      counties.splice(i, 2); 
    }
  } 
  var countyTable = d3.select("#countyContainer")
    .html("")
      .selectAll(".row")
      .data(counties)
      .enter().append("div")
        .attr("class", "county-text")
        .attr("id", function(d) {return d.name})
        .style("height", "29px")
        .style("margin-top", "0px")
        .style("opacity", "0.8")
        .text(function(d) { return d.name})
        .on("mouseover", highlight)
        .on("mouseout", unhighlight)
        .on("click",(d) =>{
           for (i=0; i < counties.length; i++){
             if(counties[i].name == d.name) {
               selectedLan  = parseInt(counties[i].rID);
               setSelectCounty("a" + counties[i].rID);
             }
           }
           diffDraw(data);
        });
}

function regionCount(data) {
  var firstDate = new Date(data.first_date.replace(/\s+/g, ""));
  var lastDate = new Date(data.last_date.replace(/\s+/g, ""));
  //lastDate får aldrig vara mindre än det valde minDate
  let subCats = data.sub_category.split(",").map(function(item) {
    return item.trim();
  }); 

  if (data.region in regioncnt && !(firstDate > currentDateMax) && !(lastDate < currentDateMin) && (selectedCat== "Alla" ||selectedCat==undefined || data.category == selectedCat || subCats.indexOf(selectedCat) != -1)  ) {
    regioncnt[data.region] = regioncnt[data.region] + 1;
  }
  else if (!(firstDate > currentDateMax) && !(lastDate < currentDateMin) && (selectedCat=="Alla"|| selectedCat==undefined || data.category == selectedCat || subCats.indexOf(selectedCat) != -1)) {
    regioncnt[data.region] = 1;
  }
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
  if (diffMode){diffPaint(data);}else{
  for (alla in regioncnt){
    regioncnt[alla]= 0;
  }
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
    var color_scale = d3.scaleLinear().domain([minvalue,average, maxvalue]).range(['#c6dbef','#6baed6', '#08306b']);
    d3.selectAll("g").datum((d,i,k) => { return k[i];}).attr("fill", function (d){
    var regionalAds = regioncnt[d.id.replace("a", "")];
    return color_scale(regionalAds)
    //return d3.interpolateBlues((Math.log(regioncnt[d.id.replace("a", "")])/Math.log(maxvalue)));
        //return d3.color("lightblue").darker(-1*(1-(regioncnt[d.id.replace("a", "")]*(20/(maxvalue)))));
        //return "green";
  })
}
}

function diffPaint(data){
  diffDraw(data);
  diffPainter = {};
  for(alla in regioncnt){

    diffPainter[alla] = {'first':{'day':currentDateMin,'count':0},'last':{'day':currentDateMax,'count':0}}
    diffPainter[alla].first = dayCount(diffPainter[alla].first,data,alla);
    diffPainter[alla].last = dayCount(diffPainter[alla].last,data,alla);
  }
  var maxvalue = -100000000;
  var minvalue = 100000000;
  var average = 0;
  var averagenegative = 0;
  var counter = 0;
  for (var key in diffPainter) {
    var diff = (diffPainter[key].last.count - diffPainter[key].first.count);
    if (diff>0){
    average += diff;
    }else if (diff < 0){
      averagenegative += diff;
    }
    counter ++;
      if (diff>maxvalue) {
        maxvalue =diff;
      }
      if (diff<minvalue) {
        minvalue =diff;
      }
    }
    average = (average/counter);
    averagenegative = (average/counter);
    var color_scale = d3.scaleLinear().domain([minvalue-1,averagenegative-1,0,average+1, maxvalue+1]).range(['#9e0142','#f46d43','#ffff7b','#66bd63', '#006837']);
    drawLegend2(minvalue, averagenegative, 0, average, maxvalue);
  d3.selectAll("g").datum((d,i,k) => { return k[i];}).attr("fill", function (d){
    var regionalAds = diffPainter[d.id.replace("a", "")].last.count - diffPainter[d.id.replace("a", "")].first.count;
    return color_scale(regionalAds)
  });
  
}

function resetTime(e, data) {
  document.getElementById("slider-container").innerHTML = "";
  document.getElementById("btndiv").innerHTML = "";
  currentDateMax = d3.max(dates);
  currentDateMin = d3.min(dates);
  generateSlider2(data);
  reDraw(data);
  mapHeader();
}

function generateSlider2(data){
  var resetbtn = document.createElement('div');
  resetbtn.setAttribute("id", "resettimeBtn");
  resetbtn.className = "ui button";
  resetbtn.style.width = "100%";
  resetbtn.style.height = "100%";
  resetbtn.style.fontSize = "13px";
  resetbtn.style.lineHeight = "22px";
  resetbtn.innerHTML = "Återställ tidsspann";
  resetbtn.addEventListener("click", (e)=>{resetTime(e, data)}); 
  document.getElementById("btndiv").append(resetbtn);
  //console.log("bithcc " + timeConverter(timeConverter(d3.min(dates).setHours(00,00,00)).setMilliseconds(000)));
  var dateMin = Number(timeConverter(timeConverter(d3.min(dates).setHours(00,00,00)).setMilliseconds(000)));
  var dateMax = Number(timeConverter(timeConverter(d3.max(dates).setHours(23,59,59)).setMilliseconds(999)));
  var slider = createD3RangeSlider(dateMin, dateMax, "#slider-container");
  slider.range(dateMin, dateMax);
  
  d3.select("#range-label").text(timeConverter(dateMin).getDate() + " " + months[timeConverter(dateMin).getMonth()] + " " + timeConverter(dateMin).getFullYear() + " - " + timeConverter(dateMax).getDate() + " " + months[timeConverter(dateMax).getMonth()] + " " + timeConverter(dateMax).getFullYear());
  slider.onChange(function(newRange){
      d3.select("#range-label").text(timeConverter(newRange.begin).getDate() + " " + months[timeConverter(newRange.begin).getMonth()] + " " + timeConverter(newRange.begin).getFullYear() + " - " + timeConverter(newRange.end).getDate() + " " + months[timeConverter(newRange.end).getMonth()] + " " + timeConverter(newRange.end).getFullYear());
      currentDateMin = timeConverter(timeConverter(timeConverter(newRange.begin).setHours(00,00,00)).setMilliseconds(000));
      currentDateMax = timeConverter(timeConverter(timeConverter(newRange.end).setHours(23,59,59)).setMilliseconds(999));
      reDraw(data);
      mapHeader();

  });

  d3.select(".slider-container").style("height", "100%").style("width", "100%");
  d3.select(".slider").style("left","0px").style("position", "relative").style("height", "100%"). style("width", "100%");
  mapHeader();
}

//Creates dynamic dropdown with categories
function createDropDown() {
  var select = document.getElementById('cat');
  var outerMenu = document.createElement('div');
  outerMenu.classList.add('menu');

  var resetcatBtn = document.getElementById("resetcatBtn");
  resetcatBtn.addEventListener("click", (e)=>{filterCategories(e, undefined,2)});

  for (var i = 0; i < categoryList.length; i++) {
    let mainCategoryID = categoryList[i].cgID
    //Create main category div
    var opt = document.createElement('div');
    opt.value = categoryList[i].cgID;
    opt.innerHTML = "<span class='text' value='" + mainCategoryID +  "'>" + categoryList[i].name + "</span><i class='caret right icon right floated'></i>";
    opt.addEventListener("click", (e)=>{filterCategories(e, mainCategoryID,0)}); 
    opt.classList.add('item');

    var subMenu = document.createElement('div');
    subMenu.classList.add('menu');
    opt.appendChild(subMenu);
    
    if(categoryList[i].subcategories.length){
      for(var j = 0; j < categoryList[i].subcategories.length; j++){
        //Create subcategories under a main category
        let subCatID = categoryList[i].subcategories[j].scgID;
        var subCat = document.createElement('div');
        subCat.value = categoryList[i].subcategories[j].scgID;
        subCat.innerHTML = "<span class='text' value='" + categoryList[i].subcategories[j].scgID + "'>" + categoryList[i].subcategories[j]['#text'] + "</span>";
        subCat.addEventListener('click', (e)=>{filterCategories(e, subCatID,1)});

        subCat.classList.add('item');
        subMenu.appendChild(subCat);
      }
    }
    outerMenu.appendChild(opt);
    select.appendChild(outerMenu);
  }
  //Jquery bit for dropdown to work
  $('.ui.dropdown')
  .dropdown({
    allowCategorySelection: true
  });
}

function filterCategories(e, data, type) {
  e.stopPropagation(); 
  d3.select("#transfer").dispatch('mysel',{detail:data});
  //var categoryLabel = document.getElementById("category-label");
  //categoryLabel.innerHTML = "";
  var selectedValue = document.getElementById("selectedValue");
  selectedValue.innerHTML = "";
  if (type == 0){
    for (i=0; i < categoryList.length; i++){
      if (data == categoryList[i].cgID){
        //d3.select("#category-label").text(categoryList[i].name);
        d3.select("#selectedValue").text(categoryList[i].name);
        selectedCatName = categoryList[i].name;
      }
    }
  }
  else if (type == 1) {
    for (i=0; i < categoryList.length; i++){
      for (j=0; j < categoryList[i].subcategories.length; j++){
        if (data == categoryList[i].subcategories[j].scgID){
          //d3.select("#category-label").text(categoryList[i].subcategories[j]['#text']);
          d3.select("#selectedValue").text(categoryList[i].subcategories[j]['#text']);
          selectedCatName = categoryList[i].subcategories[j]['#text'];
        }
      }
    }
  }
  else if (type == 2) {
    //d3.select("#category-label").text("Alla");
    d3.select("#selectedValue").text("Välj Kategori");
    selectedCatName = "Alla";
  }
  mapHeader();
}
function mapHeader(){
  var textbox = document.getElementById("mapHeader");
  textbox.innerHTML = "";
  if (!(selectedCatName == "Alla")) {
    textbox.innerHTML = "Annonser i jobbkategorin " + "<text style='font-style:italic'>" + selectedCatName + "</text>" + " under tidspannet " + "<text style='font-style:italic'>" +  currentDateMin.getDate() + "-" + months[currentDateMin.getMonth()] + "-" + currentDateMin.getFullYear() + "</text>" +  " till " + "<text style='font-style:italic'>" + currentDateMax.getDate() + "-" + months[currentDateMax.getMonth()] + "-" + currentDateMax.getFullYear() + "</text>.";
  }
  else if (selectedCatName == "Alla"){
    textbox.innerHTML = "Annonser för " + "<text style='font-style:italic'>Alla</text>" + " jobbkategorier " + " under tidspannet " + "<text style='font-style:italic'>" +  currentDateMin.getDate() + "-" + months[currentDateMin.getMonth()] + "-" + currentDateMin.getFullYear() + "</text>" +  " till " + "<text style='font-style:italic'>" + currentDateMax.getDate() + "-" + months[currentDateMax.getMonth()] + "-" + currentDateMax.getFullYear() + "</text>.";
  }
  //console.log(selectedCatName + " " + currentDateMax + " " + currentDateMin);
}

function diffDraw(data) {
  if (selectedLan != undefined && diffMode) {
  compareregionlist = {};
  const oneday = 24*60*60*1000;
  var diffDays = Math.ceil(Math.abs((currentDateMax.valueOf() - currentDateMin.valueOf())/(oneday)));
  var formatTime = d3.timeFormat("%d %b, %Y");
  daycounter = currentDateMin.valueOf();
  for (i=0; i<=diffDays; i++){
    compareregionlist[""+formatTime(new Date(daycounter+(i*oneday)))] = {'day':(new Date(daycounter+(i*oneday))),'count': 0}
  }

  comparedayslist = d3.keys(compareregionlist).map( d =>  dayCount(compareregionlist[d],data) );

  var margin = {top: 50, right: 50, bottom: 50, left: 50}
    , width = 600 - margin.left - margin.right 
    , height = 400 - margin.top - margin.bottom; 

  var n = comparedayslist.length;

  var xScale = d3.scaleTime()
      .domain(d3.extent(comparedayslist, function(d) { return d.day; }))
      .range([0, width]); 

  var yScale = d3.scaleLinear()
      .domain([0,d3.max(comparedayslist, function(d) { return d.count; })])
      .range([height, 0]);  

  var parseTime = d3.timeParse("%D")
      bisectDate = d3.bisector(function(d) { return d.day; }).left;

  var line = d3.line()
      .x(function(d, i) { return xScale(d.day); }) 
      .y(function(d) { return yScale(d.count); }) 
      .curve(d3.curveMonotoneX) 

  d3.select("#linegraph").select("svg").remove();
  var svg = d3.select("#linegraph").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("margin-left", "-35px" )
      .style("margin-top", "50px" );

  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale).ticks(4)); 

  g.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale))
      .append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("fill", "#5D6971")
        .text("Antal annonser");

  g.append("path")
      .datum(comparedayslist) 
      .attr("class", "line") 
      .attr("d", line); //  Calls the line generator 

  var focus = g.append("g")
    .attr("class", "focus")
    .style("display", "none");

  focus.append("line")
      .attr("class", "x-hover-line hover-line")
      .attr("y1", 0)
      .attr("y2", height);

  focus.append("line")
      .attr("class", "y-hover-line hover-line")
      .attr("x1", width)
      .attr("x2", width);

  focus.append("text")
      .attr("x", 15)
      .attr("dy", ".31em");

  svg.append("rect")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemovePlot);

  g.selectAll(".dot")
      .data(comparedayslist)
    .enter().append("circle") // Uses the enter().append() method
      .attr("class", "dot") 
      .attr("cx", function(d, i) { return xScale(d.day) })
      .attr("cy", function(d) { return yScale(d.count) })
      .attr("r", 5);

    g.append("text")
      .attr("class", "chart-title")
      .attr("x", width/2)
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .text(selectedCounty);
  }

    function mousemovePlot() {
    var x0 = xScale.invert(d3.mouse(this)[0]),
        i = bisectDate(comparedayslist, x0, 1),
        d0 = comparedayslist[i - 1],
        d1 = comparedayslist[i],
        d = x0 - d0.day > d1.day - x0 ? d1 : d0;
    focus.attr("transform", "translate(" + xScale(d.day) + "," + yScale(d.count) + ")");
    focus.select("text").text(function() { return d.count; });
    focus.select(".x-hover-line").attr("y2", height - yScale(d.count));
    focus.select(".y-hover-line").attr("x2", width + width);
  }
}

function dayCount(dayitem,data,selRegion) {
  if (!(selRegion)) selRegion = selectedLan;
  var formatTime = d3.timeFormat("%d %b, %Y");
  todaysDateasDate = dayitem.day;
  data.forEach(d=> {
  var firstDate = new Date(d.first_date.replace(/\s+/g, ""));
  var lastDate = new Date(d.last_date.replace(/\s+/g, ""));
  let subCats = "";
    if (d.sub_category){
  subCats = d.sub_category.split(",").map(function(item) {
    return item.trim();
  
  })}; //|| subCats.indexOf(selectedCat) != -1)
  //lastDate får aldrig vara mindre än det valde minDate
  if (d.region == selRegion && (firstDate <= todaysDateasDate ) && (lastDate >= todaysDateasDate) && (selectedCat== "Alla" ||selectedCat==undefined || d.category == selectedCat || subCats.includes(selectedCat)) )  {
    dayitem.count += 1;
  }
 });
 return dayitem;
};

function drawLegend1 (minvalue, average, maxvalue){
  var w = 25, h = 660;
  //var color_scale = d3.scaleLinear().domain([minvalue,average, maxvalue]).range(['#c6dbef','#6baed6', '#08306b']);

  var key = d3.select("#legend1")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  var legend = key.append("defs")
    .append("svg:linearGradient")
    .attr("id", "gradient")
    .attr("x1", "100%")
    .attr("y1", "100%")
    .attr("x2", "100%")
    .attr("y2", "0%")
    .attr("spreadMethod", "pad");

  legend.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", '#c6dbef')
    .attr("stop-opacity", 1);

  legend.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", '#6baed6')
    .attr("stop-opacity", 1);

  legend.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", '#08306b')
    .attr("stop-opacity", 1);

  key.append("rect")
    .attr("width", w)
    .attr("height", h - 30)
    .style("fill", "url(#gradient)")
    .attr("transform", "translate(0,10)");
}

function drawLegend2 (minvalue, averagenegative, middle, average, maxvalue) {
  var ele = document.getElementById("legend2");
  ele.innerHTML = "";
  var para = document.createElement("p");
  var text = document.createTextNode("Relativ förändring (%).")
  para.appendChild(text);
  ele.appendChild(para);
  var w = 25, h = 660;
  //var color_scale = d3.scaleLinear().domain([minvalue,averagenegative,0,average, maxvalue]).range(['#9e0142','#f46d43','#ffff7b','#66bd63', '#006837']);

  var key = d3.select("#legend2")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  var legend = key.append("defs")
  .append("svg:linearGradient")
  .attr("id", "gradient2")
  .attr("x1", "100%")
  .attr("y1", "100%")
  .attr("x2", "100%")
  .attr("y2", "0%")
  .attr("spreadMethod", "pad");

  legend.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", '#9e0142')
    .attr("stop-opacity", 1);

  legend.append("stop")
    .attr("offset", "25%")
    .attr("stop-color", '#f46d43')
    .attr("stop-opacity", 1);

  legend.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", '#ffff7b')
    .attr("stop-opacity", 1);
  
    legend.append("stop")
    .attr("offset", "75%")
    .attr("stop-color", '#66bd63')
    .attr("stop-opacity", 1);

    legend.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", '#006837')
    .attr("stop-opacity", 1);

    key.append("rect")
      .attr("width", w)
      .attr("height", h - 30)
      .style("fill", "url(#gradient2)")
      .attr("transform", "translate(0,10)");

}

function openModal(){
  $('.ui.longer.modal')
  .modal('show');
}

function myFunction() {
  myVar = setTimeout(showPage, 1000);
};

function showPage() {
  document.getElementById("loader").style.display = "none";
  document.getElementById("myDiv").style.display =  "initial";
  d3.select("#transfer").dispatch('other',{detail:"loaded"});
}

function removeOverRegionTooltip(d){
  divTooltip.transition()   
      .duration(100)    
      .style("opacity", 0)
      .style("z-index", "-10");
}

function highlightCountyHelper(d) {
  var countyIdx = countyList.findIndex(i => i.name === d.name);
  let countyGroupIdx = countyIdx + 1;
  let countyGroupName = "#a" + countyGroupIdx;
  return countyGroupName
}

function setSelectCounty(id) {
    let formatId = id.replace("a", "");
    let region = regionlist.region_list[formatId-1].name;
    selectedCounty = region
}

//Tooltip mouse-handling for map of sweden
//
var mouseover = function(d) {
  if (d.parentElement.id == "svg2"){
    let formatId = d.id.replace("a", "");
    let region = regionlist.region_list[formatId-1].name;

  divTooltip.transition()   
    .duration(175)    
    .style("opacity", .85);
    if (diffMode){
    var tipText = region + "<br/> Förändring: " + (diffPainter[formatId].last.count - diffPainter[formatId].first.count)
    }else {
      var tipText = region + "<br/> Antal Annonser: "  + regioncnt[formatId]
    }

  divTooltip.html(tipText)
    .style("z-index", "10")
    .style("left", (d3.mouse(this)[0]) + "px")
    .style("top", (d3.mouse(this)[1]) + 20 + "px") ;
  d3.select(this)
    .style("stroke", "black")
    .style("stroke-width", "1.2px");
  d3.select("#" + region)
    .style("opacity", "1")
    .style("font-weight", "bold");
  }
}

var mouseout = function(d) {
  if (d.parentElement.id == "svg2"){  
    let formatId = d.id.replace("a", "");
    let region = regionlist.region_list[formatId-1].name;
    divTooltip.transition()   
      .duration(100)    
      .style("opacity", 0)
      .style("z-index", "-10");
    d3.select(this)
      .style("stroke", "black")
      .style("stroke-width", "0.3px"); 
    d3.select("#" + region)
      .style("opacity", "0.8")
      .style("font-weight", "normal");   
 }
}

var mousemove = function(d) {
  if (d.parentElement.id == "svg2"){  
    divTooltip
      .style("left", (d3.mouse(this)[0]) + "px")
      .style("top", (d3.mouse(this)[1]) + 20 + "px") 
 }
}

//Mouseovers for countylist
var highlight = function(d) {
  let mousedCounty = document.getElementById(d.name);
  mousedCounty.style.fontWeight = "bold";
  mousedCounty.style.opacity = "1";

  overRegionTooltip(d);

  d3.select(highlightCountyHelper(d))
    .style("stroke", "black")
    .style("stroke-width", "1.2px");
}

var unhighlight = function(d) {
    let mousedCounty = document.getElementById(d.name);
    mousedCounty.style.fontWeight = "normal";
    mousedCounty.style.opacity = "0.8";
    removeOverRegionTooltip(d);

    d3.select(highlightCountyHelper(d))
      .style("stroke", "black")
      .style("stroke-width", "0.3px")
}

function overRegionTooltip(d){
  let activeRegion = highlightCountyHelper(d);
  let formatId = d.rID;
  let region = regionlist.region_list[formatId-1].name;
  
  let boxCoordinates = d3.selectAll(activeRegion).node().getBBox();

  divTooltip.transition()   
    .duration(175)    
    .style("opacity", .85);
  divTooltip
    .style("left", ((boxCoordinates.x+70) + "px"))
    .style("top", ((boxCoordinates.y+50) + "px"));
  if (diffMode){
    var tipText = region + "<br/> Förändring: " + (diffPainter[formatId].last.count - diffPainter[formatId].first.count)
  }
  else {
    var tipText = region + "<br/> Antal Annonser: "  + regioncnt[formatId]
  }
  divTooltip.html(tipText)
    .style("z-index", "10");
}

function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp);
  var time = new Date(a);
  return time;
}
