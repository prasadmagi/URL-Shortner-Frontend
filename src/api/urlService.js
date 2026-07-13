import client from "./client";
import { getAuthToken } from "./authService";
import { getShortUrl } from "../utils/url";

/** POST /api/url or /api/url/auth — anonymous (max 2/IP) or logged-in user */
export const shortenUrl = async (longUrl, password = null, customAlias = null) => {
  const endpoint = getAuthToken() ? "/api/url/auth" : "/api/url";
  const payload = { longUrl };
  if (password) payload.password = password;
  if (customAlias) payload.customAlias = customAlias;
  const { data } = await client.post(endpoint, payload);

  return {
    message: data.message,
    shortCode: data.shortCode,
    longUrl: data.longUrl,
    isAnonymous: data.isAnonymous,
    shortUrl: getShortUrl(data.shortCode),
  };
};

export const verifyUrlPassword = async (shortCode, password) => {
  const { data } = await client.post(`/api/url/${shortCode}/verify`, { password });
  return data;
};
