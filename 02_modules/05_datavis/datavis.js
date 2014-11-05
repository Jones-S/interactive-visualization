$(document).ready(function() {

//first load json data into array
//because json is loaded asynchronously, all functions concerning data are written inside
var datajson;

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
        datajson = json;
        evalData();
    });


 _.mixin({deepFindKeyVal: function (obj, key, val) {


    function findNested (obj, key, val, memo) {
        _.isArray(memo) || (memo = []);

        var isMatch = false;

        _.forOwn(obj, function(v, i) {
            if (i === key && v === val) {
                isMatch = true;
            }
        });
        if (isMatch) {
            memo.push(obj);
        } else {
            _.forOwn(obj, function(v, i) {
                 findNested(v, key, val, memo);
            });
        }


        return memo;
    }

    return findNested(obj, key, val);

}});







function evalData() {
    if (datashort && datajson) {

        // some necessary global vars
        var width = $(window).width();
        var height = $(window).height();
        var bgCircCenterX = width/2 - 200;
        var bgCircCenterY = height/2;
        var minSize = 2; //min radius of circles independent of population in px
        var maxTraffCost = _.max(_.pluck(datajson["gemeinden"], "trafficcostPerPerson")); //use loDash to get max
        var maxDstBtwnLines = 0.02; //in radians
        //calc circle count and angle step
        var increase = Math.PI * 2 / datajson["gemeinden"].length;
        var angle = 0;
        var rad = 280; //radius of circle with circles on it
        var animFlag = false; //defines if animation should be played
        var sliderVal = 0.8; //holds tension
        var alphaLimit = 100; //100+ people will be displayed with lines in full alpha ( = 1.0)
        var peoplePerLine = 20;
        var scaleOnZoom = 2;
        var zoomFlag = false;
        var lines; var gemCircles; var text;
        var activeGems = [];

        // fill circle info array
        var circleInfo = [];

        var gemObject = {};
        _(datajson["gemeinden"]).forEach(function(obj, i){
            var pop = ((obj["population"]/11600 < minSize) ? minSize : obj["population"]/11600)
            gemObject = {
                "name" : datajson["gemeinden"][i]["gemName"],
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
                    "delta": datajson["gemeinden"][j]['moveTo'][i] - datajson["gemeinden"][i]['moveTo'][j],
                    "pathEnds": []
                };

            });

            circleInfo.push(gemObject);

        });

        // fill circle info array
        var circleInfoShort = [];

        var gemObject = {};
        _(datashort["gemeinden"]).forEach(function(obj, i){
            var pop = ((obj["population"]/11600 < minSize) ? minSize : obj["population"]/11600)
            gemObject = {
                "name" : datashort["gemeinden"][i]["gemName"],
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
                    "delta": datashort["gemeinden"][j]['moveTo'][i] - datashort["gemeinden"][i]['moveTo'][j],
                    "pathEnds": []
                };

            });

            circleInfoShort.push(gemObject);

        });


        function calcLinePos(data){
            increase = Math.PI * 2 / data.length;
            maxTraffCost = _.max(_.pluck(data, "trafficcostPerPerson")); //use loDash to get max


             //calc all positions of the lines
            _.forEach(data, function(obj){
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
            _.forEach(data, function(obj){
                var x = obj["centerPos"]["xM"];
                var y = obj["centerPos"]["yM"];
                _.forEach(obj["connections"], function(elem){
                    for (var i = Math.round( Math.abs(elem["delta"]/peoplePerLine )) - 1; i >= 0; i--) { //for every line (calc first) -> Math.abs FIRST!!!
                        elem["pathEnds"].push({ "x": x , "y": y });
                    };
                });

            });

            //move x,y of pathends
            _.forEach(data, function(obj, i){ //e.g. {"connection" : ..., "name" ...} etc
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


        }


        calcLinePos(circleInfo);
        calcLinePos(circleInfoShort);

















        //draw svg
        var svgContainer = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);
        //add group to contain all circles
        var svgGroup = svgContainer.append("g");

        //add bg circle
        var bgCircle = svgGroup.append("circle")
            .attr("cx", bgCircCenterX).attr("cy", bgCircCenterY).attr("r", rad)
            .style("fill", "none")
            .style("stroke-dasharray", ("3,3")) // make the stroke dashed
            .style("stroke", "rgba(255, 255, 255, 0.5)");









        // UPDATE SVG WITH NEW DATA

        //update svg with data as input
        function update(data) {

            // DATA JOIN
            // Join new data with old elements, if any.
            gemCircles = svgGroup.selectAll(".gemCircle")
                .data(data);

            text = svgGroup.selectAll("text")
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
                .style("fill-opacity", 0) //1e-6 extremly small number -> prohibit flickering ??
                .remove();

            text.exit()
                .transition()
                .duration(750)
                .style("fill-opacity", 0) //1e-6 extremly small number -> prohibit flickering ??
                .remove();

            //delete all old lines
            d3.selectAll(".line").remove();



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
                            var x = data[to]["connections"][reverseKey]["pathEnds"][j]["x"];
                            var y = data[to]["connections"][reverseKey]["pathEnds"][j]["y"];
                            var path = [];
                            //define path animation direction
                            if (data[to]["connections"][reverseKey]["delta"] < 0){
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


                        // lines.data(path)
                        //     .enter()
                        //     .append("path")
                        //     .transition()
                        //     .duration(750)
                        //     .style("fill-opacity", 1);

                        // lines.exit()
                        //     .transition()
                        //     .duration(750)
                        //     .style("fill-opacity", 1e-6) //1e-6 extremly small number -> prohibit flickering ??
                        //     .remove();

                        // var lineAttr = lines
                        //     .attr("class", "line")
                        //     .attr("d", line(path))
                        //     .style("fill", "none")
                        //     .style("stroke-width", 1)
                        //     .style("stroke", strokeColor)
                        //     .style("stroke-dasharray", "2")

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
                    .transition()
                    .duration(750)
                    .style("fill-opacity", 1);



                })

        } //update function

        update(circleInfo);


















        // UPDATE ACTIVE ARRAY WITH CLICKED ONES

        function updateActives(name){
            var name = name;
            //check if id is already in active array
            if(_.find(activeGems, { 'gemName': name })) {
                _.remove(activeGems, { 'gemName': name });
            } else { //ok its not, then add it
                var result = _.deepFindKeyVal(datajson["gemeinden"], "gemName", name); //get the data object beloning to that name
                // console.log(result);
                if (result){
                    var newMoveTo = [];
                    var currentId;
                    var lastId = -1;
                    var incomeId = result[0]["contId"];


                    _.forEach(activeGems, function(obj, i){ //for each existing object -> reduce moveTo
                        currentId = obj["contId"];
                        //add itself to the newMoveTo if at right position
                        if(activeGems[0]["gemId"] > incomeId || activeGems[activeGems.length-1]["gemId"] < incomeId ){ //if current object
                            newMoveTo.push(result[0]["moveTo"][incomeId]);
                        } else if ( lastId < incomeId < currentId ){
                            newMoveTo.push(result[0]["moveTo"][incomeId]);
                        }
                        //add moveTo from index with ids from already added objects in array
                        newMoveTo.push(result[0]["moveTo"][currentId]); //get moveTo at specific indices
                        lastId = currentId;

                    });

                    if(activeGems.length == 0){ // if array is still empty then push anyway
                        newMoveTo.push(result[0]["moveTo"][incomeId]);
                        console.log(result[0]["moveTo"][incomeId]);
                    }

                    console.log(datajson["gemeinden"][170]);
                    console.log("Dr. Jones");
                    result[0]["moveTo"] = newMoveTo; //replace moveTo of result

                    activeGems.push(result[0]); //push result object into active Array

                    //add moveTo information to existing objects
                    //but first sort array
                    activeGems = _.map(_.sortBy(activeGems, ['contId']));
                    // find index of newly added element
                    var atIndex = _.findIndex(activeGems, { 'contId': incomeId });
                    //extend moveTos of existing gems in activeGems
                    _.forEach(activeGems, function(obj, i){
                        if(obj["contId"] != incomeId){ //the last added object has alread an up to date moveTo array
                            var origData = _.deepFindKeyVal(data["gemeinden"], "contId", obj["contId"]); //find the orig data with the full moveTo array
                            console.log(origData[0]);
                            origData = origData[0]["moveTo"][incomeId]; //and get the specific value from the moveTo array
                            obj["moveTo"].splice[atIndex, 0, origData]; //and add the moveTo value to the array object in active array at the given index (matching with the index of the newly added elem in the array itself)
                        }
                    });

                    window.activeGems = activeGems;
                }
            }

        }

        //ANIMATIONS AND INTERACTIONS

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

        //start animation on
        $(".fourthbutton").click(function() {
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
            update(circleInfo);
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

        $( ".secondbutton" ).click(function() {
            console.log("secondbutton");
            if(zoomFlag){
                zoomFlag = false;
                svgGroup.transition()
                   .attr("transform", "translate(0,0) scale(1)")
                   .duration(300)
                   // .ease("elastic")
                   .delay(100);
            }

        });

        $( ".thirdbutton" ).click(function() {
            update(circleInfo);

        });

        $( ".firstbutton" ).click(function() {
            update(circleInfoShort);

        });

        $( ".map svg path" ).mouseover(function() {
            console.log("hover");

        });

        $( ".map svg path" ).click(function() {
            var name = $(this).find('title').text();
            console.log(name);
            console.log(datajson["gemeinden"][170]);
            console.log("Dr. Jones");
            updateActives(name);
        });





        }

        window.circleInfo = circleInfo;
        window.circleInfoShort = circleInfoShort;
        
    }

}); //jquery document ready
