


    LGamesClient.Games.MissingNumber = (function(){
      var MissingNumber = function(userAvatar){
        LGamesClient.Game.call(this,'missingnumb3r',userAvatar);
      }

      MissingNumber.prototype = Object.create(LGamesClient.Game.prototype);
      MissingNumber.prototype.constructor = MissingNumber;

      var _api = {

        _initSocket: function(){
          LGamesClient.Game.prototype._initSocket.call(this);
          
          this.socket.on('timeTick', this._onTimeTick.bind(this));
          this.socket.on('newOperation', this._onNewOperation.bind(this));
          this.socket.on('enterGame', this._onEnterGame.bind(this));
          this.socket.on('newPlayer', this._onNewPlayer.bind(this));
          this.socket.on('removePlayer', this._onRemovePlayer.bind(this));
          this.socket.on('playerWins', this._onPlayerWins.bind(this));
          this.socket.on('playerSol', this._onPlayerSol.bind(this));
        },

        _onTimeTick: function(newTime,showSol){
          this.time.html(newTime);
          this.time.fitText(0.15);

          if(showSol){
          	this.operation.html(this.operation.html().replace('_','<span class="sol">' + showSol + '</span>'));
          }
        },

        _onClickNumber: function(event) {
			var number = $(event.currentTarget);

			number.attr('sol', 'true');
			this._sendSolution(number.html());
		},

        _onNewOperation: function(newOperation){
            this.operation.html(newOperation[0]);
            this.operation.fitText(0.5);

            this.playersContainer.children('.player').removeAttr('sol');
            this.numbers.empty();

            for (var i = 0; i < newOperation[1].length; i++) {
              var newNumber = $('<div class="number">' + newOperation[1][i] + '</div>');
              
              newNumber.click(this._onClickNumber.bind(this));
              this.numbers.append(newNumber);
            }
        },

        _onEnterGame: function(initPlayers){
          this.players = initPlayers;
          this.playersContainer.empty();
          
          for (var i = 0; i < this.players.length; i++) {
            this.playersContainer.append('<div class="player" id="' + this.players[i].id + '"><img src="' + this.players[i].avatar + '" /></div>');
          }
        },

        _onNewPlayer: function(player){
          this.players.push(player);
          this.playersContainer.append('<div class="player" id="' + player.id + '"><img src="' + player.avatar + '" /></div>');
        },

        _onRemovePlayer: function(playerId){
          this.players = this.players.filter(function(player) {
            return player.id != playerId;
          });
          $(".player[id='" + playerId + "']").remove();
        },

        _onPlayerWins: function(playerId){
            var playerWin = this.playersContainer.children(".player[id='" + playerId + "']");

            playerWin.attr('sol', 'ok');
            this.playersContainer.prepend(playerWin);
            
            if(playerId == this.myPlayer.id){
              this.numbers.children('.number[sol]').attr('sol', 'ok');
            }
        },

        _onPlayerSol: function(playerData){
            var player = this.playersContainer.children(".player[id='" + playerData[0] + "']");
            player.attr('sol', playerData[1]);

            if(playerData[0] == this.myPlayer.id){
              this.numbers.children('.number[sol]').attr('sol', playerData[1]);
            }
        },

        _sendSolution: function(number){
          $('.number').off('click');
          this.socket.emit('playerSol', number);      
        },

        init: function(){
          this.playersContainer = $('.playersContainer');
          this.operationModal = $('.operationModal');
          this.operation = $('.operation');
          this.numbers = $('footer>div.numbers');
          this.time = $('.time');
          this.avatar = $('footer>img')
        }
      }

      $.extend(MissingNumber.prototype, _api);
      return MissingNumber;

    }());
