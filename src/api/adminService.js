import axios from "axios";
import { getAuthToken } from "./authService";

const BASE_URL = "https://url-shortner-backend-beta.vercel.app/api";

const adminClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add auth token to requests
adminClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * GET /api/admin/stats — get admin statistics
 */
export const getAdminStats = async () => {
  try {
    const { data } = await adminClient.get("/admin/stats");
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/admin/users — get all users with URL counts
 */
export const getAllUsers = async () => {
  try {
    const { data } = await adminClient.get("/admin/users");
    return data;
  } catch (error) {
    throw error;
  }
};



/**
 * GET /api/admin/users/{userId} — get specific user details with their URLs
 */
export const getUserDetails = async (userId) => {
  try {
    const { data } = await adminClient.get(`/admin/users/${userId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/admin/analytics/{shortCode} — get analytics for a specific URL
 */
export const getUrlAnalytics = async (shortCode) => {
  try {
    const { data } = await adminClient.get(`/admin/analytics/${shortCode}`);
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE /api/admin/users/:id — delete a user
 */
export const deleteUserAsAdmin = async (userId) => {
  try {
    const { data } = await adminClient.delete(`/admin/users/${userId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * PUT /api/admin/users/:id — update a user
 */
export const updateUserAsAdmin = async (userId, updates) => {
  try {
    const { data } = await adminClient.put(`/admin/users/${userId}`, updates);
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE /api/admin/urls/:id — delete a URL as admin
 */
export const deleteUrlAsAdmin = async (urlId) => {
  try {
    const { data } = await adminClient.delete(`/admin/urls/${urlId}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export default adminClient;
