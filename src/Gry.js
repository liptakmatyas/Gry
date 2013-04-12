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

        scaledTeamColor: function(team, scale, alpha) {
            //console.log('[scaledTeamColor] team, scale:', team, scale);
            if (typeof alpha !== 'number') alpha = 1;
            var colorValue = Math.floor(255*scale);
            colorValue = colorValue < 0 ? 0
                       : colorValue > 255 ? 255
                       : colorValue;
            //var hexColorValue = (colorValue < 16 ? '0' : '') + colorValue.toString(16);
            //console.log('[scaledTeamColor] colorValue, hexColorValue:', colorValue, hexColorValue);
            //var c = '#'+team.replace(/0/g, '00').replace(/x/g, hexColorValue);
            //console.log('[scaledTeamColor] c:', c);
            var c = 'rgba('+team.replace(/0/g, '0,').replace(/x/g, colorValue+',')+alpha+')';
            return c;
        }

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
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
var b2ContactListener = Box2D.Dynamics.b2ContactListener;

