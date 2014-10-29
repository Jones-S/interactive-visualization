$(document).ready(function() {

    var nums = [80, 53, 125, 200, 28, 97]; //werte für balken
    var names = ["Opfikon", "Schleinikon", "Weiningen", "Niederweningen", "Zürich", "Bonstetten"]

    var paper = Raphael("graph", 800, 800);

    // var bars = document.getElementsByTagName("rect");
    for (var i = 0; i < nums.length; i++) {
    	var posY = i*30;
    	var t = paper.text(20, posY+3, names[i] )
    		.attr({'text-anchor': 'start'})
    	;
        var rect = paper.rect(120, posY, nums[i], 10)
        	.attr({
			    'fill': '#c51d00',
			    'stroke': '#000000',
			    'stroke-width': '0.3'
			});
        // var bar = bars.item(i);
        // bar.setAttribute("height", nums[i]);
    }



});


