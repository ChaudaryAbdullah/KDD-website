import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

interface MentorProject {
  id: string;
  name: string;
  description: string;
  Mentor: string;
  image: string;
  status: "private" | "public";
  createdAt: string;
}

interface AdminProject {
  id: string;
  name: string;
  description: string;
  mentor: string;
  students: string[];
  type: string;
  image: string;
  file: string;
}

type ProjectType = "mentor" | "admin";

export default function AllProjectsPage() {
  const { type } = useParams<{ type: string }>(); // type: 'mentor', 'admin', or admin type (e.g. 'fyp')
  const [projects, setProjects] = useState<(MentorProject | AdminProject)[]>(
    []
  );
  const [uidToUsername, setUidToUsername] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<
    MentorProject | AdminProject | null
  >(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const pageSize = 10;

  useEffect(() => {
    const fetchProjects = async () => {
      let projectList: (MentorProject | AdminProject)[] = [];
      if (type === "mentor") {
        const mentorSnap = await getDocs(collection(db, "projects"));
        mentorSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.status === "public") {
            projectList.push({ id: docSnap.id, ...data } as MentorProject);
          }
        });
      } else {
        const adminSnap = await getDocs(collection(db, "adminprojects"));
        adminSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (type === "admin" || data.type === type) {
            projectList.push({ id: docSnap.id, ...data } as AdminProject);
          }
        });
      }
      setProjects(projectList);
      // Fetch all users for UID to username mapping
      const usersSnap = await getDocs(collection(db, "users"));
      const uidMap: Record<string, string> = {};
      usersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.userName) {
          uidMap[docSnap.id] = data.userName;
        }
      });
      setUidToUsername(uidMap);
      setLoading(false);
    };
    fetchProjects();
  }, [type]);

  // Pagination
  const totalPages = Math.ceil(projects.length / pageSize);
  const paginatedProjects = projects.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-700 to-white py-16">
      <div className="max-w-7xl mx-auto px-6" style={{ marginTop: 100 }}>
        {/* Enhanced Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white/85 via-white/80 to-gray-400 drop-shadow-xl p-3 mb-6 ">
            {type === "mentor"
              ? "All Mentor Projects"
              : type === "admin"
              ? "All Admin Projects"
              : `${type.charAt(0).toUpperCase() + type.slice(1)} Projects`}
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-white/85 via-white/80 to-gray-400 rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Discover innovative projects and connect with talented mentors and
            students
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-white/70 text-lg mt-6">
              Loading amazing projects...
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto border border-white/20">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No Projects Found
              </h3>
              <p className="text-white/70">
                Check back later for new exciting projects!
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
              {paginatedProjects.map((project) => {
                // Mentor project card
                if ("Mentor" in project) {
                  const mentorName =
                    uidToUsername[project.Mentor] || project.Mentor;
                  let displayDate = "";
                  if (project.createdAt) {
                    if (
                      typeof project.createdAt === "object" &&
                      project.createdAt !== null &&
                      typeof (project.createdAt as any).toDate === "function"
                    ) {
                      displayDate = (project.createdAt as any)
                        .toDate()
                        .toLocaleDateString();
                    } else {
                      const dateObj = new Date(project.createdAt);
                      displayDate = isNaN(dateObj.getTime())
                        ? ""
                        : dateObj.toLocaleDateString();
                    }
                  }
                  return (
                    <div
                      key={project.id}
                      className="group bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/30 flex flex-col cursor-pointer transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:bg-white"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowModal(true);
                      }}
                    >
                      <div className="relative mb-4 h-48 rounded-2xl overflow-hidden shadow-lg">
                        <img
                          src={project.image || "/placeholder.svg"}
                          alt={project.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <span
                          className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${project.Mentor}`);
                          }}
                        >
                          {mentorName}
                        </span>
                        <span
                          className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                            project.status === "public"
                              ? "bg-green-500/90 text-white"
                              : "bg-gray-500/90 text-white"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-bold text-xl text-blue-900 mb-3 line-clamp-2 group-hover:text-purple-700 transition-colors duration-200">
                          {project.name}
                        </h3>
                        <p className="text-gray-700 mb-4 line-clamp-3 text-sm leading-relaxed flex-1">
                          {project.description.length > 120
                            ? project.description.slice(0, 120) + "..."
                            : project.description}
                        </p>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {displayDate}
                          </span>
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
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
                      </div>
                    </div>
                  );
                } else {
                  // Admin project card
                  const mentorName =
                    uidToUsername[(project as AdminProject).mentor] ||
                    (project as AdminProject).mentor;
                  const studentNames = (
                    (project as AdminProject).students || []
                  ).map((uid: string) => ({
                    uid,
                    name: uidToUsername[uid] || uid,
                  }));
                  return (
                    <div
                      key={project.id}
                      className="group bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/30 flex flex-col cursor-pointer transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:bg-white"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowModal(true);
                      }}
                    >
                      <div className="relative mb-4 h-48 rounded-2xl overflow-hidden shadow-lg">
                        <img
                          src={project.image || "/placeholder.svg"}
                          alt={project.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <span
                          className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/profile/${(project as AdminProject).mentor}`
                            );
                          }}
                        >
                          Mentor: {mentorName}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-bold text-xl text-blue-900 mb-3 line-clamp-2 group-hover:text-purple-700 transition-colors duration-200">
                          {project.name}
                        </h3>
                        <p className="text-gray-700 mb-4 line-clamp-3 text-sm leading-relaxed">
                          {project.description.length > 120
                            ? project.description.slice(0, 120) + "..."
                            : project.description}
                        </p>
                        {studentNames.length > 0 && (
                          <div className="mb-4">
                            <span className="font-semibold text-xs text-gray-600 block mb-2">
                              Students:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {studentNames
                                .slice(0, 3)
                                .map(({ uid, name }, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-3 py-1 rounded-full text-xs cursor-pointer hover:from-purple-200 hover:to-blue-200 transition-all duration-200 transform hover:scale-105"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/profile/${uid}`);
                                    }}
                                  >
                                    {name}
                                  </span>
                                ))}
                              {studentNames.length > 3 && (
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                                  +{studentNames.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex justify-end items-center pt-3 border-t border-gray-100 mt-auto">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-white"
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
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </>
        )}

        {/* Enhanced Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mb-8">
            <button
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <svg
                className="w-4 h-4 inline mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-2">
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page > totalPages - 3) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                      page === pageNum
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <svg
                className="w-4 h-4 inline ml-2"
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
            </button>
          </div>
        )}

        {/* Enhanced Modal */}
        {showModal && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative border border-purple-200 animate-fadeIn">
              <button
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-gray-500 hover:text-red-600 hover:bg-white transition-all duration-200 flex items-center justify-center shadow-lg"
                onClick={() => setShowModal(false)}
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="relative h-72 rounded-t-3xl overflow-hidden">
                <img
                  src={selectedProject.image || "/placeholder.svg"}
                  alt={selectedProject.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>

              <div className="p-8">
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent mb-4">
                  {selectedProject.name}
                </h2>
                <p className="text-gray-700 mb-6 text-base leading-relaxed">
                  {selectedProject.description}
                </p>

                <div className="space-y-4">
                  {"Mentor" in selectedProject && (
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600 text-sm">
                          Mentor
                        </span>
                        <p
                          className="text-purple-700 font-semibold cursor-pointer hover:text-purple-800 transition-colors duration-200"
                          onClick={() => {
                            setShowModal(false);
                            navigate(
                              `/profile/${
                                (selectedProject as MentorProject).Mentor
                              }`
                            );
                          }}
                        >
                          {uidToUsername[
                            (selectedProject as MentorProject).Mentor
                          ] || (selectedProject as MentorProject).Mentor}
                        </p>
                      </div>
                    </div>
                  )}

                  {"mentor" in selectedProject && (
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600 text-sm">
                          Mentor
                        </span>
                        <p
                          className="text-purple-700 font-semibold cursor-pointer hover:text-purple-800 transition-colors duration-200"
                          onClick={() => {
                            setShowModal(false);
                            navigate(
                              `/profile/${
                                (selectedProject as AdminProject).mentor
                              }`
                            );
                          }}
                        >
                          {uidToUsername[
                            (selectedProject as AdminProject).mentor
                          ] || (selectedProject as AdminProject).mentor}
                        </p>
                      </div>
                    </div>
                  )}

                  {"students" in selectedProject &&
                    (selectedProject as AdminProject).students.length > 0 && (
                      <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
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
                          <span className="font-semibold text-gray-600 text-sm">
                            Students
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(selectedProject as AdminProject).students.map(
                            (uid: string, idx: number) => (
                              <span
                                key={idx}
                                className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-3 py-2 rounded-full text-sm font-medium cursor-pointer hover:from-purple-200 hover:to-blue-200 transition-all duration-200 transform hover:scale-105"
                                onClick={() => {
                                  setShowModal(false);
                                  navigate(`/profile/${uid}`);
                                }}
                              >
                                {uidToUsername[uid] || uid}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {"createdAt" in selectedProject && (
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600 text-sm">
                          Created At
                        </span>
                        <p className="text-gray-800 font-medium">
                          {(() => {
                            const createdAt = (selectedProject as MentorProject)
                              .createdAt;
                            if (createdAt) {
                              if (
                                typeof createdAt === "object" &&
                                createdAt !== null &&
                                typeof (createdAt as any).toDate === "function"
                              ) {
                                return (createdAt as any)
                                  .toDate()
                                  .toLocaleDateString();
                              } else {
                                const dateObj = new Date(createdAt);
                                return isNaN(dateObj.getTime())
                                  ? ""
                                  : dateObj.toLocaleDateString();
                              }
                            }
                            return "";
                          })()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
