$(document).ready(function() {




    var data = [

        {
            "x": 10,
            "y": 20
        }, {
            "x": 40,
            "y": 60
        }, {
            "x": 140,
            "y": 70
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
        .interpolate("monotone");

    var paths = group.selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("d", line(data))
        .attr("fill", "none")
        .attr("stroke-width", 0.04)
        .attr("stroke", "red");


});