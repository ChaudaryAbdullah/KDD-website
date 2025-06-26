"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db } from "../firebase"; // adjust this path if needed
import { setDoc, doc, collection, getDocs, addDoc } from "firebase/firestore";

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

  const checkDuplicateUser = async (email: string, userName: string) => {
    // Check in existing users
    const usersSnapshot = await getDocs(collection(db, "users"));
    const existingUser = usersSnapshot.docs.find(
      (doc) => doc.data().email === email || doc.data().userName === userName
    );

    // Check in pending users
    const pendingSnapshot = await getDocs(collection(db, "pendingUsers"));
    const pendingUser = pendingSnapshot.docs.find(
      (doc) => doc.data().email === email || doc.data().userName === userName
    );

    return existingUser || pendingUser;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      // Check for duplicate users
      const duplicate = await checkDuplicateUser(formData.email, formData.userName);
      if (duplicate) {
        setError("Username or email already exists!");
        toast.error("Username or email already exists!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        return;
      }

      // Save user data to pendingUsers collection
      await addDoc(collection(db, "pendingUsers"), {
        userName: formData.userName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        dob: formData.dob,
        email: formData.email,
        role: formData.role,
        rank: formData.rank,
        password: formData.password, // Store temporarily for approval
        profilePic: formData.profilePic,
        description: formData.description,
        isActiveMember: formData.isActiveMember,
        requestedAt: new Date().toISOString(),
        status: "pending"
      });

      // Create admin notification
      await addDoc(collection(db, "adminNotifications"), {
        type: "user_signup_request",
        userName: formData.userName,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        message: `New user ${formData.firstName} ${formData.lastName} (${formData.userName}) has requested to join as ${formData.role}`,
        createdAt: new Date().toISOString(),
        read: false,
        status: "pending"
      });

      toast.success("Signup request submitted successfully! Please wait for admin approval.", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });

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

      // Show success message instead of navigating
      setSuccessMessage("Your signup request has been submitted and is pending admin approval. You will be notified once approved.");
      
    } catch (error: any) {
      setError(error.message);
      toast.error("Signup failed: " + error.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <div className="pt-24 flex items-center justify-center min-h-screen bg-gradient-to-b from-violet-800 via-purple-700 to-white px-4">
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
          Creating an account requires admin approval. You will be notified once your request is reviewed.
        </p>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <p className="text-green-800 text-sm">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="userName"
            placeholder="Username"
            value={formData.userName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />

          <div className="flex gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-2 border rounded-md"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-1/2 px-4 py-2 border rounded-md"
            />
          </div>

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />

          <div>
            <label className="block text-sm text-gray-700 mt-2 mb-1">
              Upload Your Image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-2 border rounded-md"
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
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
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
            className="w-full px-4 py-2 border rounded-md"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />

          <input
            type={passwordVisible ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />

          <input
            type={confirmPasswordVisible ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Submit Signup Request
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default SignUp;