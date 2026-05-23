import axios from "axios";
import { getAuthToken } from "./authService";

const BASE_URL = "https://url-shortner-backend-beta.vercel.app/api";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add auth token to requests
client.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * GET /api/user/urls — get user's shortened URLs
 */
export const getUserUrls = async () => {
  try {
    const { data } = await client.get("/url/my/urls");
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/user/stats — get user statistics
 */
export const getUserStats = async () => {
  try {
    const { data } = await client.get("/user/stats");
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE /api/url/:id — delete a shortened URL
 */
export const deleteUrl = async (urlId) => {
  try {
    const { data } = await client.delete(`/url/${urlId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * PUT /api/url/:id — update a shortened URL
 */
export const updateUrl = async (urlId, updates) => {
  try {
    const { data } = await client.put(`/url/${urlId}`, updates);
    return data;
  } catch (error) {
    throw error;
  }
};

export default client;
