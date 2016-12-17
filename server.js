const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const mongoose = require('mongoose');
const Submission = mongoose.model('Submission');
const Program = mongoose.model('Program');
app.use('/admin', require('./admin'));
app.use('/assets', express.static(path.join(__dirname, '/app/assets')));

app.all("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('submission', (data) => {
    console.log(data);
  });
});

http.listen(8081, () => {
  console.log('listening on *:8081');
});
