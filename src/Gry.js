(function() {
    if (typeof Gry !== 'undefined') { throw 'Gry already defined'; }

    //  The rest of the components will attach themselves to this object
    window.Gry = {
        //  Random position within 80% of given dimensions
        //  d{w,h} -> p{x,y}
        rndPos: function(d) {
            //console.log('[Gry.rndPos] d:', d);
            var p = { x: (0.1+Math.random()*0.8)*d.w, y: (0.1+Math.random()*0.8)*d.h };
            //console.log('[Gry.rndPos] p:', p);
            return p;
        },

    };

}());

//  Box2D aliases
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2AABB = Box2D.Collision.b2AABB;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
var b2ContactListener = Box2D.Dynamics.b2ContactListener;

