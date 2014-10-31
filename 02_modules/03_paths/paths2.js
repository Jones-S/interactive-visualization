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
            "y": 500
        }

    ];

    var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y%m%d").parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);
    var y = d3.scale.linear()
        .range([height, 0]);

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


    group.append("linearGradient")
        .attr("id", "temperature-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", y(50))
        .attr("x2", 0).attr("y2", y(60))
        .selectAll("stop")
        .data([
            {offset: "0%", color: "red"},
            {offset: "0.001%", color: "black"},
            {offset: "11%", color: "black"},
            {offset: "62%", color: "black"},
            {offset: "62%", color: "lawngreen"},
            {offset: "100%", color: "lawngreen"}
        ])
        .enter().append("stop")
        .attr("offset", function(d) {
            return d.offset;
        })
        .attr("stop-color", function(d) {
            return d.color;
        });

    // var paths = group.selectAll("path")
    //     .data(data)
    //     .enter()
    //     .append("path")
    //     .attr("d", line(data))
    //     .attr("fill", "none")
    //     .attr("stroke-width", 0.6)
    //     .attr("stroke", "#15897a");

    group.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);


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
