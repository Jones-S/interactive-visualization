$(document).ready(function() {




    var data = [

        {
            "x": 10,
            "y": 20
        }, {
            "x": 140,
            "y": 60
        }, {
            "x": 400,
            "y": 100
        }

    ];

    var svgContainer = d3.select("body").append("svg")
        .attr("width", 600)
        .attr("height", 600);

    var group = svgContainer.append("g")
        .attr("transform", "translate(0, 0)");

    var line = d3.svg.line()
        .x(function(d) {
            return d.x;
        })
        .y(function(d) {
            return d.y;
        })
        .interpolate("basic");

    var paths = group.selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("d", line(data))
        .attr("fill", "none")
        .attr("stroke-width", 0.6)
        .attr("stroke", "#15897a");

    var pathGradient = d3.select("SVGID_2_");

    var doubleclick = $("svg");
    doubleclick.dblclick(function() {
        alert("Double Clicked");
        var lineMove = pathGradient.transition()
            .attr("transform", "translate(800,100)")
            .duration(300)
            // .ease("elastic")
            .delay(100);
    });



});
