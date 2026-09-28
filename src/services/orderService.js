import API from "../api/axiosInstance";

/*
 * paymentImage اختياري، فالطلب ينبعت كـ multipart/form-data
 * و item ينبعت كنص JSON لأن FormData ما بتدعم المصفوفات المتداخلة.
 */
const createOrder = async (orderData, paymentImage) => {
  const formData = new FormData();

  formData.append("methodPayment", orderData.methodPayment);
  formData.append("paymentNumber", orderData.paymentNumber);
  formData.append("item", JSON.stringify(orderData.item));

  if (paymentImage) {
    formData.append("paymentImage", paymentImage);
  }

  const response = await API.post("/orders", formData);
  return response.data;
};

const getMyOrders = async () => {
  const response = await API.get("/orders/mine");
  return response.data;
};

const getMyStats = async () => {
  const response = await API.get("/orders/my-stats");
  return response.data;
};

const getMyInvoices = async () => {
  const response = await API.get("/orders/mine/invoices");
  return response.data;
};
const getAllOrders = async () => {
  const response = await API.get("/orders");
  return response.data;
};
const updateOrderStatus = async (id, status) => {
  const response = await API.patch(`/orders/${id}/status`, {
    status,
  });

  return response.data;
};

const orderService = {
  createOrder,
  getMyOrders,
  getMyStats,
  getMyInvoices,
  getAllOrders,
  updateOrderStatus,
};

export default orderService;
