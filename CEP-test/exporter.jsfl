(function () {

	//
	//  Flash level editor, sample JSON export script!
	//  by andy hall - @fenomas - andhall@adobe.com
	//

	
	// config:
	var exportDir = "levelData/";
	
	
	// helpers and setup
	function trace(s) {
		fl.trace(s);
	}
	fl.outputPanel.clear();

	// get the document
	var doc = fl.getDocumentDOM();
	if (!doc) {
		// try the first doc that's open
		doc = fl.documents[0];
		if (!doc) {
			alert("Unable to find open FLA document");
			return;
		}
	}
	
	// environmental vars
	var pathURI = doc.pathURI.replace(doc.name, "");
	var exportPath = pathURI + exportDir;
	var jsonFilename = doc.name.replace(".fla", ".jsonp");
	
	
	// read in JSON lib - seems that JSON is not yet built into the JSFL VM
	eval(FLfile.read(pathURI + "json.jsfl"));
	
	
	
	// Now we scan the stage for stuff, and keep track of what will be exported

	var json = {};
	json.stageInstances = [];
	var libItemsToExport = [];

	// scan the stage for stuff to export
	// assume only one frame for now
	var stage = doc.timelines[0];

	var lc = stage.layerCount;
	for (var i = 0; i < lc; i++) {
		var els = stage.layers[i].frames[0].elements;
		for (var j in els) {
			var el = els[j];
			if (el.elementType == "instance") {
				var o = {};
				var props = [ "left", "top", "width", "height", "scaleX", "scaleY"];
				for (var s in props) {
					o[props[s]] = el[props[s]];
				}
				var lib = el.libraryItem;
				o.name = lib.name;
				json.stageInstances.push(o);

				if (libItemsToExport.indexOf(lib.name) == -1) {
					libItemsToExport.push(lib.name);
				}
				
				// New code to export custom metadata set with the custom HTML5 panel:
				o.metadata = {};
				var pNames = el.getPersistentDataNames();
				for (var k = 0; k < pNames.length; k++) {
					var name = pNames[k];
					o.metadata[name] = el.getPersistentData(name);
				}
				// end new code for metadata!
				
			}
		}
	}


	// JSON oputput
	var jsonFile = exportPath + jsonFilename;
	var jsonData = JSON.encode(json);
	// conver to JSONP
	jsonData = "document.gameConfigJSON = '" + jsonData + "';";
	
	if ( !FLfile.write(jsonFile, jsonData) ) {
		alert('Error: unable to write out json file!');
	}


	// export images as needed
	
	for (var i = 0; i < libItemsToExport.length; i++) {
		var item = libItemsToExport[i];
		exportItem(item);
	}
	
	
	
	// helper for exporting a library item as PNG
	// borrowed much of this code from: 
	//     https://github.com/oopstoons/shporter/blob/master/Library/png_exporter.jsfl

	function exportItem(name) {
		// create temp scene to add item to, cut the item and kill the temp scene
		doc.library.selectItem(name, true);
		doc.exitEditMode();
		doc.addNewScene("__DELETE_ME__");
		doc.library.addItemToDocument({
			x: 0,
			y: 0
		}, name);
		
		var el = doc.selection[0];
		el.x -= el.left;
		el.y -= el.top;
		var size = {
			w: el.width,
			h: el.height,
		}
		doc.clipCut();
		doc.deleteScene();
		
		// create new output doc
		fl.createDocument();
		tmpDoc = fl.getDocumentDOM();
		tmpDoc.width  = Math.ceil(size.w+1);
		tmpDoc.height = Math.ceil(size.h+1);

		// pastes the clipboard item
		tmpDoc.clipPaste(true);
		//var element = tmpDoc.selection[0];
		//element.symbolType = 'graphic';
		
		// save the stage as PNG
		var imgFilename = exportPath + name + ".png";
		tmpDoc.exportPNG( imgFilename, false, true );
		
		// clean up
		tmpDoc.close(false);
	}


})();