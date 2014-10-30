jQuery(function() {

    

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

    });

});
