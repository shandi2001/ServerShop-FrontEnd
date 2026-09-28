import API from "../api/axiosInstance";

const getMyMessages = async () => {
  const response = await API.get("/messages/mine");
  return response.data;
};

const getMessage = async (id) => {
  const response = await API.get(`/messages/${id}`);
  return response.data;
};

const markAsRead = async (id) => {
  const response = await API.patch(`/messages/${id}`, {
    isRead: true,
  });

  return response.data;
};

const messageService = {
  getMyMessages,
  getMessage,
  markAsRead,
};

export default messageService;
