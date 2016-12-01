const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

app.use('/assets', express.static(path.join(__dirname, '/app/assets')));


app.all("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('submission', (data) => {
    console.log(data);
  });
});

http.listen(8081, function(){
  console.log('listening on *:8081');
});
