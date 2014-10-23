$(document).ready(function() {


var o = {
    init: function(){
        this.diagram();
    },
    random: function(l, u){
        return Math.floor((Math.random()*(u-l+1))+l);
    },
    diagram: function(){
        var originX = 10;
        var originY = 50;
        var barHeight = 30;
        var barMargin = 10;

        var r = Raphael('diagram', 600, 600);

        // We don't need the customAttributes, so we drop that,
        // and replace with a simple call to rect()
        r.rect(10,10,300,barHeight,6).attr({ stroke: 'none', fill: '#193340' });
        // Similarly, we reposition the title to center
        // it with our new rectangle.
        var title = r.text(160, 25, 'Skills').attr({
            font: '20px Arial',
            fill: '#fff'
        }).toFront();

        $('.get').find('.skill').each(function(i){
            // I've added in a width field, and calculate
            // it based on turning its value to a percentage
            // of the width of the Raphael element.
            var t = $(this),
                color = t.find('.color').val(),
                value = t.find('.percent').val(),
                width = r.width * (t.find('.percent').val() *.01),
                text = t.find('.text').text();
            // create a new rectangle, providing X, Y, width,
            // and height. Base the fill and stroke on the color
            var z = r.rect(originX, originY, width, barHeight).attr({ 'fill': color, 'stroke': color, 'stroke-width':0 });
            // update our originY to accomodate shifting the next
            // bar down by the barHeight + barMargin
            originY = originY + barHeight + barMargin;

            z.mouseover(function(){
                // I added X in to animation, so that it would
                // appear to expand from the left, and the
                // expansion would not bleed off-canvas
                this.animate({ 'x': 10, 'stroke-width': 20, opacity: .75 }, 1000, 'elastic');
                if(Raphael.type != 'VML') //solves IE problem
                    this.toFront();
                title.animate({ opacity: 0 }, 500, '>', function(){
                    this.attr({ text: text + ': ' + value + '%' }).animate({ opacity: 1 }, 500, '<');
                });
            }).mouseout(function(){
                // and here I revert back to the originX after the
                // mouse has moved on...
                this.animate({ x: originX, 'stroke-width': 0, opacity: 1 }, 1000, 'elastic');
            });
        });
    }
}

$(function(){ o.init(); });

});