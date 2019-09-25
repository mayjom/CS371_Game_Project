// the-game.js
// CS371 - Game Project
// James Mayo
// 12/10/2017
// ** GAME RUNS BEST IN FIREFOX **
// The object of the game is for the player to grab as many "gems" on the
// playing field as possible before the timer below the canvas runs out,
// while avoiding and outperforming a mummy that bounces around the arena
// like a top.
// - The player, mummy, and gem start at a random location in the arena
//   with every new iteration of the game
// - When the game is loaded, the player always starts facing the south wall
// - Both the player and the mummy rebound off of walls using the
//   reflection model described in class
// - The gem, when touched by either the player or the mummy,
//   will warp to a another random location in the arena,
//   and the character who touched the gem will gain one point
// - If the mummy touches the player, the player will be warped
//   to a random location in the arena, and the mummy will
//   "steal" one point from the player; if the player has no points,
//   then nothing will be stolen
// - The player has the ability to warp to the center of the arena
//   by pressing the 'Q' key, at the cost of losing one point; can be 
//   used if the player happens to get stuck outside a wall, or for 
//   more strategic purposes, such as avoiding the mummy,etc.
// - The player also has the ability to pause the game by pressing
//   the 'E' key; this stops the mummy's movement, stops the timer,
//   and disables the player's movement until the game is unpaused
//   by pressing the key again
// - The player also has the ability to reset the game to a starting state
//   the pressing the 'R' key; this resets the timer back to 60, resets the
//   scores back to 0, and respawns the game objects in random locations
// - When the timer reaches 0, the game enters a paused state until the
//   player presses the 'R' key
// - The game status box at the bottom of the screen shows the time remaining,
//   whether game is paused or not, and, when the game is over, who won
// ** The mummy currently looks about 1/3 like a mummy and 2/3 like a
//    screwy upside-down pyramid, because I couldn't pinpoint why the program
//    overwrites the previous texture with the most recently initialized
//    one; the arena texture "spills over" into the mummy texture **
var gl;
var canvas; 
const WALLHEIGHT     = 70.0; // Some playing field parameters
const ARENASIZE      = 1000.0;
const EYEHEIGHT      = 15.0;
const PLAYER_VP        = 0.625;

const  upx=0.0, upy=1.0, upz=0.0;    // Some LookAt params 

const fov = 60.0;     // Perspective view params 
const near = 1.0;
const far = 10000.0;
var aspect;

const width = 1000;       // canvas size 
const height = 625;
const vp1_left = 0;      // Left viewport -- the hero's view 
const vp1_bottom = 0;

// Lighting stuff
var la0  = [ 0.2,0.2,0.2, 1.0 ]; // light 0 ambient intensity 
var ld0  = [ 1.0,1.0,1.0, 1.0 ]; // light 0 diffuse intensity 
var ls0  = [ 1.0,1.0,1.0, 1.0 ]; // light 0 specular 
var lp0  = [ 0.0,1.0,1.0, 1.0 ]; // light 0 position -- will adjust to hero's viewpoint 
var ma   = [ 0.02 , 0.2  , 0.02 , 1.0 ]; // material ambient 
var md   = [ 0.08, 0.6 , 0.08, 1.0 ]; // material diffuse 
var ms   = [ 0.6  , 0.7, 0.6  , 1.0 ]; // material specular 
var me      = 75;             // shininess exponent 
const red  = [ 1.0,0.0,0.0, 1.0 ]; // pure red 
const blue = [ 0.0,0.0,1.0, 1.0 ]; // pure blue 
const green = [ 0.0,1.0,0.0, 1.0 ]; // pure blue 
const yellow = [ 1.0,1.0,0.0, 1.0 ]; // pure yellow

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var program;

var arena;
var player;
var gem;
var mummy;
var playerScore = 0; // Number of gems the player has grabbed
var mummyScore = 0; // Number of gems the mummy has grabbed (or stolen)
var paused = false; // Tells whether or not the game is paused
var mummySpeed = 8.0; // Speed at which the mummy moves

var frameTimer = 3900; // A rudimentary timer variable for the game
                       // to be decremented on each animFrame
var gameTimer = 60;    // The time that is displayed on the page;
                       // Decrements by one when frameTimer is
					   // divisible by 65

var g_matrixStack = []; // Stack for storing a matrix

