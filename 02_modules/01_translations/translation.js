// code to translate and zoom on double click event

$(document).ready(function() {

    var circleData = [{
        "cx": 20,
        "cy": 20,
        "radius": 20,
        "color": "black"
    }, {
        "cx": 70,
        "cy": 70,
        "radius": 20,
        "color": "#6e6a89"
    }, {
        "cx": 70,
        "cy": 70,
        "radius": 20,
        "color": "#6e6a89"
    }, {
        "cx": 70,
        "cy": 70,
        "radius": 20,
        "color": "#6e6a89"
    }, {
        "cx": 70,
        "cy": 70,
        "radius": 20,
        "color": "#6e6a89"
    }, {
        "cx": 70,
        "cy": 70,
        "radius": 20,
        "color": "#6e6a89"
    }, {
        "cx": 70,
        "cy": 70,
        "radius": 20,
        "color": "#6e6a89"

    }];

    //calculate circle position

    var increase = Math.PI * 2 / circleData.length;
    var angle = 0;

    for (var i = 0; i < circleData.length; i++) {
        x = 100 * Math.cos(angle) + 200;
        y = 100 * Math.sin(angle) + 200;
        angle += increase;
        circleData[i]["cx"] = x;
        circleData[i]["cy"] = y;
    }

    var svgContainer = d3.select("body").append("svg")
        .attr("width", 600)
        .attr("height", 600);

    var circleGroup = svgContainer.append("g");



    var circles = circleGroup.selectAll("circle")
        .data(circleData)
        .enter()
        .append("circle");

    var circleAttributes = circles
        .attr("cx", function(d) {
            return d.cx;
        })
        .attr("cy", function(d) {
            return d.cy;
        })
        .attr("r", function(d) {
            return d.radius;
        })
        .style("fill", function(d) {
            return d.color;
        });

    var doubleclick = $("svg circle");
    doubleclick.dblclick(function() {
        // alert("Double Clicked");
        circleGroup.transition()
            .attr("transform", "translate(80,5)")
            .attr("transform", "scale(1.4)")
            .duration(300)
            // .ease("elastic")
            .delay(100);
    });


});
