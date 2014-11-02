$(document).ready(function() {

//first load json data into array
//because json is loaded asynchronously, all functions concerning data are written inside
var data;

//mapping function
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}



d3.json("data.json", function(error, json) {
    if (error) return console.warn(error);
    data = json;

    // some necessary global vars
    var width = $(window).width();
    var height = $(window).height();
    var minSize = 2; //min radius of circles independent of population
    var maxTraffCost = _.max(_.pluck(data["gemeinden"], "trafficCosts")); //use loDash to get max


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

    //add bg circle
    var bgCircle = svgGroup.append("circle")
        .attr("cx", width/2).attr("cy", height/2).attr("r", rad)
        .attr("fill", "white");

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
                r: function(d){
                    var pop = (d["population"]/11600 < minSize) ? minSize : d["population"]/11600; //if population is producing a too small circle set it to minSize
                    return pop;
                    }, //todo: write mapping function and set a max size
                fill: function(d) {
                    //use mapping function to map trafficCosts to RGB from 0 - 255
                    var colorMap = map_range(d["trafficCosts"], 0, maxTraffCost, 255, 120 );
                    colorMap = Math.floor(colorMap); //and round it to whole numbers to use as rgb
                    console.log(colorMap + " - " + d["trafficCosts"]);
                    return "rgba(" + colorMap +", 0, 0, 0.8)";
                    }
            })
        })

});






});
