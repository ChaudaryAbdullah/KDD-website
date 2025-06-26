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
import MentorProjects from "./pages/MentorProjects.tsx";
import AdminPage from "./pages/AdminPage.tsx";
import AddProjectAdmin from "./pages/AddAdminProjects.tsx";
import ViewUsers from "./pages/ViewUsers.tsx";
import ViewProjects from "./pages/ViewProjects.tsx";


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
        <Route path="/mentorProject" element={<MentorProjects />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/adminProject" element={<AddProjectAdmin />} />
        <Route path="/viewUsers" element={<ViewUsers />} />
        <Route path="/viewProjects" element={<ViewProjects />} />
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
