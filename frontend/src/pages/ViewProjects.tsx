import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Project {
  id: string;
  name: string;
  description: string;
  mentor: string;
  students: string[];
  type: "fyp" | "ongoing";
  image: string;
  createdAt: string;
  isArchived: boolean;
}

const ViewProjects = () => {
  const [fypProjects, setFypProjects] = useState<Project[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [mentorUidToUsername, setMentorUidToUsername] = useState<Record<string, string>>({});
  const [studentUidToUsername, setStudentUidToUsername] = useState<Record<string, string>>({});

  const showToast = (message: string, type: "success" | "error") => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch user data for mentor and student username mapping
      const usersRef = collection(db, "users");
      const mentorQuery = query(usersRef, where("role", "==", "mentor"));
      const studentQuery = query(usersRef, where("role", "==", "student"));
      const [mentorSnap, studentSnap] = await Promise.all([
        getDocs(mentorQuery),
        getDocs(studentQuery),
      ]);

      const mentorMap: Record<string, string> = {};
      mentorSnap.forEach((doc) => {
        const data = doc.data();
        if (doc.id && data.userName) {
          mentorMap[doc.id] = data.userName;
        }
      });
      setMentorUidToUsername(mentorMap);

      const studentMap: Record<string, string> = {};
      studentSnap.forEach((doc) => {
        const data = doc.data();
        if (doc.id && data.userName) {
          studentMap[doc.id] = data.userName;
        }
      });
      setStudentUidToUsername(studentMap);

      // Fetch projects
      const fypQuery = query(collection(db, "adminprojects"), where("type", "==", "fyp"));
      const ongoingQuery = query(collection(db, "adminprojects"), where("type", "==", "ongoing"));
      const [fypSnap, ongoingSnap] = await Promise.all([
        getDocs(fypQuery),
        getDocs(ongoingQuery),
      ]);

      const fypList: Project[] = fypSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        type: "fyp" as const,
      } as Project));
      setFypProjects(fypList);

      const ongoingList: Project[] = ongoingSnap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        type: "ongoing" as const,
      } as Project));
      setOngoingProjects(ongoingList);

      showToast("Projects loaded successfully!", "success");
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast("Error loading projects. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (date: string) => {
    if (!date) return "";
    if (
      typeof date === "object" &&
      date !== null &&
      typeof (date as any).toDate === "function"
    ) {
      return (date as any).toDate().toLocaleDateString();
    }
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime()) ? "" : dateObj.toLocaleDateString();
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(80,0,120,0.12)" }}
      className="p-4 border rounded-lg transition-colors flex flex-col bg-white border-gray-200 hover:bg-purple-50 hover:border-purple-200 min-w-[250px] max-w-full sm:min-w-[300px] sm:max-w-[400px] w-full"
    >
      <div className="relative mb-3 h-40 rounded-xl overflow-hidden shadow">
        <img
          src={project.image || "/placeholder.svg"}
          alt={project.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="font-semibold text-blue-700">{project.name}</div>
      <div className="text-xs text-gray-500">
        Mentor: {mentorUidToUsername[project.mentor] || project.mentor}
      </div>
      <div className="text-xs text-gray-500">Type: {project.type === "fyp" ? "FYP" : "Ongoing"}</div>
      <div className="text-sm text-gray-700 line-clamp-2 mt-1">{project.description}</div>
      <div className="flex flex-wrap gap-1 mt-1">
        {project.students?.map((uid) => (
          <span
            key={uid}
            className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs"
          >
            {studentUidToUsername[uid] || uid}
          </span>
        ))}
      </div>
      <div className="text-xs text-gray-400 mt-2">{formatDate(project.createdAt)}</div>
      {project.isArchived && (
        <span className="mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
          Archived
        </span>
      )}
    </motion.div>
  );

  const ProjectDetailModal = ({
    project,
    onClose,
  }: {
    project: Project;
    onClose: () => void;
  }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-1 bg-purple-600 rounded" />
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-6 text-purple-700">Project Details</h2>
          <div className="flex items-start space-x-6 mb-6">
            <img
              src={project.image || "/placeholder.svg"}
              alt={project.name}
              className="w-24 h-24 rounded-lg object-cover border-4 border-gray-200 shadow"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                {project.isArchived && (
                  <span className="px-3 py-1 text-sm rounded-full font-medium bg-red-100 text-red-800">
                    Archived
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 text-sm rounded-full font-medium bg-purple-100 text-purple-800">
                  {project.type === "fyp" ? "FYP" : "Ongoing"}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                value={project.name || ""}
                disabled
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Project Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={project.description || ""}
                disabled
                rows={4}
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mentor</label>
              <input
                value={mentorUidToUsername[project.mentor] || project.mentor}
                disabled
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Mentor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Students</label>
              <input
                value={project.students
                  ?.map((uid) => studentUidToUsername[uid] || uid)
                  .join(", ") || ""}
                disabled
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Students"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <input
                value={project.type === "fyp" ? "FYP" : "Ongoing"}
                disabled
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Type"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <input
                value={formatDate(project.createdAt)}
                disabled
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Created At"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={project.isArchived}
                disabled
                className="w-4 h-4 text-purple-600 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">Archived</label>
            </div>
            <div className="text-xs text-gray-400 pt-2 border-t">
              <p>
                <strong>Project ID:</strong> {project.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-800 via-purple-700 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-800 via-purple-700 to-white py-8">
      <div className="container mx-auto px-4" style={{ marginTop: 100, marginBottom: 100 }}>
        <div className="w-full max-w-7xl bg-white rounded-2xl shadow-lg overflow-hidden mx-auto">
          <div className="text-center p-8 bg-gradient-to-r from-purple-700 to-purple-500">
            <div className="w-16 h-1 bg-white rounded mb-6 mx-auto" />
            <h1 className="text-4xl font-bold text-white mb-2">Projects Directory</h1>
            <p className="text-purple-100">Explore our FYP and Ongoing projects</p>
          </div>
          <div className="flex justify-center space-x-8 p-6 bg-gray-50 border-b border-gray-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-purple-600">{fypProjects.length}</h3>
              <p className="text-gray-600">FYP Projects</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-600">{ongoingProjects.length}</h3>
              <p className="text-gray-600">Ongoing Projects</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-600">
                {fypProjects.length +
                  ongoingProjects.length}
              </h3>
              <p className="text-gray-600">Total Projects</p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-8 md:p-12 bg-white">
              <div className="w-16 h-1 bg-purple-600 rounded mb-6" />
              <h2 className="text-2xl font-bold mb-6 text-purple-700">
                FYP Projects ({fypProjects.length})
              </h2>
              <div className="space-y-4 max-h-[32rem] overflow-y-auto">
                {fypProjects.length === 0 ? (
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
                          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p>No FYP projects found</p>
                  </div>
                ) : (
                  fypProjects.map((project) => (
                    <div
                      key={project.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                    >
                      <ProjectCard project={project} />
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex-1 bg-gray-50 p-8 md:p-12 border-l border-gray-100">
              <div className="w-16 h-1 bg-blue-600 rounded mb-6" />
              <h2 className="text-2xl font-bold mb-6 text-blue-700">
                Ongoing Projects ({ongoingProjects.length})
              </h2>
              <div className="space-y-4 max-h-[32rem] overflow-y-auto">
                {ongoingProjects.length === 0 ? (
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
                          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p>No Ongoing projects found</p>
                  </div>
                ) : (
                  ongoingProjects.map((project) => (
                    <div
                      key={project.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedProject(project)}
                    >
                      <ProjectCard project={project} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedProject && (
        <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
      <ToastContainer />
    </div>
  );
};

export default ViewProjects;