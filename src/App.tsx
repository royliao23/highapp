import React, { useEffect, useState } from "react";
import { HashRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "./styles.css";
import Home from "./Pages/Home";
import Task from "./Pages/Task";
import Contact from "./Pages/Contact";
import Articles from "./Pages/Articles";
import Login from "./Pages/Login";
import Contractor from "./Pages/Contractor";
import Category from "./Pages/Category";
import ProjectComp from "./Pages/Project";
import JobComp from "./Pages/Job";
import PurchaseComp from "./Pages/Purchase";
import Nav from "./components/Nav";
import Signup from "./Pages/Signup";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import InvoiceComp from "./Pages/Invoice";
import PurchaseView from "./Pages/PurchaseView";
import InvoiceView from "./Pages/InvoiceView";
import PayComp from "./Pages/Pay";
import PayView from "./Pages/PayView";
import AgingReport from "./Pages/AgingReport";
import BankReconciliation from "./Pages/BankReconciliation";
import PayrollDashboard from "./Pages/PayrollDashboard";
const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <HashRouter>
      <MainApp
        isLoggedIn={isLoggedIn}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
    </HashRouter>
  );
};

interface MainAppProps {
  isLoggedIn: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

const MainApp: React.FC<MainAppProps> = ({
  isLoggedIn,
  onLoginSuccess,
  onLogout,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const hideNavPages = ["/login", "/signup"];

  
  useEffect(() => {
    const publicPaths = ["/login", "/signup", "/forgot-password", "/reset-password"];
    if (!isLoggedIn && !publicPaths.includes(pathname)) {
      navigate("/login");
    }
  }, [isLoggedIn, pathname, navigate]);
  

  return (
    <>
      {isLoggedIn && !hideNavPages.includes(pathname) && (
        <Nav onLogout={onLogout} />
      )}
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<Login onLoginSuccess={onLoginSuccess} />} />
        {isLoggedIn && <Route path="/" element={<Home />} />}
        {isLoggedIn && <Route path="/home" element={<Home />} />}
        {isLoggedIn && <Route path="/purchase" element={<PurchaseComp />} />}
        {isLoggedIn && <Route path="/task" element={<Task />} />}
        {isLoggedIn && <Route path="/contact" element={<Contact />} />}
        {isLoggedIn && <Route path="/articles" element={<Articles />} />}
        {isLoggedIn && <Route path="/category" element={<Category />} />}
        {isLoggedIn && <Route path="/job" element={<JobComp />} />}
        {isLoggedIn && <Route path="/project" element={<ProjectComp />} />}
        {isLoggedIn && <Route path="/contractor" element={<Contractor />} />}
        {isLoggedIn && <Route path="/invoice" element={<InvoiceComp />} />}
        {isLoggedIn && <Route path="/pay" element={<PayComp />} />}
        {isLoggedIn && <Route path="/creditor-aging" element={<AgingReport />} />}
        {isLoggedIn && <Route path="/ledger" element={<AgingReport />} />}
        {isLoggedIn && <Route path="/chart" element={<AgingReport />} />}
        {isLoggedIn && <Route path="/br" element={<BankReconciliation />} />}
        {isLoggedIn && <Route path="/payroll" element={<PayrollDashboard />} />}
        <Route path="/purchase/:code" element={<PurchaseView />} />
        <Route path="/invoice/:code" element={<InvoiceView />} />
        <Route path="/pay/:code" element={<PayView />} />
        <Route path="*" element={<Login onLoginSuccess={onLoginSuccess} />} />
      </Routes>
    </>
  );
};

export default App;
