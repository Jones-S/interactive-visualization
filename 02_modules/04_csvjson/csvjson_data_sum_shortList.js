$(document).ready(function() {

    var nameKey,
        moveTo,
        flats,
        costs,
        resultat = {},
        gemeinden = {},
        allAdded = [];

    // load data
    $.get("data/JSON/gemeinde_nameKey.json", function(data) {
        // console.log("-- Daten sind da --", data);
        nameKey = data;
        evalData();
    });

    $.get("data/JSON/gemeinde_move_to.json", function(data) {
        // console.log("-- Daten sind da --", data);
        moveTo = data;
        evalData();
    });

    $.get('data/JSON/gemeinde_leerwoh_2013.json', function(data){
        // console.log("-- Daten sind da --", data);
        flats = data;
        evalData();
    });

        $.get('data/JSON/gemeinde_trafficcost_2012.json', function(data){
        // console.log("-- Daten sind da --", data);
        costs = data;
        evalData();
    });

   $.get('data/JSON/gemeinde_population_2012.json', function(data){
        // console.log("-- Daten sind da --", data);
        population = data;
        evalData();
    });
     $.get('data/JSON/gemeinde_population_dens_2012.json', function(data){
        // console.log("-- Daten sind da --", data);
        density = data;
        evalData();
    });
    function evalData() {
        if (nameKey && moveTo && flats && costs) {

            //  function getGemeideName(gemeindeId) {
            //     return nameKey[gemeindeId];
            // }

             // _.forEach(moveTo['gemeinden'], function(gemeindeData) {
             //    var shortMoveTo=[];
             //    if(gemeindeData['moveTo'][i]<= 100){
             //       shortMoveTo= return gemeindeData['moveTo'];
             //    }
             // });

            _.forEach(moveTo['gemeinden'], function(gemeindeData) {

                var reduced = _.reduce(gemeindeData['moveTo'], function(result, key) { // rechnet Total moveIn Gemeinde aus
                    return parseInt(result, 10) + parseInt(key, 10);
                }, 0);


                // console.log(nameKey[gemeindeData['gemIdentifier']], reduced);
                allAdded.push(reduced);
                
            });

            // console.log(allAdded);

           var group = [];
          console.log("group: " + group);
           // console.log(moveTo['gemeinden'][0]['moveTo'].length);
           for (var i = 0; i < moveTo['gemeinden'][0]['moveTo'].length; i++) {
               group[i] = 0;
           }


            _.forEach(moveTo['gemeinden'], function (gemeindeData) { // 
               for (var index = 0; index < gemeindeData['moveTo'].length; index++) {
                    // console.log(group[index],gemeindeData['moveTo'][index])
                   group[index] += parseInt(gemeindeData['moveTo'][index], 10);// rechnet Total moveOut Gemeinde
               }

            });

            // resultat = {  nameKey[gemeindeId];

            //               }
            // console.log(group);

            gemeinden["gemeinden"] = [];
            var i = 0;
            _.forEach(nameKey, function(obj, key){
                 if(key <=100){
               // console.log("elem ", key);
                var  dataContainer = {};
                // dataContainer["gemId"]= parseInt(key,10);
                // dataContainer["gemName"] = obj;
                // dataContainer["moveOutTot"]=allAdded[i];
                // dataContainer["moveInTot"]=group[i];
                // dataContainer["emptyFlatsPercent"]=parseInt(flats[key],10);
                // dataContainer["trafficcostPerPerson"]=parseInt(costs[key],10);
                dataContainer["moveTo"]= moveTo['gemeinden'][i]['moveTo'][key];
                // dataContainer["population"]=parseInt(population[key],10);
                // dataContainer["populationDensity"]=density[key];
                i++;
            }
                gemeinden["gemeinden"].push(dataContainer);
                // console.log(dataContainer);
                console.log(gemeinden['gemeinden']);
                window.gemeinden = gemeinden;


                // _.find(moveTo['gemeinden'], function (obj) { return obj['gemIdentifier'] === key });
            });


        }
    }

    //     function getGemMoveOut_total (moveTo) {
    //         var liste = {};
    //         moveTo.gemeinden()


    //         // magic

    //         return liste;
    //     }


}); // Jquery schliessen