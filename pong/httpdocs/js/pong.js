var Pong = function( socket ){

	var self = this;
	
	this.state = { width: 600, height: 400, offset: 50, paddleWidth: 100, paddleOne: 50, paddleTwo: 50 };

	this.paddleOne = jQuery( '#paddleOne' );
    this.paddleTwo = jQuery( '#paddleTwo' );
    this.ball = jQuery( '#ball' );

    this.scorePlayerOne = jQuery( '#playerOneScore' );
    this.scorePlayerTwo = jQuery( '#playerTwoScore' );


	this.currentPlayer = this.paddleOne;

	// Set ball positions
	this.paddleOne.action({ 
		left: this.state.offset + 'px', 
		height: this.state.paddleWidth + 'px'
	});
	
	this.paddleTwo.action({ 
		right: this.state.offset + 'px', 
		height: this.state.paddleWidth + 'px'
	});
	
	this.paddleOne.draggable({
	    move: false,
	    onChange: $.proxy( function( elem, position ){
	        self.handleDrag( elem, position, 0 )
	    }, this )
	});
	
	this.paddleTwo.draggable({
	    move: false,
	    onChange: $.proxy( function( elem, position ){
	        self.handleDrag( elem, position, 1 )
	    }, this )
	});
	
	this.setPosition( this.paddleOne, this.state.paddleOne )
	this.setPosition( this.paddleTwo, this.state.paddleTwo )

	
	jQuery( document ).bindKey( ['up'], $.proxy( function( ){ self.handleUpKey( this.paddleTwo, 1 ) }, this ) );
	jQuery( document ).bindKey( ['down'], $.proxy( function( ){ self.handleDownKey( this.paddleTwo, 1 ) }, this ) );
			
	jQuery( document ).bindKey( ['w'], $.proxy( function( ){ self.handleUpKey( this.paddleOne, 0 ) }, this ) );
	jQuery( document ).bindKey( ['s'], $.proxy( function( ){ self.handleDownKey( this.paddleOne, 0 ) }, this ) );
			
			
	this.socket = socket.connect();
    this.bindSockets();

};

Pong.prototype.crop = function( position ){
	return ( position > 0 ? ( position > this.state.height - this.state.paddleWidth ? this.state.height - this.state.paddleWidth : position ) : 0 );
};


Pong.prototype.handleDrag = function( elem, position, player ){
	var position = this.crop( position.startY + position.offsetY )
	this.setPosition( elem, position, player );
};

Pong.prototype.setPosition = function( paddle, position, player ){

    if( this.socket ) {
        this.socket.emit( "paddle", { player: player, position: position } );
    }
    
    renderPaddle(paddle, position);
};

Pong.prototype.bindSockets = function(){

    var self = this;

    if( this.socket ) {

        this.socket.on( "update paddle", function( options ){
        
            if( options.player === 0 ) {
                renderPaddle( self.paddleOne, options.position );
            }

            if( options.player === 1 ) {
                renderPaddle( self.paddleTwo, options.position );
            }
        });

        this.socket.on( "update ball", function( options ){
            renderBall(self.ball, options);
        });

        this.socket.on( "scores", function( options ){
            jQuery( '#playerOneScore' ).html( options.player1 );
            jQuery( '#playerTwoScore' ).html( options.player2 );
        });

    }
};

Pong.prototype.handleUpKey = function( elem, player ){
	var position = this.crop( jQuery( elem ).property('top').value - 20 )
	this.setPosition( elem, position, player  );
};


Pong.prototype.handleDownKey = function( elem, player ){
	var position = this.crop( jQuery( elem ).property('top').value + 20 )
	this.setPosition( elem, position, player  );	
};


jQuery( document ).ready( function(){
	var game = new Pong( new Sockets() );
});

function renderPaddle(paddle, position) {
    jQuery( paddle ).action( { top: position + 'px' } );

}

function renderBall(ball, position){
    jQuery( ball ).action( {
        left: position.x + 'px', top: position.y + 'px'
    });
}
