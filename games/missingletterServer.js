


var words = [
  ['bo_t',['a','l','i','u'],['f','b','n','s','e']],
  ['station_ry',['a','e'],['d','i','y','o']],
  ['co_rse',['a','u'],['r','i','p','o']],
  ['con_ensus',['s'],['c','t','p','o']],
  ['definit_ly',['e'],['y','h','a','r']],
  ['separ_te',['a'],['y','r','e','i']]
];

var Game = function(){
  this.gameIO;
  this.players = [];
  this.playersEnded = 0;

  this.words = words;
  this.lastWords = [];
  this.actWord;
  this.actSol;

  this.maxTime = 10;
  this.winTime = 3;
  this.timeLeft;
  this.timeTick;

  this.solved;
}


Game.prototype = {
  
  _onClientConnected: function(client){
    client.on("newPlayer", this._onNewPlayer.bind(this,client));
    client.on("playerSol", this._onPlayerSolution.bind(this,client.conn.id));    
    client.on("disconnect", this._onPlayerLeaveGame.bind(this,client.conn.id));
  },

  _onNewPlayer: function(playerSocket, player){
    this.players.push(player);

    playerSocket.emit('enterGame', this.players);
    playerSocket.broadcast.emit('newPlayer', player);

    if(this.players.length == 1){
      this._newGame();
    }
    else{
      playerSocket.emit('newWord', this.actWord);      
    }
  },

  _onPlayerSolution: function(playerId,solution) {
    if(solution == this.actSol){
      if(!this.solved){
        this._playerWins(playerId);
      }
      else{
        this.gameIO.emit('playerSol',[playerId,'ok']);
      }
    }
    else{
      this.gameIO.emit('playerSol',[playerId,'ko']);
    }

    if(this.playersEnded++ == this.players.length-1){
      this.timeLeft = 0;
    }
  },

  _onPlayerLeaveGame: function(playerId) {
    for (var i = 0; i < this.players.length; i++) {
      if( playerId.indexOf(this.players[i].id) != -1){
        this.gameIO.emit('removePlayer', this.players[i].id);
        this.players.splice(i,1);
        break;
      }
    }

    if(!this.players.length){
      clearInterval(this.timeTick);
      this.timeTick = null;
    }
  },

  _getRandomWord: function(){
    var wordN = Math.floor(Math.random()*this.words.length);
    while(this.lastWords.indexOf(wordN) != -1){
      wordN = Math.floor(Math.random()*this.words.length);
    }

    var letterN = Math.floor(Math.random()*this.words[wordN][1].length);
    var filled = this.words[wordN][2].concat(this.words[wordN][1][letterN]).sort(function(){return 0.5 - Math.random()}).splice(0,5);

    this.lastWords.push(wordN);
    if(this.lastWords.length > this.words.length/2){
      this.lastWords.shift();
    }

    return [[this.words[wordN][0],filled],this.words[wordN][1][letterN]];
  },

  _newGame: function(){
    var newWord = this._getRandomWord();

    this.actWord = newWord[0];
    this.actSol = newWord[1];

    this.gameIO.emit('newWord',this.actWord);

    this.solved = false;
    this.playersEnded = 0;
    this.timeLeft = this.maxTime;
    this._setTime();

    if(!this.timeTick){
      this.timeTick = setInterval(this._setTime.bind(this),1000);
    }
  },

  _playerWins: function(playerId){
    this.solved = true;
    this.timeLeft = this.winTime;
    
    this.gameIO.emit('playerWins',playerId);
  },

  _setTime: function(){
    var sendSol = false;

    if(this.timeLeft < 0){
      this._newGame();
    }
    else if(this.timeLeft == 0){
      sendSol = this.actSol;
    }
    this.gameIO.emit('timeTick', this.timeLeft--, sendSol);
  },

  init: function(io){
    this.gameIO = io.of('/missinglet_er')
    this.gameIO.on("connection", this._onClientConnected.bind(this));    
  }
}

module.exports = new Game();

