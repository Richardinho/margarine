var http = require('http');
var mime = require('mime');
var querystring = require('querystring');
var fs = require('fs');

var fileCache = {};
var RegExpDirMatch = /\/$/;
var RegExpJSMatch = /\.module$|\.module\?.*?$/;
var RegExpQSMatch = /\.module\?.*?$/;
var RegExpQSReplace = /^.*?\.module\?/;

http.createServer(function (req, res) {
		
	if( RegExpJSMatch.test( req.url ) ) {
	
		if( RegExpQSMatch.test( req.url ) ) {
		
			var params = querystring.parse( req.url.replace( RegExpQSReplace, "" ) );
			req.url = req.url.replace( RegExpQSMatch, '.module' );
			
		} else {
			var params = {};
		}
		
		var url = __dirname + "/../httpdocs"  + req.url;

		//try {
			
			var fileStats = fs.statSync( url );
						
			if( fileCache[ url ] !== fileStats.ino ) {								
				delete require.cache[ url ];
				fileCache[ url ] = fileStats.ino;
			}
												
			content = require( url );
						
			if( typeof content === "function" ) {
					
				content( params, function( data ){
				
					var data = JSON.stringify( data );
					
					res.writeHead( 200, {"Content-Type": "application/json; charset=ISO-8859-1" } );
					res.write( data );
					res.end();
				});
				
			} else {
			
				res.write( content.toString() );			
				res.end();			
			}
			
/*
		} catch (e){
		
			res.writeHead(500, {"Content-Type": "text/html"} );	
			res.end( "error" );
			console.log( e );
		}
*/	

	} else {
	
		if( RegExpDirMatch.test( req.url ) ) {
			req.url += 'index.htm';
		}
	
		fs.readFile( __dirname + "/../httpdocs" + req.url, function( error, data ){
		
			if( !error ) {
				res.writeHead(200, { "Content-Type": mime.lookup( req.url ) } );			
				res.end( data );
			} else {
				res.writeHead(404, { "Content-Type": "text/html" } );
				res.end( "" );
			}
		});		
	}
		
}).listen(8080);

