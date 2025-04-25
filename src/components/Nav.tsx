import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

interface NavProps {
  onLogout: () => void;
}

const Nav: React.FC<NavProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);
  const [isHrDropdownOpen, setIsHrDropdownOpen] = useState(false);

  const handleMenuClick = (action?: () => void) => {
    setIsDropdownOpen(false);
    setIsReportsDropdownOpen(false);
    setIsHrDropdownOpen(false);
    if (action) action();
  };
  

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/home" className="navbar-logo" onClick={() => setIsDropdownOpen(false)}>
          <img src="/bm/logo192.png" alt="High App" />
        </Link>

        <div className={`hamburger ${isDropdownOpen ? "open" : ""}`} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>

        <ul className={`menu ${isDropdownOpen ? "dropdown-active" : ""}`}>
          <li className="menu-item">
            <Link to="/home" className="menu-link" onClick={() => handleMenuClick()}>Home</Link>
          </li>
          <li className="menu-item">
            <Link to="/purchase" className="menu-link" onClick={() => handleMenuClick()}>Purchase</Link>
          </li>
          <li className="menu-item">
            <Link to="/invoice" className="menu-link" onClick={() => handleMenuClick()}>Invoice</Link>
          </li>
          <li className="menu-item">
            <Link to="/pay" className="menu-link" onClick={() => handleMenuClick()}>Pay</Link>
          </li>
          <li className="menu-item">
            <Link to="/contractor" className="menu-link" onClick={() => handleMenuClick()}>Contractor</Link>
          </li>
          <li className="menu-item">
            <Link to="/job" className="menu-link" onClick={() => handleMenuClick()}>Job</Link>
          </li>
          <li className="menu-item">
            <Link to="/project" className="menu-link" onClick={() => handleMenuClick()}>Project</Link>
          </li>
          <li className="menu-item">
            <Link to="/category" className="menu-link" onClick={() => handleMenuClick()}>Category</Link>
          </li>
          <li className="menu-item">
            <Link to="/budget" className="menu-link" onClick={() => handleMenuClick()}>Budget</Link>
          </li>

          {/* Hr Dropdown */}
          <li className={`menu-item dropdown ${isHrDropdownOpen ? "open" : ""}`}>
            <span className="menu-link dropdown-toggle" onClick={() => setIsHrDropdownOpen(!isHrDropdownOpen)}>
            HR {isHrDropdownOpen ? "✖" : "▾"}
            </span>
            <ul className={`dropdown-menu ${isHrDropdownOpen ? "show" : ""}`}>
              <li><Link to="/company" className="dropdown-item" onClick={() => handleMenuClick()}>Company</Link></li>
              <li><Link to="/department" className="dropdown-item" onClick={() => handleMenuClick()}>Department</Link></li>
              <li><Link to="/employee" className="dropdown-item" onClick={() => handleMenuClick()}>Employee</Link></li>
              <li className="menu-item">
                <Link to="/payroll" className="dropdown-item" onClick={() => handleMenuClick()}>Payroll</Link>
              </li>
            </ul>
          </li>
          

          {/* Reports Dropdown */}
          <li className={`menu-item dropdown ${isReportsDropdownOpen ? "open" : ""}`}>
            <span className="menu-link dropdown-toggle" onClick={() => setIsReportsDropdownOpen(!isReportsDropdownOpen)}>
            Reports {isReportsDropdownOpen ? "✖" : "▾"}
            </span>
            <ul className={`dropdown-menu ${isReportsDropdownOpen ? "show" : ""}`}>
              <li><Link to="/creditor-aging" className="dropdown-item" onClick={() => handleMenuClick()}>Creditor</Link></li>
              <li><Link to="/br" className="dropdown-item" onClick={() => handleMenuClick()}>Reconcile Bank</Link></li>
              <li><Link to="/bas" className="dropdown-item" onClick={() => handleMenuClick()}>BAS</Link></li>
              <li><Link to="/ledger" className="dropdown-item" onClick={() => handleMenuClick()}>Ledger</Link></li>
              <li><Link to="/chart" className="dropdown-item" onClick={() => handleMenuClick()}>Chart</Link></li>
            </ul>
          </li>

          <li className="menu-item">
            <a href="#" className="menu-link logout-link" onClick={() => {
              handleMenuClick(() => {
                onLogout();
                navigate("/login");
              });
            }}>
              Log Out
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Nav;
