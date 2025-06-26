import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import PortfolioPage from "./pages/PortfolioPage";
import Contact from "./pages/Contact";
import LoginForm from "./pages/Login";
import SignUp from "./pages/SignUp";
import AddProject from "./pages/AddProjects";
import AdminPage from "./pages/AdminPage.tsx";
import ViewUsers from "./pages/ViewUsers.tsx";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/addproject" element={<AddProject />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/viewusers" element={<ViewUsers />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white overflow-x-hidden">
        <main>
          <Navbar />
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
