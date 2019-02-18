var dataArray = [];
var circles = [];
var regioncnt = {};
var regionlist;

//Read regionList data form json file
d3.json("./data/regionlist.json").then(function(data){
    regionlist = data
    
});

//list_id ;  platform  ; first_date ; last_date  ; region ; category;sub_category; subject_full ;  area  ; zipcode ;
d3.tsv("./data/data.tsv").then(function(data){
  data.forEach( d => regionCount(d));
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
        return d3.color("lightblue").darker(-1*(1-(regioncnt[d.id.replace("a", "")]*(20/(maxvalue)))));
        //return "green";

  })
  .on('mouseover', function(d){
    //Här vill vi kanske byta färg på regionen för att visa hover men lyckas ej atm /joel
    //console.log(d)
  })
  .on('click', function(d){
    let formatId = d.id.replace("a", "")
    let region = regionlist.region_list[formatId-1].name
    document.getElementById("hoverTarget").innerHTML = region + " - Amount: " + regioncnt[d.id.replace("a", "")];
  });

});

function regionCount(data) {
  //console.log(data.region);
  if (data.region in regioncnt) {
    //console.log("hej " + data.region);
    regioncnt[data.region] = regioncnt[data.region] + 1;
  }
  else {
    regioncnt[data.region] = 1;
  }
//  colorMap(regioncnt);
}

function colorMap (regioncnt) {
  d3.selectAll("path").data(regioncnt),attr("fill", d =>
    console.log(regioncnt + "hej")
  )
}


$('.ui.dropdown').dropdown({
  allowAdditions: true
});

function filterCategories(data) {
  var selector = document.getElementById("cat");
  var value = selector[selector.selectedIndex].value;
  console.log(value);

}
