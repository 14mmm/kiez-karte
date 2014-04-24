/*
	Drag'n'Drop
*/

// -----------------------------------------------------------------------------

function initDragnDrop()
{
	var dropZone = document.getElementById( 'mapContainer');
	dropZone.addEventListener( 'dragstart', dndHandleDragStart, false);
	dropZone.addEventListener( 'dragenter', dndHandleDragEnter, false);
	dropZone.addEventListener( 'dragover', dndHandleDragOver, false);
//	dropZone.addEventListener( 'dragleave', dndHandleDragLeave, false);
	dropZone.addEventListener( 'drop', dndHandleDrop, false);

	document.body.addEventListener( 'dragover', dndHandleDragOver, false);
	document.body.addEventListener( 'drop', dndHandleDrop, false);
}

// -----------------------------------------------------------------------------

function dndHandleDragStart( evt)
{
	evt.dataTransfer.effectAllowed = 'copy';
}

// -----------------------------------------------------------------------------

function dndHandleDragEnter( evt)
{
	if( !$.mobile.activePage.find( '.popupDrop').parent().hasClass( 'ui-popup-active')) {
		$( '#popupDrop').popup( 'open');
	}
}

// -----------------------------------------------------------------------------

function dndHandleDragOver( evt)
{
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';

	$( '#popupDrop').html(
		'<div style="margin:2em 4em 2em 4em;text-shadow:none;">' +
		'<div style="font-size:3em;text-align:center;margin-bottom:0.5em;"><i class="fa fa-file-text-o"></i></div>' +
		'Du hast eine Datei? Klasse, dann lasse sie auf der Karte fallen.' +
		'<br><center><a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-a" data-rel="back">Abbrechen</a></center>' +
		'</div>');
	$( '#popupDrop').popup( 'reposition', {positionTo: "window"});

	return false;
}

// -----------------------------------------------------------------------------

function dndHandleDragLeave( evt)
{
	$( '#popupDrop').popup( 'close');
}

// -----------------------------------------------------------------------------

function dndHandleDrop( evt)
{
	evt.stopPropagation();
	evt.preventDefault();

	if( 1 == evt.dataTransfer.files.length) {
		dndHandleNewFile( evt.dataTransfer.files[ 0]);
	} else {
		$( '#popupDrop').html(
			'<div style="margin:2em 4em 2em 4em;text-shadow:none;">' +
			'<div style="font-size:3em;text-align:center;margin-bottom:0.5em;"><i class="fa fa-files-o"></i></div>' +
			evt.dataTransfer.files.length + ' Dateien? So viele? Bitte ziehe nur einzelne Dateien hier her. Danke.' +
			'</div>');
		$( '#popupDrop').popup( 'reposition', {positionTo: "window"});
	}

	return false;
}

// -----------------------------------------------------------------------------

function dndHandleNewFile( f)
{
	var errorImg = '';
	var errorTxt = '';

	if( f.type.match( 'image.*')) {
		errorImg = 'fa-picture-o';
		errorTxt = 'Ein Bild? Nein.';
	} else if( f.type.match( 'application/pdf')) {
		errorImg = 'fa-file';
		errorTxt = 'Eine PDF-Datei, so, so. Was soll ich damit?';
	} else if( f.type.match( 'application/json')) {
		// accepted
	} else if( !f.type.match( 'text.*')) {
		errorImg = 'fa-file-o';
		errorTxt = 'Ist diese Datei Open Data freundlich?';
//		errorTxt += ' (' + f.type + ')';
	}

	if( 0 != errorTxt.length) {
		$( '#popupDrop').html(
			'<div style="margin:2em 4em 2em 4em;text-shadow:none;">' +
			'<div style="font-size:3em;text-align:center;margin-bottom:0.5em;"><i class="fa ' + errorImg + '"></i></div>' +
//			errorTxt + ' Bitte nur CSV-Dateien hier her ziehen.' +
			errorTxt + ' Bitte nur JSON-Dateien hier her ziehen.' +
			'</div>');
		$( '#popupDrop').popup( 'reposition', {positionTo: "window"});

        return;
	}

	dndReadTextFile( f);
}

// -----------------------------------------------------------------------------

function dndReadErrorHandler( evt)
{
	switch( evt.target.error.code) {
	case evt.target.error.NOT_FOUND_ERR:
		alert( 'File Not Found!');
		break;
	case evt.target.error.NOT_READABLE_ERR:
		alert( 'File is not readable');
		break;
	case evt.target.error.ABORT_ERR:
		break; // noop
	default:
		alert( 'An error occurred reading this file.');
	};
}

