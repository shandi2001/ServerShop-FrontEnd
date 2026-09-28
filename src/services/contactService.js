import API from "../api/axiosInstance";

const createContact = async (message) => {
  const response = await API.post("/contacts", {
    message,
  });

  return response.data;
};

const getMyContacts = async () => {
  const response = await API.get("/contacts/mine");
  return response.data;
};

const getAllContacts = async () => {
  const response = await API.get("/contacts");
  return response.data;
};

const deleteContact = async (id) => {
  const response = await API.delete(`/contacts/${id}`);
  return response.data;
};

const contactService = {
  createContact,
  getMyContacts,
  getAllContacts,
  deleteContact,
};

export default contactService;
