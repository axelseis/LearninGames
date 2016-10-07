


var LGamesClient = {};
LGamesClient.Games = {};

LGamesClient.Game = (function(){
  var Game = function(name,userAvatar){
    this.name = name;
    this.socket = io('/' + this.name);
    this.myPlayer = {
      id: '',
      avatar: userAvatar
    };

    this._initSocketEvents();
  }

  var _api = {
    _onConnect: function(){
      this.myPlayer.id = this.socket.id;
      this.socket.emit('newPlayer', this.myPlayer);
    },

    _initSocketEvents: function(){
      this.socket.on('connect', this._onConnect.bind(this));
    }
  }

  Game.prototype = _api;
  Game.prototype.constructor = Game;

  return Game;
}());

