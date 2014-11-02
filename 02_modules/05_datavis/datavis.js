$(document).ready(function() {


    //draw svg
    var svgContainer = d3.select("body").append("svg")
        .attr("width", 600)
        .attr("height", 600);
    //add group to contain all circles
    var svgGroup = svgContainer.append("g");

    //add bg circle
    var bgCircle = svgGroup.append("circle")
        .attr("cx", 300).attr("cy", 300).attr("r", 120)
        .attr("fill", "black");

    //add circles
    var circles = svgGroup.selectAll("circle")
        .data([
            {cx: "250", cy: "300", r: "12", color: "red"},
            {cx: "300", cy: "300", r: "12", color: "red"},
            {cx: "350", cy: "300", r: "12", color: "red"},
            {cx: "400", cy: "300", r: "12", color: "red"},
            {cx: "450", cy: "300", r: "12", color: "red"},
        ])
        .enter()
        .append("circle")
        .attr("cx", function(d) { return d.cx; })
        .attr("cy", function(d) { return d.cy; })
        .attr("r", function(d) { return d.r; })
        .attr("fill", function(d) { return d.color; })

});

