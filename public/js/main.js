


var LGamesClient = {};

LGamesClient.Main = (function(){
  var overlay;

  onResize = function(ev){
    var screenOrientation = ($(window).width() > $(window).height())? 90 : 0;

    switch(screenOrientation) {  
      case 90:
        overlay.show();
        console.log('overlay', overlay);
        break; 
      case 0:
        overlay.hide();
        break; 
    }
  };

  return{
      init: function(){
        overlay = $('#overlay');
        window.addEventListener('resize', onResize);

        onResize();
      }
  };
})();

LGamesClient.Main.init();

$( document ).ready(function(){
  LGamesClient.Main.init();
});
