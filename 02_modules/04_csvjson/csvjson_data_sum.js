$(document).ready(function() {

    var schluessel,
        daten,
        object = [];
    resultat = {};

    // load data
    $.get("data/gemeinde_schluessel.json", function(data) {
        console.log("-- Daten sind da --", data);
        schluessel = data;
        evalData();
    });

    $.get("data/gemeinden_move_to.json", function(data) {
        console.log("-- Daten sind da --", data);
        daten = data;
        evalData();
    });

    function evalData() {
        if (schluessel && daten) {

             function getGemeideName(gemeindeId) {
                return schluessel[gemeindeId];
            }

            _.forEach(daten['gemeinden'], function(gemeindeData) {

                var reduced = _.reduce(gemeindeData['moveTo'], function(result, key) {
                    return parseInt(result, 10) + parseInt(key, 10);
                }, 0);

                console.log("halloo " + getGemeideName(gemeindeData['gemIdentifier']), reduced);
              
            });

           var group = [];
           console.log(daten['gemeinden'][0]['moveTo'].length)
           for (var i = 0; i < daten['gemeinden'][0]['moveTo'].length; i++) {
               group[i] = 0;
           }
           console.log(group);

            _.forEach(daten['gemeinden'], function (gemeindeData) {
               for (var index = 0; index < gemeindeData['moveTo'].length; index++) {
                    // console.log(group[index],gemeindeData['moveTo'][index])
                   group[index] += parseInt(gemeindeData['moveTo'][index], 10);
               }
            });
            console.log(group);


            // // Alle Gemeinden ausgeben
            // _.forEach(daten['gemeinden'], function (gemeindeData) {
            //     console.log( getGemeinde( gemeindeData['gemIdentifier'] ) );
            // }); 

        }
    }

    //     function getGemMoveOut_total (moveTo) {
    //         var liste = {};
    //         daten.gemeinden()


    //         // magic

    //         return liste;
    //     }


}); // Jquery schliessen