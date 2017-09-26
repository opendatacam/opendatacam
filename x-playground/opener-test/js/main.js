  $(window).ready(function() {

    setTimeout(function(e){
      $("#loader").velocity({left: "10%"}, {
        duration: 2000,
        easing: "linear"
      });
    }, 500);
    setTimeout(function(e){
      setTimeout(function(e){
      $("#title").velocity({left: "20%"}, {
        duration: 500,
        easing: "easeInBack"
      });
    }, 80);
      $("#loader").velocity({left: "100%"}, {
        duration: 200,
        easing: "easeInBack"
      });
    }, 2250);

  });
