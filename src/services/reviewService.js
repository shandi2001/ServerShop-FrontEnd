import API from "../api/axiosInstance";

const createReview = async (rate, comment) => {
  const response = await API.post("/reviews", { rate, comment });
  return response.data;
};

const getAllReviews = async () => {
  const response = await API.get("/reviews");
  return response.data;
};

const getReview = async (id) => {
  const response = await API.get(`/reviews/${id}`);
  return response.data;
};

const deleteReview = async (id) => {
  const response = await API.delete(`/reviews/${id}`);
  return response.data;
};

const getMyReviews = async () => {
  const response = await API.get("/reviews/mine");
  return response.data;
};

const reviewService = {
  createReview,
  getAllReviews,
  getReview,
  deleteReview,
  getMyReviews,
};

export default reviewService;
