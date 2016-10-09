



function evalExpr(express){
  return(Math.round(eval(express)*10)/10);
}

function getAllIndexes(str, val) {
  var indexes = [], i;
  for(i = 0; i < str.length; i++)
      if (str[i] === val)
          indexes.push(i);
  return indexes;
}

var MissingNumber = function(){
  this.gameIO;
  this.players = [];
  this.playersEnded = 0;

  this.templates = ['_o_','(_o_)o_','_o(_o_)'];
  this.nums = [1,2,3,4,5,6,7,8,9];
  this.ops = ['*','+','-'];

  this.actOperation;
  this.actSol;

  this.maxTime = 30;
  this.winTime = 10;
  this.timeLeft;
  this.timeTick;

  this.solved;
}

function get4RandomNumbers(val){
  var rand = [];
  var tempNum = Math.floor(Math.random()*100);
  
  while(rand.length < 4){
    while(Math.abs(val-tempNum) > 10 || rand.indexOf(tempNum) != -1 || tempNum == val || tempNum == 0){
      tempNum = Math.floor(Math.random()*100);
    }
    rand.push(tempNum);
  }
  return rand;
}

MissingNumber.prototype = {
  
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
      playerSocket.emit('newOperation', this.actOperation);      
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

  _getRandomOperation: function(pos){
    var pos = pos || 0;
    var tempExp = '';
    var nums = this.nums.slice();
    var ops = this.ops.slice();
    var min = 0;
    var max = 100;
    var value = 0;
    var solPos,
        solValue,
        filled;
    
    var actTemplate = this.templates[Math.floor(Math.random()*this.templates.length)]

    for (var i = 0; i < actTemplate.length; i++) {
      var tempChar = actTemplate.charAt(i);
      if(tempChar == '_'){
        var tempN = nums.splice(Math.floor(Math.random()*nums.length),1)[0];
        tempExp += tempN;
      }
      else if(tempChar == 'o'){
        var tempN = ops.splice(Math.floor(Math.random()*ops.length),1)[0];
        tempExp += tempN;
      }
      else{
        tempExp += tempChar;
      }
    }

    value = value || evalExpr(tempExp)

    if((value < min || value > max) && pos < 1000){
      return this._getRandomOperation(pos+1);
    }
    else{     
      solPos = getAllIndexes(actTemplate,'_').concat(['end']).sort(function(){return 0.5 - Math.random()})[0];
      solValue = solPos == 'end' ? value : tempExp.charAt(solPos);
      tempExp = solPos == 'end' ? tempExp : tempExp.substr(0, solPos) + '_' + tempExp.substr(solPos+1,tempExp.length);
      filled = get4RandomNumbers(solValue).concat(solValue).sort(function(){return 0.5 - Math.random()});

      return [[solPos == 'end' ? tempExp + '=_' : tempExp + '=' + value, filled], solValue];
    }
  },

  _newGame: function(){
    var newOperation = this._getRandomOperation();

    this.actOperation = newOperation[0];
    this.actSol = newOperation[1];

    this.gameIO.emit('newOperation',this.actOperation);

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
    this.gameIO = io.of('/missingnumb3r')
    this.gameIO.on("connection", this._onClientConnected.bind(this));    
  }
}

module.exports = new MissingNumber();

