// code to translate and zoom on double click event

$(document).ready(function() {

    var svgContainer = d3.select("body").append("svg")
        .attr("width", 200)
        .attr("height", 200);

    //Draw the Circle
    var circle = svgContainer.append("circle")
        .attr("cx", 30)
        .attr("cy", 30)
        .attr("r", 20);


});