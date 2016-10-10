


var begins = [
  ['He was born with a gift of laughter and a sense that the world was mad', 'Raphael Sabatini', 'Scaramouche'],
  ['It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.', 'Jane Austen', 'Pride and Prejudice'],
  ['Every summer Lin Kong returned to Goose Village to divorce his wife, Shuyu.', 'Ha Jin', 'Waiting'],
  ['It was a bright cold day in April, and the clocks were striking thirteen.', 'George Orwell', '1984'],
  ['Once upon a time, there was a woman who discovered she had turned into the wrong person.', 'Anne Tyler', 'Back When We Were Grownups'],
  ['Peggy was a kind woman, a quiet woman, a librarian who lived on Oak Street with her loyal dog, Ginger. They ate together. They walked together. They read books together. They watched television together. Their life was perfect.', '?', '?'],
  ['Miss Brooke had that kind of beauty which seems to be thrown into relief by poor dress.', 'George Eliot', 'Middlemarch'],
  ['It was the day my grandmother exploded.', 'Iain Banks', 'The Crow Road']
];

var StoryChat = function(){
  this.gameIO;
  this.players = [];
  this.actPlayerIndex;
 
  this.begins = begins;
  this.lastBegins = [];
  this.story = [];

  this.maxElapsedTime = 20;
}


StoryChat.prototype = {
  
  _onClientConnected: function(client){
    client.on("newPlayer", this._onNewPlayer.bind(this,client));
    client.on("playerDismiss", this._onPlayerDismiss.bind(this));    
    client.on("TheEnd", this._onTheEnd.bind(this));    
    client.on("playerWrite", this._onPlayerWrite.bind(this));    
    client.on("playerEndsWrite", this._onPlayerEndsWrite.bind(this));    
    client.on("disconnect", this._onPlayerLeaveGame.bind(this,client.conn.id));
  },

  _onNewPlayer: function(playerSocket, player){
    this.players.push(player);

    playerSocket.emit('enterGame', this.players, this.story);
    playerSocket.broadcast.emit('newPlayer', player);

    if(!this.story.length){
      this._newStory();
    }
    if(this.actPlayerIndex == null){
      this._setNextPlayer2Write();
    }
    else{
      this._onPlayerWrite(this.players[this.actPlayerIndex].id, 'waiting...');
    }
  },

  _onPlayerWrite: function(playerId,text) {
    var newPar = [playerId,text]
    this.gameIO.emit('playerWrite',newPar);
  },

  _onPlayerEndsWrite: function(playerId, playerPar) {
    this.story.push(playerPar);
    this._setNextPlayer2Write();
  },

  _onPlayerDismiss: function(playerId) {
    this.gameIO.emit('playerDismiss', this.players[this.actPlayerIndex].id);
    this._setNextPlayer2Write();
  },

  _onTheEnd: function(playerId, playerPar) {
    this.gameIO.emit('TheEnd', playerPar);

    this.story = [];

    while(this.players.length){ //when disconnect, fires _onPlayerLeaveGame
      this.gameIO.connected['/storychat#' + this.players[0].id].disconnect();
    }
  },

  _onPlayerLeaveGame: function(playerId) {
    var actPlayerId = this.actPlayerIndex != null ? this.players[this.actPlayerIndex].id : null;

    for (var i = 0; i < this.players.length; i++) {
      if( playerId.indexOf(this.players[i].id) != -1){
        this.gameIO.emit('removePlayer', this.players[i].id);
        this.players.splice(i,1);
        break;
      }
    }

    if(!this.players.length){
      this.actPlayerIndex = null;
    }
    else if(this.story.length && (this.actPlayerIndex == null || playerId == actPlayerId)){
      this._setNextPlayer2Write();
    }
  },
 
  _getRandomBegin: function(){
    var beginN;
    do {
      beginN = Math.floor(Math.random()*this.begins.length);
    } 
    while(this.lastBegins.indexOf(beginN) != -1)

    this.lastBegins.push(beginN);
    if(this.lastBegins.length >= Math.floor(this.begins.length/2)){
      this.lastBegins.shift();
    }
    return this.begins[beginN];
  },

  _newStory: function(){
    var newBegin = this._getRandomBegin();

    this.story = [newBegin];
    this.actPlayerIndex = null;

    this.gameIO.emit('newStory',this.story);
    this.playersVotedEnd = 0;
  },

  _setNextPlayer2Write: function(){ 
    if(this.actPlayerIndex == null || this.actPlayerIndex >= this.players.length-1){
      this.actPlayerIndex = 0;
    }
    else{
      this.actPlayerIndex++ ;
    }

    this.gameIO.emit('nextPlayer2Write', this.players[this.actPlayerIndex].id);
  },

  init: function(io){
    this.gameIO = io.of('/storychat')
    this.gameIO.on("connection", this._onClientConnected.bind(this));    
  }
}

module.exports = new StoryChat();

