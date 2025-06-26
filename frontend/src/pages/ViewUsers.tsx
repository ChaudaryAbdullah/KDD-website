import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
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

const ViewUsers = () => {
  const [mentors, setMentors] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch mentors
      const mentorsQuery = query(
        collection(db, "users"),
        where("role", "==", "mentor")
      );
      const mentorsSnapshot = await getDocs(mentorsQuery);
      const mentorsList: User[] = mentorsSnapshot.docs.map((docSnap) => ({
        uid: docSnap.id,
        ...(docSnap.data() as Omit<User, "uid">),
      }));
      setMentors(mentorsList);

      // Fetch students
      const studentsQuery = query(
        collection(db, "users"),
        where("role", "==", "student")
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsList: User[] = studentsSnapshot.docs.map((docSnap) => ({
        uid: docSnap.id,
        ...(docSnap.data() as Omit<User, "uid">),
      }));
      setStudents(studentsList);

      showToast("Users loaded successfully!", "success");
    } catch (err) {
      console.error("Error fetching users:", err);
      showToast("Error loading users. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const mentorRankOptions = [
    "founder",
    "cofounder",
    "director",
    "head",
    "instructor",
    "researcher",
  ];
  const studentRankOptions = ["fypstudent", "internee", "alumni"];

  const formatRank = (rank: string) => {
    return rank
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/fypstudent/i, "FYP Student")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString();
  };

  const UserDetailModal = ({
    user,
    onClose,
  }: {
    user: User;
    onClose: () => void;
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-1 bg-purple-600 rounded" />
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
            >
              ×
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-purple-700">
            User Details
          </h2>

          {/* User Info */}
          <div className="flex items-start space-x-6 mb-6">
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-2xl border-4 border-gray-200 shadow">
                {user.firstName?.charAt(0) || ""}
                {user.lastName?.charAt(0) || ""}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <span
                  className={`px-3 py-1 text-sm rounded-full font-medium ${
                    user.isActiveMember
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.isActiveMember ? "Active Member" : "Inactive Member"}
                </span>
              </div>

              <p className="text-gray-600 mb-1">@{user.userName}</p>
              <p className="text-gray-600 mb-2">{user.email}</p>

              <div className="flex items-center space-x-2 mb-2">
                <span
                  className={`px-3 py-1 text-sm rounded-full font-medium ${
                    user.role === "mentor"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-600 font-medium">
                  {formatRank(user.rank)}
                </span>
              </div>
            </div>
          </div>

          {/* Details in AdminPage style */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  value={user.firstName || ""}
                  disabled
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  value={user.lastName || ""}
                  disabled
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                value={user.userName || ""}
                disabled
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                value={user.email || ""}
                disabled
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                value={user.address || ""}
                disabled
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                value={formatDate(user.dob)}
                disabled
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Date of Birth"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  disabled
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                  placeholder="Role"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rank
                </label>
                <input
                  value={formatRank(user.rank)}
                  disabled
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                  placeholder="Rank"
                />
              </div>
            </div>

            {user.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={user.description}
                  disabled
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                  placeholder="Description"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={user.isActiveMember}
                disabled
                className="w-4 h-4 text-purple-600 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Active Member
              </label>
            </div>

            <div className="text-xs text-gray-400 pt-2 border-t">
              <p>
                <strong>User ID:</strong> {user.uid}
              </p>
              <p>
                <strong>Joined:</strong> {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-800 via-purple-700 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-800 via-purple-700 to-white py-8">
      <div
        className="container mx-auto px-4"
        style={{ marginTop: 100, marginBottom: 100 }}
      >
        <div className="w-full max-w-7xl bg-white rounded-2xl shadow-lg overflow-hidden mx-auto">
          {/* Header */}
          <div className="text-center p-8 bg-gradient-to-r from-purple-700 to-purple-500">
            <div className="w-16 h-1 bg-white rounded mb-6 mx-auto" />
            <h1 className="text-4xl font-bold text-white mb-2">
              Users Directory
            </h1>
            <p className="text-purple-100">
              Browse our community of mentors and students
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-8 p-6 bg-gray-50 border-b border-gray-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-purple-600">
                {mentors.length}
              </h3>
              <p className="text-gray-600">Mentors</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-600">
                {students.length}
              </h3>
              <p className="text-gray-600">Students</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-600">
                {mentors.filter((m) => m.isActiveMember).length +
                  students.filter((s) => s.isActiveMember).length}
              </h3>
              <p className="text-gray-600">Active Members</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row">
            {/* Mentors Section */}
            <div className="flex-1 p-8 md:p-12 bg-white">
              <div className="w-16 h-1 bg-purple-600 rounded mb-6" />
              <h2 className="text-2xl font-bold mb-6 text-purple-700">
                Mentors ({mentors.length})
              </h2>

              <div className="space-y-4 max-h-[32rem] overflow-y-auto">
                {mentors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                    <p>No mentors found</p>
                  </div>
                ) : (
                  mentors.map((mentor) => (
                    <div
                      key={mentor.uid}
                      className="p-4 border rounded-lg transition-all duration-200 flex items-center justify-between bg-white border-gray-200 hover:bg-purple-50 hover:border-purple-200 cursor-pointer hover:shadow-md"
                      onClick={() => setSelectedUser(mentor)}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                          {mentor.profilePic ? (
                            <img
                              src={mentor.profilePic}
                              alt={`${mentor.firstName} ${mentor.lastName}`}
                              className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                              {mentor.firstName?.charAt(0) || ""}
                              {mentor.lastName?.charAt(0) || ""}
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-semibold text-gray-900">
                              {mentor.firstName} {mentor.lastName}
                            </p>
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium ${
                                mentor.isActiveMember
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {mentor.isActiveMember ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            @{mentor.userName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {mentor.email} • {formatRank(mentor.rank)}
                          </p>
                        </div>
                      </div>

                      <div className="text-purple-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Students Section */}
            <div className="flex-1 bg-gray-50 p-8 md:p-12 border-l border-gray-100">
              <div className="w-16 h-1 bg-blue-600 rounded mb-6" />
              <h2 className="text-2xl font-bold mb-6 text-blue-700">
                Students ({students.length})
              </h2>

              <div className="space-y-4 max-h-[32rem] overflow-y-auto">
                {students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 14l9-5-9-5-9 5 9 5z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                        />
                      </svg>
                    </div>
                    <p>No students found</p>
                  </div>
                ) : (
                  students.map((student) => (
                    <div
                      key={student.uid}
                      className="p-4 border rounded-lg transition-all duration-200 flex items-center justify-between bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-200 cursor-pointer hover:shadow-md"
                      onClick={() => setSelectedUser(student)}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                          {student.profilePic ? (
                            <img
                              src={student.profilePic}
                              alt={`${student.firstName} ${student.lastName}`}
                              className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                              {student.firstName?.charAt(0) || ""}
                              {student.lastName?.charAt(0) || ""}
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-semibold text-gray-900">
                              {student.firstName} {student.lastName}
                            </p>
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium ${
                                student.isActiveMember
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {student.isActiveMember ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            @{student.userName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.email} • {formatRank(student.rank)}
                          </p>
                        </div>
                      </div>

                      <div className="text-blue-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default ViewUsers;
