$(document).ready(function() {

    //first load json data into array

    $.getJSON("data.json", function(data) {
        var gem = []; //store all gemeinden info in gem variable
        $.each(data, function(key, val) {
            gem.push("<li id='" + key + "'>" + val + "</li>");
        });

        $("<ul/>", {
            "class": "my-new-list",
            html: gem.join("")
        }).appendTo("body");

        console.log(gem);

    });

});
