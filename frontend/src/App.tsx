import React, { useEffect, useState } from "react";
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
import Dashboard from "./pages/Dashboard.tsx";
import UserProfilePage from "./pages/UserProfilePage.tsx";
import ViewProjects from "./pages/ViewProjects.tsx";
import ProjectsPage from "./pages/ProjectsPage.tsx";
import AllProjectsPage from "./pages/AllProjectsPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const AnimatedRoutes = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  useEffect(() => {
    const fetchRole = async () => {
      // Check localStorage for isSuperAdmin
      if (localStorage.getItem("isSuperAdmin") === "true") {
        setUserRole("superadmin");
        return;
      }
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserRole(userSnap.data().role);
        } else {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    };
    fetchRole();
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/mentorProject"
          element={
            <ProtectedRoute allowedRoles={["mentor"]} userRole={userRole}>
              <MentorProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "superadmin"]}
              userRole={userRole}
            >
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminProject"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "superadmin"]}
              userRole={userRole}
            >
              <AddProjectAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewUsers"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]} userRole={userRole}>
              <ViewUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["mentor", "student", "admin", "superadmin"]}
              userRole={userRole}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:uid" element={<UserProfilePage />} />
        <Route
          path="/viewProjects"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]} userRole={userRole}>
              <ViewProjects />
            </ProtectedRoute>
          }
        />
        <Route path="/projectsPage" element={<ProjectsPage />} />
        <Route path="/all-projects/:type" element={<AllProjectsPage />} />
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
