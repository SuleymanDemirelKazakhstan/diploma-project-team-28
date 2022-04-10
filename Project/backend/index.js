const io = require("socket.io")(4000, { cors: { origin: "*" } });

const App = require("./models/app.model");
const User = require("./models/user.model");
const Room = require("./models/room.model");

const app = new App();

io.on("connection", (socket) => {
  const user = new User({
    name: socket.handshake.query.userName,
    socket: socket,
  });
  app.addUser(user);
  console.log("connected", user.name, user.socket.id);

  socket.emit("me", user.toJSON());

  socket.on("room:create", (data) => {
    // {
    //   roomName: string
    // }

    const room = new Room({ name: data.roomName, adminUser: user });
    room.addUser(user);
    app.addRoom(room);

    user.socket.join(room.id);
    user.socket.emit("me:room:join", { roomId: room.id, roomName: room.name });
  });

  socket.on("room:join", (data) => {
    // {
    //   roomId: string
    // }
    const room = app.getRoomById(data.roomId);

    if (room) {
      user.socket.to(room.id).emit("friend:room:join", user.toJSON());

      room.addUser(user);

      user.socket.emit("me:room:join", {
        roomId: room.id,
        roomName: room.name,
      });
    }
  });

  socket.on("me:move", (data) => {
    // {
    //   x: number,
    //   y: number
    // }
    console.log(data);
    user.move({ x: data.x, y: data.y });
    user.socket.to(user.joinedRoom).emit("friend:update", user.toJSON());
  });
});
