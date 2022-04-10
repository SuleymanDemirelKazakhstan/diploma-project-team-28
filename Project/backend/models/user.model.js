class User {
  constructor({ name, socket }) {
    this.id = socket.id;
    this.name = name;
    this.socket = socket;
    this.x = Math.floor(Math.random() * 1000) + 50;
    this.y = Math.floor(Math.random() * 800) + 50;
  }

  move({ x, y }) {
    this.x = x;
    this.y = y;
  }

  joinRoom(roomId) {
    this.joinedRoom = roomId;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      x: this.x,
      y: this.y,
    };
  }
}

module.exports = User;
