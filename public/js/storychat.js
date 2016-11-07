


    LGamesClient.Games.StoryChat = (function(){
      var botPars = [
        "Y hubo gran regocijo",
        "La guerra es la paz. La libertad es la esclavitud. La ignorancia es la fuerza",
        "Algún día te morirás por besarme",
        "Escribo, triste, en mi cuarto quieto, solo, como siempre he sido, solo como siempre seré",
        "Lo odio por hacerme sentir así. Por darme esperanzas y luego tirar todo por la borda",
        "Hoy es siempre todavía",
        "No se ve bien sino con el corazón, lo esencial es invisible a los ojos",
        "Añorar el pasado es correr tras el viento",
        "Algo se marchitó en él: quizás la fe en la perennidad de la infancia",
        "Cierto que casi siempre se encuentra algo, si se mira, pero no siempre es lo que uno busca"
      ];

      var StoryChat = function(userAvatar){
        LGamesClient.Game.call(this,'storychat',userAvatar);
      }

      StoryChat.prototype = Object.create(LGamesClient.Game.prototype);
      StoryChat.prototype.constructor = StoryChat;

      var _api = {

        _initSocket: function(){
          LGamesClient.Game.prototype._initSocket.call(this);
          
          this.socket.on('enterGame', this._onEnterGame.bind(this));
          this.socket.on('newPlayer', this._onNewPlayer.bind(this));
          this.socket.on('removePlayer', this._onRemovePlayer.bind(this));
          this.socket.on('newStory', this._onNewStory.bind(this));
          this.socket.on('TheEnd', this._onTheEnd.bind(this));
          this.socket.on('nextPlayer2Write', this._onNextPlayer2Write.bind(this));
          this.socket.on('playerDismiss', this._onPlayerDismiss.bind(this));
          this.socket.on('playerWrite', this._onPlayerWrite.bind(this));
        },

        _onEnterGame: function(initPlayers, story){
          this.players = initPlayers;
          
          this.footer.show();
          this.myturnModal.hide();    
          window.clearInterval(this.countdownTO);
          
          this._onNewStory(story);
        },

        _onNewPlayer: function(newplayers){
          this.players = newplayers;
        },

        _onRemovePlayer: function(playerId){
          if(this.actPlayerId == playerId){
            this.actPlayerPar.remove();
          }

          this.players = this.players.filter(function(player) {
            return player.id != playerId;
          });
        },

        _onNewStory: function(newStory){
          this.usersPars.empty();
          for (var i = 0; i < newStory.length; i++) {
            if(i==0) {
              this.begin.html(newStory[0][0] + '<br/><i>' + newStory[0][1] + ' (' + newStory[0][2] + ')' + '</i>');
            }
            else{
              var newPar = this.actPlayerParTemplate.clone();
              newPar.html(newStory[i]);

              this.usersPars.append(newPar);
              //this._onPlayerPar(newStory[i]);
            }
          }
        },

        _onNextPlayer2Write: function(newPlayerId){
          var newPlayer = this.getPlayerById(newPlayerId);

          this.actPlayerId = newPlayerId;
          this.actPlayerPar = this.actPlayerParTemplate.clone();
          this.actPlayerPar.children('.playerAvatar').attr('src', newPlayer.avatar.replace(/&amp;/g,'&'));
          this.actPlayerPar.children('.par').html(waitingText);

          this.usersPars.append(this.actPlayerPar);

          window.clearInterval(this.countdownTO);

          if(newPlayerId == this.myPlayer.id){
            this.myturnModal.show();
            this._setCountdown(this.countdownTime);
            this.footer.hide();

            if(this.isTestUser){
              var decission = Math.random()*1 < 0.5 ? this.dismissBut : this.writeBut;
              
              window.setTimeout(decission.click.bind(decission),2000);
              if(decission == this.writeBut){
                window.setTimeout(this._writeBotMessage.bind(this),3000);
              }
            }
          }
          else{
            var actplayerIndex = this.getPlayerIndexById(newPlayerId);
            var myindex = this.getPlayerIndexById(this.myPlayer.id)
            var turns2me =  myindex > actplayerIndex ? myindex - actplayerIndex : this.players.length - actplayerIndex +myindex;

            this.footerText.html(turns2me == 1 ? nextplayText : turns2me + ' ' + turnsText);
          }

          this.storyContainer.parent().scrollTop(this.storyContainer.height());
        },

        _writeBotMessage: function(){
          var press = jQuery.Event("keyup");
          if(!this.actBotPar){
            this.actBotPar = botPars[Math.floor(Math.random()*botPars.length)];
          }
          
          if(this.actBotLetterNum < this.actBotPar.length){
            press.keyCode = 0;

            this.actPlayerPar.children('.par').html(this.actPlayerPar.children('.par').html() + this.actBotPar.charAt(this.actBotLetterNum));
            this.actBotLetterNum++;

            window.setTimeout(this._writeBotMessage.bind(this),100)
          }
          else{
            this.actBotLetterNum = 0;
            this.actBotPar = null;
            press.keyCode = 13;            
          }

          this.actPlayerPar.trigger(press);
        },

        _setCountdown: function(time){
          this.myturnCountdown.html(time);
          if(time-- == 0){
            this._onClickDismissBut();
          }
          else{
            this.countdownTO = window.setTimeout(this._setCountdown.bind(this, time--),1000);            
          }
        },

        _onClickWriteBut: function(event){
          this.actPlayerPar.children('.par').attr('contenteditable','true');

          this.myturnModal.hide();
          window.clearInterval(this.countdownTO);

          this.actPlayerPar.keyup(this._onKeyPress.bind(this));
          this.actPlayerPar.children('.par').html('');
          this.actPlayerPar.children('.par').focus();
        },

        _onClickDismissBut: function(event){
          this.actPlayerPar.remove();

          this.footer.show();
          this.myturnModal.hide();    
          window.clearInterval(this.countdownTO);

          this.socket.emit('playerDismiss');
        },

        _onClickEndBut: function(event){
          this.actPlayerPar.children('.par').html(this.myturnModal.children('#endBut').text());

          this.footer.show();
          this.myturnModal.hide();    
          window.clearInterval(this.countdownTO);

          this.socket.emit('TheEnd', this.actPlayerPar.html());
        },

        _onClickNewStoryBut: function(event){
          this.footerButs.hide();
          this._initSocket();
        },

        _onClickDownloadBut: function(event){
          var beginExport = this.begin.clone();
          beginExport.find('i').remove();
          
          var storyText = beginExport.text() + '\n';
          this.usersPars.find('.par').each(function(index, el) {
            storyText += '\n' + $(this).text();
          });
          
          $('<a/>').attr({
              download: 'story', 
              href: "data:text/plain;charset=utf-8," + encodeURIComponent(storyText)
          })[0].click();
        },

        _onPlayerDismiss: function(playerId){
          this.actPlayerPar.remove();
        },

        _onTheEnd: function(playerPar){
          var newPar = this.actPlayerParTemplate.clone();
          newPar.html(playerPar);
          
          this.actPlayerPar.remove();
          this.actPlayerPar = null;
          this.usersPars.append(newPar);

          this.footerText.html('');
          this.footerButs.show();
        },

        _onPlayerWrite: function(playerData){
          console.log('playerData[0] != this.myPlayer.id', playerData[0] != this.myPlayer.id)
          if(playerData[0] != this.myPlayer.id){
            if(!this.actPlayerPar){
              this._onNextPlayer2Write(playerData[0]);
            }
            this.actPlayerPar.children('.par').html(playerData[1]);            
          }
        },

        _onKeyPress: function(event){
          this.socket.emit('playerWrite', this.actPlayerPar.children('.par').html());

          if (event.keyCode === 13) { //ENTER
            this.actPlayerPar.children('.par').removeAttr('contenteditable');
            this.socket.emit('playerEndsWrite', this.actPlayerPar.html());

            this.footer.show();
          }          
        },

        init: function(){
          this.countdownTime = 20;
          this.countdownTO;
          this.isTestUser;

          this.storyContainer = $('.storyContainer');
          this.begin = $('#begin');
          this.usersPars = $('#usersPars');
          this.myturnCountdown = $('#myturnCountdown');
          this.actPlayerParTemplate = $('<div class="playerPar"><img class="playerAvatar" src=""/><div class="par"></div>');
          
          this.actBotPar;
          this.actBotLetterNum;          
          this.actPlayerPar;

          this.myturnModal = $('#myturnModal');
          this.dismissBut = this.myturnModal.children('#dismissBut');
          this.writeBut = this.myturnModal.children('#writeBut');

          this.footerText = $('footer.footer>.footerText');
          this.footerButs = $('footer.footer>div.buts');

          this.footerButs.children('a#newStoryBut').click(this._onClickNewStoryBut.bind(this));
          this.footerButs.children('a#downloadBut').click(this._onClickDownloadBut.bind(this));

          this.myturnModal.children('#endBut').on('click', this._onClickEndBut.bind(this));
          this.writeBut.on('click', this._onClickWriteBut.bind(this));
          this.dismissBut.on('click', this._onClickDismissBut.bind(this));
          
          if(this.myPlayer.avatar.indexOf('testuser_') != -1){
            this.isTestUser = true;
          }
        }
      }

      $.extend(StoryChat.prototype, _api);
      return StoryChat;

    }());
