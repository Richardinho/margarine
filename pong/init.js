var cluster = require('cluster');
var os = require('os');

if ( cluster.isMaster ) {

	var cpuCount = os.cpus().length;
	
	// Fork workers.
	for (var i = 0; i < cpuCount; i++) {
		console.log( 'Starting worker' );
		cluster.fork();
	}
	
	cluster.on('death', function(worker) {
		cluster.fork();
		console.log( 'Restarting worker' );
	});
  
 	var socket = require('./servers/socket');
	//var httpd = require('./servers/stdin');

} else if( cluster.isWorker ) {

	var httpd = require('./servers/httpd');
}
