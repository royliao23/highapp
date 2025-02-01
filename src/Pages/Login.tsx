import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loggedin } from "../state/counter/counterSlice";

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/v1/token?grant_type=password`,
        { email: username, password },
        {
          headers: {
            apikey: process.env.REACT_APP_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
  
      localStorage.setItem("authToken", response.data.access_token);
      localStorage.setItem("username", username);
      onLoginSuccess(username);
      dispatch(loggedin(true));
      navigate("/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid login credentials.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="login">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin} className="login_form">
          <label htmlFor="username" className="login_label">
            Username or Email
          </label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-label="Username or Email"
            className="login_box"
            required
          />

          <label htmlFor="password" className="login_label">
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
              className="login_box"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                cursor: "pointer",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          <button type="submit" disabled={isLoading} className="login_button">
            {isLoading ? "Logging in..." : "Log In"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
