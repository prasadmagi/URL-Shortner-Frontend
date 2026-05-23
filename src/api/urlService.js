import client from "./client";
import { getAuthToken } from "./authService";
import { getShortUrl } from "../utils/url";

/** POST /api/url or /api/url/auth — anonymous (max 2/IP) or logged-in user */
export const shortenUrl = async (longUrl) => {
  const endpoint = getAuthToken() ? "/api/url/auth" : "/api/url";
  const { data } = await client.post(endpoint, { longUrl });

  return {
    message: data.message,
    shortCode: data.shortCode,
    longUrl: data.longUrl,
    isAnonymous: data.isAnonymous,
    shortUrl: getShortUrl(data.shortCode),
  };
};
