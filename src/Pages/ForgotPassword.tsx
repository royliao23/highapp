import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        // Call Supabase's resetPasswordForEmail method with the correct redirect URL
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "http://localhost:3000/#/reset-password",
          });
    
        if (error) {
          throw error;
        }
    
        setMessage("A password reset link has been sent to your email.");
        setTimeout(() => navigate("/login"), 5000);
      } catch (err: any) {
        setError(err.message || "Failed to send reset email.");
      } finally {
        setIsLoading(false);
      }

   
  };

  return (
    <div className="login">
      <div className="login-container">
        <h2>Forgot Password?</h2>
        <p>Enter your registered email to receive a password reset link.</p>

        <form onSubmit={handlePasswordReset} className="login_form">
          <label htmlFor="email" className="login_label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email Address"
            className="login_box"
            required
          />

          <button type="submit" disabled={isLoading} className="login_button">
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>

          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}

          <p style={{ marginTop: "10px" }}>
            <Link to="/login" style={{ color: "blue", textDecoration: "underline" }}>
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
