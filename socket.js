const { Server } = require("socket.io");

const io = new Server(3200, { /* options */ });

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("message", (msg) => {
        console.log("message: " + msg);
    });
});