// code to translate and zoom on double click event

$(document).ready(function() {


    var svgContainer = d3.select("body").append("svg")
        .attr("width", 200)
        .attr("height", 200);

    var circleGroup = svgContainer.append("g");

    //Draw the Circle
    var half_height = $("svg").height() / 2;
    var half_width = $("svg").width() / 2;
    var circle = circleGroup.append("circle")
        .attr("cx", half_width)
        .attr("cy", half_height)
        .attr("r", 20);

    var doubleclick = $("svg circle");
    doubleclick.dblclick(function() {
        alert( "Double Clicked" );
    });


});