import axios from "axios";

export const loginRequest = async (data: {
  username: string;
  password: string;
  role: string;
}) => {
  const res = await axios.post("http://localhost:3000/auth/login", data);
  return res.data;
};
