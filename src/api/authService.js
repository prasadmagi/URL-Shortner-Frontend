import axios from "axios";

const LOGIN_URL = "https://url-shortner-backend-beta.vercel.app/api/auth/login";
const SIGNUP_URL = "https://url-shortner-backend-beta.vercel.app/api/auth/signup";

/**
 * POST /api/auth/login — authenticate user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Response with token and user data
 */
export const loginUser = async (email, password) => {
  try {
    const { data } = await axios.post(LOGIN_URL, { email, password });
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || { email }));
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * POST /api/auth/signup — register new user
 * @param {string} name - User full name
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Response with token and user data
 */
export const signupUser = async (name, email, password) => {
  try {
    const { data } = await axios.post(SIGNUP_URL, { name, email, password });
    
    // Store token in localStorage if provided
    if (data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || { name, email }));
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};

/**
 * Get stored auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

/**
 * Get stored user info
 */
export const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};
