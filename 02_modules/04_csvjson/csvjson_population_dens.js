jQuery(function() {

	console.log('jQuery start');

$.get('data/CSV/data_population_dens_2012.csv', function( in_data ) {

	var line = in_data.split('\n',300);
	var propertyNames = line[0].split(';');
	var datacontainer =[];

	for (var index = 1; index < line.length - 1; index++) {

		var single_line = line[index];
		var partsArray = single_line.split(';');
		var object = [];

		for (var index2  = 0; index2  < partsArray.length - 1; index2++) {
			var value = partsArray[index2];
			object.push(value)
		};
		datacontainer.push(object);
	};

	// console.log(datacontainer);

	var spacePerPers={};
	for (var index = 0; index < datacontainer.length; index++) {
		var BFS_num = datacontainer[index][0];
		// console.log("BFS_num: " + BFS_num);
		var countProQM = datacontainer[index][8];
		// console.log("countProQM: " + countProQM);
		spacePerPers[BFS_num] = 1/countProQM; //1 sqkm / people count

	};
	console.log(spacePerPers);
	window.spacePerPers = spacePerPers;

	});




});// jQuery schliessen
