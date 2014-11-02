$(document).ready(function() {

    //first load json data into array

    var data; // a global

    d3.json("data.json", function(error, json) {
        if (error) return console.warn(error);
        data = json;
        console.log(data);
    });


});
