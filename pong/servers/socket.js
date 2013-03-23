var socket = require('socket.io');
var http = require('http');

// Create socket server
var io = require('socket.io').listen(8000);
io.set("log level", 1);
io.set("browser client minification", true);
io.set("browser client etag", true);
io.set("browser client gzip", true);

// Set some default global values

var clientID = 0;
var state = { ball: { x:0, y: 0, vx: 10, vy: 10 }, leftPaddle: 50, rightPaddle: 50 };
var scores = { player1: 0, player2: 0 }

function moveBall(){

	if( state.ball.y + state.ball.vy > 400 ){ 
		bounceY();
	}
	
	if( state.ball.x + state.ball.vx >= 600 ){
		bounceX();	
		score(1,1);
		publishScores();
		resetGame();	 		
	}

	if( state.ball.y + state.ball.vy <= 0 ){ 
		bounceY();
	}
	
	if( state.ball.x + state.ball.vx <= 0 ){
		bounceX();		
		score(2,1);
	 	publishScores();
	 	resetGame();
	}

	if (state.ball.x < 50) {
		if((state.ball.y > state.leftPaddle) && (state.ball.y < (state.leftPaddle + 100) )) {
			bounceX();
		}
	}

	if (state.ball.x > 600 - 60) {
		if((state.ball.y > state.rightPaddle) && (state.ball.y < (state.rightPaddle + 100) )) {
			bounceX();
		}
	
	}	

	state.ball.y = state.ball.y + state.ball.vy;
	state.ball.x = state.ball.x + state.ball.vx;
}

function publishScores(){
	io.sockets.emit( "pong" ).emit( "scores", scores );
}

function resetGame(){
 	state.ball.x = 300;
	state.ball.y = 200;
}

function bounceX(){
	state.ball.vx = -state.ball.vx; 
}

function bounceY(){
	state.ball.vy = -state.ball.vy; 
}

function score( player, count ){

	if( player === 1 ) {
		scores.player1 = scores.player1 + count;
	}

	if( player === 2 ) {
		scores.player2 = scores.player2 + count;
	}	
}


setInterval( function(){
	moveBall();
	io.sockets.emit( "pong" ).emit( "update ball", state.ball );
}, 30 );

resetGame();

io.sockets.on( "connection", function( socket ){
    console.log("on connection")
	var playerID = clientID++;	

	socket.join("pong");
	
	socket.emit( "pong" ).emit( "scores", scores );
	socket.emit( "update paddle", { player: 0, position: state.leftPaddle } );
	socket.emit( "update paddle", { player: 1, position: state.rightPaddle } );

	socket.on( "paddle", function( options ){
	
		if( options.player === 0 ) {
			state.leftPaddle = options.position;
		}

		if( options.player === 1 ) {
			state.rightPaddle = options.position;
		}
				
		socket.broadcast.to( "pong" ).emit( "update paddle", { player: options.player, position: options.position } );
	});
	

	/* Sent on disconnect */
	socket.on( "disconnect", function( options ){		
		clientID--;
	});
	
} );