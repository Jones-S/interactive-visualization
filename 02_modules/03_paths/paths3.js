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


    var svgContainer = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var group = svgContainer.append("g");

    var line = d3.svg.line()
        .x(function(d) {
            return d.x;
        })
        .y(function(d) {
            return d.y;
        })
        .interpolate("bundle");


    group.append("linearGradient")
        .attr("id", "grad1")
        .attr("gradientUnits", "userSpaceOnUse")  // {userSpaceOnUse, ObjectBoundingBox}
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", 392).attr("y2", 482)
        .selectAll("stop")
        .data([
            {offset: "0%", color: "#e8ff00"},
            {offset: "33%", color: "#59b39d"},
            {offset: "66%", color: "#e8ff00"},
            {offset: "100%", color: "#59b39d"}
        ])
        .enter().append("stop")
        .attr("offset", function(d) {
            return d.offset;
        })
        .attr("stop-color", function(d) {
            return d.color;
        });

    group.append("path")
      .data(data)
      .attr("class", "line")
      .attr("d", line(data))
      .attr("stroke-width", 0.6)
      .attr("stroke", "url(#grad1)");


    var doubleclick = $("svg");
    doubleclick.dblclick(function() {
        // alert("Double Clicked");
        var gradient = d3.select("#grad1").transition()
            .attr("x1", 150).attr("y1", 200)
            .attr("x2", 530).attr("y2", 680)
            .duration(4000)
            // .ease("elastic")
            .delay(100);


    });



});
