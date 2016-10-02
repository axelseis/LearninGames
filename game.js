


//===============socket.io============

module.exports = function(app, io){

	io.sockets.on("connection", onSocketConnection);

	function onSocketConnection(client) {
	    console.log("New player has connected: "+client.id);
	    //client.on("disconnect", onClientDisconnect);
	    //client.on("new player", onNewPlayer);
	    //client.on("move player", onMovePlayer);
	};
};
/*
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });
});
*/