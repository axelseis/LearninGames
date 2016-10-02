


var words = {
  'bo_t':[['a','l','i','u'],['f','b','n','s','e']],
  'station_ry':['a','e'],
  'co_rse':['coarse','course']
}

var players = [];

module.exports = function(app, io){
	io.sockets.on("connection", onSocketConnection);

  function onSocketConnection(client) {
    console.log("onSocketConnection: " + client.id);
    client.on("disconnect", onClientDisconnect);
    client.on("newPlayer", onNewPlayer);
    //client.on("move player", onMovePlayer);
  };

  function onNewPlayer(player) {
    players.push(player);
    console.log("onNewPlayer: " + players.length);

    this.broadcast.emit('newPlayer', player);
    this.emit('enterGame', players);
  };

  function onClientDisconnect() {
    var playerId = this.id;

    for (var i = 0; i < players.length; i++) {
      if( playerId.indexOf(players[i].id) != -1){
        this.broadcast.emit('removePlayer', players[i].id);
        players.splice(i,1);
        break;
      }
    }
    /*
    players = players.filter(function(obj){
      console.log('obj.id=' + obj.id + ' != ' + 'playerId:' + playerId);
      return playerId.indexOf(obj.id) != -1;
    });
    this.broadcast.emit('removePlayer', this.id);
    */
    console.log("onClientDisconnect: " + players.length);
  };
}
