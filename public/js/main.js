


var LGamesClient = {};

LGamesClient.Main = (function(){
  var overlay;

  var onResize = function(ev){
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
      var langcookie = Cookies.get('locale') || window.navigator.userLanguage || window.navigator.language;

      Cookies.set('locale', langcookie, {expires: 999});

      overlay = $('#overlay');

      $('.langs[lang=' + langcookie + ']').addClass('selected');
      $('.langs').click(function(event) {
        Cookies.set('locale', $(this).attr('lang'), {expires: 999});
        location.reload(true);          
      });
      //window.addEventListener('resize', onResize);

      //onResize();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js');
      }
    }
  };
})();


$( document ).ready(function(){
  LGamesClient.Main.init();
  LGamesClient.Home.init();
});
