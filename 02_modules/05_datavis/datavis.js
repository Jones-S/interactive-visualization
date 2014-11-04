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
    var minSize = 2; //min radius of circles independent of population
    var maxTraffCost = _.max(_.pluck(data["gemeinden"], "trafficCosts")); //use loDash to get max
    var lineAngleStep = Math.PI / 100; //in radians
    //calc circle count and angle step
    var increase = Math.PI * 2 / data["gemeinden"].length;
    var angle = 0;
    var rad = 120; //radius of circle with circles on it

    // fill circle info array
    var circleInfo = [];

    var gemObject = {};
    _(data["gemeinden"]).forEach(function(gem, i){
        gemObject = {
            "name" : data["gemeinden"][i]["gemeinde"],
            "centerPos" : { "xM" : 0, "yM" : 0 },
            "connections" : {}
            //     // how the content will look like
            //     // "0-0" : {   "delta" : 0,
            //     //             "pathEnds" : [{ "x" : 0, "y" : 0}] //x und y pos of path ending on the circle, can have more than one element with x,y if more than 1 line
            //     //         }
            // ]
        };

        var object = {};

        _.forEach(gem["nach"], function(obj, j){
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
            var lines = Math.abs(Math.round(elem["delta"]/20)); //e.g. 7 lines for 140 people
            totalLines += lines;
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
            var firstRight = obj["angle"] - halfLines * lineAngleStep;
            var firstLeft = obj["angle"] + halfLines * lineAngleStep;
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
        console.log("increment : " + increment + " minusStep : " + minusStep + " plusStep : " + plusStep + " cncts : " + cncts);

        for (var j = increment; j >= 0; j--) {
            // console.log("My J: " + j);
            if(minusStep >= 0){
                console.log("from right " + i + " - " + minusStep);
                curKey = i + "-" + minusStep; // "3-2"
                // console.log(obj["connections"][curKey]);
                _.forEach(obj["connections"][curKey]["pathEnds"], function(elem){
                    curAttach = startRight + (indexFromRight * lineAngleStep); //calc current Attachment point for line from left
                    x = rad * Math.cos(curAttach) + bgCircCenterX; //calc x depending on current attachment point
                    y = rad * Math.sin(curAttach) + bgCircCenterY; //calc x depending on current attachment point
                    indexFromRight ++; //increase counter from left
                    elem["x"] = x;
                    elem["y"] = y;
                });
                minusStep --;
            }

            if (plusStep <= cncts ) {
                // console.log("i: " + i);
                curKey = i + "-" + plusStep; // "3-7"
                console.log(curKey);
                _.forEach(obj["connections"][curKey]["pathEnds"], function(elem){
                    curAttach = startLeft - (indexFromLeft * lineAngleStep); //calc current Attachment point for line from left
                    x = rad * Math.cos(curAttach) + bgCircCenterX; //calc x depending on current attachment point
                    y = rad * Math.sin(curAttach) + bgCircCenterY; //calc x depending on current attachment point
                    indexFromLeft ++; //increase counter from left
                    elem["x"] = x;
                    elem["y"] = y;
                    console.log(elem);
                });
                plusStep ++;
            }
        };



        // //calc x,y for every connection
        // _.forEach(obj["connections"], function(elem, j){ //e.g. "2-3"
        //     var linesOfConnection = Math.abs(Math.round(elem["delta"]/20)); //e.g. 7
        //     var moveFromTo = j.split("-"); // split "0-2" = j into {0, 2} 0= from 2 = to
        //     var from = moveFromTo[0]; //2
        //     var to = moveFromTo[1]; //3

        //     if (from != to && from < to) { //if 1-1 dont do nothing, if 0-1, 0-2 etc start add pathends from left side of dock
        //         for (var i = linesOfConnection - 1; i >= 0; i--) { //for every line calc new x,y from left
        //             curAttach = startLeft - (indexFromLeft * lineAngleStep); //calc current Attachment point for line from left
        //             x = rad * Math.cos(curAttach) + bgCircCenterX; //calc x depending on current attachment point
        //             y = rad * Math.sin(curAttach) + bgCircCenterY; //calc x depending on current attachment point
        //             // console.log("X: " + x + "   Y: " + y + "    &k: " + k);
        //             indexFromLeft ++; //increase counter from left
        //             elem["pathEnds"][i] = {"x" : x, "y": y};
        //         };

        //     } else if ( from != to && from > to){ //if 1-1 don't do nothing, if 3-0, 3-1 etc start adding pathend coordinates from the right side
        //         for (var i = linesOfConnection - 1; i >= 0; i--) {
        //             curAttach = startRight + (indexFromRight * lineAngleStep); //calc current Attachment point for line from left
        //             x = rad * Math.cos(curAttach) + bgCircCenterX; //calc x depending on current attachment point
        //             y = rad * Math.sin(curAttach) + bgCircCenterY; //calc x depending on current attachment point
        //             indexFromRight ++; //increase counter from left
        //             elem["pathEnds"][i] = {"x" : x, "y": y};
        //             // k ++;
        //         };
        //     };
        // });

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
                    var pop = (d["population"]/11600 < minSize) ? minSize : d["population"]/11600; //if population is producing a too small circle set it to minSize
                    return pop;
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

    //draw first line
   var line = d3.svg.line()
        .x(function(d) {
            return d.x;
        })
        .y(function(d) {
            return d.y;
        })
        .interpolate("basis");

    var path = [];
    path[0] = circleInfo[0]["connections"]["0-1"]["pathEnds"][0];
    path[1] = { x: bgCircCenterX, y: bgCircCenterY };
    path[2] = circleInfo[1]["connections"]["1-0"]["pathEnds"][0];


    svgGroup.append("path")
        .data(path)
        .attr("class", "line")
        .attr("d", line(path))
        .attr("fill", "none")
        .attr("stroke-width", 0.6)
        .attr("stroke", "#15897a");

    var path = [];
    path[0] = circleInfo[0]["connections"]["0-1"]["pathEnds"][1];
    path[1] = { x: bgCircCenterX, y: bgCircCenterY };
    path[2] = circleInfo[1]["connections"]["1-0"]["pathEnds"][1];


    svgGroup.append("path")
        .data(path)
        .attr("class", "line")
        .attr("d", line(path))
        .attr("fill", "none")
        .attr("stroke-width", 0.6)
        .attr("stroke", "#15897a");

    var path = [];
    path[0] = circleInfo[0]["connections"]["0-1"]["pathEnds"][2];
    path[1] = { x: bgCircCenterX, y: bgCircCenterY };
    path[2] = circleInfo[1]["connections"]["1-0"]["pathEnds"][2];


    svgGroup.append("path")
        .data(path)
        .attr("class", "line")
        .attr("d", line(path))
        .attr("fill", "none")
        .attr("stroke-width", 0.6)
        .attr("stroke", "#c23400");

        var path = [];
    path[0] = circleInfo[0]["connections"]["0-1"]["pathEnds"][3];
    path[1] = { x: bgCircCenterX, y: bgCircCenterY };
    path[2] = circleInfo[1]["connections"]["1-0"]["pathEnds"][3];


    svgGroup.append("path")
        .data(path)
        .attr("class", "line")
        .attr("d", line(path))
        .attr("fill", "none")
        .attr("stroke-width", 0.6)
        .attr("stroke", "#edd400");


    // draw all lines
    _.forEach(circleInfo, function(obj){
        _.forEach(obj["connections"], function(elem, i){ //e.g. elem = 0-1
            var moveFromTo = i.split("-"); // split "0-2" = i into {0, 2} 0= from 2 = to
            // console.log(i);
            var from = moveFromTo[0];
            var to = moveFromTo[1];
            var reverseKey = to + "-" + from; //make "2-3" from i = "3-2"

            //draw line
            _.forEach(elem["pathEnds"], function(item, j){ //all path elements  -> array with 0-7 e.g.
                // console.log("ITEM_ :" + item["x"]);
                // console.log(reverseKey);
                var x = circleInfo[to]["connections"][reverseKey]["pathEnds"][j]["x"];
                var y = circleInfo[to]["connections"][reverseKey]["pathEnds"][j]["y"];
                // console.log("x: " + x + "y: " +y + "OF element " + to + "-" + from + " and pathend " + j);
                var path = [];
                    path[0] = {"x": item["x"] , "y": item["y"]};
                    path[1] = { x: bgCircCenterX, y: bgCircCenterY }; //center of circle as control point
                    path[2] = {"x": x , "y": y};


                svgGroup.append("path")
                    .data(path)
                    .attr("class", "line")
                    .attr("d", line(path))
                    .attr("fill", "none")
                    .attr("stroke-width", 0.6)
                    .attr("stroke", "#edd400");
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

    console.log(allStartPoints);

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
        .style("fill", "#00ed67")
        .attr("class", "startCircle");


});






});
