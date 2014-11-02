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
                r: function(d){ return d["population"]/11600}, //todo: write mapping function and set a max size
                fill: function(d) {
                    var maxTraffCost = _.max(d["trafficCosts"]); //use loDash to get max
                    // console.log(maxTraffCost);
                    var allTraffCosts = _.pluck(d, "trafficCosts"); //extract all trafficCosts into new array
                    console.log(allTraffCosts);


                    //write mapping function to map trafficCosts to RGB from 0 - 255
                    var colorMap = map_range(d["trafficCosts"], 0, maxTraffCost, 0, 255 );
                    console.log(colorMap + " - " + d["trafficCosts"]);
                    return "rgba(" + colorMap +", 0, 0, 0.5)";
                }
            })
        })
        
});






});
