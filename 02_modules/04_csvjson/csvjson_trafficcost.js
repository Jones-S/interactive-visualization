jQuery(function() {
	
	console.log('jQuery start');


	


$.get('data/data_traffic_cost_2012.csv', function( in_data ) {
	console.log( "-- Daten sind da - length:" + in_data.length );

	var line = in_data.split('\n',300);
	console.log( "Wir haben " + line.length + " Zeilen gefunden" );

	var propertyNames = line[0].split(';');
	var datacontainer =[];

	for (var index = 1; index < line.length; index += 1) {
		line[index]

		var single_line = line[index];
		var partsArray = single_line.split(';');
		var object = {};

		for (var index2  = 0; index2  < partsArray.length; index2 += 1) {
			var propertyName = propertyNames[index2];
			var value = partsArray[index2];
			object[propertyName] = value
		}; 
		datacontainer.push(object);
	};
	console.log('pushed'+ datacontainer.length+'object in container');

	console.log(datacontainer);

	var nettoCost = {};
	for (var index = 0; index < datacontainer.length; index++) {
		var BFS_num = datacontainer[index]['BFS_NR'];
		var moneyPerPers = datacontainer[index]['INDIKATOR_VALUE'];
		console.log(datacontainer[index]['INDIKATOR_VALUE']);
		nettoCost[BFS_num]= moneyPerPers;
	};
	console.log(nettoCost);
	window.nettoCost = nettoCost;

	});
	



});// jQuery schliessen