// Function to determine intersections in the bounding circles of game objects
function intersection(x1,x2,z1,z2,r1,r2){
	var dx = x1 - x2;
	var dz = z1 - z2;
	var distance = Math.sqrt(dx*dx+dz*dz);
	return distance < r1 + r2;
};

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    
    //    gl = WebGLUtils.setupWebGL( canvas );
    gl = WebGLDebugUtils.makeDebugContext( canvas.getContext("webgl") ); // For debugging
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    //  Configure WebGL
    
    gl.clearColor( 0.2, 0.2, 0.2, 1.0 );

    //  Load shaders and initialize attribute buffers

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    aspect=width/height;

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    gl.uniform1i(gl.getUniformLocation(program, "texture_flag"),
		 0); // Assume no texturing is the default used in
                     // shader.  If your game object uses it, be sure
                     // to switch it back to 0 for consistency with
                     // those objects that use the default.
    
    
    arena = new Arena(program);
    arena.init();

    player = new Hero(program,Math.random()*((ARENASIZE-20.0)-20.0)+20.0,
	                0.0,-Math.random()*(-20.0-(-ARENASIZE+20.0))-20.0,
					-90,20.0);
    player.init();

    gem = new ThingSeeking(program,Math.random()*((ARENASIZE-20.0)-20.0)+20.0,
                   	                0.0,-Math.random()*(-20.0-(-ARENASIZE+20.0))-20.0,
									0,20.0);
    gem.init();
	
	
	mummy = new Villain(program,Math.random()*((ARENASIZE-20.0)-20.0)+20.0,0.0,
	                      -Math.random()*(-20.0-(-ARENASIZE+20.0))-20.0,31,20.0);
    mummy.init();
    
    render();
};

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Hero's eye viewport 
    gl.viewport( vp1_left, vp1_bottom, (PLAYER_VP * width), height );
    
    lp0[0] = player.x + player.xdir; // Light in front of hero, in line with hero's direction
    lp0[1] = EYEHEIGHT;
    lp0[2] = player.z + player.zdir;
    modelViewMatrix = lookAt( vec3(player.x, EYEHEIGHT, player.z),
			      vec3(player.x + player.xdir, EYEHEIGHT, player.z + player.zdir),
			      vec3(upx, upy, upz) );
    projectionMatrix = perspective( fov, PLAYER_VP * aspect, near, far );
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    arena.show();
	
	
	// Player behavior--------------------------
	// Wall reflection
	if (player.z <= -ARENASIZE+30.0) // Hit the north wall
	{
		var v = vec2(player.xdir,player.zdir);
		var n = vec2(arena.normals[24],arena.normals[26]);
		var rX = v[0]-2*(v[0]*n[0])*n[0];
		var rZ = v[1]-2*(v[1]*n[1])*n[1];
		player.xdir = rX;
		player.zdir = rZ;
	}
	else if (player.z >= 0.0-30.0) // Hit the south wall
	{
		var v = vec2(player.xdir,player.zdir);
		var n = vec2(arena.normals[36],arena.normals[38]);
		var rX = v[0]-2*(v[0]*n[0])*n[0];
		var rZ = v[1]-2*(v[1]*n[1])*n[1];
		player.xdir = rX;
		player.zdir = rZ;
	}
	if (player.x >= ARENASIZE-30.0) // Hit the east wall
	{
		var v = vec2(player.xdir,player.zdir);
		var n = vec2(arena.normals[12],arena.normals[14]);
		var rX = v[0]-2*(v[0]*n[0])*n[0];
		var rZ = v[1]-2*(v[1]*n[1])*n[1];
		player.xdir = rX;
		player.zdir = rZ;
	}
	else if (player.x <= 0.0+30.0)  // Hit the west wall
	{
		var v = vec2(player.xdir,player.zdir);
		var n = vec2(arena.normals[0],arena.normals[2]);
		var rX = v[0]-2*(v[0]*n[0])*n[0];
		var rZ = v[1]-2*(v[1]*n[1])*n[1];
	    player.xdir = rX;
		player.zdir = rZ;
	}
	// If the mummy touches the player, teleport the player
	// to a random spot in the arena, steals one point from the player
	if (intersection(player.x,mummy.x,player.z,mummy.z,
	                 player.bounding_cir_rad,mummy.bounding_cir_rad))
	{
		if (playerScore > 0)
		{
			playerScore -= 1;
			mummyScore += 1;
		}
		document.getElementById('playerScore').innerHTML = playerScore;
		document.getElementById('mummyScore').innerHTML = mummyScore;
		player.x = Math.random()*((ARENASIZE-20.0)-20.0)+20.0;
		player.z = -Math.random()*(-20.0-(-ARENASIZE+20.0))-20.0;
	}
    player.show();
	
	// Gem behavior--------------------------
	// If the player touches it...
	if (intersection(player.x,gem.x,player.z,gem.z,
	                 player.bounding_cir_rad,player.bounding_cir_rad))
	{
		playerScore += 1;
		document.getElementById('playerScore').innerHTML = playerScore;
		gem.x = Math.random()*((ARENASIZE-20.0)-20.0)+20.0;
		gem.z = -Math.random()*(-20.0-(-ARENASIZE+20.0))-20.0;
	}
	// If the mummy touches it...
	else if (intersection(mummy.x,gem.x,mummy.z,gem.z,
	                 mummy.bounding_cir_rad,gem.bounding_cir_rad))
	{
		mummyScore += 1;
		document.getElementById('mummyScore').innerHTML = mummyScore;
		gem.x = Math.random()*((ARENASIZE-20.0)-20.0)+20.0;
		gem.z = -Math.random()*(-20.0-(-ARENASIZE+20.0))-20.0;
	}
    gem.show();
	
	
	// Mummy behavior--------------------------
	// Wall reflection
	if (mummy.z <= -ARENASIZE+30.0) // Hit the north wall
	{
		var v = vec2(mummy.xdir,mummy.zdir);
		var n = vec2(arena.normals[24],arena.normals[26]);
		var rX = v[0]-2*(v[0]*n[0])*n[0];
		var rZ = v[1]-2*(v[1]*n[1])*n[1];
		mummy.xdir = rX;
		mummy.zdir = rZ;
	}
	else if (mummy.z >= 0.0-30.0) // Hit the south wall
	{
		var v = vec2(mummy.xdir,mummy.zdir);
		var n = vec2(arena.normals[36],arena.normals[38]);
		var rX = v[0]-2*(v[0]*n[0])*n[0];
		var rZ = v[1]-2*(v[1]*n[1])*n[1];
		mummy.xdir = rX;
		mummy.zdir = rZ;
	}
	if (mummy.x >= ARENASIZE-30.0) // Hit the east wall
	{
		var v = vec2(mummy.xdir,mummy.zdir);
		var n = vec2(arena.normals[12],arena.normals[14]);
		var rX = v[0]-2*(v[0]*n[0])*n[0];
		var rZ = v[1]-2*(v[1]*n[1])*n[1];
		mummy.xdir = rX;
		mummy.zdir = rZ;
	}
	else if (mummy.x <= 0.0+30.0)  // Hit the west wall
	{
		var v = vec2(mummy.xdir,mummy.zdir);
		var n = vec2(arena.normals[0],arena.normals[2]);
		var rX = v[0]-2*(v[0]*n[0])*n[0];
		var rZ = v[1]-2*(v[1]*n[1])*n[1];
		mummy.xdir = rX;
		mummy.zdir = rZ;
	}
	// Stop the mummy's movement when the timer runs out
	if (frameTimer != 0)
	{
		mummy.move(mummySpeed);
	}
    mummy.show();
    
    // Overhead viewport 
    var horiz_offset = (width * (1.0 - PLAYER_VP) / 20.0);
    gl.viewport( vp1_left + (PLAYER_VP * width) + horiz_offset ,
		 vp1_bottom, 18 * horiz_offset, height );
    modelViewMatrix = lookAt(  vec3(500.0,100.0,-500.0),
			       vec3(500.0,0.0,-500.0),
			       vec3(0.0,0.0,-1.0) );
    projectionMatrix = ortho( -500,500, -500,500, 0,200 );
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    arena.show();
    player.show();
    gem.show();
    mummy.show();
	// If the game is paused, do not decrement frameTimer
	if (paused)
	{
		document.getElementById("timer").innerHTML = gameTimer;
	}
	// Timer runs out - Game Over
	else if (frameTimer <= 0)
	{
		frameTimer = 0;
		// If the player has the most gems
		if (playerScore > mummyScore)
		{
			document.getElementById("game_status").innerHTML = 'Game Over - Player Wins!';
		}
		// If the player and the mummy are tied
		else if (playerScore == mummyScore)
		{
			document.getElementById("game_status").innerHTML = 'Game Over - Tie!';
		}
		// If the mummy has the most gems
		else
		{
			document.getElementById("game_status").innerHTML = 'Game Over - Mummy Wins!';
		}
	}
	// Decrement the HTML timer
	else if (frameTimer % 65 == 0)
	{
		gameTimer -= 1;
		document.getElementById("timer").innerHTML = gameTimer;
		frameTimer -= 1;
	}
	// Simply decrement the frameTimer on each animFrame
	else
	{
		frameTimer -= 1;
		document.getElementById("timer").innerHTML = gameTimer;
	}
    requestAnimFrame( render );
};

