import axios from "axios";

const DAILY_API_KEY =
  "db0f0077f1eb03874a9f9f2503f55273685c2baa4de13e432aeef1bddba6baeb";

export const ApiService = {
  async UploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);

    const { data } = await axios.post("/upload-avatar", formData);

    return data;
  },

  СreateRoom(input: { name: string }) {
    return axios
      .post(
        "https://api.daily.co/v1/rooms",
        {
          ...input,
          properties: { enable_new_call_ui: false },
        },
        {
          headers: {
            Authorization: `Bearer ${DAILY_API_KEY}`,
          },
        }
      )
      .then(({ data }) => data);
  },

  // TODO: join room
};
