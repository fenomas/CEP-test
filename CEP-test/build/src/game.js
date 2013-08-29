var b2Vec2 = Box2D.Common.Math.b2Vec2
    , b2BodyDef = Box2D.Dynamics.b2BodyDef
    , b2Body = Box2D.Dynamics.b2Body
    , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    , b2World = Box2D.Dynamics.b2World
    , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;


var PPM = 32; // pixels per meter in the physics simulation


var LayerStart = cc.Layer.extend({
    
    moveSpeed:  8,
    jumpHeight: 10,
    
    world:      null,
    hero:       null,
    keysDown:   null,
    jumpTimer:       0,
    jumpCooldown:   10,
    numFootContacts: 0,
    debug:      false,
    
    
    ctor: function() {
        this._super();
        
        // set up keyboard events
        this.setKeyboardEnabled(true);
        this.keysDown = { up:false, down:false, left:false, right:false };
        
        // level data is read in in jsonp format in index.html
        var levelData = JSON.parse( document.gameConfigJSON );
        
        // physics world:
        this.world = new b2World(new b2Vec2(0, -20), true);
        this.world.SetContinuousPhysics(true);
        this.setupDebugDraw(this.debug);
        
        // level data is read in in jsonp format in index.html
        var levelData = JSON.parse( document.gameConfigJSON );
        
        // add sprites to stage and physics for each stage object in level data
        var objects = levelData.stageInstances; // array
        for (var i=0; i<objects.length; i++) {
            this.addObject( objects[i] );
        }
        
        // create a foot listener for jumping
        this.numFootContacts = 0;
        var listener = new Box2D.Dynamics.b2ContactListener();
        var gameClosure = this;
        listener.BeginContact = function(e) {
            if (e.GetFixtureA().GetUserData() == "feet" ||
                e.GetFixtureB().GetUserData() == "feet") {
                gameClosure.numFootContacts++;
            }
        }
        listener.EndContact = function(e) {
            if (e.GetFixtureA().GetUserData() == "feet" ||
                e.GetFixtureB().GetUserData() == "feet") {
                gameClosure.numFootContacts--;
            }
        }
        this.world.SetContactListener(listener);
        
        
        this.scheduleUpdate();
        
        return true;
    },
    
    
    
    
    // function to add sprites to screen and physics
    // dat is an object: { name, left, top, width, height, scaleX/Y, metadata }
    // (metadata object is new to this demo!)
    addObject:function( dat ) {
        
        // next line works because resources are registered in resource.js
        var sprite = cc.Sprite.create(dat.name+'.png');
        // lay out size, scale
        sprite.setAnchorPoint( cc.p(0.5,0.5) );
        var cs = sprite.getContentSize();
        sprite.setScale( dat.scaleX, dat.scaleY );
        var x = dat.left+dat.width/2;
        // y gets inverted because cocos2d has origin at lower left
        var winHt = cc.Director.getInstance().getWinSize().height;
        var y = winHt - dat.top+dat.height/2;
        sprite.setPosition( cc.p(x,y) );
        this.addChild(sprite, 0);
        
        // create physics settings
        var bodyDef = new b2BodyDef();
        var static = (dat.metadata.dynamic!="true");
        bodyDef.type = (static) ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
        bodyDef.position.Set( x/PPM, y/PPM );
        bodyDef.userData = sprite;
        
        // Define the fixture.
        var dynamicBox = new b2PolygonShape();
        dynamicBox.SetAsBox( dat.width/2/PPM, dat.height/2/PPM );
        
        var fixtureDef = new b2FixtureDef();
        fixtureDef.shape = dynamicBox;
        fixtureDef.density = parseFloat(dat.metadata.density);
        fixtureDef.friction = parseFloat(dat.metadata.friction);
        fixtureDef.userData = dat.name;
        
        var body = this.world.CreateBody(bodyDef);
        body.CreateFixture(fixtureDef);
        
        // everything after this is special handling for the hero:
        if (dat.metadata.hero != "true") {
            return;
        }
        
        body.SetFixedRotation(true);
        this.jumpHeight = parseFloat(dat.metadata.jump);
        
        // give hero a foot fixture so we can tell if he's standing on something
        var footFixtureDef = new b2FixtureDef();
        footFixtureDef.isSensor = true;
        footFixtureDef.density = 0.001;
        footFixtureDef.shape = new b2PolygonShape();
        // position it at his feet
        var footWid = dat.width/4/PPM;
        var footHt = 6/PPM; // feet extend ~3 pixels below hero's box
        var footOff = new b2Vec2(0,0-dat.height/2/PPM);
        footFixtureDef.shape.SetAsOrientedBox(footWid, footHt, footOff, 0);
        footFixtureDef.userData = "feet";
        body.CreateFixture(footFixtureDef);
        
        this.hero = body;
    },
    
    
    
    
    
    update: function(dt) {
        this.handleMovement();
        
        var velocityIterations = 8;
        var positionIterations = 1;
        this.world.Step(dt, velocityIterations, positionIterations);
        
        if (this.debug) {
            this.world.DrawDebugData();
        } else {
            //Iterate over the bodies in the physics world
            for (var b = this.world.GetBodyList(); b; b = b.GetNext()) {
                if (b.GetUserData() != null) {
                    //Synchronize the AtlasSprites position and rotation with the corresponding body
                    var myActor = b.GetUserData();
                    myActor.setPosition(cc.p(b.GetPosition().x * PPM, b.GetPosition().y * PPM));
                    myActor.setRotation(-1 * cc.RADIANS_TO_DEGREES(b.GetAngle()));
                    //console.log(b.GetAngle());
                }
            }
        }
    },
    
    
    
    
    
    // jump/move if necessary
    handleMovement: function() {
        var impulse = new b2Vec2(0,0);
        // sideways movement..
        var currVel = this.hero.GetLinearVelocity().x;
        var desiredVel = 0;
        if (this.keysDown.left)  { desiredVel -= this.moveSpeed; };
        if (this.keysDown.right) { desiredVel += this.moveSpeed; };
        impulse.x = this.hero.GetMass() * (desiredVel - currVel);
        
        this.jumpTimer++;
        if (this.keysDown.up && this.numFootContacts && 
                this.jumpTimer>this.jumpCooldown) {
            var jumpHeight = 10 / PPM;
            var jumpVel = Math.sqrt(10*this.jumpHeight*2); // 10 being gravity
            impulse.y = this.hero.GetMass() * jumpVel;
            this.jumpTimer = 0;
        };
        
        this.hero.ApplyImpulse( impulse, this.hero.GetWorldCenter() );
    },
    
    
    
    // key events
    
    onKeyDown: function(key) {
        this.handleKeys(key,true);
    },
    
    onKeyUp: function(key) {
        this.handleKeys(key,false);
    },
    
    handleKeys: function(key, isDown) {
        var dir = "-";
        switch (key) {
        case 37:
        case 65: // a, left arrow
            dir = "left"; break;
        case 38:
        case 87: // w, up arrow
            dir = "up"; break;
        case 39:
        case 68: // d, right arrow
            dir = "right"; break;
        case 40:
        case 83: // s, down arrow
            dir = "down"; break;
        }
        this.keysDown[dir] = isDown;
//        console.log("Key "+((isDown) ? "down":"up")+": "+dir);
    },
    
    
    
    
    
    // debug drawing
    setupDebugDraw: function(debug) {
        if (debug) {
            var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
            var debugDraw = new b2DebugDraw();
            debugDraw.SetSprite(document.getElementById("box2D").getContext("2d"));
            
            debugDraw.SetDrawScale(PPM);
            debugDraw.SetFillAlpha(0.5);
            debugDraw.SetLineThickness(1.0);
            debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
            this.world.SetDebugDraw(debugDraw);
        } else {
            document.getElementById("box2D").style.display = "none";
        }
    }
    
    
});

var SceneStart = cc.Scene.extend({
    onEnter:function () {
        this._super();
        this.addChild(new LayerStart);
    }
});

