import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import { auth } from "../firebase";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "admin@gmail.com" && password === "admin@786") {
      // Set super admin flag
      localStorage.setItem("isSuperAdmin", "true");
      // Optionally, set a dummy user object for UI
      localStorage.setItem(
        "superAdminUser",
        JSON.stringify({ userName: "admin", email: "admin@gmail.com" })
      );
      // Redirect to admin dashboard or home
      navigate("/viewusers");
      return;
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Login Successful!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        navigate("/");
      } catch (error: any) {
        toast.error(`Login failed: ${error.message}`, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-violet-800 via-purple-700 to-white px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Login</h2>
          <button
            className="text-red-500 text-2xl font-bold hover:text-red-700"
            onClick={() => navigate("/")}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
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

        <div style={{ marginTop: 20 }} className="text-sm text-gray-600 mb-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Create One
          </Link>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default LoginForm;
