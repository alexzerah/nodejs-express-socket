// app.js
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  }
});

// Vos routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Evenements socket
io.on('connection', (socket) => {
    console.log(`A user connected with socket ${socket.id}`);
    socket.emit('game', {user: 1, turn: 0})
    
    socket.on("newTurn", (msg) => {
        console.log(msg)
        socket.broadcast.emit("newTurn", msg)
  })
})

// Evenement serveur
server.listen(3000, () => {
    console.log('listening on *:3000');
})
