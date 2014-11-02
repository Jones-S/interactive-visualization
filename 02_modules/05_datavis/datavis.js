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
    var dockLineDist = 0.3; //in px
    //calc circle count and angle step
    var increase = Math.PI * 2 / data["gemeinden"].length;
    var angle = 0;
    var rad = 90; //radius of circle with circles on it

    // fill circle info array
    var circleInfo = [];

    var gemObject = {};
    _(data["gemeinden"]).forEach(function(gem, i){
        gemObject = {
            "name" : data["gemeinden"][i]["gemeinde"],
            "centerPos" : { "xM" : 0, "yM" : 0 },
            "connections" : [
                // how the content will look like
                // "0-0" : {   "delta" : 0,
                //             "pathEnds" : [{ "px" : 0, "py" : 0}] //x und y pos of path ending on the circle, can have more than one element with x,y if more than 1 line
                //         }
            ],
            "totalDeltas": 0
        };

        var object = {};
        var connections = [];

        _(data["gemeinden"]).forEach(function(gem, j){
            var key = i + "-" + j; //e.g. "0-1" > from gemeinde 0 to gemeinde 1
            //now calculate delta between the gemeinden including itself (always 0)
            object[key] = {
                delta: data["gemeinden"][j]["nach"][i] - data["gemeinden"][i]["nach"][j],
                pathEnds: []
            };

        });
        connections.push(object);


        gemObject["connections"] = connections;
        circleInfo.push(gemObject);

    });


    //calc total lines from circle(=gemeinde) with index i
    //therefore add all deltas (and ignore minus token)
    _.forEach(circleInfo, function(obj, i) { //called 5 times with 5 circles
        var totalDeltas = 0; //set total people moving (delta) to 0
        _.forEach(obj["connections"][0], function(conn){
            // console.log(conn["delta"]);
            totalDeltas += Math.abs(conn["delta"]); //add all deltas and make the positive
        });
        obj["totalDeltas"] = totalDeltas; //set totalDelta to each gemeinde in circleInfo Array
    });

    //calc width of space where lines are attached to circle
    _.forEach(circleInfo, function(obj){
        obj["dockWidth"] = Math.round(obj["totalDeltas"]/20);
    });

    //calc all positions of the lines
    _.forEach(circleInfo, function(obj){
        var even = (obj["dockWidth"] % 2 == 0); //check if line count is even or odd
        var lineAngleStep = Math.PI/dockLineDist;

        var cx = rad * Math.cos(angle) + bgCircCenterX; //calc x of M of circle
        obj["centerPos"]["xM"] = cx;
        var cy = rad * Math.sin(angle) + bgCircCenterY;
        obj["centerPos"]["yM"] = cy;
        obj["angle"] = angle;
        angle += increase;

        if (even) {
            var halfLines = obj["dockWidth"]/2;
            //set first point
            var lineAngle = obj["angle"] - halfLines * lineAngleStep;
            console.log(lineAngle);
            for (var i = obj["dockWidth"]; i >= 0; i--) {
                // calc x,y of path endings
                var x = rad * Math.cos(lineAngle) + bgCircleCenterX;
                var y = rad * Math.sin(lineAngle) + bgCircleCenterY;
                lineAngle += lineAngleStep;
                obj["connections"]
            };
        } else {
            var halfLines = Math.floor(obj["dockWidth"]/2); //round floor because if odd -> one pathending will be centered
            //set first point
            var lineAngle = obj["angle"] - halfLines * lineAngleStep;
            console.log(lineAngle);
        };
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

    // _(circleInfo).forEach(function(num){ console.log("hey " + num["centerPos"]["yM"])});


});






});
