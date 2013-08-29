
/** based on hello-world project from cocos2d-x.org, by Ricardo Quesada */

(function () {
    var d = document;
    var c = {
        COCOS2D_DEBUG:2, //0 to turn debug off, 1 for basic debug, and 2 for full debug
        box2d:true,
        chipmunk:false,
        showFPS:true,
        loadExtension:false,
        frameRate:60,
        tag:'gameCanvas', //the dom element to run cocos2d on
        engineDir:'./cocos2d/',
        //SingleEngineFile:'',
        appFiles:[
            'src/resource.js',
            'src/game.js'//add your own files in order here
        ]
    };

    if(!d.createElement('canvas').getContext){
        alert( 'Canvas seems to be unsupported..');
        return;
    }


    window.addEventListener('DOMContentLoaded', function () {
        //first load engine file if specified
        var s = d.createElement('script');
        s.src = c.engineDir + 'platform/jsloader.js';
        d.body.appendChild(s);
        document.ccConfig = c;
        s.id = 'cocos2d-html5';
    });
    
})();
