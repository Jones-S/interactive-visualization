$(document).ready(function() {

//first load json data into array
//because json is loaded asynchronously, all functions concerning data are written inside
var data;

//mapping function
function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

//allow deep plucking
_.mixin(
    {
        'pluck': _.wrap(
            _.pluck,
            function (oldpluck, collection, props) {
                if (_.isArray(props)) {
                    var reply = collection;
                    _.forEach(props, function (prop) {
                        reply = oldpluck(reply, prop);
                    });
                    return reply;
                } else {
                    return oldpluck(collection, props);
                }
            }
        )
    },
    { 'chain': true }
);



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
                // "0-0" : {   "diff" : 0,
                //             "pathEnds" : [{ "px" : 0, "py" : 0}] //x und y pos of path ending on the circle, can have more than one element with x,y if more than 1 line
                //         }
            ]
        };

        var object = {};
        var paths = []; //this container will hold all the delta (effective people exchange)

        _(data["gemeinden"]).forEach(function(gem, j){
            var key = i + "-" + j; //e.g. "0-1" > from gemeinde 0 to gemeinde 1
            //now calculate delta between the gemeinden including itself (always 0)
            object[key] = {
                diff: data["gemeinden"][j]["nach"][i] - data["gemeinden"][i]["nach"][j],
                pathEnds: []
            }
        });

        paths.push(object);
        gemObject["connections"] = paths;
        circleInfo.push(gemObject);

        //calc total lines from circle(=gemeinde) with index i
        //therefore add all deltas (and ignore minus token)
        // var result = _.pluck([{a:{b:1}}, {a:{b:2}}], ["a", "b"]);
        var result = _.pluck(circleInfo["connections"], ["0-0", "diff"]);
        console.log(result);



        // console.log(allDiffs);
        // console.log(circleInfo[i]["paths"]);

    });

    // console.log(circleInfo);

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
