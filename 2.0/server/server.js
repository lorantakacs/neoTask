const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const request = require('request');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  var admin = 'Admin';
  var counter = 0;

  socket.emit('welcomeMessage', {
    from: admin,
    text: 'Welcome to Which Cat? '
  });

  socket.broadcast.emit('joinMessage', {
    from: admin,
    text: 'new user joined'
  });

  // variable storing API url
  const catApiUrl = 'https://api.thecatapi.com/v1/images/search?mime_type=jpg,pngb12ea3e6-c22a-4cea-bb17-18e4163598f5';

  // function listening for request from fron-end then requesting pictures and sending response using callback function reqEmitFunc
  var listenAndEmit = (socketToListen, reqEmitFunc, url, pic) => {
    socket.on(socketToListen, (message) => {
      counter++;
      console.log(counter);
      console.log(message.text);
      reqEmitFunc(url, pic);
    });
  };

  // function requesting pic and emit to front-end
  var reqPicEmit = (url, pic) => {
    request(url, {json:true}, (err, res, body) => {
      if (err){
        return console.log(err);
      }

      console.log(body);

      io.emit(pic, {
        id: body[0].id,
        picUrl: body[0].url,
      });

    });
  };

  //listen to request for initial picture1 and send to frontend
  listenAndEmit('initRequestPicture1', reqPicEmit, catApiUrl, 'initPicture1');

  //listen to request for initial picture2 and send to frontend
  listenAndEmit('initRequestPicture2', reqPicEmit, catApiUrl, 'initPicture2');

  //listen to request for picture1 and send to frontend
  listenAndEmit('requestPicture1', reqPicEmit, catApiUrl, 'picture1');

  //listen to request for picture2 and send to frontend
  listenAndEmit('requestPicture2', reqPicEmit, catApiUrl, 'picture2');

    socket.on('disconnect', () => {
      console.log('User was disconnected');
    });
});

server.listen(port, () => {

  console.log(`Server is up on port ${port}`);

});
