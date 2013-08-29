

var cs = new CSInterface();

// this file defines functions in the JSFL VM, to be called from the panel
// 
// we do this by defining the functions locally, then passing their toString over to the other VM



//check the selection to see if there's anything whose metadata can be seen

function checkSelection() {
	var els = getPersistableSelected();
	return (els && els.length>0);
};
cs.evalScript( checkSelection.toString() );




// helper function to get all selected elements that can have metadata

function getPersistableSelected() {
	var doc = fl.getDocumentDOM();
	if (!doc) 			{ return null; }
	var sel = doc.selection;
	if (!sel) 			{ return null; }
	var els = [];
	for (var s in sel) {
		if (sel[s].elementType != "shape") {
			els.push( sel[s] );
		}
	}
	return els;
}
cs.evalScript( getPersistableSelected.toString() );




// loop through the selected elements, reading metadata, and return value if they all match

function readSelectionMetadata(name) {
	var els = getPersistableSelected();
	if (els.length==0) { return ''; }
	var result = els[0].getPersistentData(name);
	for (var i=1; i<els.length; i++) {
		if (result != els[i].getPersistentData(name)) {
			return '';
		}
	}
	return result;
}
cs.evalScript( readSelectionMetadata.toString() );





// loop through the selected elements, writing metadata to all, or removing it if value is ""

function writeSelectionMetadata(name, value) {
	var els = getPersistableSelected();
	for (var i=0; i<els.length; i++) {
		if (value=="") {
			els[i].removePersistentData(name);
		} else {
			els[i].setPersistentData(name, "string", value);
		}
	}
}
cs.evalScript( writeSelectionMetadata.toString() );

