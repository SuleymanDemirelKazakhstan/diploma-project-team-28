export interface User {
  id?: string;
  name: string;
  avatar?: string;
  x?: number;
  y?: number;
}

export interface Room {
  id: string;
  name: string;
  adminUser: User;
}

export interface CreateRoomInput {
  roomName: string;
}

export interface JoinRoomInput {
  roomId: string;
}

export interface JoinRoomMsg extends Room {
  members: User[];
}

export interface ProfileCreateMsg {
  id: string;
  x: number;
  y: number;
}

export interface FriendRoomJoinMsg {
  id: string;
  name: string;
  avatar?: string;
  x: number;
  y: number;
}

export interface FriendUpdateMsg {
  id: string;
  name: string;
  avatar?: string;
  x: number;
  y: number;
}
