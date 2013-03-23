var trader = require('trader');
var cache = new ( require('cache') )();


/* Listen for terminal commands */

process.stdin.resume();
process.stdin.setEncoding('utf8');
 
process.stdin.on('data', function (chunk) {

	var commands = new TerminalCommands();
	var parts = commands.parts( chunk );
		
	if( typeof commands[ parts.command ] === 'function' ) {
		commands[ parts.command ]( parts.vars );
	}
});


/* Terminal commands */

var TerminalCommands = function(){};

TerminalCommands.prototype.clean = function( chunk ){
	return chunk.replace( /^[\n\r\t\s]{1,}|[\n\r\t\s]{1,}$/, '' );
};

TerminalCommands.prototype.parts = function( chunk ){

	chunk = this.clean( chunk );
	
	var cmd = chunk.replace( /^([a-zA-Z]{1,})[\s]{1,}.*$/g, '$1' );
	var vars = chunk.replace( /^[a-zA-Z]{1,}[\s]{1,}(.*)$/g, '$1' );
	
	return { command: cmd, vars: vars !== cmd ? vars : "" };
};

TerminalCommands.prototype.db = function(){

	var at = new trader();
	
	at.fetchFilter( at.options(), function( result ){
	
		var makes = Object.keys( result.filter.make );
			
		for( var makeValue in result.filter.make ) {
		
			if( makeValue !== "" ){
				
				at.reset();	
				at.set( { make: makeValue } );
				
				var makeName = makeValue;
										
				at.fetch( at.options(), function( result ){
					console.log( "Adding " + result.result.length + " cars" );
				}, 5 );
			}
		}
	});
};

TerminalCommands.prototype.count = function( vars ){
	console.log( cache.select( 'used' ).length );
};