jQuery(function() {
	
	console.log('jQuery start');
	var $ausgabe;

	$ausgabe = $('#ausgabe');
	ausgeben('start.....');

	function ausgeben(in_text){
		$ausgabe.text(in_text);
	}


$.get('gem_def.csv', function( in_data ) {
	console.log( "-- Daten sind da - length:" + in_data.length );
    ausgeben( "Daten gelesen.." );

	var line = in_data.split('\n',300);
	console.log( "Wir haben " + line.length + " Zeilen gefunden" );

	var propertyNames = line[0].split(',');
	var datacontainer =[];

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
		datacontainer.push(object);
	};
	console.log('pushed'+ datacontainer.length+'object in container');

	console.log(datacontainer);

	var moveInto = {};
	for (var i = 0; i < datacontainer.length; i++) {
		var BFSnum = datacontainer[i]['BFS']; // oder datacontainer[i].BFS
		var gemeinden = datacontainer[i]['Gemeinden']; // oder datacontainer[i].Gemeinde
		// console.log(gemeinden);
		moveInto[BFSnum] = gemeinden;

	};
	console.log(moveInto);
	});
});