// -----------------------------------------------------------------------------

function dndReadUpdateProgress( evt)
{
	if( evt.lengthComputable) {
		var percentLoaded = Math.round(( evt.loaded / evt.total) * 100);

		if( percentLoaded < 100) {
//			progress.style.width = percentLoaded + '%';
//			progress.textContent = percentLoaded + '%';
		}
	}
}

// -----------------------------------------------------------------------------

var dndReadFileObject = null;
var dndReadFileIndex = 0;
var dndReadFileGeocodeSet = null;
var dndReadFileChanged = false;
var dndReadFileName = '';

function dndReadTextFile( f)
{
	dndReadFileName = f.name;

	var reader = new FileReader();
	reader.onloadend = function( e) {
		if( e.target.readyState == FileReader.DONE) {
			if( '{' == e.target.result.substring( 0, 1)) {
				dndReadFileJSON( e.target.result);
			} else if( '[' == e.target.result.substring( 0, 1)) {
				dndReadFileJSON( e.target.result);
			} else {
				dndReadFileError();
			}
		}
	}

	var str = '';
	str += '<strong>' + escape( dndReadFileName) + '</strong><br>';
	str += 'Lade jetzt ' + f.size + ' Bytes...<br>';

	$( '#popupDrop').html(
		'<div style="margin:2em 4em 2em 4em;text-shadow:none;">' +
		'<div style="font-size:3em;text-align:center;margin-bottom:0.5em;"><i class="fa fa-table"></i></div>' +
		str +
		'</div>');
	$( '#popupDrop').popup( 'reposition', {positionTo: "window"});

//	var blob = f.slice( 0, 1000);
//	reader.readAsText( blob);
	reader.readAsText( f);
}

// -----------------------------------------------------------------------------

function dndReadFileError()
{
	$( '#popupDrop').html(
		'<div style="margin:2em 4em 2em 4em;text-shadow:none;">' +
		'<div style="font-size:3em;text-align:center;margin-bottom:0.5em;"><i class="fa fa-table"></i></div>' +
		'Diese Datei ist leider nicht lesbar.' +
		'</div>');
	$( '#popupDrop').popup( 'reposition', {positionTo: "window"});
}

// -----------------------------------------------------------------------------

function dndReadFileJSON( stream)
{
	var obj = $.parseJSON( stream);
	dndReadFileChanged = false;

	if( typeof obj != 'undefined') {
		if( typeof obj.index != 'undefined') {
			obj = obj.index;
			dndReadFileChanged = true;
		}

		dndReadFileObject = obj;
		dndReadFileIndex = 0;

		if( dndReadFileGeocodeSet) {
			map.objects.remove( dndReadFileGeocodeSet);
		}
		dndReadFileGeocodeSet = new nokia.maps.map.Container();
		map.objects.add( dndReadFileGeocodeSet);

		$( '#popupDrop').html(
			'<div style="margin:2em 4em 2em 4em;text-shadow:none;">' +
			'<div style="font-size:3em;text-align:center;margin-bottom:0.5em;"><i class="fa fa-table"></i></div>' +
			'Verteile die Punkte auf der Karte' +
			'</div>');
		$( '#popupDrop').popup( 'reposition', {positionTo: "window"});

		dndReadFileObjectFunc();
	} else {
		dndReadFileError();
	}
}

// -----------------------------------------------------------------------------

