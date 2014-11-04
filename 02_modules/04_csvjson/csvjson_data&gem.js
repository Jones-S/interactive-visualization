$(document).ready(function() {

    // load data
    $.get("data/bbgem12.csv", function(data) {
        console.log("-- Daten sind da - length:" + data.length);

        // divide at new lines
        var lines = data.split("\n", 300); // 300 = limit
        console.log("Wir haben " + lines.length + " Zeilen gefunden");

        // Hämmerchen 2, spalten an Kommas / Feldtrennung
        // apply special treatment to the first line
        // var propertyNames = lines[ 0 ].split( "," ); // read title cells
        var dataContainer = [];

        for (var i = 1; i < lines.length - 1; i++) {
            var one_line = lines[i]; // read lines
            //elements will be array, (bsp: 171 (gemeinde VON), 0 (Pers nach Gem 1), 2, 2 etc)
            var elements = one_line.split(";");
            var gemId = elements[0];
            var quantOfPeople = [];
            var object = []; // blank array

            for (var j = 1; j < elements.length; j += 1) { //start at 1 because element 0 is gemeinde name
                var value = elements[j]; // single numbers  = value
                quantOfPeople.push(value); //add value to quantity of People - Array
            }

            object = {
                gemIdentifier: gemId,
                moveTo: quantOfPeople //insert array into array
            }
            dataContainer.push(object);
        }
        // packe in JavaScript Objekte
        console.log("-- Pushed " + dataContainer.length + " objects in our container");
        console.log(dataContainer[170]);
        console.log(dataContainer);
    });

$.get('gem_def.csv', function( in_data ) {
    console.log( "-- Daten sind da - length:" + in_data.length );

    var line = in_data.split('\n',300);
    console.log( "Wir haben " + line.length + " Zeilen gefunden" );

    var propertyNames = line[0].split(',');
    var dataholder =[];

    for (var index = 1; index < line.length; index += 1) {
        line[index]

        var single_line = line[index];
        var partsArray = single_line.split(',');
        var object = {};

        for (var index2  = 0; index2  < partsArray.length; index2 += 1) {
            var propertyName = propertyNames[index2];
            var value = partsArray[index2];
            object[propertyName] = value
        }; 
        dataholder.push(object);
    };
    console.log('pushed'+ dataholder.length+'object in container');

    console.log(dataholder);

    var moveInto = {};
    for (var i = 0; i < dataholder.length; i++) {
        var BFSnum = dataholder[i]['BFS']; // oder dataholder[i].BFS
        var gemeindenName = dataholder[i]['Gemeinden']; // oder dataholder[i].Gemeinde
        // console.log(gemeindenName);
        moveInto[BFSnum] = gemeindenName;

    };
    console.log(moveInto);
    });

        //print array values to text in json format
        // var text = '{ "gemeinden": [{ "gemIdentifier" : "';
        // //add values to string
        // for (var i = 0; i < dataContainer.length; i++) {
        //     text = text + dataContainer[i]["gemIdentifier"]; //gemeinde Identifier written into text
        //     text = text + '",<br/> "moveTo" : [';

        //     //second for loop for iterating through moveTo counts
        //     for (var j = 0; j < dataContainer[i]["moveTo"].length; j++) {
        //         text = text + '"' + dataContainer[i]["moveTo"][j];
        //         if (j == dataContainer[i]["moveTo"].length - 1) {
        //             text = $.trim(text);
        //         }

        //         text = text + '"';
        //         if (j < dataContainer[i]["moveTo"].length - 1) { //special treatment for last element -> no comma wanted
        //             text = text + ',';
        //         };
        //     };

        //     //finish object
        //     text = text + ']<br/>';
        //     text = text + '}';
        //     if (i < dataContainer.length - 1) { //special treatment for last element -> no new gemIdentifier key wanted
        //         text = text + ',<br/> { "gemIdentifier" : "';
        //     }
        // };

        // //finish json
        // text = text + ']<br/> }';

        // //add text as html to .json div
        // $(".json").html(text);

    // //initiate chromestore
    // var cs = new ChromeStore([{
    //     path: 'videos/clips'
    // }, {
    //     path: 'audio/wav',
    //     callback: function() {
    //         console.log('finished creating audio structure')
    //     }
    // }]);

    // //request bytes from filesystem
    // cs.init(1024 * 1024, function(cstore) {
    //     console.log('Chromestore initialized');
    // });

    // cs.usedAndRemaining(function(used, remaining) {
    //     console.log("Used bytes: " + used);
    //     console.log("Remaining bytes: " + remaining);
    // });

    // cs.getDir('genres/action', {
    //     create: true
    // }, function(dirEntry) {
    //     console.log('Directory created');
    // });


}); // Jquery schliessen
