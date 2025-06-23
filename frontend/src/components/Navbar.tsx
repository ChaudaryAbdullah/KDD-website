import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Droplets, Phone } from "lucide-react";
import logo from "../assets/cut.png";
const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="KDD LAB" width="20%" />
              <span
                className={`font-bold ${
                  isScrolled ? "text-gray-900" : "text-white"
                } text-lg sm:text-xl md:text-2xl`}
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

          {/* Desktop Contact Info */}
          <motion.div
            className="hidden md:flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
          ></motion.div>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
