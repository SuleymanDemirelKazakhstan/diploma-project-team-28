class App {
  users = [];
  rooms = [];

  constructor() {}

  addUser(user) {
    this.users.push(user);
  }

  addRoom(room) {
    this.rooms.push(room);
  }

  getRoomById(roomId) {
    const room = this.rooms.find((_room) => _room.id === roomId);

    return room;
  }
}

module.exports = App;
