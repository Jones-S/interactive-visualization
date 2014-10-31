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
    var data2 = [

        {
            "x": 0,
            "y": 0
        }, {
            "x": 425,
            "y": 525
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

    var xWidth = data[data.length - 1]["x"] - data[0]["x"];
    var yHeight = data[data.length - 1]["y"] - data[0]["y"];

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
        .attr("gradientUnits", "userSpaceOnUse") // {userSpaceOnUse, ObjectBoundingBox}
        .attr("x1", -xWidth).attr("y1", -yHeight)
        .attr("x2", xWidth).attr("y2", yHeight)
        .selectAll("stop")
        .data([{
            offset: "0%",
            color: "#e8ff00"
        }, {
            offset: "25%",
            color: "#59b39d"
        }, {
            offset: "50%",
            color: "#e8ff00"
        }, {
            offset: "75%",
            color: "#59b39d"
        }, {
            offset: "100%",
            color: "#e8ff00"
        }])
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
        .attr("xWidth", xWidth) //add height & width of path bounding box
        .attr("yHeight", yHeight)
        .attr("stroke", "url(#grad1)");

    var path2 = group.append("path")
        .data(data2)
        .attr("class", "line2")
        .attr("d", line(data2))
        .attr("stroke-width", 0.9)
        .attr("stroke", "url(#grad1)");


    var gradient = d3.select("#grad1")

    var doubleclick = $("svg");

    function moveGradient() {
        gradient.transition()
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", 2*xWidth).attr("y2", 2*yHeight)
            .duration(2500)
            .ease("linear")
            // .ease("elastic")
            // .delay(100)
            .each("end", myCallback);
    }

    function myCallback() {
        // alert("Double Clicked");
        gradient.attr("x1", -xWidth).attr("y1", -yHeight)
        .attr("x2", xWidth).attr("y2", yHeight)
        moveGradient();

    }

    $("svg").dblclick(function() {
        // alert(d3.select(".line2").attr("width"));
        var totalLength = path2.node().getTotalLength();
        console.log(totalLength);
        moveGradient();

    });


});
