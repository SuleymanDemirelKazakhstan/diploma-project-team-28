const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const multer = require("multer");
const path = require("path");

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
  },
});
const upload = multer({ storage: storage });

const ROOMS = {};

const SOCKET_TO_ROOM = {};

io.on("connection", (socket) => {
  socket.on("me:room:join", (data) => {
    /*
      {
        roomId: string,
        user: {
          id: string,
          name: string,
          avatar: string,
          x: number,
          y: number
        }
      }
    */
    const userData = {
      ...data.user,
      socketId: socket.id,
    };

    // Add new user
    if (ROOMS[data.roomId]) {
      ROOMS[data.roomId].users.push(userData);
      SOCKET_TO_ROOM[socket.id] = data.roomId;
      socket.join(data.roomId);
      socket.to(data.roomId).emit("friend:room:join");

      socket.emit("room:data", ROOMS[data.roomId]);
    }

    console.log(ROOMS[data.roomId]);
  });

  socket.on("me:signal:send", (payload) => {
    io.to(payload.userToSignal).emit("friend:signal:send", {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on("me:signal:return", (payload) => {
    io.to(payload.callerID).emit("friend:signal:return", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    const roomId = SOCKET_TO_ROOM[socket.id];
    if (ROOMS[roomId]) {
      ROOMS[roomId].users = ROOMS[roomId].users.filter(
        (u) => u.socketId !== socket.id
      );
    }
  });
});

// Upload avatar on registration
app.post("/upload-avatar", upload.single("avatar"), (req, res) => {
  return res.status(201).json({
    path: "/" + req.file.path,
  });
});

// Create room
app.post("/rooms", (req, res) => {
  /*
    {
      id: string
      title: string
    }
  */
  const { id: roomId, title } = req.body;

  ROOMS[roomId] = {
    title: title,
    users: [],
  };

  res.status(201).json(ROOMS[roomId]);
});

// Get room info
app.get("/rooms/:roomId", (req, res) => {
  const { roomId } = req.params;

  // Check if room exists
  if (ROOMS[roomId]) {
    return res.status(200).json(ROOM[roomId]);
  }

  return res.sendStatus(404);
});

server.listen(4000, () => console.log("Server is running on port 4000"));
