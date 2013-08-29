
// accessor inside angular scope.. probably a cleaner way to do this
var angScope;
var mainScope = this;

// controller for angular.js main page logic
function mainCtrl($scope) {
	angScope = $scope;
    
    $scope.dynamic = true;
    $scope.hero = false;
    $scope.density = 1;
    $scope.friction = 0.3;
    $scope.jump = 5;
    
    $scope.update = function() {
    	mainScope.writeMetadata();
    };
    $scope.setVals = function(dy,h,de,f,j) {
    	this.dynamic = dy;
    	this.hero = h;
    	this.density = de;
    	this.friction = f;
    	this.jump = j;
    	this.$apply();
    };
    
}



// functions for reading and writing metadata to and from the UI controls
function readMetadata() {
	var names = [ "dynamic", "hero", "density", "friction", "jump" ];
	var vals = [];
	for (var i in names) {
		vals[i] = callJSFL("readSelectionMetadata('"+ names[i] +"')");
	}
	vals[0] = (vals[0]=="true") ? true : false;
	vals[1] = (vals[1]=="true") ? true : false;
	angScope.setVals( vals[0], vals[1], vals[2], vals[3], vals[4] );
}

function writeMetadata() {
	var names = [ "dynamic", "hero", "density", "friction", "jump" ];
	var a = angScope;
	var vals = [ String(a.dynamic), String(a.hero), a.density, a.friction, a.jump  ];
	for (var i in names) {
		callJSFL("writeSelectionMetadata('"+ names[i] +"', '"+ vals[i] +"' );  ");
	}
}


// Flash selection changed
function onSelection() {
	var check = callJSFL("checkSelection()");
	if (check=="true") {
		setUIEnabled(true);
		readMetadata();
	} else {
		setUIEnabled(false);
		return;
	}
	
}


// UI management
function setUIEnabled(enabled) {
	var el = document.getElementsByClassName("topcoat-list")[0];
	if (enabled) {
		el.classList.remove("is-disabled");
	} else {
		angScope.setVals(false, false, "", "", "");
		el.classList.add("is-disabled");
	}
}



// set up some extension management when main body loads
function onBodyLoaded() {
	var cs = new CSInterface();
	if (window["__adobe_cep__"] && cs.hostEnvironment.appName == "FLPR"){
		// get event whenever selection changes
		cs.addEventListener("com.adobe.events.flash.selectionChanged", onSelection );
		onSelection();
	} else {
		setUIEnabled(false);
	}
}



// helper function for succinctly getting data out of callbacks from JSFL
function callJSFL(js) {
	var cs = new CSInterface();
	var result = "";
	cs.evalScript( js, function(res) { result = res; } );
	return result;
}