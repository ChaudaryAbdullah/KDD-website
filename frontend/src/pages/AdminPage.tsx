import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  updatePassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy,
  updateDoc 
} from "firebase/firestore";
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

interface PendingUser {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  address: string;
  dob: string;
  email: string;
  role: string;
  rank: string;
  password: string;
  profilePic?: string;
  description: string;
  isActiveMember: boolean;
  requestedAt: string;
  status: string;
}

interface AdminNotification {
  id: string;
  type: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  message: string;
  createdAt: string;
  read: boolean;
  status: string;
}

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'pending' | 'notifications'>('users');
  const [editId, setEditId] = useState<string | null>(null);
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

  const fetchPendingUsers = async () => {
    try {
      const q = query(collection(db, "pendingUsers"), orderBy("requestedAt", "desc"));
      const snapshot = await getDocs(q);
      const pendingList: PendingUser[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<PendingUser, "id">),
      }));
      setPendingUsers(pendingList);
    } catch (err) {
      console.error("Error fetching pending users:", err);
      showToast("Failed to load pending users", "error");
    }
  };

  const fetchNotifications = async () => {
    try {
      const q = query(collection(db, "adminNotifications"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const notificationsList: AdminNotification[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<AdminNotification, "id">),
      }));
      setNotifications(notificationsList);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      showToast("Failed to load notifications", "error");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
    fetchNotifications();
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

  const approveUser = async (pendingUser: PendingUser) => {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        pendingUser.email,
        pendingUser.password
      );
      const newUser = userCredential.user;

      // Add user to users collection
      await setDoc(doc(db, "users", newUser.uid), {
        uid: newUser.uid,
        userName: pendingUser.userName,
        email: pendingUser.email,
        role: pendingUser.role,
        rank: pendingUser.rank || "",
        firstName: pendingUser.firstName,
        lastName: pendingUser.lastName,
        address: pendingUser.address,
        dob: pendingUser.dob,
        profilePic: pendingUser.profilePic || "",
        description: pendingUser.description || "",
        isActiveMember: pendingUser.isActiveMember,
        createdAt: new Date().toISOString(),
      });

      // Remove from pending users
      await deleteDoc(doc(db, "pendingUsers", pendingUser.id));

      // Update notification status
      const relatedNotification = notifications.find(
        n => n.userName === pendingUser.userName && n.status === "pending"
      );
      if (relatedNotification) {
        await updateDoc(doc(db, "adminNotifications", relatedNotification.id), {
          status: "approved",
          read: true
        });
      }

      showToast(`User ${pendingUser.userName} approved successfully!`, "success");
      
      // Refresh data
      await Promise.all([fetchUsers(), fetchPendingUsers(), fetchNotifications()]);
      
    } catch (err) {
      console.error("Error approving user:", err);
      showToast(`Failed to approve user: ${err.message}`, "error");
    }
  };

  const rejectUser = async (pendingUser: PendingUser) => {
    try {
      // Remove from pending users
      await deleteDoc(doc(db, "pendingUsers", pendingUser.id));

      // Update notification status
      const relatedNotification = notifications.find(
        n => n.userName === pendingUser.userName && n.status === "pending"
      );
      if (relatedNotification) {
        await updateDoc(doc(db, "adminNotifications", relatedNotification.id), {
          status: "rejected",
          read: true
        });
      }

      showToast(`User ${pendingUser.userName} rejected successfully!`, "success");
      
      // Refresh data
      await Promise.all([fetchPendingUsers(), fetchNotifications()]);
      
    } catch (err) {
      console.error("Error rejecting user:", err);
      showToast(`Failed to reject user: ${err.message}`, "error");
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, "adminNotifications", notificationId), {
        read: true
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking notification as read:", err);
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
          await signInWithEmailAndPassword(auth, email, password);
          const currentUser = auth.currentUser;
          if (currentUser) {
            await updatePassword(currentUser, password);
            await auth.signOut();
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

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-gradient-to-b from-violet-800 via-purple-700 to-white py-8">
      <div
        style={{ marginTop: 100, marginBottom: 100 }}
        className="w-full max-w-7xl bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-4 px-6 text-center font-semibold ${
              activeTab === 'users'
                ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-4 px-6 text-center font-semibold relative ${
              activeTab === 'pending'
                ? 'border-b-2 border-orange-600 text-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            Pending Approvals ({pendingUsers.length})
            {pendingUsers.length > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {pendingUsers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-4 px-6 text-center font-semibold relative ${
              activeTab === 'notifications'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Notifications ({notifications.length})
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Form Section - Only show for users tab */}
          {activeTab === 'users' && (
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
          )} 
          

          {/* Right Panel - Content based on active tab */}
          <div className={`${activeTab === 'users' ? 'flex-1' : 'w-full'} bg-gray-50 p-8 md:p-12 border-l border-gray-100`}>
            <div className="w-16 h-1 bg-purple-600 rounded mb-6" />
            
            {/* Users Tab */}
            {activeTab === 'users' && (
              <>
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
              </>
            )}

            {/* Pending Users Tab */}
            {activeTab === 'pending' && (
              <>
                <h3 className="text-xl font-bold mb-6 text-orange-700">
                  Pending User Approvals
                </h3>
                <div className="space-y-4 max-h-[32rem] overflow-y-auto">
                  {pendingUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No pending user requests
                    </div>
                  ) : (
                    pendingUsers.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 border rounded-lg bg-white border-orange-200 hover:bg-orange-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <p className="font-semibold text-gray-900">
                                {user.userName}
                              </p>
                              <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                                Pending
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                            <p className="text-sm text-gray-500 mb-2">
                              {user.firstName} {user.lastName} • {user.role}
                            </p>
                            <p className="text-xs text-gray-400">
                              Requested: {new Date(user.requestedAt).toLocaleDateString()}
                            </p>
                            {user.profilePic && (
                              <img
                                src={user.profilePic}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="mt-2 h-16 w-16 object-cover rounded-lg border"
                              />
                            )}
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <button
                              onClick={() => approveUser(user)}
                              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectUser(user)}
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg font-semibold hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <>
                <h3 className="text-xl font-bold mb-6 text-blue-700">
                  Admin Notifications
                </h3>
                <div className="space-y-4 max-h-[32rem] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                          notification.read
                            ? "bg-white border-gray-200"
                            : "bg-blue-50 border-blue-200"
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <p className="font-semibold text-gray-900">
                                {notification.type === 'user_signup_request' ? 'New User Request' : notification.type}
                              </p>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  notification.status === 'pending'
                                    ? 'bg-orange-100 text-orange-800'
                                    : notification.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {notification.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminPage;