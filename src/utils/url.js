const BACKEND_URL = import.meta.env.DEV 
  ? "http://localhost:4000" 
  : (import.meta.env.VITE_BACKEND_URL || "https://url-shortner-backend-beta.vercel.app");

export const getShortUrl = (shortCode) =>
  `${BACKEND_URL}/api/url/${shortCode}`;
