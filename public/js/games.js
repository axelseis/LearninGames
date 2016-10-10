


LGamesClient.Games = {};

LGamesClient.Game = (function(){
  var Game = function(name,userAvatar){
    this.name = name;
    this.socket;
    this.players = [];
    this.myPlayer = {
      id: '',
      avatar: userAvatar
    };
    this.footer = $('footer.footer')
    this._initSocket();
  }

  var _api = {
    _onConnect: function(){
      this.myPlayer.id = this.socket.id;
      this.socket.emit('newPlayer', this.myPlayer);
    },

    _initSocket: function(){
      this.socket = io('/' + this.name);
      this.socket.on('connect', this._onConnect.bind(this));
    },

    getPlayerById: function(playerId){
      for (var i = 0; i < this.players.length; i++) {
        if(this.players[i].id == playerId){
          return this.players[i];
        }
      }
      return null;
    },

    getPlayerIndexById: function(playerId){
      for (var i = 0; i < this.players.length; i++) {
        if(this.players[i].id == playerId){
          return i;
        }
      }
      return null;
    }
  }

  Game.prototype = _api;
  Game.prototype.constructor = Game;

  return Game;
}());

