import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, Droplets, Truck, Award, Users, Leaf } from "lucide-react";

const About = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const timelineSteps = [
    {
      step: "01",
      title: "Source Selection",
      description:
        "We carefully select the finest natural spring sources from pristine locations.",
      icon: Droplets,
      color: "bg-blue-500",
    },
    {
      step: "02",
      title: "Multi-Stage Filtration",
      description:
        "7-stage purification process including reverse osmosis and UV sterilization.",
      icon: Shield,
      color: "bg-green-500",
    },
    {
      step: "03",
      title: "Quality Testing",
      description:
        "Every batch undergoes rigorous laboratory testing for purity and safety.",
      icon: Award,
      color: "bg-purple-500",
    },
    {
      step: "04",
      title: "Eco-Friendly Packaging",
      description:
        "Bottled in recyclable containers using sustainable packaging methods.",
      icon: Leaf,
      color: "bg-emerald-500",
    },
    {
      step: "05",
      title: "Fresh Delivery",
      description:
        "Direct delivery to your doorstep ensuring maximum freshness.",
      icon: Truck,
      color: "bg-orange-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="py-10 bg-blue-500"
    >
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-500 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              About AquaNest
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              For over a decade, we've been committed to delivering the purest,
              freshest water to families and businesses across the nation.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.img
                src="https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                alt="Water purification facility"
                className="rounded-2xl shadow-xl"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To provide every household and business with access to the
                highest quality water through innovative purification technology
                and exceptional customer service.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe that pure water is not a luxury, but a fundamental
                right. That's why we've made it our mission to make premium
                water accessible and affordable for everyone.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape how we serve our
              customers
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Shield,
                title: "Quality First",
                description:
                  "We never compromise on quality. Every drop of water meets the highest industry standards for purity and safety.",
                color: "bg-blue-500",
              },
              {
                icon: Users,
                title: "Customer-Centric",
                description:
                  "Our customers are at the heart of everything we do. We listen, adapt, and continuously improve our services.",
                color: "bg-green-500",
              },
              {
                icon: Leaf,
                title: "Environmental Responsibility",
                description:
                  "We are committed to sustainable practices and minimizing our environmental impact in all operations.",
                color: "bg-emerald-500",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                className="text-center group"
                variants={itemVariants}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`${value.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6`}
                  whileHover={{
                    scale: 1.1,
                    rotate: 360,
                    transition: { duration: 0.6 },
                  }}
                >
                  <value.icon className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Animated Timeline */}
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
              Our Delivery Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From source to your door - see how we ensure the highest quality
              at every step
            </p>
          </motion.div>

          <div className="relative">
            {/* Animated Timeline Line */}
            <motion.div
              className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-1 bg-blue-200"
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />

            <div className="space-y-12">
              {timelineSteps.map((step, index) => (
                <motion.div
                  key={index}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  {/* Animated Timeline Dot */}
                  <motion.div
                    className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg z-10"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.5 }}
                    whileHover={{ scale: 1.5 }}
                  />

                  {/* Content */}
                  <div
                    className={`w-full md:w-5/12 ${
                      index % 2 === 0 ? "md:pr-12" : "md:pl-12"
                    } ml-16 md:ml-0`}
                  >
                    <motion.div
                      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center mb-4">
                        <motion.div
                          className={`${step.color} w-12 h-12 rounded-full flex items-center justify-center mr-4`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <step.icon className="h-6 w-6 text-white" />
                        </motion.div>
                        <div>
                          <span className="text-sm font-semibold text-blue-600">
                            STEP {step.step}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900">
                            {step.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-20 bg-blue-600 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Our Impact</h2>
            <p className="text-xl text-blue-200">
              Numbers that showcase our commitment to excellence
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { number: "15+", label: "Years of Experience" },
              { number: "50,000+", label: "Satisfied Customers" },
              { number: "1M+", label: "Bottles Delivered" },
              { number: "99.9%", label: "Purity Guarantee" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="text-4xl md:text-5xl font-bold text-white mb-2"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-blue-200">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;
