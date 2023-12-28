const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
    cors: {
        origin: "*"
    }
});

app.use(express.static(__dirname + '/fe'));
app.use("/", (req, res) => {
    res.sendFile(__dirname + '/fe/index.html');
})
io.on('connection', socket => {
    // Handle signaling between peers
    socket.on('offer', offer => {
        socket.broadcast.emit('offer', offer);
        console.log("🚀 ~ file: index.js:20 ~ offer:", offer)
    });

    socket.on('answer', answer => {
        socket.broadcast.emit('answer', answer);
        console.log("🚀 ~ file: index.js:25 ~ answer:", answer)
    });

    socket.on('icecandidate', candidate => {
        socket.broadcast.emit('icecandidate', candidate);
        console.log("🚀 ~ file: index.js:30 ~ candidate:", candidate)
    });
    socket.on('join', (data) =>{
        socket.broadcast.emit('join', data);
    })
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
