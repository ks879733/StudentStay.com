export const ROLE_HOME = {
  student: "/dashboard",
  owner: "/owner/dashboard",
  admin: "/admin/dashboard",
};

export const getRole = () => {
  const savedRole = localStorage.getItem("role");
  if (ROLE_HOME[savedRole]) return savedRole;

  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return ROLE_HOME[user?.role] ? user.role : null;
  } catch {
    return null;
  }
};

export const getDashboardPath = () => ROLE_HOME[getRole()] || "/login";

export const clearAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-changed"));
};
