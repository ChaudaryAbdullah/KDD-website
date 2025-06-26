import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import UserLogo from "../assets/userlogo.png";
import { Menu, X } from "lucide-react";
import logo from "../assets/cut.png";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMentor, setIsMentor] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // Check for super admin on mount and on location change
    setIsSuperAdmin(localStorage.getItem("isSuperAdmin") === "true");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        const fetchUserRole = async () => {
          try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              setIsMentor(userData.role === "mentor");
            } else {
              setIsMentor(false);
            }
          } catch (error) {
            setIsMentor(false);
          }
        };
        fetchUserRole();
      } else {
        setIsLoggedIn(false);
        setIsMentor(false);
      }
    });
    return () => unsubscribe();
  }, [location]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProfileClick = () => {
    if (!isSuperAdmin && !isLoggedIn) {
      navigate("/login");
    } else {
      setIsDropdownOpen((prev) => !prev);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    setIsSuperAdmin(false);
    localStorage.removeItem("isSuperAdmin");
    localStorage.removeItem("superAdminUser");
    navigate("/");
  };

  const handleViewMentor = () => {
    navigate("/mentorProject");
    setIsDropdownOpen(false);
  };

  const handleViewDashboard = () => {
    navigate("/dashboard");
    setIsDropdownOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Contact", path: "/contact" },
  ].filter(Boolean); // removes falsy (like false or null)

  return (
    <motion.nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg py-4"
          : "bg-transparent backdrop-blur-md py-6"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col"
          >
            <Link to="/" className="flex items-center space-x-2 ">
              <img
                src={logo}
                alt="KDD LAB"
                width="20%"
                className={`${isScrolled ? "bg-transparent " : "bg-white/45 "}`}
              />
              <span
                className={`font-bold ${
                  isScrolled ? "text-gray-900" : "text-white"
                } text-sm sm:text-xl md:text-2xl`}
              >
                Driving InnovationThrough Data
              </span>
            </Link>
          </motion.div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <Link
                  to={link.path}
                  className={`relative transition-colors duration-300 ${
                    location.pathname === link.path
                      ? isScrolled
                        ? "text-purple-500"
                        : "text-purple-200"
                      : isScrolled
                      ? "text-gray-700 hover:text-purple-600"
                      : "text-white hover:text-blue-200"
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.span
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-current rounded-full"
                      layoutId="navbar-indicator"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Profile icon */}
          <div
            className="hidden md:block relative"
            style={{ marginLeft: "10px" }}
            ref={dropdownRef}
          >
            <button
              onClick={handleProfileClick}
              className={
                isScrolled
                  ? "bg-purple-400 text-white px-2 py-2 rounded-full hover:bg-purple-700 transition flex items-center justify-center"
                  : "bg-white/85 text-purple-400 px-2 py-2 rounded-full hover:bg-white/80 transition flex items-center justify-center"
              }
              style={{ width: 45, height: 45 }}
            >
              <img
                src={UserLogo}
                alt="G"
                className="w-10 h-10 rounded-full object-cover"
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-md z-50">
                {isSuperAdmin ? (
                  <>
                    <button
                      onClick={() => {
                        navigate("/viewUsers");
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      View All Users
                    </button>
                    <button
                      onClick={() => {
                        navigate("/viewProjects");
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      View All Projects
                    </button>
                    <button
                      onClick={() => {
                        navigate("/admin");
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Admin Panel
                    </button>
                    <button
                      onClick={() => {
                        navigate("/adminProject");
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      Add Projects
                    </button>
                  </>
                ) : isMentor ? (
                  <button
                    onClick={handleViewMentor}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    Add Projects
                  </button>
                ) : null}

                {!isSuperAdmin ? (
                  <button
                    onClick={handleViewDashboard}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                  >
                    Dashboard
                  </button>
                ) : null}
                <button
                  onClick={handleSignOut}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-red-500"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Hamburger Icon */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-md ${
              isScrolled ? "text-gray-900" : "text-white"
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg z-40"
            >
              <div className="flex flex-col items-start px-6 py-4 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-gray-800 hover:text-blue-600 w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <hr className="w-full border-gray-200" />
                {!isLoggedIn && !isSuperAdmin ? (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/login");
                    }}
                    className="w-full text-left text-gray-800 hover:text-blue-600"
                  >
                    Login
                  </button>
                ) : (
                  <>
                    {isSuperAdmin ? (
                      <>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/viewUsers");
                          }}
                          className="w-full text-left text-gray-800 hover:text-blue-600"
                        >
                          View All Users
                        </button>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/viewProjects");
                          }}
                          className="w-full text-left text-gray-800 hover:text-blue-600"
                        >
                          View All Projects
                        </button>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/admin");
                          }}
                          className="w-full text-left text-gray-800 hover:text-blue-600"
                        >
                          Admin Panel
                        </button>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate("/adminProject");
                          }}
                          className="w-full text-left text-gray-800 hover:text-blue-600"
                        >
                          Add Admin Projects
                        </button>
                      </>
                    ) : isMentor ? (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          handleViewMentor();
                        }}
                        className="w-full text-left text-gray-800 hover:text-blue-600"
                      >
                        Add Projects
                      </button>
                    ) : null}

                    {!isSuperAdmin ? (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          handleViewDashboard();
                        }}
                        className="w-full text-left text-gray-800 hover:text-blue-600"
                      >
                        Dashboard
                      </button>
                    ) : null}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleSignOut();
                      }}
                      className="w-full text-left text-red-500 hover:underline"
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
