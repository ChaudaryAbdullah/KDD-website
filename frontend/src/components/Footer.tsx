import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Droplets,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <footer className="bg-gray-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={itemVariants}>
            <motion.div
              className="flex items-center space-x-2 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-2xl font-bold">KDD LAB</span>
            </motion.div>
            <p className="text-gray-300 mb-4">
              “If you can’t explain it simply, you don’t understand it well
              enough.” — Albert Einstein
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram].map((Icon, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", path: "/" },
                { name: "About Us", path: "/about" },
              ].map((link, index) => (
                <motion.li
                  key={link.name}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              {[
                { Icon: Phone, text: "TBD", href: "tel:" },
                {
                  Icon: Mail,
                  text: "kdd.lab@nu.edu.pk",
                  href: "mailto:kdd.lab@nu.edu.pk",
                },
                {
                  Icon: MapPin,
                  text: `National University of Computer and Emerging Sciences (FAST-NUCES),  H-11/4 Islamabad Pakistan`,
                  href: "#",
                },
              ].map(({ Icon, text, href }, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="h-5 w-5 text-blue-400" />
                  <a
                    href={href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {text}
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p>&copy; 2025 KDD LAB. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
