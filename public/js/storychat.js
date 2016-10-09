


    LGamesClient.Games.StoryChat = (function(){
      var StoryChat = function(userAvatar){
        LGamesClient.Game.call(this,'storychat',userAvatar);
      }

      StoryChat.prototype = Object.create(LGamesClient.Game.prototype);
      StoryChat.prototype.constructor = StoryChat;

      var _api = {

        _initSocketEvents: function(){
          LGamesClient.Game.prototype._initSocketEvents.call(this);
          
          this.socket.on('timeTick', this._onTimeTick.bind(this));
          this.socket.on('newStory', this._onNewStory.bind(this));
          this.socket.on('enterGame', this._onEnterGame.bind(this));
          this.socket.on('newPlayer', this._onNewPlayer.bind(this));
          this.socket.on('playerStartWrite', this._onPlayerStartWrite.bind(this));
          this.socket.on('removePlayer', this._onRemovePlayer.bind(this));
          this.socket.on('playerPar', this._onPlayerPar.bind(this));
          this.socket.on('timeTick', this._onTimeTick.bind(this));
        },

        _onTimeTick: function(newTime,showSol){
          this.time.html(newTime);
          this.time.fitText(0.15);

          if(showSol){
          	this.word.html(this.word.html().replace('_','<span class="sol">' + showSol + '</span>'));
            this.word.fitText(0.8);
          }
        },

        _onNewStory: function(newStory){
            console.log('newStory', newStory);
            this.begin.html(newStory[0][0] + '<br/><i>' + newStory[0][1] + ' (' + newStory[0][2] + ')' + '</i>');
        },

        _onPlayerStartWrite: function(newPlayerId){
          if(newPlayerId == this.myPlayer.id){
            this.myturnModal.show();
          }
          else{
            var newPlayer = this.getPlayerById(newPlayerId);

            this.actPlayerPar = this.actPlayerParTemplate.clone();
            this.actPlayerPar.children('.playerAvatar').src = newPlayer.avatar;
            this.actPlayerPar.children('.par').html('waiting ...');

            this.usersPars.append(this.actPlayerPar);
          }
        },

        _onEnterGame: function(initPlayers, story){
          this.players = initPlayers;
          this._onNewStory(story);
        },

        _onNewPlayer: function(player){
          this.players.push(player);
        },

        _onRemovePlayer: function(playerId){
          this.players = this.players.filter(function(player) {
            return player.id != playerId;
          });
        },

        _onPlayerPar: function(playerData){
            console.log('playerData', playerData);
        },

        _sendPar: function(paragraph){
          this.socket.emit('playerPar', paragraph);      
        },

        _onClickWriteBut: function(event){
          this.actPlayerPar = this.actPlayerParTemplate.clone();
          this.actPlayerPar.children('.playerAvatar').attr('src', this.myPlayer.avatar);
          this.actPlayerPar.children('.par').attr('contenteditable','true');

          this.myturnModal.hide();
          this.footer.hide();

          this.usersPars.append(this.actPlayerPar);
          this.actPlayerPar.children('.par').focus();

          this.socket.emit('playerStartWrite', this.myPlayer.id);      
        },

        _onClickDismissBut: function(event){
          this.socket.emit('playerDismissWrite', this.myPlayer.id);      
        },

        init: function(){
          this.storyContainer = $('.storyContainer');
          this.begin = $('#begin');
          this.usersPars = $('#usersPars');
          this.myturnModal = $('#myturnModal');
          this.actPlayerPar;
          this.actPlayerParTemplate = $('<div class="playerPar"><img class="playerAvatar" src=""/><div class="par"></div>');

          this.myturnModal.children('#writeBut').on('click', this._onClickWriteBut.bind(this));
          this.myturnModal.children('#dismissBut').on('click', this._onClickDismissBut.bind(this));
        }
      }

      $.extend(StoryChat.prototype, _api);
      return StoryChat;

    }());
