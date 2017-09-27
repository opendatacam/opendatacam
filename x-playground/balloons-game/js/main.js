
  // quick and dirty js for ui
  $(window).ready(function() {


    //counter game
    var counter = 0;


    //counter time
    var startNum;
    var currentNum;

    function addClassDelayed(jqObj, c, to) {
        setTimeout(function() { jqObj.addClass(c); }, to);
    }

    function anim() {
      addClassDelayed($("#countdown"), "puffer", 600);
      if (currentNum == 0) currentNum = startNum-1; else currentNum--;
      $('#countdown').html(currentNum+1);
      $('#countdown').removeClass("puffer");
    }

    $(function() {
      startNum = 20;
      currentNum = startNum;
      $("#countdown").html(currentNum); // init first time based on n
      self.setInterval(function(){
        anim()
          console.log(currentNum);
          if(currentNum == 0 && counter < 50){
            $("#looser").fadeIn();
          }
          if(counter >= 50){
            $("#winner").fadeIn();
          }
        },1325);
      });


    $("#graphic").on({
      mouseenter: function () {
          $('#rect').css('border-radius', '100px');
          $('#rect').css('background-color', 'white');
          $('#rect').css('height', '50px');
          setTimeout( function(){
            $('#graphic').animate({top: "-30%"}, 400);
          },200);

          counter++;
          $("#displayCount").html(counter);

          setTimeout( function(){
            $('#rect').css('border-radius', '2px');
            $('#rect').css('background-color', 'transparent');
            $('#rect').css('height', '40px');
          },900);
          setTimeout( function(){
            var randomnumber=Math.floor(Math.random()*80);
            var randomnumber_zwei=Math.floor(Math.random()*80);
            setTimeout( function(){
              $('#graphic').css({top: randomnumber+ "%", left: randomnumber_zwei + "%"});
            },500);
          },900);
      },
    });
    $("#graphic_2").on({
      mouseenter: function () {
          $('#rect_2').css('border-radius', '100px');
          $('#rect_2').css('background-color', 'white');
          $('#rect_2').css('height', '50px');
          setTimeout( function(){
            $('#graphic_2').animate({top: "-30%"}, 400);
          },200);

          counter++;
          $("#displayCount").html(counter);

          setTimeout( function(){
            $('#rect_2').css('border-radius', '2px');
            $('#rect_2').css('background-color', 'transparent');
            $('#rect_2').css('height', '40px');
          },900);
          setTimeout( function(){
            var randomnumber=Math.floor(Math.random()*80);
            var randomnumber_zwei=Math.floor(Math.random()*80);
            setTimeout( function(){
              $('#graphic_2').css({top: randomnumber+ "%", left: randomnumber_zwei + "%"});
            },500);
          },900);
      },
    });
    $("#graphic_3").on({
      mouseenter: function () {
          $('#rect_3').css('border-radius', '100px');
          $('#rect_3').css('background-color', 'white');
          $('#rect_3').css('height', '50px');
          setTimeout( function(){
            $('#graphic_3').animate({top: "-30%"}, 400);
          },200);

          counter++;
          $("#displayCount").html(counter);

          setTimeout( function(){
            $('#rect_3').css('border-radius', '2px');
            $('#rect_3').css('background-color', 'transparent');
            $('#rect_3').css('height', '40px');
          },900);
          setTimeout( function(){
            var randomnumber=Math.floor(Math.random()*80);
            var randomnumber_zwei=Math.floor(Math.random()*80);
            setTimeout( function(){
              $('#graphic_3').css({top: randomnumber+ "%", left: randomnumber_zwei + "%"});
            },500);
          },900);
      },
    });
    $("#graphic_4").on({
      mouseenter: function () {
          $('#rect_4').css('border-radius', '100px');
          $('#rect_4').css('background-color', 'white');
          $('#rect_4').css('height', '50px');
          setTimeout( function(){
            $('#graphic_4').animate({top: "-30%"}, 400);
          },200);

          counter++;
          $("#displayCount").html(counter);

          setTimeout( function(){
            $('#rect_4').css('border-radius', '2px');
            $('#rect_4').css('background-color', 'transparent');
            $('#rect_4').css('height', '40px');
          },900);
          setTimeout( function(){
            var randomnumber=Math.floor(Math.random()*80);
            var randomnumber_zwei=Math.floor(Math.random()*80);
            setTimeout( function(){
              $('#graphic_4').css({top: randomnumber+ "%", left: randomnumber_zwei + "%"});
            },500);
          },900);
      },
    });


  });
