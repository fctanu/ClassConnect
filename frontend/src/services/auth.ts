import axios from "axios";

export async function logout() {
  await axios.post("/api/auth/logout", {}, { withCredentials: true });
  localStorage.removeItem("accessToken");
}

export async function refresh() {
  const res = await axios.post(
    "/api/auth/refresh",
    {},
    { withCredentials: true },
  );
  localStorage.setItem("accessToken", res.data.accessToken);
  return res.data.accessToken;
}
