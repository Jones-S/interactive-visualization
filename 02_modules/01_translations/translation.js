// code to translate and zoom on double click event

$(document).ready(function() {

    var circleData = [{
        "cx": 20,
        "cy": 20,
        "radius": 20,
        "color": "green"
    }, {
        "cx": 70,
        "cy": 70,
        "radius": 20,
        "color": "purple"
    }];

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
        // alert("Double Clicked");
        circleGroup.transition()
            .attr("transform", "translate(80,0)")
            .attr("transform", "scale(1.4)")
            .duration(300)
            // .ease("elastic")
            .delay(100);
    });


});