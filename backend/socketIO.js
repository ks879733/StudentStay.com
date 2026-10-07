const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("Authentication required"));

            const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
            if (!decoded.userId) return next(new Error("Invalid authentication token"));

            socket.userId = String(decoded.userId);
            return next();
        } catch {
            return next(new Error("Authentication required"));
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        socket.join(`user:${socket.userId}`);

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
};

module.exports = {
    initSocket,
    getIO
};
