


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

        $('.langs[lang=' + Cookies.get('locale') + ']').addClass('selected')
        $('.langs').click(function(event) {
          Cookies.set('locale', $(this).attr('lang'));
          location.reload(true);          
          //window.location = window.location.href.split('?')[0] + '?lang=' + $(this).attr('lang');
        });
        //window.addEventListener('resize', onResize);

        //onResize();
      }
  };
})();

//LGamesClient.Main.init();

$( document ).ready(function(){
  LGamesClient.Main.init();
});
