import API from "../api/axiosInstance";

const getAllPackages = async () => {
  const response = await API.get("/packages");

  return response.data;
};

const createPackage = async (data) => {
  const response = await API.post("/packages", data);

  return response.data;
};

const deletePackage = async (id) => {
  const response = await API.delete(`/packages/${id}`);

  return response.data;
};

const updatePackage = async (id, data) => {
  const response = await API.patch(`/packages/${id}`, data);

  return response.data;
};

const packageService = {
  getAllPackages,

  createPackage,

  deletePackage,

  updatePackage,
};

export default packageService;
