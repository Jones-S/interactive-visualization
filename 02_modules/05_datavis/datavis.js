$(document).ready(function() {

//first load json data into array
//because json is loaded asynchronously, all functions concerning data are written inside
var data;

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
            // "connections" : [
            //     // how the content will look like
            //     // "0-0" : {   "delta" : 0,
            //     //             "pathEnds" : [{ "x" : 0, "y" : 0}] //x und y pos of path ending on the circle, can have more than one element with x,y if more than 1 line
            //     //         }
            // ]
        };

        var object = {};
        var connections = [];

        _(data["gemeinden"]).forEach(function(gem, j){
            var key = i + "-" + j; //e.g. "0-1" > from gemeinde 0 to gemeinde 1
            //now calculate delta between the gemeinden including itself (always 0)
            object[key] = { delta: data["gemeinden"][j]["nach"][i] - data["gemeinden"][i]["nach"][j],
                pathEnds: []
            };
        });
        connections.push(object); //
        gemObject["connections"] = connections;
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

        _.forEach(obj["connections"][0], function(elem){
            var lines = Math.abs(Math.round(elem["delta"]/20)); //e.g. 7 lines for 140 people
            totalLines += lines;
        })
        obj["totalLines"] = totalLines;
            //calc startAngle (lineAngle) for first line
            var even = (obj["totalLines"] % 2 == 0); //check if line count is even or odd
            var halfLines = 0;
            if (even) {
                halfLines = obj["totalLines"]/2;
                console.log(halfLines);
                halfLines -= 0.5; //because in the center is no point
                console.log(halfLines);
            } else {
                halfLines = Math.floor(obj["totalLines"]/2); //round floor because if odd -> one pathending will be centered
            };
            //set first points form left and right in dock
            var firstLeft = obj["angle"] + halfLines * lineAngleStep;
            var firstRight = obj["angle"] - halfLines * lineAngleStep;
            obj["firstPoints"] = { "left" : firstLeft, "right" : firstRight }; //save them to the array
            if(obj["totalLines"] > 0){
        };
    });

    //set all x,y of paths in center or the circles
    _.forEach(circleInfo, function(obj){
        var x = obj["centerPos"]["xM"];
        var y = obj["centerPos"]["yM"];
        _.forEach(obj["connections"][0], function(elem){
            for (var i = Math.abs(Math.round(elem["delta"]/20)) - 1; i >= 0; i--) { //for every line (calc first)
                elem["pathEnds"].push({ "x": x , "y": y });
            };
        });

    });

    //move x,y of pathends
    _.forEach(circleInfo, function(obj, i){
        var totalLines = obj["totalLines"];
        var moveFrom = i;
        var startLeft = obj.firstPoints.left;
        var startRight = obj.firstPoints.right;
        var x;
        var y;
        var indexFromLeft = 0; //how many lines were added from left
        var indexFromRight = 0; //respectively from the right side
        var curAttach; //saves the current attachment point

        //calc x,y for every connection
        _.forEach(obj["connections"][0], function(elem, j){
            var linesOfConnection = Math.abs(Math.round(elem["delta"]/20)); //e.g. 7
            var moveFromTo = j.split("-"); // split "0-2" = j into {0, 2} 0= from 2 = to
            var from = moveFromTo[0];
            var to = moveFromTo[1];
            var k = 0; //counts which connection i'm moving -> index for array with all (x,y) pathendings

            if (from != to && from < to) { //if 1-1 dont do nothing, if 0-1, 0-2 etc start add pathends from left side of dock
                for (var i = linesOfConnection - 1; i >= 0; i--) { //for every line calc new x,y from left
                    curAttach = startLeft - (indexFromLeft * lineAngleStep); //calc current Attachment point for line from left
                    x = rad * Math.cos(curAttach) + bgCircCenterX; //calc x depending on current attachment point
                    y = rad * Math.sin(curAttach) + bgCircCenterY; //calc x depending on current attachment point
                    // console.log("X: " + x + "   Y: " + y + "    &k: " + k);
                    indexFromLeft ++; //increase counter from left
                    elem["pathEnds"][k] = {"x" : x, "y": y};
                    // console.log(k);
                    k ++;
                };

            } else if ( from != to && from > to){ //if 1-1 don't do nothing, if 3-0, 3-1 etc start adding pathend coordinates from the right side
                for (var i = linesOfConnection - 1; i >= 0; i--) {
                    curAttach = startRight + (indexFromRight * lineAngleStep); //calc current Attachment point for line from left
                    x = rad * Math.cos(curAttach) + bgCircCenterX; //calc x depending on current attachment point
                    y = rad * Math.sin(curAttach) + bgCircCenterY; //calc x depending on current attachment point
                    indexFromRight ++; //increase counter from left
                    elem["pathEnds"][k] = {"x" : x, "y": y};
                    // console.log(k);
                    k ++;
                };
            };
        });

        //access key [from - to], e.g. "1-0"


    });


    console.log(circleInfo);


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
    path[0] = circleInfo[0]["connections"][0]["0-1"]["pathEnds"][0];
    path[1] = { x: bgCircCenterX, y: bgCircCenterY };
    path[2] = circleInfo[1]["connections"][0]["1-0"]["pathEnds"][0];


    svgGroup.append("path")
        .data(path)
        .attr("class", "line")
        .attr("d", line(path))
        .attr("fill", "none")
        .attr("stroke-width", 0.6)
        .attr("stroke", "#15897a");

    var path = [];
    path[0] = circleInfo[0]["connections"][0]["0-1"]["pathEnds"][1];
    path[1] = { x: bgCircCenterX, y: bgCircCenterY };
    path[2] = circleInfo[1]["connections"][0]["1-0"]["pathEnds"][1];


    svgGroup.append("path")
        .data(path)
        .attr("class", "line")
        .attr("d", line(path))
        .attr("fill", "none")
        .attr("stroke-width", 0.6)
        .attr("stroke", "#15897a");

    var path = [];
    path[0] = circleInfo[0]["connections"][0]["0-1"]["pathEnds"][2];
    path[1] = { x: bgCircCenterX, y: bgCircCenterY };
    path[2] = circleInfo[1]["connections"][0]["1-0"]["pathEnds"][2];


    svgGroup.append("path")
        .data(path)
        .attr("class", "line")
        .attr("d", line(path))
        .attr("fill", "none")
        .attr("stroke-width", 0.6)
        .attr("stroke", "#c23400");

        var path = [];
    path[0] = circleInfo[0]["connections"][0]["0-1"]["pathEnds"][3];
    path[1] = { x: bgCircCenterX, y: bgCircCenterY };
    path[2] = circleInfo[1]["connections"][0]["1-0"]["pathEnds"][3];


    svgGroup.append("path")
        .data(path)
        .attr("class", "line")
        .attr("d", line(path))
        .attr("fill", "none")
        .attr("stroke-width", 0.6)
        .attr("stroke", "#edd400");


    // _(circleInfo).forEach(function(num){ console.log("hey " + num["centerPos"]["yM"])});


});






});
