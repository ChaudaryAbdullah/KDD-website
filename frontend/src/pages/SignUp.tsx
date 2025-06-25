"use client";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    address: "",
    dob: "",
    email: "",
    role: "",
    rank: "",
    password: "",
    confirmPassword: "",
    profilePic: "",
    description: "",
    isActiveMember: false,
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleClose = () => navigate("/");
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") handleClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Get existing accounts from localStorage
    const existingData = JSON.parse(
      localStorage.getItem("signupDataList") || "[]"
    );

    if (existingData.length >= 10) {
      setError("Maximum of 10 accounts can be stored temporarily.");
      toast.error("Maximum limit reached (10 accounts).", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    // Add the new account
    const updatedData = [...existingData, formData];
    localStorage.setItem("signupDataList", JSON.stringify(updatedData));

    toast.success("Account created successfully!", {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });

    // Reset form
    setFormData({
      userName: "",
      firstName: "",
      lastName: "",
      address: "",
      dob: "",
      email: "",
      role: "",
      rank: "",
      password: "",
      confirmPassword: "",
      profilePic: "",
      description: "",
      isActiveMember: false,
    });
  };

  return (
    <div className="pt-24  flex items-center justify-center min-h-screen bg-gradient-to-b from-violet-800 via-purple-700 to-white px-4">
      <div
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg"
        style={{ marginBottom: 20 }}
        onKeyDown={handleKeyDown}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Sign Up</h2>
          <button
            className="text-red-500 text-2xl font-bold hover:text-red-700"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Creating an account allows you to access your order history and make
          new orders on any device.
        </p>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {successMessage && (
          <p className="text-green-600 text-sm mb-3">{successMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="userName"
            placeholder="Username"
            value={formData.userName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="flex gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div>
            <label className="block text-sm text-gray-700 mt-2 mb-1">
              Upload Your Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData({
                      ...formData,
                      profilePic: reader.result as string,
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {formData.profilePic && (
              <img
                src={formData.profilePic}
                alt="Preview"
                className="mt-3 h-32 w-full object-cover rounded-lg border border-gray-200 shadow"
              />
            )}
          </div>

          <label className="block text-sm text-gray-700 mt-2 mb-1">Role</label>
          <select
            name="role"
            value={formData.role || ""}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
          </select>

          <label className="block text-sm text-gray-700">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type={passwordVisible ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type={confirmPasswordVisible ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default SignUp;
