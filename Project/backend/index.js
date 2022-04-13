const io = require("socket.io")(4000, { cors: { origin: "*" } });

const App = require("./models/app.model");
const User = require("./models/user.model");
const Room = require("./models/room.model");

const app = new App();

io.on("connection", (socket) => {
  const user = new User({
    name: socket.handshake.query.name,
    socket: socket,
  });

  app.addUser(user);

  socket.emit("me:profile:create", user.toJSON());
  console.log("User connected", user.toJSON());

  socket.on("room:create", (data) => {
    console.log("Create room", data);
    // {
    //   roomName: string
    // }

    const room = new Room({ name: data.roomName, adminUser: user });
    room.addUser(user);
    app.addRoom(room);

    user.socket.join(room.id);
    user.socket.emit("me:room:join", room.toJSON());
  });

  socket.on("room:join", (data) => {
    // {
    //   roomId: string
    // }
    const room = app.getRoomById(data.roomId);

    if (room) {
      room.addUser(user);
      user.socket.join(room.id);
      user.socket.emit("me:room:join", room.toJSON());
      user.socket.to(room.id).emit("friend:room:join", user.toJSON());
    }
  });

  socket.on("me:move", (data) => {
    console.dir(user.toJSON());
    // {
    //   x: number,
    //   y: number
    // }
    user.move({ x: data.x, y: data.y });
    user.socket.to(user.joinedRoom).emit("friend:update", user.toJSON());
  });
});
