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
    var dockLineDist = Math.PI / 100; //in radians
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
        var lineAngleStep = dockLineDist;
        var totalLines = 0;

        _.forEach(obj["connections"][0], function(elem){
            var lines = Math.abs(Math.round(elem["delta"]/20)); //e.g. 7 lines for 140 people
            totalLines += lines;
        })
        obj["totalLines"] = totalLines;

        //calc startAngle (lineAngle) for first line
        var even = (obj["totalLines"] % 2 == 0); //check if line count is even or odd
        if (even) {
            var halfLines = obj["totalLines"]/2;
            //set first point
            var lineAngle = obj["angle"] - halfLines * lineAngleStep;
            // console.log(lineAngle);
        } else {
            var halfLines = Math.floor(obj["totalLines"]/2); //round floor because if odd -> one pathending will be centered
            //set first point
            var lineAngle = obj["angle"] - halfLines * lineAngleStep;
        };

    });

    //set all x,y of paths in center or the circles
    _.forEach(circleInfo, function(obj){
            // var x = rad * Math.cos(lineAngle) + bgCircCenterX;
            // var y = rad * Math.sin(lineAngle) + bgCircCenterY;
            // lineAngle += lineAngleStep;
            var x = obj["centerPos"]["xM"];
            var y = obj["centerPos"]["yM"];
            _.forEach(obj["connections"][0], function(elem){
                for (var i = Math.abs(Math.round(elem["delta"]/20)) - 1; i >= 0; i--) { //for every line (calc first)
                    elem["pathEnds"].push({ "x": x , "y": y });
                };
            });

    });

    //move x,y of pathends

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
    path[2] = circleInfo[1]["connections"][0]["1-0"]["pathEnds"][6];


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
    path[2] = circleInfo[1]["connections"][0]["1-0"]["pathEnds"][5];


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
    path[2] = circleInfo[1]["connections"][0]["1-0"]["pathEnds"][4];


    svgGroup.append("path")
        .data(path)
        .attr("class", "line")
        .attr("d", line(path))
        .attr("fill", "none")
        .attr("stroke-width", 0.6)
        .attr("stroke", "#15897a");

        var path = [];
    path[0] = _.last(circleInfo[0]["connections"][0]["0-1"]["pathEnds"]);
    path[1] = { x: bgCircCenterX, y: bgCircCenterY };
    path[2] = circleInfo[1]["connections"][0]["1-0"]["pathEnds"][0];


    svgGroup.append("path")
        .data(path)
        .attr("class", "line")
        .attr("d", line(path))
        .attr("fill", "none")
        .attr("stroke-width", 0.6)
        .attr("stroke", "#15897a");


    // _(circleInfo).forEach(function(num){ console.log("hey " + num["centerPos"]["yM"])});


});






});
