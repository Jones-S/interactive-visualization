$(document).ready(function() {




	var data = [

			{x: 10, y: 20},
			{x: 40, y: 60},
			{x: 50, y: 70}

		];

		var group = canvas.append("g")
			.attr("transform", "translate(100, 100)");

		var line = d3.svg.line()
			.x(function (d) {return d.x;})
			.y(function (d) {return d.y;});

		var paths = group.selectAll("path")
			.data(data)
			.enter()
			.append("path")
			.attr("d", line)
			.attr("fill", "none")
			.attr("stroke-width", 10)
			.attr("stroke", "red");
			

			});