function dndReadFileObjectFunc()
{
	try {
		while(( typeof dndReadFileObject[dndReadFileIndex] != 'undefined') && (typeof dndReadFileObject[dndReadFileIndex].lat != 'undefined') && (typeof dndReadFileObject[dndReadFileIndex].lng != 'undefined')) {
			marker = new nokia.maps.map.StandardMarker([parseFloat( dndReadFileObject[dndReadFileIndex].lat), parseFloat( dndReadFileObject[dndReadFileIndex].lng)], { text: dndReadFileIndex + 1 });
			dndReadFileGeocodeSet.objects.add( marker);

			++dndReadFileIndex;
		}

		if( typeof dndReadFileObject[dndReadFileIndex] == 'undefined') {
			if( dndReadFileGeocodeSet.objects.getLength() > 0) {
				map.zoomTo( dndReadFileGeocodeSet.getBoundingBox(), false);
			}

			if( dndReadFileChanged) {
				dndDownloadFile();
			} else {
				$( '#popupDrop').popup( 'close');
			}
		} else {
			var street = '';
			var zip = '';
			var city = '';

			if( typeof dndReadFileObject[dndReadFileIndex].anschrift != 'undefined') {
				street = dndReadFileObject[dndReadFileIndex].anschrift;
			}
			if( typeof dndReadFileObject[dndReadFileIndex].strasse != 'undefined') {
				street = dndReadFileObject[dndReadFileIndex].strasse;
			}
			if( typeof dndReadFileObject[dndReadFileIndex].plz != 'undefined') {
				zip = dndReadFileObject[dndReadFileIndex].plz;
			}
			if( typeof dndReadFileObject[dndReadFileIndex].ort != 'undefined') {
				city = dndReadFileObject[dndReadFileIndex].ort;
			}
			if( typeof dndReadFileObject[dndReadFileIndex].plz_ort != 'undefined') {
				zip = dndReadFileObject[dndReadFileIndex].plz_ort.substring( 0, 5);
				city = dndReadFileObject[dndReadFileIndex].plz_ort.substring( 6);
			}

			var jqxhr = $.ajax( 'scripts/geocoding.php?street=' + encodeURIComponent( street) + '&zip=' + encodeURIComponent( zip) + '&city=' + encodeURIComponent( city))
			.done( function( data) {
				var result = $.parseJSON( data);

				if( typeof result.errorCode != 'undefined') {
					switch( parseInt( result.errorCode)) {
					case 10:
						// Could not geocode given address
						$( '#popupDrop').html(
							'<div style="margin:2em 4em 2em 4em;text-shadow:none;">' +
							'<div style="font-size:3em;text-align:center;margin-bottom:0.5em;"><i class="fa fa-table"></i></div>' +
							'Diese Adresse konnte nicht geocodiert werden:<br><br>' + street + '<br>' + zip + ' ' + city +
							'</div>');
						$( '#popupDrop').popup( 'reposition', {positionTo: "window"});
						return;
					case 12:
						// Zip is outside Berlin-Lichtenberg
						delete result.error;
						break;
					}
				}
				if( typeof result.error != 'undefined') {
					$( '#popupDrop').html(
						'<div style="margin:0;text-shadow:none;">' +
						data + '<br>' + street + ', ' + zip + ' ' + city +
//						this.url +
						'</div>');
					$( '#popupDrop').popup( 'reposition', {positionTo: "window"});
					return;
				}

				if( typeof result.lat != 'undefined') {
					dndReadFileChanged = true;
					dndReadFileObject[dndReadFileIndex].lat = result.lat;
					dndReadFileObject[dndReadFileIndex].lng = result.lng;
					marker = new nokia.maps.map.StandardMarker([parseFloat( result.lat), parseFloat( result.lng)], { text: dndReadFileIndex + 1 });
					dndReadFileGeocodeSet.objects.add( marker);
					map.zoomTo( dndReadFileGeocodeSet.getBoundingBox(), false);
				}

				++dndReadFileIndex;
				dndReadFileObjectFunc();
			})
//			.fail( function() {
//				alert( "error" );
//			})
//			.always( function() {
//				alert( "complete" );
//			})
			;
		}
	} catch( e) {
		alert( e);
	}
}

// -----------------------------------------------------------------------------

function dndDownloadFile()
{
	try {
		var fileName = dndReadFileName;
		var fileExtension = fileName.split( '.').pop();

		fileName = fileName.substring( 0, fileName.length - fileExtension.length);
		fileName += 'geo.json';

		$( '#popupDrop').html(
			'<div style="margin:2em 4em 2em 4em;text-shadow:none;">' +
			'<div style="font-size:3em;text-align:center;margin-bottom:0.5em;"><i class="fa fa-table"></i></div>' +
			'Die Daten wurden um GPS-Koordinaten ergänzt.<br>Bitte laden sie sich die neue Datei herunter.<br>' +
			'<br><center><a href="data:text/plain;charset=utf-8,' + encodeURIComponent( JSON.stringify( dndReadFileObject)) + '" download="' + fileName + '" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-a">Datei herunterladen</a></center>' +
			'</div>');
		$( '#popupDrop').popup( 'reposition', {positionTo: "window"});
	} catch( e) {
		alert( e);
	}
}

// -----------------------------------------------------------------------------