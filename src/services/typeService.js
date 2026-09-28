import API from "../api/axiosInstance";

const getAllTypes = async () => {
  const response = await API.get("/types");
  return response.data;
};

const typeService = {
  getAllTypes,
};

export default typeService;
