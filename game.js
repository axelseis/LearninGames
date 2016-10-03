


var words = [
  ['bo_t',['a','l','i','u'],['f','b','n','s','e']],
  ['station_ry',['a','e'],['d','i','y']],
  ['co_rse',['a','u'],['r','i','p']]
]


var players = [];
var maxTime = 10;
var winTime = 3;
var actWord,
    playersEnded,
    timeTick,
    timeLeft,
    solved;

module.exports = function(app, io){
	io.sockets.on("connection", onSocketConnection);

  newGame = function(){
    var wordN = Math.floor(Math.random()*words.length);
    var letterN = Math.floor(Math.random()*words[wordN][1].length);
    var filled = words[wordN][1].slice(0).splice(letterN+1,1).concat(words[wordN][2]).sort(function(){return 0.5 - Math.random()}).splice(0,4).concat(words[wordN][1][letterN]).sort(function(){return 0.5 - Math.random()});
    
    actWord = [words[wordN][0],words[wordN][1][letterN],filled];
    solved = false;
    playersEnded = 0;
    timeLeft = maxTime;

    io.sockets.emit('newWord',actWord);

    setTime();
    if(!timeTick){
      timeTick = setInterval(setTime,1000);
    }
  };

  playerWins = function(playerId){
    console.log('playerWins', playerId);
    solved = true;
    timeLeft = winTime;
    
    io.sockets.emit('playerWins',playerId);
  };

  setTime = function(){
    if(timeLeft < 0){
      newGame();
    }
    io.sockets.emit('timeTick',timeLeft--);
  }

  function onSocketConnection(client) {      //console.log('client', client);
    console.log("onSocketConnection: ", client.conn.id);
    client.on("disconnect", onClientDisconnect);
    client.on("newPlayer", onNewPlayer);
    client.on("playerSol", onPlayerSolution);
  };

  function onPlayerSolution(solution) {
    console.log('onPlayerSolution', solution);

    if(solution == actWord[1]){
      if(!solved){
        playerWins(this.conn.id);
      }
      else{
        io.sockets.emit('playerSol',[this.conn.id,'ok']);
      }
    }
    else{
      io.sockets.emit('playerSol',[this.conn.id,'ko']);
    }

    if(playersEnded++ == players.length){
      newGame();
    }
  };

  function onNewPlayer(player) {
    players.push(player);
    console.log('onNewPlayer' + players.length);

    this.broadcast.emit('newPlayer', player);
    this.emit('enterGame', players);

    if(players.length == 1){
      newGame();
    }
    else{
      this.emit('newWord', actWord);      
    }
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
    console.log('onClientDisconnect' + this.id + ' -> ' + players.length);

    if(!players.length){
      clearInterval(timeTick);
    }
  };
}
