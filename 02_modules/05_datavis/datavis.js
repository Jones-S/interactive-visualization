$(document).ready(function() {

//first load json data into array
//because json is loaded asynchronously, all functions concerning data are written inside
var data;

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

    //add circles
    var gemCircles = svgGroup.selectAll("circle")
        .data(data["gemeinden"])
        .enter()
        .append("circle");

    var gemCircAttr = gemCircles
        .attr("cx", 30).attr("cy", 30)
        .attr("r", function(d, i) {
            return d["trafficCosts"]/100
        });
});






});
