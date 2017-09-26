var yolo = {}

document.addEventListener('DOMContentLoaded', function(){
  // load detections
  $.ajax({
    url: 'data/video/C0082-47mm_detected.txt',
    dataType: 'text',
    success: function(data){
      var lines = data.split('\n');
      lines.forEach(function(l) {
        var detection = JSON.parse(l);
        yolo[detection.time] = detection.detections;
      });
    }
  });

  // handle video
  //var v = document.getElementById('v');
  var canvas = document.getElementById('c');
  var context = canvas.getContext('2d');
  var pixelSize = 9;
  var stampW = 42 * pixelSize;
  var stampH = 3;
  canvas.width = 1280;
  canvas.height = 720;

  v.addEventListener('loadeddata', function() {
    console.log('video data loaded, we can start playing');
    v.play();
  });

  v.addEventListener('play', function(){
    draw(this, context, pixelSize, stampW, stampH);
  }, false);
}, false);

function draw(v, ctx, s, w, h) {
  if(v.paused || v.ended) return false;
  ctx.drawImage(v, 0, 0);

  var pixels = ctx.getImageData(0, 0, w, 1).data;
  ctx.fillStyle = "#0f0";
  ctx.fillRect(0,3,w,h);

  // remove alpha channels
  pixels = _.filter(pixels, function(p, i) { return (i % 4) < 3 });
  // group into RGB chunks
  var rgbs = _.chunk(pixels, 3);
  // sample only center pixel of "pixel window"
  var centerL = Math.floor(s/2);
  var centerR = Math.ceil(s/2);
  var centerRgbs = _.filter(rgbs, function(p, i) {
    var filtered = ((i % s >= centerL) && (i % s < centerR));
    if (filtered) {
      ctx.fillStyle = "rgba("+p[0]+","+p[1]+","+p[2]+","+1+")";
      ctx.fillRect(i,1,1,6);
    }
    return filtered;
  });
  // map back from 0 - 255 to 0 - 1
  var bits = centerRgbs.map(function(rgb) { return rgb[0] > 127 ? 1 : 0 });
  var bitString = bits.join('');
  var millis = parseInt(bitString, 2);
  $('#timecode').text("timecode video (millis): "+millis);

  // draw bbox detections of this frame
  var detections = yolo[millis];
  if (detections) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.font = "35px Arial";
    ctx.fillStyle = "white";
    detections.forEach(function(d) {
      var x = d.x-d.w/2;
      var y = d.y-d.h/2;
      ctx.strokeRect(x,y,d.w,d.h);
      ctx.fillText(d.name,x,y-10);
    });
  }



  // loop
  requestAnimationFrame(draw.bind(this, v, ctx, s, w, h));
}

  // quick and dirty js for ui
  $(window).ready(function() {

    //hovers
    $("#item_one svg").on({
      mouseenter: function () {
          $('main #traffic_stats').fadeIn(100)
          $('#item_one polyline').css('stroke', '#FFCC33');
          $('#item_one #Fill-2').css('fill', '#FFCC33');
          document.body.style.cursor = 'pointer';
      },
      mouseleave: function () {
          $('main #traffic_stats').fadeOut(100)
          document.body.style.cursor = 'default';
          $('#item_one polyline').css('stroke', '#26262E');
          $('#item_one #Fill-2').css('fill', '#26262E');
      }
    });
    $("#item_two svg").on({
      mouseenter: function () {
          $('main #info').fadeIn(100);
          $('#item_two path').css('stroke', '#FFCC33');
          document.body.style.cursor = 'pointer';
      },
      mouseleave: function () {
          $('main #info').fadeOut(100);
          $('#item_two path').css('stroke', '#26262E');
          document.body.style.cursor = 'default';
      }
    });
    $("header #level").on({
      mouseenter: function () {
          $('#dropdown-button polygon').css('stroke', '#FFCC33');
      },
      mouseleave: function () {
          $('#dropdown-button polygon').css('stroke', 'white');
      }
    });

    $("header #dropdown #close_dropdown").on({
      mouseenter: function () {
          $('header #dropdown #close_dropdown path').css('stroke', '#FFCC33');
          document.body.style.cursor = 'pointer';
      },
      mouseleave: function () {
          $('header #dropdown #close_dropdown path').css('stroke', 'white');
          document.body.style.cursor = 'default';
      }
    });

    $("#close_subpage").on({
      mouseenter: function () {
          $('#close_subpage path').css('stroke', '#FFCC33');
          document.body.style.cursor = 'pointer';
      },
      mouseleave: function () {
          $('#close_subpage path').css('stroke', 'white');
          document.body.style.cursor = 'default';
      }
    });


    //clicks
    $("#item_one svg").click(function(){
      $('main #traffic_stats').hide();
      $('main .subpage').delay(800).fadeIn(200);
      $('main #traffic_stats_headline').show();
      setTimeout( function(){
        $('main #traffic_stats_headline').css({ top: "170px"})
      },300);
    });
    $("#item_two svg").click(function(){
      $('main #info').hide();
      $('main .subpage').delay(800).fadeIn(200);
      $('main #info_headline').show();
      setTimeout( function(){
        $('main #info_headline').css({ top: "30%"})
      },500);
    });
    $("#close_subpage").click(function(){
      $('main #traffic_stats').show();
      $('main #traffic_stats').hide()
      $('main .subpage').hide()
      $('main #traffic_stats_headline').hide();
      setTimeout( function(){
        $('main #traffic_stats_headline').css({ top: "50%"});
      },300);
    });

    $("header #level").click(function(){
      $('header #dropdown').css({ top: "15px"});
    });
    $("header #close_dropdown").click(function(){
      $('header #dropdown').css({ top: "-200px"});
    });


  });
