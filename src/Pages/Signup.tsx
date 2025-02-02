import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/v1/signup`, {
        email,
        password,
      },
      {
        headers: {
          apikey: process.env.REACT_APP_API_KEY,
          "Content-Type": "application/json",
        },
      });
      alert("Signup successful. Please login.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup} className="login_form">
          <label htmlFor="email" className="login_label">
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email"
            className="login_box"
            required
          />

          <label htmlFor="password" className="login_label">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password"
            className="login_box"
            required
          />

          <button type="submit" disabled={isLoading} className="login_button">
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Signup;
