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

    // console.log(datajson);


        // some necessary global vars
        var width = $(window).width();
        var height = $(window).height();
        var bgCircCenterX = width/2 - 200;
        var bgCircCenterY = height/2;
        var minSize = 1; //min radius of circles independent of population in px
        var maxTraffCost;
        var maxDstBtwnLines = 0.02; //in radians
        //calc circle count and angle step
        var increase;
        var angle = 0;
        var rad = 280; //radius of circle with circles on it
        var animFlag = false; //defines if animation should be played
        var sliderVal = 0.8; //holds tension
        var divideFactor = 4250; 
        var alphaLimit = 100; //100+ people will be displayed with lines in full alpha ( = 1.0)
        var peoplePerLine = 20;
        var scaleOnZoom = 2;
        var zoomFlag = false;
        var lines; var gemCircles; var text;
        var activeGems = []; var circleInfo = [];


        function prepareArray(array){
            // fill circle info array
            circleInfo = [];

            var gemObject = {};
            _.forEach(array, function(obj, i){
                var pop = ((obj["population"]/divideFactor < minSize) ? minSize : obj["population"]/divideFactor);
                gemObject = {
                    "name" : obj["gemName"],
                    "centerPos" : { "xM" : 0, "yM" : 0 },
                    "connections" : {},
                    "circleRad" : pop,
                    "trafficcostPerPerson" : obj["trafficcostPerPerson"]
                };

                var object = {};

                _.forEach(obj["moveTo"], function(elem, j){ //elem = moveTo value
                    var key = i + "-" + j; //e.g. "0-1" > from gemeinde 0 to gemeinde 1
                    //now calculate delta between the gemeinden including itself (always 0)
                    gemObject["connections"][key] = {
                        "delta": elem - array[j]['moveTo'][i],
                        "pathEnds": []
                    };

                });

                circleInfo.push(gemObject);


            });
        }



        function calcLinePos(data){
            increase = Math.PI * 2 / data.length;
            maxTraffCost = _.max(_.pluck(data, "trafficcostPerPerson")); //use loDash to get max
            increase = Math.PI * 2 / data.length;

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





            //add text to circles
            var offset;
            var textLabels = text
                .attr("x", function(d) {
                    offset = 11; // in pixel
                    return (rad * Math.cos(d["angle"]) + bgCircCenterX + offset);
                })
                .attr("y", function(d) {
                    return (rad * Math.sin(d["angle"]) + bgCircCenterY + 2); //last number = y offset to align text with center of circle
                })
                .text(function(d) {
                    return d["name"];
                })
                .attr("transform", function(d) {
                        var degrees = d["angle"] * (180/Math.PI);
                        return "rotate(" + degrees + " " + (rad * Math.cos(d["angle"]) + bgCircCenterX) +"," + (rad * Math.sin(d["angle"]) + bgCircCenterY) +")";
                })
                .attr("class", function(d) {
                    return "label " + d["name"] ;
                })




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
                            var colorMap = map_range(d["trafficcostPerPerson"], 0, maxTraffCost, 35, 0 ); //hsl 0 -350
                            colorMap = Math.floor(colorMap); //and round it to whole numbers to use as rgb
                            // console.log(colorMap + " - " + d["trafficCosts"]);
                            return "hsla(" + colorMap + ", 100%, 58%, 0.7)";
                            },
                        class:  "gemCircle"
                    })
                    .transition()
                    .duration(750)
                    .style("fill-opacity", 1);



                })

        } //update function



















        // UPDATE ACTIVE ARRAY WITH CLICKED ONES

        function updateActives(name){
            var name = name;
            //check if id is already in active array
            if(_.find(activeGems, { 'gemName': name })) {
                var atIndex = _.findIndex(activeGems, { 'gemName': name });
                _.remove(activeGems, { 'gemName': name });
                //also remove moveTos of other elements

                _.forEach(activeGems, function(obj){
                    obj["moveTo"].splice(atIndex, 1);
                });


            } else { //ok its not, then add it
                var result = _.cloneDeep(_.deepFindKeyVal(datajson["gemeinden"], "gemName", name)); //get the data object beloning to that name && clone it, otherwise I will overwrite the orig array
                if (result){
                    var newMoveTo = [];
                    var currentId;
                    var lastId = -1;
                    var incomeId = result[0]["contId"];
                    var incomePushed = false;


                    _.forEach(activeGems, function(obj, i){ //for each existing object -> reduce moveTo
                        currentId = obj["contId"];
                        //add itself to the newMoveTo if at right position
                        if(activeGems[0]["contId"] > incomeId && !incomePushed){ //if current object
                            newMoveTo.push(result[0]["moveTo"][incomeId]);
                            //set flag that income is already pushed
                            incomePushed = true;
                            console.log("first or LAST");
                        } else if ( lastId < incomeId < currentId && !incomePushed){
                            newMoveTo.push(result[0]["moveTo"][incomeId]);
                            incomePushed = true;
                        }
                        //add moveTo from index with ids from already added objects in array
                        newMoveTo.push(result[0]["moveTo"][currentId]); //get moveTo at specific indices
                        lastId = currentId;

                    });

                    //if new element is the last to come
                    if(activeGems.length != 0 && activeGems[activeGems.length-1]["contId"] < incomeId){
                        newMoveTo.push(result[0]["moveTo"][incomeId]);
                        console.log("was last");
                    }


                    if(activeGems.length == 0){ // if array is still empty then push anyway
                        newMoveTo.push(result[0]["moveTo"][incomeId]);
                        console.log("was first");
                    }
                    console.log(newMoveTo);


                    result[0]["moveTo"] = newMoveTo; //replace moveTo of result
                    console.log("------ ^^^^ new move to");
                    // result[0]["moveTo"] = ['jonas', 'nora']; //replace moveTo of result

                    activeGems.push(result[0]); //push result object into active Array


                    //add moveTo information to existing objects
                    //but first sort array
                    activeGems = _.map(_.sortBy(activeGems, ['contId']));
                    // find index of newly added element
                    var atIndex = _.findIndex(activeGems, { 'contId': incomeId });
                    //extend moveTos of existing gems in activeGems

                    _.forEach(activeGems, function(obj, i){
                        if(obj["contId"] != incomeId){ //the last added object has alread an up to date moveTo array
                            //go back to clone to get the data:
                            var origData = _.cloneDeep(_.deepFindKeyVal(datajson["gemeinden"], "contId", obj["contId"])); //find the orig data with the full moveTo array and clone it
                            origData = origData[0]["moveTo"][incomeId]; //and get the specific value from the moveTo array
                            obj["moveTo"].splice(atIndex, 0, origData); //and add the moveTo value to the array object in active array at the given index (matching with the index of the newly added elem in the array itself)
                        }
                    });



                }
            }

            prepareArray(activeGems); //prepare cricleInfo with content of activeGems
                calcLinePos(circleInfo);
                update(circleInfo);
                window.activeGems = activeGems;

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

        $('#tensionslider').on('change', function(){
            sliderVal = $('#tensionslider').val();
            console.log("sliderVal: " + sliderVal);
            d3.selectAll(".line")
            update(circleInfo);
        });

        $('#peopleslider').on('change', function(){
            peoplePerLine = $('#peopleslider').val();
            d3.selectAll(".line")
            prepareArray(datajson["gemeinden"]);
            calcLinePos(circleInfo);
            update(circleInfo);
        });

        $('#dividerslider').on('change', function(){
            divideFactor = $('#dividerslider').val();
            console.log("divideFactor: " + divideFactor);
            d3.selectAll(".line")
            prepareArray(datajson["gemeinden"]);
            calcLinePos(circleInfo);
            update(circleInfo);
        });

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

        //zoom

        $( ".thirdbutton" ).click(function() {
            console.log("secondbutton");
            var position = {};
            scaleOnZoom = 3.2;
            position.left = 471.94; //pos of elsau
            position.top =  132.47;
            // position.top = -(position.top * scaleOnZoom - height/2);
            // position.left = -(position.left  * scaleOnZoom - width/2);
            position.top =  - (height/2 + 1220);
            position.left = -(position.left) - 500;
            var translate = "translate(" + position.left + "," + position.top + ") scale(" + scaleOnZoom + ") rotate(" + (38.5) + ")";

            d3.select(".group")
                .transition()
                .attr("transform", translate)
                .duration(800);
                // .ease("elastic")
                // .delay(100);
            zoomFlag = true;
            $(".map svg").css("visibility", "hidden");
            $(".detailimg img").delay(840).fadeIn(300);
            $(" .Rickenbach").hide();
            $(" .label").css("opacity", "0.5");




        });

        $( ".secondbutton" ).click(function() {
            console.log("thirdbutton");
            if(zoomFlag){
                zoomFlag = false;
                svgGroup.transition()
                   .attr("transform", "translate(0,0) scale(1)")
                   .duration(300)
                   // .ease("elastic")
                   .delay(100);
            $(".map svg").css("visibility", "visible");
            $(".detailimg img").hide();
            $(" .label").css("opacity", "1");
            $(" .Rickenbach").show();
        }

        });

        $( ".map svg path" ).click(function() {
            var name = $(this).find('title').text();
            console.log($(this).css("fill"));

            console.log($(this).css("fill"));
            if($(this).css("fill") == "#ffffff"){
                $(this).css("fill", "none");
            } else {
                $(this).css("fill", "white");
            };
            console.log(name);
            updateActives(name);
        });


        //draw svg
        var svgContainer = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "gemSvg");
        //add group to contain all circles
        var svgGroup = svgContainer.append("g").attr("class", "group");

        //add bg circle
        var bgCircle = svgGroup.append("circle")
            .attr("cx", bgCircCenterX).attr("cy", bgCircCenterY).attr("r", rad)
            .style("fill", "none")
            // .style("stroke-dasharray", ("")) // make the stroke dashed
            .style("stroke", "rgba(255, 255, 255, 0.3)");

        prepareArray(datajson["gemeinden"]);
        calcLinePos(circleInfo);
        update(circleInfo);


    } //eval data if


} //evalData

}); //jquery document ready
