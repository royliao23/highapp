import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { loggedin } from "../state/counter/counterSlice";

const Nav = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleMenuClick = (action?: () => void) => {
    setIsDropdownOpen(false); // Close the dropdown
    if (action) action(); // Execute additional actions, if any
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/home" className="navbar-logo" onClick={() => setIsDropdownOpen(false)}>
          <img src="/bm/logo192.png" alt="/logo192.png" />
          ProApp
        </Link>

        {/* Hamburger Menu */}
        <div
          className={`hamburger ${isDropdownOpen ? "open" : ""}`}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>

        {/* Menu */}
        <ul className={`menu ${isDropdownOpen ? "dropdown-active" : ""}`}>
          <li className="menu-item">
            <Link to="/home" className="menu-link" onClick={() => handleMenuClick()}>
              Purchase Order
            </Link>
          </li>
          {/* <li className="menu-item">
            <Link to="/articles" className="menu-link" onClick={() => handleMenuClick()}>
              Articles
            </Link>
          </li> */}
          <li className="menu-item">
            <Link to="/contractor" className="menu-link" onClick={() => handleMenuClick()}>
              Supplier
            </Link>
          </li>
          <li className="menu-item">
            <Link to="/job" className="menu-link" onClick={() => handleMenuClick()}>
              Job
            </Link>
          </li>
          <li className="menu-item">
            <Link to="/project" className="menu-link" onClick={() => handleMenuClick()}>
              Project
            </Link>
          </li>
          <li className="menu-item">
            <Link to="/category" className="menu-link" onClick={() => handleMenuClick()}>
              Category
            </Link>
          </li>
          <li className="menu-item">
            <Link to="/task" className="menu-link" onClick={() => handleMenuClick()}>
              Tasks
            </Link>
          </li>
          <li className="menu-item">
            <Link to="/contact" className="menu-link" onClick={() => handleMenuClick()}>
              Contact
            </Link>
          </li>
          <li className="menu-item">
            <a
              href="#"
              className="menu-link logout-link"
              onClick={() =>
                handleMenuClick(() => {
                  navigate("/login");
                  dispatch(loggedin(false));
                })
              }
            >
              Log Out
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Nav;
