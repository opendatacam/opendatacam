var yolo = {}

document.addEventListener('DOMContentLoaded', function(){
  // load detections
  $.ajax({
    url: 'data/C0082-47mm_detected.txt',
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
  setTimeout(draw, 50, v, ctx, s, w, h);
}

  // animations
  $(window).ready(function() {
    setTimeout(function(e){
      $("#splash_screen svg").css("width", "15%");
      $("#splash_screen svg #first_blinking_circle").addClass("first_blinking_circle_animate");
      $("#splash_screen svg #second_blinking_circle").addClass("second_blinking_circle_animate");
      $("#splash_screen #logo").css("fill", "#C22C01");
    }, 1000);
    setTimeout(function(e){
      $("#splash_screen").fadeOut();
      $("main").fadeIn();
      $("header").delay(600).fadeIn();
    }, 3500);
    $(".menu_item").click(function(){
       $(".content").css("left", "10px").css("right", "10px");
    });
    $(".close_content").click(function(){
       $(".content").css("left", "-100%").css("right", "100%");
    });
  });
