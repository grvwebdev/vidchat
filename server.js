require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: [ "GET", "POST" ]
	}
})

const users = {};
io.on('connection', socket => {

    
    if (!users[socket.id]) {
        users[socket.id] = socket.id;
    }

    socket.emit("yourID", socket.id);
    console.log("yourID", socket.id);
    io.sockets.emit("allUsers", users);
    // console.log(users);
    
    socket.on('disconnect', () => {
        delete users[socket.id];
        socket.broadcast.emit("userLeft", socket.id);
    })

    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from});
    })

    socket.on("acceptCall", (data) => {
        io.to(data.to).emit('callAccepted', data.signal);
    })
});

var port = process.env.PORT || 7000;
server.listen(port, () => console.log('server is running on port '+port));