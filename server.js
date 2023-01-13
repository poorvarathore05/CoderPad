const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const { Server } = require("socket.io");
const http = require("http");
const ACTIONS = require("./src/ACTIONS");
const path = require("path");
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const io = new Server(server);

app.use(express.static("build"));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const userSocketMap = {};

function getConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        userName: userSocketMap[socketId],
      };
    }
  );
}

io.on("connection", (socket) => {
  console.log("INside connection");
  console.log(`socket ${socket.id} connected`);

  socket.on(ACTIONS.JOIN, ({ roomId, userName }) => {
    userSocketMap[socket.id] = userName;
    socket.join(roomId);
    const clients = getConnectedClients(roomId);
    console.log(clients);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        userName,
        socketId: socket.id,
      });
    });
  });

  //Code Change
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code, cursor }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code, cursor });
  });

  // Sync_Code on join
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Disconnect the client

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        userName: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

server.listen(PORT, () => console.log(`LISTENING ON port${PORT}`));
