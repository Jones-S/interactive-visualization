
$(document).ready(function() {
var svg = d3.select("body")
            .append("svg")
            .attr("width", 600)
            .attr("height", 600);

var rad = 100;
	centerX = 300;
	centerY =300;

var circle = svg.append("circle")
				.attr("cx", centerX)
				.attr("cy", centerY)
				.attr("r", rad)
				.style("fill", "white")
				.style("stroke-width", 2)
				.style("stroke", "black");

});