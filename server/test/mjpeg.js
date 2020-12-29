const http = require('http');

const request_options = {
  hostname: '192.168.2.161',
  port: 8090,
};

const req_pipe = http.request(request_options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', () => {
    console.log('received data');
  });
  res.on('close', () => {
    console.log('close');
  });
  res.on('readable', () => {
    console.log('readble');
  });
  res.on('error', () => {
    console.log('error');
  });
});
// req_pipe.pipe();

req_pipe.on('error', (e) => {
  console.log(e);
});
// client quit normally
// req.on('end', function(){
//     console.log('end');
//     req_pipe.abort();

// });
// //client quit unexpectedly
// req.on('close', function(){
//     console.log('close');
//     req_pipe.abort()

// })

// app.get('/cam/frontdoor',function(req,res){

//     var request_options = {
//         auth: {
//             user: '',
//             pass: ''},
//         url: 'http:/xx.xx.xx.xx/mjpg/video.mjpg',
//     };

//     var req_pipe = request(request_options);
//     req_pipe.pipe(res);

//     req_pipe.on('error', function(e){
//         console.log(e)
//     });
//     //client quit normally
//     req.on('end', function(){
//         console.log('end');
//         req_pipe.abort();

//     });
//     //client quit unexpectedly
//     req.on('close', function(){
//         console.log('close');
//         req_pipe.abort()

//     })

// })
