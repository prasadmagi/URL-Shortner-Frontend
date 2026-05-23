export const getShortUrl = (shortCode) =>
  `${import.meta.env.VITE_BACKEND_URL}/api/url/${shortCode}`;
