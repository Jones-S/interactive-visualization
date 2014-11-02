$(document).ready(function() {

//first load json data into array
//because json is loaded asynchronously, all functions concerning data are written inside
var data;

//mapping function
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}


d3.json("data.json", function(error, json) {
    if (error) return console.warn(error);
    data = json;

    // some necessary global vars
    var width = $(window).width();
    var height = $(window).height();
    var minSize = 2; //min radius of circles independent of population
    var maxTraffCost = _.max(_.pluck(data["gemeinden"], "trafficCosts")); //use loDash to get max

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

    console.log(circleInfo);

    //calc total lines from circle(=gemeinde) with index i
    //therefore add all deltas (and ignore minus token)
    _.forEach(circleInfo, function(obj, i) { //called 5 times with 5 circles
        var totalDeltas = 0; //set total people moving (delta) to 0
        // console.log(obj);
        _.forEach(obj["connections"][i], function(conn, i){
            console.log(conn["delta"]);
            totalDeltas += Math.abs(conn["delta"]); //add all deltas and make the positive
        });

        obj["totalDeltas"] = totalDeltas;

    });


    console.log(circleInfo[0]["totalDeltas"]);




    //draw svg
    var svgContainer = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
    //add group to contain all circles
    var svgGroup = svgContainer.append("g");

    //calc circle count and angle step
    var increase = Math.PI * 2 / data["gemeinden"].length;
    var angle = 0;
    var rad = 90; //radius of circle with circles on it

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
                        var cx = rad * Math.cos(angle) + width/2;
                        circleInfo[i]["centerPos"]["xM"] = cx;
                        return cx;
                    },
                cy: function(){
                        var cy = rad * Math.sin(angle) + height/2;
                        circleInfo[i]["centerPos"]["yM"] = cy;
                        angle += increase;
                        return cy;
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
