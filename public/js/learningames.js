


var LGamesClient = {};
LGamesClient.Games = {};

LGamesClient.Game = (function(){
  var Game = function(name,userAvatar){
    this.name = name;
    this.socket = io('/' + this.name);
    this.players = [];
    this.myPlayer = {
      id: '',
      avatar: userAvatar
    };
    this.footer = $('footer.footer')
    this._initSocketEvents();
  }

  var _api = {
    _onConnect: function(){
      this.myPlayer.id = this.socket.id;
      this.socket.emit('newPlayer', this.myPlayer);
    },

    _initSocketEvents: function(){
      this.socket.on('connect', this._onConnect.bind(this));
    },

    getPlayerById: function(playerId){
      for (var i = 0; i < this.players.length; i++) {
        if(this.players[i].id == playerId){
          return this.players[i];
        }
      }
      return null;
    }
  }

  Game.prototype = _api;
  Game.prototype.constructor = Game;

  return Game;
}());

