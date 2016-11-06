


    LGamesClient.Games.MissingLetter = (function(){
      var MissingLetter = function(userAvatar){
        LGamesClient.Game.call(this,'missinglet_er',userAvatar);
      }

      MissingLetter.prototype = Object.create(LGamesClient.Game.prototype);
      MissingLetter.prototype.constructor = MissingLetter;

      var _api = {

        _initSocket: function(){
          LGamesClient.Game.prototype._initSocket.call(this);
          
          this.socket.on('timeTick', this._onTimeTick.bind(this));
          this.socket.on('newWord', this._onNewWord.bind(this));
          this.socket.on('enterGame', this._onEnterGame.bind(this));
          this.socket.on('newPlayer', this._onNewPlayer.bind(this));
          this.socket.on('removePlayer', this._onRemovePlayer.bind(this));
          this.socket.on('playerWins', this._onPlayerWins.bind(this));
          this.socket.on('playerSol', this._onPlayerSol.bind(this));
        },

        _onTimeTick: function(newTime,showSol){
          this.time.html(newTime);
          //this.time.bigtext();

          if(showSol){
          	this.word.html('<p>' + this.word.text().replace('_','<span class="sol">' + showSol + '</span>') + '</p>');
            this.word.bigtext({maxfontsize: 60});
          }
        },

        _onClickLetter: function(event) {
    			var letter = $(event.currentTarget);

    			letter.attr('sol', 'true');
    			this._sendSolution(letter.html());
    		},

        _onNewWord: function(newWord){
            this.word.html('<p>' + newWord[0] + '</p>');
            this.word.bigtext({maxfontsize: 60});

            this.playersContainer.children('.player').removeAttr('sol');
            this.letters.empty();

            for (var i = 0; i < newWord[1].length; i++) {
              var newLetter = $('<div class="letter">' + newWord[1][i] + '</div>');
              
              newLetter.click(this._onClickLetter.bind(this));
              this.letters.append(newLetter);
            }
        },

        _onEnterGame: function(initPlayers){
          this.players = initPlayers;
          this.playersContainer.empty();
          
          for (var i = 0; i < this.players.length; i++) {
            this.playersContainer.append('<div class="player" id="' + this.players[i].id + '"><img src="' + this.players[i].avatar + '" /></div>');
          }
          this._resizePlayers();
        },

        _onNewPlayer: function(player){
          this.players.push(player);
          this.playersContainer.append('<div class="player" id="' + player.id + '"><img src="' + player.avatar + '" /></div>');
          this._resizePlayers();
        },

        _resizePlayers: function(){
          var cols = 2;
          var maxW = Math.floor(this.playersContainer.outerWidth()/cols);
          var rows = Math.ceil(this.players.length/cols);

          while(rows*maxW > this.playersContainer.outerHeight()+40){
            cols +=1;
            maxW = Math.floor(this.playersContainer.outerWidth()/cols);
            rows = Math.ceil(this.players.length/cols);
          }
          this.playersContainer.children('.player').each(function(index, el) {
            $(this).outerWidth(maxW);
            $(this).outerHeight(maxW);
          });
        },

        _onRemovePlayer: function(playerId){
          this.players = this.players.filter(function(player) {
            return player.id != playerId;
          });
          $(".player[id='" + playerId + "']").remove();
          this._resizePlayers();
        },

        _onPlayerWins: function(playerId){
            var playerWin = this.playersContainer.children(".player[id='" + playerId + "']");

            playerWin.attr('sol', 'ok');
            this.playersContainer.prepend(playerWin);
            
            if(playerId == this.myPlayer.id){
              this.letters.children('.letter[sol]').attr('sol', 'ok');
            }
        },

        _onPlayerSol: function(playerData){
            var player = this.playersContainer.children(".player[id='" + playerData[0] + "']");

            if(playerData[1] == 'ok'){
              player.insertAfter(this.playersContainer.children('.player[sol="ok"]').last());
            }
            else if(this.playersContainer.children('.player[sol="ko"]').length !=0){
              player.insertAfter(this.playersContainer.children('.player[sol="ko"]').last());
            }
            else if(this.playersContainer.children('.player[sol="ok"]').length !=0){
              player.insertAfter(this.playersContainer.children('.player[sol="ok"]').last());
            }
            else{
              this.playersContainer.prepend(player);
            }


            player.attr('sol', playerData[1]);

            if(playerData[0] == this.myPlayer.id){
              this.letters.children('.letter[sol]').attr('sol', playerData[1]);
            }
        },

        _sendSolution: function(letter){
          $('.letter').off('click');
          this.socket.emit('playerSol', letter);      
        },

        _testUser: function(){
          $('.letter').eq(Math.floor(Math.random()*5)).click();
          window.setTimeout(this._testUser.bind(this),Math.round(Math.random()*10)*1000)
        },

        init: function(){
          this.playersContainer = $('.playersContainer');
          this.wordModal = $('.wordModal');
          this.word = $('.word');
          this.letters = $('footer>div.letters');
          this.time = $('.time');
          this.avatar = $('footer>img');

          if(this.myPlayer.avatar.indexOf('testuser_') != -1){
            window.setTimeout(this._testUser.bind(this),1000)
          }
        }
      }

      $.extend(MissingLetter.prototype, _api);
      return MissingLetter;

    }());
