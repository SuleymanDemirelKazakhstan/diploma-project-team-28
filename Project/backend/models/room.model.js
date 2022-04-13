const crypto = require("crypto");

class Room {
  members = [];

  constructor({ name, adminUser }) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.adminUser = adminUser;
  }

  addUser(user) {
    this.members.push(user);
    user.joinRoom(this.id);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      adminUser: this.adminUser.toJSON(),
      members: this.members.map((memeberItem) => memeberItem.toJSON()),
    };
  }
}

module.exports = Room;
