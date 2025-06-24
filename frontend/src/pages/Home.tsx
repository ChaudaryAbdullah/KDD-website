import { useRef } from "react";
import { Link } from "react-router-dom";
import DataScience from "../assets/Data Science_col.png";
import DeepLearning from "../assets/Deep Learning_col.png";
import MachineLearning from "../assets/Machine learning_col.png";
import BigData from "../assets/Big Data_col.png";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  FileArchive,
  Presentation,
  BookOpenCheck,
  Users,
  GraduationCap,
} from "lucide-react";

const Home = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-800 via-purple-700 to-purple-600 overflow-hidden"
      >
        {/* Animated Background */}
        <motion.div className="absolute inset-0 opacity-20" style={{ y }}>
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://isb.nu.edu.pk/kdd/assets/img/nodes.png")',
            }}
          />
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-20"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-16 h-16 bg-blue-300 rounded-full opacity-20"
          animate={{
            y: [0, 20, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          style={{ opacity }}
        >
          <motion.div
            variants={heroVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              variants={textVariants}
            >
              <motion.span
                initial={{ opacity: 0, rotateX: -90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="block"
              >
                EFFORTS DON'T
              </motion.span>
              <motion.span
                className="block text-blue-200"
                initial={{ opacity: 0, rotateX: -90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                BETRAY YOU
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed"
              variants={textVariants}
            >
              Our team consists of competent individuals committed to finding
              solutions to real-world problems.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={textVariants}
            >
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  to="/contact"
                  className="group bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg shadow-lg flex items-center space-x-2 mb-4 sm:mb-0"
                >
                  <span>Contact Us</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <a
                  href="#about"
                  className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
                >
                  Learn More
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center mx-auto mt-0 sm:mt-0 mt-[4px]">
            <motion.div
              className="w-1 h-3 bg-white rounded-full mt-2"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What We Offer?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our team specializes in th following domains
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: BigData,
                title: "Big Data",
                description:
                  "Big data is the study of methods to analyze, systematically extract information from, and otherwise deal with data sets that are too large or complex to be processed by conventional data-processing software.",
                color: "bg-blue-100",
                delay: 0,
              },
              {
                icon: MachineLearning,
                title: "Machine Learning",
                description:
                  "Machine learning is the study of computer algorithms that can improve themselves automatically through the use of experience and data. Considered a component of artificial intelligence.",
                color: "bg-gray-200",
                delay: 0.2,
              },
              {
                icon: DataScience,
                title: "Data Science",
                description:
                  "Data science is an interdisciplinary field that employs scientific methods, processes, algorithms, and systems to extract knowledge and insights from structured and unstructured data, and to apply this knowledge and actionable insights to a wide variety of application domains.",
                color: "bg-purple-100",
                delay: 0.4,
              },
              {
                icon: DeepLearning,
                title: "Deep Learning",
                description:
                  "Deep learning is a subset of machine learning techniques based on artificial neural networks and representation learning. Supervised, semi-supervised, or unsupervised learning is possible.",
                color: "bg-green-100",
                delay: 0.2,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: feature.delay }}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3 },
                }}
              >
                <motion.div
                  className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mb-6`}
                  whileHover={{
                    scale: 1.1,
                    rotate: 360,
                    transition: { duration: 0.6 },
                  }}
                >
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="h-12 w-12 object-contain"
                  />
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section*/}

      <section id="about" className="about py-20 bg-purple-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The Knowledge Discovery & Data Science (KDD) Lab specializes in
              Data Science, Big Data, Analysis of Social Networks, Artificial
              Intelligence, Machine Learning, Deep Learning, Image Processing,
              Data Warehousing, and Data Mining. It offers opportunities to
              conduct advanced and innovative research in the aforementioned
              fields. We work diligently to identify and resolve algorithmic
              challenges for a vast array of applications and datasets, such as
              social networks, images and videos, large-scale databases, health
              informatics, etc.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-purple-600 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-5 gap-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.2 }}
          >
            {[
              { icon: Users, number: "8", label: "Team Members" },
              { icon: FileArchive, number: "3", label: "Funded Projects" },
              { icon: BookOpenCheck, number: "13", label: "Publications" },
              { icon: Presentation, number: "20", label: "Total FYP's" },
              { icon: GraduationCap, number: "5", label: "Alumni" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-white"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <stat.icon className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                </motion.div>
                <motion.div
                  className="text-4xl font-bold mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-blue-200 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
