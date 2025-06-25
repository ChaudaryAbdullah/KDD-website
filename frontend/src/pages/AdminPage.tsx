import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  updatePassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface User {
  uid: string;
  userName: string;
  firstName: string;
  lastName: string;
  address: string;
  dob: string;
  email: string;
  role: string;
  rank: string;
  profilePic?: string;
  description: string;
  isActiveMember: boolean;
  createdAt: string;
}

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editId, setEditId] = useState<string | null>(null); // Holds uid
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

  const mentorRankOptions = [
    "founder",
    "cofounder",
    "director",
    "head",
    "instructor",
    "researcher",
  ];
  const studentRankOptions = ["fypstudent", "internee", "alumni"];

  const getAvailableRanks = (role: string) => {
    return role === "student"
      ? studentRankOptions
      : role === "mentor"
      ? mentorRankOptions
      : [];
  };

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const usersList: User[] = snapshot.docs.map((docSnap) => ({
        uid: docSnap.id,
        ...(docSnap.data() as Omit<User, "uid">),
      }));
      setUsers(usersList);
    } catch (err) {
      console.error("Error fetching users:", err);
      showToast("Failed to load users", "error");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    if (type === "success") {
      toast.success(message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } else {
      toast.error(message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const handleSubmit = async () => {
    const {
      userName,
      email,
      role,
      rank,
      firstName,
      lastName,
      address,
      dob,
      password,
      confirmPassword,
      profilePic,
      description,
      isActiveMember,
    } = formData;

    if (
      !userName ||
      !email ||
      !role ||
      !rank ||
      !firstName ||
      !lastName ||
      !address ||
      !dob
    ) {
      return showToast("All fields are required.", "error");
    }

    if (!editId && (!password || !confirmPassword)) {
      return showToast("Password fields are required for new users.", "error");
    }

    if (password && password !== confirmPassword) {
      return showToast("Passwords do not match!", "error");
    }

    if (password && password.length < 6) {
      return showToast("Password must be at least 6 characters long.", "error");
    }

    try {
      const userQuerySnapshot = await getDocs(collection(db, "users"));

      if (!editId) {
        // Add Mode
        const duplicate = userQuerySnapshot.docs.find(
          (docSnap) =>
            docSnap.data().email === email ||
            docSnap.data().userName === userName
        );

        if (duplicate) {
          return showToast("Username or email already exists!", "error");
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const newUser = userCredential.user;

        await setDoc(doc(db, "users", newUser.uid), {
          uid: newUser.uid,
          userName,
          email,
          role,
          rank,
          firstName,
          lastName,
          address,
          dob,
          profilePic: profilePic || "",
          description: description || "",
          isActiveMember,
          createdAt: new Date().toISOString(),
        });

        showToast("User added successfully!", "success");
      } else {
        // Edit Mode
        const userRef = doc(db, "users", editId);
        const updateData = {
          userName,
          email,
          role,
          rank,
          firstName,
          lastName,
          address,
          dob,
          profilePic: profilePic || "",
          description: description || "",
          isActiveMember,
        };

        await setDoc(userRef, updateData, { merge: true });

        if (password) {
          // Temporarily sign in as the user to update their password
          await signInWithEmailAndPassword(auth, email, password);
          const currentUser = auth.currentUser;
          if (currentUser) {
            await updatePassword(currentUser, password);
            await auth.signOut(); // Sign out to prevent session conflicts
          } else {
            throw new Error("Failed to authenticate user for password update");
          }
        }

        showToast("User updated successfully!", "success");
        setEditId(null);
      }

      await fetchUsers();
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
    } catch (err) {
      console.error("Error submitting user data:", err);
      showToast(`Failed to submit user data: ${err.message}`, "error");
    }
  };

  const handleEdit = (user: User) => {
    setEditId(user.uid);
    setFormData({
      userName: user.userName ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      address: user.address ?? "",
      dob: user.dob ?? "",
      email: user.email ?? "",
      role: user.role ?? "",
      rank: user.rank ?? "",
      password: "",
      confirmPassword: "",
      profilePic: user.profilePic ?? "",
      description: user.description ?? "",
      isActiveMember: user.isActiveMember ?? false,
    });
  };

  const handleCancel = () => {
    setEditId(null);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-gradient-to-b from-violet-800 via-purple-700 to-white py-8">
      <div
        style={{ marginTop: 100, marginBottom: 100 }}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left: Form */}
        <div className="flex-1 p-8 md:p-12 bg-white">
          <div className="w-16 h-1 bg-purple-600 rounded mb-6" />
          <h2 className="text-2xl font-bold mb-6 text-purple-700">
            {editId ? "Edit User" : "Create New User"}
          </h2>
          <div className="space-y-4">
            <input
              placeholder="Username"
              value={formData.userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
              disabled={!!editId}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            />
            <input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={!!editId}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
              />
              <input
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
              />
            </div>
            <input
              placeholder="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            />
            <input
              placeholder="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={(e) =>
                setFormData({ ...formData, dob: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            />
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value,
                  rank: "",
                })
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            >
              <option value="">Select Role</option>
              {["mentor", "student"].map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={formData.rank}
              onChange={(e) =>
                setFormData({ ...formData, rank: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
              disabled={!formData.role}
            >
              <option value="">Select Rank</option>
              {getAvailableRanks(formData.role).map((rank) => (
                <option key={rank} value={rank}>
                  {rank
                    .replace(/([a-z])([A-Z])/g, "$1 $2")
                    .replace(/fypstudent/i, "FYP Student")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder={
                  editId
                    ? "New Password (leave blank to keep unchanged)"
                    : "Password"
                }
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
              />
              <input
                placeholder={
                  editId ? "Confirm New Password" : "Confirm Password"
                }
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mt-2 mb-1">
                Upload Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
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
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
              />
              {formData.profilePic && (
                <img
                  src={formData.profilePic}
                  alt="Preview"
                  className="mt-3 h-32 w-full object-cover rounded-lg border border-gray-200 shadow"
                />
              )}
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActiveMember"
                checked={formData.isActiveMember}
                onChange={(e) =>
                  setFormData({ ...formData, isActiveMember: e.target.checked })
                }
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label
                htmlFor="isActiveMember"
                className="text-sm font-medium text-gray-700"
              >
                Active Member
              </label>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleSubmit}
                className={`flex-1 text-white p-3 rounded-lg font-semibold shadow transition-colors ${
                  editId
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {editId ? "Update User" : "Create User"}
              </button>
              {editId && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-3 text-gray-600 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Right: Users List */}
        <div className="flex-1 bg-purple-50 p-8 md:p-12 border-l border-purple-100">
          <div className="w-16 h-1 bg-purple-600 rounded mb-6" />
          <h3 className="text-xl font-bold mb-6 text-purple-700">
            Existing Users
          </h3>
          <div className="space-y-4 max-h-[32rem] overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.uid}
                className={`p-4 border rounded-lg transition-colors flex items-center justify-between ${
                  editId === user.uid
                    ? "bg-purple-100 border-purple-300"
                    : "bg-white border-gray-200"
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-semibold text-gray-900">
                      {user.userName}
                    </p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.isActiveMember
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isActiveMember ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                  <p className="text-sm text-gray-500">
                    {user.firstName} {user.lastName} • {user.role} • {user.rank}
                  </p>
                </div>
                <button
                  onClick={() => handleEdit(user)}
                  disabled={editId === user.uid}
                  className={`ml-3 px-4 py-2 text-sm rounded-lg font-semibold transition-colors ${
                    editId === user.uid
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  }`}
                >
                  {editId === user.uid ? "Editing" : "Edit"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminPage;
