const crypto = require("crypto");

class Room {
  users = [];

  constructor({ name, adminUser }) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.adminUser = adminUser;
  }

  addUser(user) {
    this.users.push(user);
    user.joinRoom(this.id);
  }
}

module.exports = Room;
