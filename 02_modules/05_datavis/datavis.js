$(document).ready(function() {

//first load json data into array
//because json is loaded asynchronously, all functions concerning data are written inside
var data;

var sum = _.reduce([1, 2, 3], function(sum, num) {
  return sum + num;
});
console.log(sum);
// → 6

//mapping function
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

// round to 5 function
function round5(x)
{ return Math.round(x/5)*5; }


d3.json("data.json", function(error, json) {
    if (error) return console.warn(error);
    data = json;

    // some necessary global vars
    var width = $(window).width();
    var height = $(window).height();
    var bgCircCenterX = width/2;
    var bgCircCenterY = height/2;
    var minSize = 2; //min radius of circles independent of population in px
    var maxTraffCost = _.max(_.pluck(data["gemeinden"], "trafficCosts")); //use loDash to get max
    var lineAngleStep = Math.PI / 100; //in radians
    //calc circle count and angle step
    var increase = Math.PI * 2 / data["gemeinden"].length;
    var angle = 0;
    var rad = 120; //radius of circle with circles on it
    var lines; //holds all paths
    var animFlag = false; //defines if animation should be played

    // fill circle info array
    var circleInfo = [];

    var gemObject = {};
    _(data["gemeinden"]).forEach(function(obj, i){
        var pop = ((obj["population"]/11600 < minSize) ? minSize : obj["population"]/11600)
        gemObject = {
            "name" : data["gemeinden"][i]["gemeinde"],
            "centerPos" : { "xM" : 0, "yM" : 0 },
            "connections" : {},
            "circleRad" : pop,
            //     // how the content will look like
            //     // "0-0" : {   "delta" : 0,
            //     //             "pathEnds" : [{ "x" : 0, "y" : 0}] //x und y pos of path ending on the circle, can have more than one element with x,y if more than 1 line
            //     //         }
            // ]
        };

        var object = {};

        _.forEach(obj["nach"], function(elem, j){
            var key = i + "-" + j; //e.g. "0-1" > from gemeinde 0 to gemeinde 1
            //now calculate delta between the gemeinden including itself (always 0)
            gemObject["connections"][key] = { "delta": data["gemeinden"][j]["nach"][i] - data["gemeinden"][i]["nach"][j],
                "pathEnds": []
            };
        });

        circleInfo.push(gemObject);

    });

    //calc all positions of the lines
    _.forEach(circleInfo, function(obj){
        var cx = rad * Math.cos(angle) + bgCircCenterX; //calc x of M of circle
        obj["centerPos"]["xM"] = cx;
        var cy = rad * Math.sin(angle) + bgCircCenterY;
        obj["centerPos"]["yM"] = cy;
        obj["angle"] = angle;
        angle += increase;
        var totalLines = 0;

        _.forEach(obj["connections"], function(elem){
            var objLines = Math.abs(Math.round(elem["delta"]/20)); //e.g. 7 lines for 140 people
            totalLines += objLines;
        })
        obj["totalLines"] = totalLines;
            //calc startAngle (lineAngle) for first line
            var even = (obj["totalLines"] % 2 == 0); //check if line count is even or odd
            var halfLines = 0;
            if (even) {
                halfLines = obj["totalLines"]/2;
                // console.log(halfLines);
                halfLines -= 0.5; //because in the center is no point
                // console.log(halfLines);
            } else {
                halfLines = Math.floor(obj["totalLines"]/2); //round floor because if odd -> one pathending will be centered
            };
            //set first points form left and right in dock
            var angleShift = (((obj["circleRad"]*2 - (obj["circleRad"]/3)) / rad)/ totalLines); // still in px ... (obj["circleRad"]*2 ~ b = alpha * rad
            // var angleShift = 0.01;
            obj["angleShift"] = angleShift;
            console.log("angleShift: " + angleShift);
            var firstRight = obj["angle"] - halfLines * angleShift;
            var firstLeft = obj["angle"] + halfLines * angleShift;
            obj["firstPoints"] = { "left" : firstLeft, "right" : firstRight }; //save them to the array
            if(obj["totalLines"] > 0){
        };
    });


    //set all x,y of paths in center or the circles
    _.forEach(circleInfo, function(obj){
        var x = obj["centerPos"]["xM"];
        var y = obj["centerPos"]["yM"];
        _.forEach(obj["connections"], function(elem){
            for (var i = Math.round( Math.abs(elem["delta"]/20 )) - 1; i >= 0; i--) { //for every line (calc first) -> Math.abs FIRST!!!
                elem["pathEnds"].push({ "x": x , "y": y });
            };
        });

    });
    // console.log(circleInfo);
    // console.log(circleInfo[0]["connections"]["0-1"]);

    window.circleInfo = circleInfo;


    //move x,y of pathends
    _.forEach(circleInfo, function(obj, i){ //e.g. {"connection" : ..., "name" ...} etc
        var totalLines = obj["totalLines"];
        var angleShift = obj["angleShift"];
        var curIndex = i;
        var startLeft = obj["firstPoints"]["left"];
        var startRight = obj["firstPoints"]["right"];
        var x;
        var y;
        var indexFromLeft = 0; //how many lines were added from left
        var indexFromRight = 0; //respectively from the right side
        var curAttach; //saves the current attachment point
        var curKey;

        var cncts = _.size(obj["connections"]) - 1; //e.g. 7
        var minusStep = curIndex; //set step to start-index
        var plusStep = curIndex;

        var increment = (curIndex >= (cncts - curIndex)) ? curIndex : (cncts - curIndex); //set increment var for for loop
        // console.log("increment : " + increment + " minusStep : " + minusStep + " plusStep : " + plusStep + " cncts : " + cncts);

        for (var j = increment; j >= 0; j--) {
            // console.log("My J: " + j);
            if(minusStep >= 0){
                curKey = i + "-" + minusStep; // "3-2"
                _.forEach(obj["connections"][curKey]["pathEnds"], function(elem){
                    curAttach = startRight + (indexFromRight * angleShift); //calc current Attachment point for line from left
                    x = rad * Math.cos(curAttach) + bgCircCenterX; //calc x depending on current attachment point
                    y = rad * Math.sin(curAttach) + bgCircCenterY; //calc x depending on current attachment point
                    indexFromRight ++; //increase counter from left
                    elem["x"] = x;
                    elem["y"] = y;
                });
                minusStep --;
            }

            if (plusStep <= cncts ) {
                curKey = i + "-" + plusStep; // "3-7"
                _.forEach(obj["connections"][curKey]["pathEnds"], function(elem){
                    curAttach = startLeft - (indexFromLeft * angleShift); //calc current Attachment point for line from left
                    x = rad * Math.cos(curAttach) + bgCircCenterX; //calc x depending on current attachment point
                    y = rad * Math.sin(curAttach) + bgCircCenterY; //calc x depending on current attachment point
                    indexFromLeft ++; //increase counter from left
                    elem["x"] = x;
                    elem["y"] = y;
                });
                plusStep ++;
            }
        };

    });




    //draw svg
    var svgContainer = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
    //add group to contain all circles
    var svgGroup = svgContainer.append("g");

    //add bg circle
    var bgCircle = svgGroup.append("circle")
        .attr("cx", width/2).attr("cy", height/2).attr("r", rad)
        .style("fill", "none")
        .style("stroke-dasharray", ("3,3")) // make the stroke dashed
        .style("stroke", "rgba(255, 255, 255, 0.5)");

    //add circles
    var gemCircles = svgGroup.selectAll(".dataCircle")
        .data(data["gemeinden"])
        .enter()
        .append("circle");

    var gemCircAttr = gemCircles
        .each(function(d, i){
            d3.select(this).attr({
                cx: function(){
                        return circleInfo[i]["centerPos"]["xM"];
                    },
                cy: function(){
                        return circleInfo[i]["centerPos"]["yM"];
                    },
                r: function(d){
                        return circleInfo[i]["circleRad"];
                    }, //todo: write mapping function and set a max size
                fill: function(d) {
                    //use mapping function to map trafficCosts to RGB from 0 - 255
                    var colorMap = map_range(d["trafficCosts"], 0, maxTraffCost, 255, 120 );
                    colorMap = Math.floor(colorMap); //and round it to whole numbers to use as rgb
                    // console.log(colorMap + " - " + d["trafficCosts"]);
                    return "rgba(" + colorMap +", 0, 0, 0.8)";
                    }
            })
        })

   var line = d3.svg.line()
        .x(function(d) {
            return d.x;
        })
        .y(function(d) {
            return d.y;
        })
        .interpolate("basis");

    // draw all lines
    _.forEach(circleInfo, function(obj){
        _.forEach(obj["connections"], function(elem, i){ //e.g. elem = 0-1
            var moveFromTo = i.split("-"); // split "0-2" = i into {0, 2} 0= from 2 = to
            var from = moveFromTo[0];
            var to = moveFromTo[1];
            var reverseKey = to + "-" + from; //make "2-3" from i = "3-2"

            //draw line
            _.forEach(elem["pathEnds"], function(item, j){ //all path elements  -> array with 0-7 e.g.
                var x = circleInfo[to]["connections"][reverseKey]["pathEnds"][j]["x"];
                var y = circleInfo[to]["connections"][reverseKey]["pathEnds"][j]["y"];
                var path = [];
                    path[0] = {"x": item["x"] , "y": item["y"]};
                    path[1] = { x: bgCircCenterX, y: bgCircCenterY }; //center of circle as control point
                    path[2] = {"x": x , "y": y};


                lines = svgGroup.append("path")
                    .data(path)
                    .attr("class", "line")
                    .attr("d", line(path))
                    .style("fill", "none")
                    .style("stroke-width", 0.6)
                    .style("stroke", "rgba(254, 255, 223, 0.82)")
                    .style("stroke-dasharray", "6")

            });
        });
    });


    //get all first left and first right angles and save it into new array
    var allStartPoints = [];
    _.forEach(circleInfo, function(obj) {
        var object = {};
        x = rad * Math.cos(obj["firstPoints"]["left"]) + bgCircCenterX;
        y = rad * Math.sin(obj["firstPoints"]["left"]) + bgCircCenterY;
        object = {"x" : x, "y": y};
        allStartPoints.push(object);
        var object = {};
        x = rad * Math.cos(obj["firstPoints"]["right"]) + bgCircCenterX;
        y = rad * Math.sin(obj["firstPoints"]["right"]) + bgCircCenterY;
        object = {"x" : x, "y": y};
        allStartPoints.push(object);
    });


    var startPoints = svgGroup.selectAll(".startCircle")
        .data(allStartPoints)
        .enter()
        .append("circle");

    var startPointAttr = startPoints
        .each(function(d, i){
            d3.select(this).attr({
                cx: function(d){
                        return d.x;
                    },
                cy: function(d){
                        return d.y;
                    }
            })
        })
        .attr("r", "3")
        .style("fill", "rgba(0, 237, 103, .4)")
        .attr("class", "startCircle");

    //animate lines
    function transition() {
        console.log("Dr. Jones: ");
        if(animFlag){
            d3.selectAll(".line").transition().duration(1000).ease("linear")
            .style("stroke-dashoffset", "12")
            .each("end", function() {
                d3.selectAll(".line").style("stroke-dashoffset", "0");
                transition();
            });
        }
    }

    //start animation on dblclick
    $("svg").dblclick(function() {
        if(animFlag){
            animFlag = false;
        } else {
            animFlag = true;
            transition();
        }

    });

    // transition();


}); //d3 json event
}); //jquery document ready
