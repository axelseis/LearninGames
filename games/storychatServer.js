


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
  this.actPlayer;
 
  this.begins = begins;
  this.lastBegins = [];
  this.story = [];

  this.maxElapsedTime = 20;
}


StoryChat.prototype = {
  
  _onClientConnected: function(client){
    client.on("newPlayer", this._onNewPlayer.bind(this,client));
    client.on("playerPar", this._onPlayerPar.bind(this,client.conn.id));    
    client.on("playerVoteEnd", this._onPlayerVoteEnd.bind(this,client.conn.id));    
    client.on("disconnect", this._onPlayerLeaveGame.bind(this,client.conn.id));
  },

  _onNewPlayer: function(playerSocket, player){
    this.players.push(player);

    playerSocket.emit('enterGame', this.players, this.story);
    playerSocket.broadcast.emit('newPlayer', player);

    if(this.players.length == 1){
      this._newGame();
    }
  },

  _onPlayerPar: function(playerId,paragraph) {
    var newPar = [paragraph,playerId]
    
    this.story.push(newPar);
    this.gameIO.emit('playerPar',newPar);
  },

  _onPlayerVoteEnd: function(playerId) {
    //Send message to all players and wait for their votes
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
      //this.endStory();
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

  _newGame: function(){
    var newBegin = this._getRandomBegin();

    this.story = [newBegin];
    this.actPlayer = null;

    this.gameIO.emit('newStory',this.story);
    this.playersVotedEnd = 0;

    this._setNextPlayer2Write();
  },

  _setNextPlayer2Write: function(){
    if(!this.actPlayer || this.players.indexOf(this.actPlayer) == this.players.length){
      this.actPlayer = this.players[0];
    }
    else{
      this.actPlayer = this.players[this.players.indexOf(this.actPlayer)+1];
    }

    this.gameIO.emit('newPlayer2Write', this.actPlayer.id);

    //var playerSocket = this.gameIO.connected['/storychat#' + this.actPlayer.id];
    //console.log('this.gameIO.connected', this.gameIO.connected);
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
    this.gameIO = io.of('/storychat')
    this.gameIO.on("connection", this._onClientConnected.bind(this));    
  }
}

module.exports = new StoryChat();

