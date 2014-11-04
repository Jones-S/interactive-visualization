$(document).ready(function() {

    var schluessel,
        daten,
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

          
              _.forEach(daten['gemeinden'], function (gemeindeData) {
                for (var i = 0; i < moveTo.length; i++) {
                    moveTo[i]
                };
              });


            // // Alle Gemeinden ausgeben
            // _.forEach(daten['gemeinden'], function (gemeindeData) {
            //     console.log( getGemeinde( gemeindeData['gemIdentifier'] ) );
            // }); 

        }
    }

    function getGemeinde(gemeindeId) {
        return schluessel[gemeindeId];
    };

    function moveTo(){

          _.forEach(daten['gemeinden'], function (gemeindeData) {

                var reduced = _.reduce(gemeindeData['moveTo'], function(result, key) {
                    return parseInt(result, 10) + parseInt(key, 10);
                }, 0);

                console.log("halloo" + schluessel[gemeindeData['gemIdentifier']], reduced);
            });
    }
 

    //     function getGemMoveOut_total (moveTo) {
    //         var liste = {};
    //         daten.gemeinden()


    //         // magic

    //         return liste;
    //     }

    //     function getGemeindeZuzugsListe (gemeindeId) {
    //         var liste = {};

    //         // magic

    //         return liste;
    //     }

}); // Jquery schliessen