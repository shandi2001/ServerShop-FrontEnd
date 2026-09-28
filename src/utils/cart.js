/*
 * مفتاح السلة موحّد بمكان واحد.
 *
 * كان يُبنى من اسم المستخدم بأربع أماكن مختلفة، فمستخدمان بنفس الاسم
 * يتشاركان السلة، وتغيير الاسم يفقد محتواها.
 */
export const getCartKey = (user) =>
  `servergo_cart_${String(user?.id || user?._id || user?.email || "guest")}`;

export const readCart = (user) => {
  try {
    const saved = localStorage.getItem(getCartKey(user));
    const items = saved ? JSON.parse(saved) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

export const writeCart = (user, items) => {
  localStorage.setItem(getCartKey(user), JSON.stringify(items));
};

export const clearCart = (user) => {
  localStorage.removeItem(getCartKey(user));
};

export const readCurrentUser = () => {
  try {
    const saved = localStorage.getItem("servergo_user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};
