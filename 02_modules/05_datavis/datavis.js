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

$.get("data.json", function(json) {
        datashort = json;
        evalData();
    });

$.get("final_data.json", function(json) {
        data = json;
        evalData();
    });

function evalData() {
    if (datashort && data) {

        // some necessary global vars
        var width = $(window).width();
        var height = $(window).height();
        var bgCircCenterX = width/2;
        var bgCircCenterY = height/2;
        var minSize = 2; //min radius of circles independent of population in px
        var maxTraffCost = _.max(_.pluck(data["gemeinden"], "trafficcostPerPerson")); //use loDash to get max
        var maxDstBtwnLines = 0.02; //in radians
        //calc circle count and angle step
        var increase = Math.PI * 2 / data["gemeinden"].length;
        var angle = 0;
        var rad = 280; //radius of circle with circles on it
        var lines; //holds all paths
        var animFlag = false; //defines if animation should be played
        var sliderVal = 0.8; //holds tension
        var alphaLimit = 100; //100+ people will be displayed with lines in full alpha ( = 1.0)
        var peoplePerLine = 45;
        var scaleOnZoom = 2;
        var zoomFlag = false;

        // fill circle info array
        var circleInfo = [];

        var gemObject = {};
        _(data["gemeinden"]).forEach(function(obj, i){
            var pop = ((obj["population"]/11600 < minSize) ? minSize : obj["population"]/11600)
            gemObject = {
                "name" : data["gemeinden"][i]["gemName"],
                "centerPos" : { "xM" : 0, "yM" : 0 },
                "connections" : {},
                "circleRad" : pop,
                "trafficcostPerPerson" : obj["trafficcostPerPerson"]
                //     // how the content will look like
                //     // "0-0" : {   "delta" : 0,
                //     //             "pathEnds" : [{ "x" : 0, "y" : 0}] //x und y pos of path ending on the circle, can have more than one element with x,y if more than 1 line
                //     //         }
                // ]
            };
            // console.log("gemId: " + gemObject["name"]);

            var object = {};

            _.forEach(obj["moveTo"], function(elem, j){
                var key = i + "-" + j; //e.g. "0-1" > from gemeinde 0 to gemeinde 1
                //now calculate delta between the gemeinden including itself (always 0)
                gemObject["connections"][key] = {
                    "delta": data["gemeinden"][j]['moveTo'][i] - data["gemeinden"][i]['moveTo'][j],
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
                var objLines = Math.abs(Math.round(elem["delta"]/peoplePerLine)); //e.g. 7 lines for 140 people
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
                angleShift = (angleShift > maxDstBtwnLines) ? maxDstBtwnLines : angleShift;
                obj["angleShift"] = angleShift;
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
                for (var i = Math.round( Math.abs(elem["delta"]/peoplePerLine )) - 1; i >= 0; i--) { //for every line (calc first) -> Math.abs FIRST!!!
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




        //update svg with data as input
        function update(data) {

            // DATA JOIN
            // Join new data with old elements, if any.
            var gemCircles = svgGroup.selectAll(".dataCircle")
                .data(data);

            var text = svgGroup.selectAll("text")
                .data(data);

            // UPDATE
            // Update old elements as needed.
            gemCircles.transition()
                .duration(750);
            text.transition()
                .duration(750);


            // ENTER
            // Create new elements as needed.
            gemCircles.enter()
                .append("circle")
                .transition()
                .duration(750)
                .style("fill-opacity", 1);

            text.enter()
                .append("text")
                .transition()
                .duration(750)
                .style("fill-opacity", 1);

            // EXIT
            // Remove old elements as needed.
            gemCircles.exit()
                .transition()
                .duration(750)
                .style("fill-opacity", 1e-6) //1e-6 extremly small number -> prohibit flickering ??
                .remove();
            text.exit()
                .transition()
                .duration(750)
                .style("fill-opacity", 1e-6) //1e-6 extremly small number -> prohibit flickering ??
                .remove();



            var line = d3.svg.line()
            .x(function(d) {
                return d.x;
            })
            .y(function(d) {
                return d.y;
            })
            .interpolate("bundle")
            .tension(sliderVal);

            // draw all lines
            _.forEach(data, function(obj){
                _.forEach(obj["connections"], function(elem, i){ //e.g. elem = 0-1
                    var moveFromTo = i.split("-"); // split "0-2" = i into {0, 2} 0= from 2 = to
                    var from = moveFromTo[0];
                    var to = moveFromTo[1];
                    var reverseKey = to + "-" + from; //make "2-3" from i = "3-2"

                    //draw line
                    _.forEach(elem["pathEnds"], function(item, j){ //all path elements  -> array with 0-7 e.g.
                        var numOfPeople = (Math.abs(elem["delta"]) > alphaLimit) ? alphaLimit : Math.abs(elem["delta"]);
                        var alphaMap = d3.scale.linear() //map number of people to an alpha value
                            .domain([1, 100])
                            .range([0.15, 1]);
                        var strokeColor = "rgba(254, 255, 223," + alphaMap(numOfPeople) + ")";

                        //prohibit program to draw double lines
                        if (from >= to){
                            var x = circleInfo[to]["connections"][reverseKey]["pathEnds"][j]["x"];
                            var y = circleInfo[to]["connections"][reverseKey]["pathEnds"][j]["y"];
                            var path = [];
                            //define path animation direction
                            if (circleInfo[to]["connections"][reverseKey]["delta"] < 0){
                                path[0] = {"x": item["x"] , "y": item["y"]};
                                path[1] = { x: bgCircCenterX, y: bgCircCenterY }; //center of circle as control point
                                path[2] = {"x": x , "y": y};
                            } else {
                                path[2] = {"x": item["x"] , "y": item["y"]};
                                path[1] = { x: bgCircCenterX, y: bgCircCenterY }; //center of circle as control point
                                path[0] = {"x": x , "y": y};
                            }



                        lines = svgGroup.append("path")
                            .data(path)
                            .attr("class", "line")
                            .attr("d", line(path))
                            .style("fill", "none")
                            .style("stroke-width", 1)
                            .style("stroke", strokeColor)
                            .style("stroke-dasharray", "2")

                        }

                    });
                });
            });

            //add text to circles
            var offset;
            var textLabels = text
                .attr("x", function(d) {
                    offset = 55; // in pixel
                    return (rad * Math.cos(d["angle"]) + bgCircCenterX + offset);
                })
                .attr("y", function(d) {
                    return (rad * Math.sin(d["angle"]) + bgCircCenterY + 7);
                })
                .text(function(d) {
                    return d["name"];
                })
                .attr("transform", function(d) {
                        var degrees = d["angle"] * (180/Math.PI);
                        return "rotate(" + degrees + " " + (rad * Math.cos(d["angle"]) + bgCircCenterX) +"," + (rad * Math.sin(d["angle"]) + bgCircCenterY) +")";
                })
                .attr("class", "label");




            //set circle Attributes
            var gemCircAttr = gemCircles
                .each(function(d, i){
                    d3.select(this).attr({
                        cx: function(){
                                return d["centerPos"]["xM"];
                            },
                        cy: function(){
                                return d["centerPos"]["yM"];
                            },
                        r: function(d){
                                return d["circleRad"];
                            }, //todo: write mapping function and set a max size
                        fill: function(d) {
                            //use mapping function to map trafficCosts to RGB from 0 - 255
                            var colorMap = map_range(d["trafficcostPerPerson"], 0, maxTraffCost, 100, 300 ); //hsl 0 -350
                            colorMap = Math.floor(colorMap); //and round it to whole numbers to use as rgb
                            // console.log(colorMap + " - " + d["trafficCosts"]);
                            return "hsla(" + colorMap + ", 100%, 50%, 0.3)";
                            },
                        class:  "gemCircle"
                    })
                })

        }

        update(circleInfo);




       

        //animate lines
        function transition() {
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

        $('#slider').on('change', function(){
            sliderVal = $('#slider').val();
            console.log("sliderVal: " + sliderVal);
            d3.selectAll(".line")
            // .attr("d", line());
        });

        //double click on circle event

        $( ".gemCircle" ).click(function() {
            console.log("cliked");
            var position = {};
            position.left = $( this ).attr("cx");
            position.top =  $( this ).attr("cy");
            console.log(position);
            position.top = -(position.top * scaleOnZoom - height/2);
            position.left = -(position.left  * scaleOnZoom - width/2);
            var translate = "translate(" + position.left + "," + position.top + ") scale(" + scaleOnZoom + ")";

            svgGroup.transition()
                .attr("transform", translate)
                .duration(300)
                // .ease("elastic")
                .delay(100);
            zoomFlag = true;

        });

        //zoom out again

        $( "#slider" ).click(function() {
            console.log("slider");
            if(zoomFlag){
                zoomFlag = false;
                svgGroup.transition()
                   .attr("transform", "translate(0,0) scale(1)")
                   .duration(300)
                   // .ease("elastic")
                   .delay(100);

            }
            update(datashort);

        });





        }
    }

}); //jquery document ready
