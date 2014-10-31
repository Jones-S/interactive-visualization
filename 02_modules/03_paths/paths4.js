$(document).ready(function() {




    var data = [

        {
            "x": 10,
            "y": 10
        }, {
            "x": 450,
            "y": 10
        }, {
            "x": 10,
            "y": 120
        }
        // , {
        //     "x": 450,
        //     "y": 120
        // }

    ];

    var svgContainer = d3.select("body").append("svg")
        .attr("width", 500)
        .attr("height", 500);

    var group = svgContainer.append("g")
    .attr("transform", "translate(50, 50)");

    var line = d3.svg.line()
        .x(function(d) {
            return d.x;
        })
        .y(function(d) {
            return d.y;
        })
        .interpolate("basis");

    group.append("path")
        .data(data)
        .attr("class", "line")
        .attr("d", line(data))
        .attr("fill", "none")
        .attr("stroke-width", 0.6)
        .attr("stroke", "#15897a");


});
