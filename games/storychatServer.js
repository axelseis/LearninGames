


var beginsEN = require('./beginsEN.json');
var beginsES = require('./beginsES.json');

var StoryChat = function(){
  this.gameIO;
  this.players = {};
  this.actPlayerIndex = {};
 
  this.begins = {
    en: beginsEN,
    es: beginsES
  };

  this.lastBegins = {en:[],es:[]};
  this.story = {en:[],es:[]};

  this.maxElapsedTime = 20000;
}


StoryChat.prototype = {
  
  _onClientConnected: function(client){
    client.on("newPlayer", this._onNewPlayer.bind(this,client));
    client.on("playerDismiss", this._onPlayerDismiss.bind(this,client));    
    client.on("TheEnd", this._onTheEnd.bind(this,client));    
    client.on("playerWrite", this._onPlayerWrite.bind(this,client));    
    client.on("playerEndsWrite", this._onPlayerEndsWrite.bind(this,client));    
    client.on("disconnect", this._onPlayerLeaveGame.bind(this,client));
  },

  _onNewPlayer: function(playerSocket, player){
    playerSocket._gameRoom = player.room;
    playerSocket.join(player.room);

    if(!this.players[player.room]){
      this.players[player.room] = [];
    }
    this.players[player.room].push(player);

    playerSocket.emit('enterGame', this.players[player.room], this.story[player.room]);
    playerSocket.broadcast.in(player.room).emit('newPlayer', player);

    if(!this.story[player.room].length){
      this._newStory(player.room);
    }
    
    if(this.actPlayerIndex[player.room] == null){
      this._setNextPlayer2Write(player.room);
    }
    else{
      console.log('alguien está escribiendo: ', this.players[player.room][this.actPlayerIndex[player.room]])
      //playerSocket.emit('playerWrite', [this.players[player.room][this.actPlayerIndex[player.room]].id, 'waiting...']);

      playerSocket.emit('playerWrite', [this.players[player.room][this.actPlayerIndex[player.room]].id, 'waiting...']);

      //this._onPlayerWrite(playerSocket, 'waiting...');
    }
  },

  _onPlayerWrite: function(playerSocket,text) {
    var playerId = playerSocket.conn.id;
    var playerRoom = playerSocket._gameRoom;
    var newPar = [playerId,text]

    this.gameIO.in(playerRoom).emit('playerWrite',newPar);
  },

  _onPlayerEndsWrite: function(playerSocket, playerPar) {
    var playerRoom = playerSocket._gameRoom;

    this.story[playerRoom].push(playerPar);
    this._setNextPlayer2Write(playerRoom);
  },

  _onPlayerDismiss: function(playerSocket) {
    var playerId = playerSocket.conn.id;
    var playerRoom = playerSocket._gameRoom;
    
    this.gameIO.in(playerRoom).emit('playerDismiss', playerId);
    this._setNextPlayer2Write(playerRoom);
  },

  _onTheEnd: function(playerSocket, playerPar) {
    var playerRoom = playerSocket._gameRoom;

    this.gameIO.in(playerRoom).emit('TheEnd', playerPar);

    this.story[playerRoom] = [];

    while(this.players[playerRoom].length){ //when disconnect, fires _onPlayerLeaveGame
      this.gameIO.connected['/storychat#' + this.players[playerRoom][0].id].disconnect();
    }
  },

  _onPlayerLeaveGame: function(playerSocket) {
    var playerId = playerSocket.conn.id;
    var playerRoom = playerSocket._gameRoom;
    var actPlayerId = this.actPlayerIndex[playerRoom] != null ? this.players[playerRoom][this.actPlayerIndex[playerRoom]].id : null;

    for (var i = 0; i < this.players[playerRoom].length; i++) {
      if( playerId.indexOf(this.players[playerRoom][i].id) != -1){
        this.gameIO.in(playerRoom).emit('removePlayer', this.players[playerRoom][i].id);
        this.players[playerRoom].splice(i,1);
        break;
      }
    }

    if(!this.players[playerRoom].length){
      this.actPlayerIndex[playerRoom] = null;
    }
    else if(this.story[playerRoom].length && (this.actPlayerIndex[playerRoom] == null || playerId == actPlayerId)){
      this._setNextPlayer2Write(playerRoom);
    }
  },
 
  _getRandomBegin: function(lang){
    var beginN;
    do {
      beginN = Math.floor(Math.random()*this.begins[lang].length);
    } 
    while(this.lastBegins[lang].indexOf(beginN) != -1)

    this.lastBegins[lang].push(beginN);
    if(this.lastBegins[lang].length >= Math.floor(this.begins[lang].length/2)){
      this.lastBegins[lang].shift();
    }
    return this.begins[lang][beginN];
  },

  _newStory: function(lang){
    var newBegin = this._getRandomBegin(lang);

    this.story[lang] = [newBegin];
    this.actPlayerIndex[lang] = null;

    this.gameIO.in(lang).emit('newStory',this.story[lang]);
  },

  _setNextPlayer2Write: function(lang){ 
    if(this.actPlayerIndex[lang] == null || this.actPlayerIndex[lang] >= this.players[lang].length-1){
      this.actPlayerIndex[lang] = 0;
    }
    else{
      this.actPlayerIndex[lang]++ ;
    }

    this.gameIO.in(lang).emit('nextPlayer2Write', this.players[lang][this.actPlayerIndex[lang]].id);
  },

  init: function(io){
    this.gameIO = io.of('/storychat')
    this.gameIO.on("connection", this._onClientConnected.bind(this));    
  }
}

module.exports = new StoryChat();

