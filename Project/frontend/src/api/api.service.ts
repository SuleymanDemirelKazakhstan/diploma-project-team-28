import axios from "axios";

export const ApiService = {
  async UploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);

    const { data } = await axios.post("/upload-avatar", formData);

    return data;
  },

  async CreateRoom(input: { id: string; title: string }) {
    const { data } = await axios.post("/rooms", input);

    return data;
  },

  // TODO: join room
};
