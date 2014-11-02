$(document).ready(function() {

//first load json data into array
//because json is loaded asynchronously, all functions concerning data are written inside
var data;

var colormap = require('colormap')
options = {
  colormap: "jet"   // pick a builtin colormap or add your own
, nshades: 72       // how many divisions
, format: "hex"     // "hex" or "rgb" or "rgbaString"
, alpha: 1          // set an alpha value or a linear alpha mapping [start, end]
}
cg = colormap(options)

d3.json("data.json", function(error, json) {
    if (error) return console.warn(error);
    data = json;

    var width = $(window).width();
    var height = $(window).height();
    //draw svg
    var svgContainer = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
    //add group to contain all circles
    var svgGroup = svgContainer.append("g");

    //calc circle count and angle step
    var increase = Math.PI * 2 / data["gemeinden"].length;
    console.log(increase);
    var angle = 0;
    var rad = 90; //radius of circle with circles on it

    //add circles
    var gemCircles = svgGroup.selectAll("circle")
        .data(data["gemeinden"])
        .enter()
        .append("circle");

    var gemCircAttr = gemCircles
        .each(function(d){
            d3.select(this).attr({
                cx: function(){
                        var cx = rad * Math.cos(angle) + width/2;
                        return cx;
                    },
                cy: function(){
                        var cy = rad * Math.sin(angle) + height/2;
                        angle += increase;
                        return cy;
                    },
                r: function(d){ return d["trafficCosts"]/15}
            })
        })
        
});






});
