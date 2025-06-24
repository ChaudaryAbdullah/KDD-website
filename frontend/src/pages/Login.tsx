import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
// import { BACK_END_LINK } from "../config";
const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // === Check from sessionStorage ===
    const storedData = JSON.parse(
      sessionStorage.getItem("signupDataList") || "[]"
    );

    // Try to match by email or username
    const matchedUser = storedData.find(
      (user: any) =>
        (user.email === email || user.userName === email) &&
        user.password === password
    );

    if (matchedUser) {
      localStorage.setItem("data", matchedUser.userName);
      toast.success("Login Successful!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      navigate("/");
    } else {
      toast.error("Invalid credentials. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") handleClose();
  };

  const handleClose = () => navigate("/");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-violet-800 via-purple-700 to-white px-4">
      <div
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
        onKeyDown={handleKeyDown}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Login</h2>
          <button
            className="text-red-500 text-2xl font-bold hover:text-red-700"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <button className="flex items-center justify-center w-full border border-gray-300 rounded-md py-2 mb-4 hover:bg-gray-100 transition">
          <svg width="20" height="20" viewBox="0 0 24 24" className="mr-2">
            <g>
              <path
                fill="#4285F4"
                d="M21.8,12.1c0-0.7-0.1-1.3-0.2-2H12v3.8h5.5c-0.2,1.2-0.9,2.3-2,3v2.5h3.2C20.5,17.8,21.8,15.2,21.8,12.1z"
              />
              <path
                fill="#34A853"
                d="M12,22c2.7,0,5-0.9,6.7-2.4l-3.2-2.5c-0.9,0.6-2,1-3.5,1c-2.7,0-4.9-1.8-5.7-4.2H3v2.6C4.7,19.8,8.1,22,12,22z"
              />
              <path
                fill="#FBBC05"
                d="M6.3,13.8c-0.2-0.6-0.3-1.2-0.3-1.8s0.1-1.2,0.3-1.8V7.6H3C2.4,9,2,10.4,2,12s0.4,3,1,4.4L6.3,13.8z"
              />
              <path
                fill="#EA4335"
                d="M12,6.6c1.5,0,2.9,0.5,3.9,1.5l2.9-2.9C17.1,3.6,14.8,2.7,12,2.7C8.1,2.7,4.7,4.9,3,8.3l3.3,2.6C7.1,8.4,9.3,6.6,12,6.6z"
              />
            </g>
          </svg>
          Continue with Google
        </button>

        <div className="text-sm text-gray-600 mb-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Create One
          </Link>
        </div>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-3 text-sm text-gray-500">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username or Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <div className="text-sm text-center mt-4">
          <a href="#" className="text-blue-500 hover:underline">
            Forgot Password?
          </a>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoginForm;
