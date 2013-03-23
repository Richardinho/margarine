var Sockets = function(){

};

Sockets.prototype.connect = function(){
	
	if( typeof io !== 'undefined' ) {
		this.socket = io.connect("http://" + "localhost", {
			"connect timeout": 2000,
			"port": 8000
		});
	}
		
	return this.socket;
};