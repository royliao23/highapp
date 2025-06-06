import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = process.env.REACT_APP_API_NODE!;
const REFRESH_URL = `${API_BASE_URL}/auth/refresh`;

interface JwtPayload {
  exp: number;
}

export async function getValidAccessToken(): Promise<string | null> {
  let token = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!token || !refreshToken) return null;

  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    const now = Math.floor(Date.now() / 1000);

    // Check if the token is expired or near expiration (5 minutes)
    if (!exp || exp < now + 300) { // Refresh token if it's expired or will expire within 5 minutes
      const res = await axios.post(REFRESH_URL, {
        refresh_token: refreshToken,
      });

      token = res.data.access_token;
      if (token) {
        // Save the new token to localStorage
        localStorage.setItem("authToken", token);
      } else {
        console.error('Failed to refresh the access token');
        return null;
      }
    }

    return token;
  } catch (err) {
    console.error("Error validating or refreshing token", err);
    return null;
  }
}

