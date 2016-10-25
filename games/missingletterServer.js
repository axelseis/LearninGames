

var wordsEN = require("an-array-of-english-words");
var wordsES = require("an-array-of-spanish-words");
var letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','t','u','v','w','x','y','z'];

var MissingLetter = function(){
  this.gameIO;
  this.players = {};
  this.playersEnded = {
    en: 0,
    es: 0
  };

  this.words = {
    en: wordsEN,
    es: wordsES
  };

  this.letters = {
    en: letters,
    es: letters.concat(['ñ','á','é','í','ó','ú'])
  }

  this.lastWords = {en:[],es:[]};
  this.actWord = {};
  this.actSol = {};

  this.maxTime = 10;
  this.winTime = 3;
  this.timeLeft = {};
  this.timeTick = {};

  this.solved = [];
}


MissingLetter.prototype = {
  
  _onClientConnected: function(client){
    client.on("newPlayer", this._onNewPlayer.bind(this,client));
    client.on("playerSol", this._onPlayerSolution.bind(this,client));    
    client.on("disconnect", this._onPlayerLeaveGame.bind(this,client));
  },

  _onNewPlayer: function(playerSocket, player){
    var playerRoom = player.room || this.getLocale();

    playerSocket.join(playerRoom);
    playerSocket.__playerRoom = playerRoom;

    if(!this.players[playerRoom]){
      this.players[playerRoom] = [];
    }
    this.players[playerRoom].push(player);

    playerSocket.emit('enterGame', this.players[playerRoom]);
    playerSocket.broadcast.in(playerRoom).emit('newPlayer', player);

    if(this.players[playerRoom].length == 1){
      this._newGame(playerRoom);
    }
    else{
      playerSocket.emit('newWord', this.actWord[playerRoom]);      
    }
  },

  _onPlayerSolution: function(playerSocket,solution) {
    var playerId = playerSocket.conn.id;
    var playerRoom = playerSocket.__playerRoom;
    
    if(solution == this.actSol[playerRoom]){
      if(!this.solved[playerRoom]){
        this.solved[playerRoom] = true;
        this.timeLeft[playerRoom] = this.winTime;
        
        this.gameIO.in(playerRoom).emit('playerWins',playerId);
      }
      else{
        this.gameIO.in(playerRoom).emit('playerSol',[playerId,'ok']);
      }
    }
    else{
      this.gameIO.in(playerRoom).emit('playerSol',[playerId,'ko']);
    }

    if(this.playersEnded[playerRoom]++ == this.players[playerRoom].length-1){
      this.timeLeft[playerRoom] = 0;
    }
  },

  _onPlayerLeaveGame: function(playerSocket) {
    var playerId = playerSocket.conn.id;
    var playerRoom = playerSocket.__playerRoom;

    for (var i = 0; i < this.players[playerRoom].length; i++) {
      if( playerId.indexOf(this.players[playerRoom][i].id) != -1){
        this.gameIO.in(playerRoom).emit('removePlayer', this.players[playerRoom][i].id);
        this.players[playerRoom].splice(i,1);
        break;
      }
    }

    if(!this.players[playerRoom].length){
      clearInterval(this.timeTick[playerRoom]);
      this.timeTick[playerRoom] = null;
    }
  },
 
  _get4RandomLetters: function(excludeletter,templateWord,lang){
    var rand = [];
    var tempLetter = this.letters[lang][Math.floor(Math.random()*this.letters[lang].length)];

    while(rand.length < 4){
      while(this.words[lang].indexOf(templateWord.replace('_',tempLetter)) != -1 || rand.indexOf(tempLetter) != -1){
        tempLetter = this.letters[lang][Math.floor(Math.random()*this.letters[lang].length)];
      }
      rand.push(tempLetter);
    }
    return rand;
  },

  _getRandomWord: function(lang){
    var wordN;
    do{
      wordN = Math.floor(Math.random()*this.words[lang].length);      
    }
    while(this.lastWords[lang].indexOf(wordN) != -1 || this.words[lang][wordN].length < 4);

    var word = this.words[lang][wordN];
    var letterN = Math.floor(Math.random()*this.words[lang][wordN].length);
    var letter = word.charAt(letterN);
    var templateWord = word.substr(0, letterN) + '_' + word.substr(letterN+1);
    var filled = this._get4RandomLetters(letter,templateWord,lang).concat(letter).sort(function(){return 0.5 - Math.random()});

    this.lastWords[lang].push(wordN);
    if(this.lastWords[lang].length > 200){
      this.lastWords[lang].shift();
    }
    return [[templateWord, filled],letter];
  },

  _newGame: function(room){
    var newWord = this._getRandomWord(room);

    this.actWord[room] = newWord[0];
    this.actSol[room] = newWord[1];

    this.gameIO.in(room).emit('newWord',this.actWord[room]);

    this.solved[room] = false;
    this.playersEnded[room] = 0;
    this.timeLeft[room] = this.maxTime;
    this._setTime(room);

    if(!this.timeTick[room]){
      this.timeTick[room] = setInterval(this._setTime.bind(this,room),1000);
    }
  },

  _setTime: function(room){
    var sendSol = false;

    if(this.timeLeft[room] < 0){
      this._newGame(room);
    }
    else if(this.timeLeft[room] == 0){
      sendSol = this.actSol[room];
    }
    this.gameIO.in(room).emit('timeTick', this.timeLeft[room]--, sendSol);
  },

  init: function(io){
    this.gameIO = io.of('/missinglet_er');
    this.gameIO.on("connection", this._onClientConnected.bind(this));    
  }
}

module.exports = new MissingLetter();

