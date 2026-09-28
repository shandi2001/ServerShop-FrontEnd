import API from "../api/axiosInstance";

const getMe = async () => {
  const response = await API.get("/users/me");
  return response.data;
};

// تحديث الاسم والإيميل فقط
const updateMe = async (data) => {
  const response = await API.patch("/users/updateMe", data);
  return response.data;
};

// تحديث البيانات مع صورة البروفايل (multipart/form-data)
const updateMeWithPhoto = async ({ name, email, photo }) => {
  const formData = new FormData();

  if (name) formData.append("name", name);
  if (email) formData.append("email", email);
  if (photo) formData.append("photo", photo);

  const response = await API.patch("/users/updateMeAndUpload", formData);
  return response.data;
};

const updateMyPassword = async (passwordCurrent, password) => {
  const response = await API.patch("/users/updateMyPassword", {
    passwordCurrent,
    password,
  });

  return response.data;
};

const getAllUsers = async () => {
  const response = await API.get("/users");
  return response.data;
};

const banUser = async (id) => {
  const response = await API.patch(`/users/${id}/ban`);
  return response.data;
};

const unbanUser = async (id) => {
  const response = await API.patch(`/users/${id}/unban`);
  return response.data;
};

const forgotPassword = async (email) => {
  const response = await API.post("/users/forgotPassword", {
    email,
  });

  return response.data;
};

const resetPassword = async (email, otp, password) => {
  const response = await API.patch("/users/resetPassword", {
    email,
    otp,
    password,
  });

  return response.data;
};
const userService = {
  getMe,
  updateMe,
  updateMeWithPhoto,
  updateMyPassword,
  getAllUsers,
  banUser,
  unbanUser,
  forgotPassword,
  resetPassword,
};

export default userService;
