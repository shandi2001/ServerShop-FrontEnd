import API from "../api/axiosInstance";

const getMyServers = async () => {
  const response = await API.get("/servers/mine");
  return response.data;
};

const getAllServers = async () => {
  const response = await API.get("/servers");
  return response.data;
};

const serverService = {
  getMyServers,
  getAllServers,
};

export default serverService;
