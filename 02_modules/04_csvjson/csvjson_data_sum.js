$(document).ready(function() {

    var nameKey,
        moveInData,
        object = [];
    resultat = {};

    // load data
    $.get("data/gemeinde_nameKey.json", function(data) {
        console.log("-- Daten sind da --", data);
        nameKey = data;
        evalData();
    });

    $.get("data/gemeinde_move_to.json", function(data) {
        console.log("-- Daten sind da --", data);
        moveInData = data;
        evalData();
    });

    $.get('data/gemeinde_leerwoh_2013.json', function(data){
        console.log("-- Daten sind da --", data);
        costs = data;
        evalData();
    });

        $.get('data/gemeinde_trafficcost_2012.json', function(data){
        console.log("-- Daten sind da --", data);
        costs = data;
        evalData();
    });

    function evalData() {
        if (nameKey && moveInData && costs ) {

             function getGemeideName(gemeindeId) {
                return nameKey[gemeindeId];
            }

            _.forEach(moveInData['gemeinden'], function(gemeindeData) {

                var reduced = _.reduce(gemeindeData['moveTo'], function(result, key) {
                    return parseInt(result, 10) + parseInt(key, 10);
                }, 0);

                console.log("halloo " + getGemeideName(gemeindeData['gemIdentifier']), reduced);
              
            });

           var group = [];
           console.log(moveInData['gemeinden'][0]['moveTo'].length)
           for (var i = 0; i < moveInData['gemeinden'][0]['moveTo'].length; i++) {
               group[i] = 0;
           }
           console.log(group);

            _.forEach(moveInData['gemeinden'], function (gemeindeData) {
               for (var index = 0; index < gemeindeData['moveTo'].length; index++) {
                    // console.log(group[index],gemeindeData['moveTo'][index])
                   group[index] += parseInt(gemeindeData['moveTo'][index], 10).push();
               }

            });

            // resultat = {  nameKey[gemeindeId];

            //               }
            console.log(group);


            // // Alle Gemeinden ausgeben
            // _.forEach(moveInData['gemeinden'], function (gemeindeData) {
            //     console.log( getGemeinde( gemeindeData['gemIdentifier'] ) );
            // }); 

        }
    }

    //     function getGemMoveOut_total (moveTo) {
    //         var liste = {};
    //         moveInData.gemeinden()


    //         // magic

    //         return liste;
    //     }


}); // Jquery schliessen