// Key listener

window.onkeydown = function(event) {
    var key = String.fromCharCode(event.keyCode);
    // For letters, the upper-case version of the letter is always
    // returned because the shift-key is regarded as a separate key in
    // itself.  Hence upper- and lower-case can't be distinguished.
    switch (key) {
	// Move backward
    case 'S':
	   // If the game is not paused and
	   // the timer has not run out, allow player movement
	   if (!paused && frameTimer != 0)
	   {
	       player.move(-5.0);
	   }
	   break;
	// Move forward
    case 'W':
	   // If the game is not paused and
	   // the timer has not run out, allow player movement
	   if (!paused && frameTimer != 0)
	   {
	       player.move(5.0);
	   }
	   break;
	// Turn left 
    case 'A':
	   // If the game is not paused and
	   // the timer has not run out, allow player movement
	   if (!paused && frameTimer != 0)
	   {
	       player.turn(-3.0);
	   }
	   break;
	// Turn right 
    case 'D':
	   // If the game is not paused and
	   // the timer has not run out, allow player movement
	   if (!paused && frameTimer != 0)
	   {
	       player.turn(3.0);
	   }
	   break;
	// Teleport to the center of the arena, at the cost of one point
	case 'Q':
	   // If the game is not paused and
	   // the timer has not run out, allow player movement
	   if (!paused && frameTimer != 0)
	   {
		   if (playerScore > 0)
		   {
			  playerScore -= 1;
		   }
		   document.getElementById('playerScore').innerHTML=playerScore;
		   player.x = ARENASIZE/2.0;
		   player.z = -ARENASIZE/2.0;
	   }
	   break;
	// Pause the game
	case 'E':
	   paused = !paused;
	   // Stop the mummy's movement, indicate that the game is paused
	   if (paused)
	   {
	       mummySpeed = 0.0;
		   document.getElementById('game_status').innerHTML="Paused";
	   }
	   // Continue the mummy's movement, indicate that the game is unpaused
	   else
	   {
		   mummySpeed = 8.0;
		   document.getElementById('game_status').innerHTML="Unpaused";
	   }
	   break;
	// Reset the game and all relevant parameters
	case 'R':
	   player.x = Math.random()*((ARENASIZE-20.0)-20.0)+20.0;
	   player.z = -Math.random()*(-20.0-(-ARENASIZE+20.0))-20.0;
	   player.degrees = -90;
	   gem.x = Math.random()*((ARENASIZE-20.0)-20.0)+20.0;
	   gem.z = -Math.random()*(-20.0-(-ARENASIZE+20.0))-20.0;
	   mummy.x = Math.random()*((ARENASIZE-20.0)-20.0)+20.0;
	   mummy.z = -Math.random()*(-20.0-(-ARENASIZE+20.0))-20.0;
	   mummy.degrees = 31;
	   playerScore = 0;
	   mummyScore = 0;
	   frameTimer = 3900;
	   gameTimer = 60;
	   document.getElementById('playerScore').innerHTML=0;
	   document.getElementById('mummyScore').innerHTML=0;
	   // Determine what state to show in the game status box
	   if (paused)
	   {
		   document.getElementById('game_status').innerHTML="Paused";
	   }
	   else
	   {
		   document.getElementById('game_status').innerHTML="Unpaused";
	   }
	   document.getElementById('timer').innerHTML=60;
	   break;
    };
};