


var LGamesClient = {};

LGamesClient.Main = (function(){
  var overlay;

  onResize = function(ev){
    var screenOrientation = ($(window).width() > $(window).height())? 90 : 0;
    var keyboard_shown = $(window).scrollTop() > 0;

    if(screenOrientation == 90 && !keyboard_shown){
        overlay.show();      
    }
    else{
      overlay.hide();      
    }
  };

  return{
      init: function(){
        overlay = $('#overlay');
        //window.addEventListener('resize', onResize);

        //onResize();
      }
  };
})();

LGamesClient.Main.init();

$( document ).ready(function(){
  LGamesClient.Main.init();
});
