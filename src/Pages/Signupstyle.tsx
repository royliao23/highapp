import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if ( !formData.email || !formData.password) {
      setErrorMessage("Please fill out all fields.");
      return;
    }

    // Mock signup logic (replace with your actual signup logic)
    setTimeout(() => {
      alert("Signup successful!");
      navigate("/login");
    }, 500);
  };

  return (
    <div className="login"> {/* Use the same container class */}
      <div className="login-container"> {/* Use the same container class */}
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup} className="login_form"> {/* Use the same form class */}
          {/* <label htmlFor="username" className="login_label">
            Username
          </label> */}
          {/* <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter your username"
            className="login_box"
            required
          /> */}

          <label htmlFor="email" className="login_label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            className="login_box"
            required
          />

          <label htmlFor="password" className="login_label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            className="login_box"
            required
          />

          <p style={{ margin: "10px 0" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "blue", textDecoration: "underline" }}>
              Log in here
            </Link>
          </p>

          <button type="submit" className="login_button">
            Sign Up
          </button>
          {errorMessage && <p className="error">{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default Signup;