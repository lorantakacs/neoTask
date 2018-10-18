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

  var admin = 'Admin'

  socket.emit('welcomeMessage', {
    from: admin,
    text: 'Welcome to Which Cat? '
  });

  socket.broadcast.emit('joinMessage', {
    from: admin,
    text: 'new user joined'
  });

//listen to request for initial picture and send to frontend
  socket.on('initRequestPicture1', (message) => {
    console.log(message.text);
    request('https://api.thecatapi.com/v1/images/search?mime_type=jpg,pngb12ea3e6-c22a-4cea-bb17-18e4163598f5', {json:true}, (err, res, body) => {
      if (err){
         return console.log(err);
      }

      console.log(body);

      io.emit('initPicture1', {
        id: body[0].id,
        picUrl: body[0].url,
      });
    });
  });

//listen to request for initial picture and send to frontend
  socket.on('initRequestPicture2', (message) => {
    console.log(message.text);
    request('https://api.thecatapi.com/v1/images/search?mime_type=jpg,pngb12ea3e6-c22a-4cea-bb17-18e4163598f5', {json:true}, (err, res, body) => {
      if (err){
         return console.log(err);
      }

      console.log(body);

      io.emit('initPicture2', {
        id: body[0].id,
        picUrl: body[0].url,
      });
    });
  });

//listen to request for picture and send to frontend
  socket.on('requestPicture1', (message) => {
    console.log(message.text);
    request('https://api.thecatapi.com/v1/images/search?mime_type=jpg,pngb12ea3e6-c22a-4cea-bb17-18e4163598f5', {json:true}, (err, res, body) => {
      if (err){
         return console.log(err);
      }

      console.log(body);

      io.emit('picture1', {
        id: body[0].id,
        picUrl: body[0].url,
      });
    });
  });

//listen to request for picture and send to frontend
  socket.on('requestPicture2', (message) => {
    console.log(message.text);
    request('https://api.thecatapi.com/v1/images/search?mime_type=jpg,pngb12ea3e6-c22a-4cea-bb17-18e4163598f5', {json:true}, (err, res, body) => {
      if (err){
         return console.log(err);
      }

      console.log(body);

      io.emit('picture2', {
        id: body[0].id,
        picUrl: body[0].url,
      });
    });
  });

  socket.on('disconnect', () => {
    console.log('User was disconnected');
  });
});

server.listen(port, () => {

  console.log(`Server is up on port ${port}`);

});
