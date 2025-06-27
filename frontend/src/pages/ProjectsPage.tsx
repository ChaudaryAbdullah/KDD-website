import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

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
  students: [];
  type: string;
  image: string;
  file: string;
}

function MentorProjectCard({
  project,
  uidToUsername,
  onClick,
}: {
  project: MentorProject;
  uidToUsername: Record<string, string>;
  onClick: () => void;
}) {
  const navigate = useNavigate();
  // Handle Firestore Timestamp or string date
  let displayDate = "";
  if (project.createdAt) {
    if (
      typeof project.createdAt === "object" &&
      project.createdAt !== null &&
      typeof (project.createdAt as any).toDate === "function"
    ) {
      displayDate = (project.createdAt as any).toDate().toLocaleDateString();
    } else {
      const dateObj = new Date(project.createdAt);
      displayDate = isNaN(dateObj.getTime())
        ? ""
        : dateObj.toLocaleDateString();
    }
  }
  const mentorName = uidToUsername[project.Mentor] || project.Mentor;
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 rounded-2xl shadow-lg border border-blue-200 flex flex-col transition-all duration-200 min-w-[250px] max-w-full sm:min-w-[300px] sm:max-w-[400px] md:min-w-[350px] md:max-w-[500px] w-full cursor-pointer"
      onClick={onClick}
    >
      <div className="relative mb-3 h-40 rounded-xl overflow-hidden shadow">
        <img
          src={project.image || "/placeholder.svg"}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <span
          className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold shadow bg-purple-600 text-white cursor-pointer underline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${project.Mentor}`);
          }}
        >
          {mentorName}
        </span>
      </div>
      <h3 className="font-bold text-lg text-blue-900 mb-1">{project.name}</h3>
      <p className="text-sm text-gray-700 mb-2 line-clamp-3">
        {project.description.length > 120
          ? project.description.slice(0, 120) + "..."
          : project.description}
      </p>
      <div className="flex justify-between items-center mt-auto">
        <span className="text-xs text-gray-400">{displayDate}</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            project.status === "public"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {project.status}
        </span>
      </div>
    </motion.div>
  );
}

function AdminProjectCard({
  project,
  uidToUsername,
  onClick,
}: {
  project: AdminProject;
  uidToUsername: Record<string, string>;
  onClick: () => void;
}) {
  const navigate = useNavigate();
  // Display mentor and students usernames
  const mentorName = uidToUsername[project.mentor] || project.mentor;
  const studentNames = (project.students || []).map((uid: string) => ({
    uid,
    name: uidToUsername[uid] || uid,
  }));
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 rounded-2xl shadow-lg border border-blue-200 flex flex-col transition-all duration-200 min-w-[250px] max-w-full sm:min-w-[300px] sm:max-w-[400px] md:min-w-[350px] md:max-w-[500px] w-full cursor-pointer"
      onClick={onClick}
    >
      <div className="relative mb-3 h-40 rounded-xl overflow-hidden shadow">
        <img
          src={project.image || "/placeholder.svg"}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <span
          className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold shadow bg-purple-600 text-white cursor-pointer underline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${project.mentor}`);
          }}
        >
          Mentor: {mentorName}
        </span>
      </div>
      <h3 className="font-bold text-lg text-blue-900 mb-1">{project.name}</h3>
      <p className="text-sm text-gray-700 mb-2 line-clamp-3">
        {project.description.length > 120
          ? project.description.slice(0, 120) + "..."
          : project.description}
      </p>
      {studentNames.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          <span className="font-semibold text-xs text-gray-600">Students:</span>
          {studentNames.map(({ uid, name }, idx) => (
            <span
              key={idx}
              className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs cursor-pointer underline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${uid}`);
              }}
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ProjectsPage() {
  const navigate = useNavigate();
  const [mentorProjects, setMentorProjects] = useState<MentorProject[]>([]);
  const [adminProjects, setAdminProjects] = useState<AdminProject[]>([]);
  const [uidToUsername, setUidToUsername] = useState<Record<string, string>>(
    {}
  );
  const [selectedProject, setSelectedProject] = useState<
    MentorProject | AdminProject | null
  >(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const mentorSnap = await getDocs(collection(db, "projects"));
      const mentorList: MentorProject[] = [];
      mentorSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === "public") {
          mentorList.push({ id: docSnap.id, ...data });
        }
      });
      setMentorProjects(mentorList);

      const adminSnap = await getDocs(collection(db, "adminprojects"));
      const adminList: AdminProject[] = [];
      adminSnap.forEach((docSnap) => {
        adminList.push({ id: docSnap.id, ...docSnap.data() } as AdminProject);
      });
      setAdminProjects(adminList);

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
    };
    fetchProjects();
  }, []);

  // Group admin projects by type
  const adminTypesOrder = ["ongoing", "fyp"];
  const adminProjectsByType: Record<string, AdminProject[]> = {};
  adminProjects.forEach((p) => {
    const type = p.type || "other";
    if (!adminProjectsByType[type]) adminProjectsByType[type] = [];
    adminProjectsByType[type].push(p);
  });
  // Get all types, ordered: ongoing, fyp, then others
  const allAdminTypes = [
    ...adminTypesOrder.filter((t) => adminProjectsByType[t]),
    ...Object.keys(adminProjectsByType).filter(
      (t) => !adminTypesOrder.includes(t)
    ),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-700 to-white py-12">
      <div className="max-w-7xl mx-auto px-4" style={{ marginTop: 100 }}>
        {/* Mentor Projects Section */}
        <section className="mb-20 bg-white/80 rounded-2xl shadow-lg p-8 border border-purple-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-700 to-fuchsia-600 drop-shadow-lg">
              Mentor Projects
            </h2>
            <Link
              to="/all-projects/mentor"
              className="text-purple-700 hover:text-fuchsia-600 font-semibold underline underline-offset-4 transition-colors"
            >
              See all mentor projects
            </Link>
          </div>
          <div className="flex flex-wrap gap-8 justify-center">
            {mentorProjects.slice(0, 5).map((project) => (
              <MentorProjectCard
                key={project.id}
                project={project}
                uidToUsername={uidToUsername}
                onClick={() => {
                  setSelectedProject(project);
                  setShowModal(true);
                }}
              />
            ))}
          </div>
        </section>
        {/* Modal for project details (mentor or admin) */}
        {showModal && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-xl w-full relative border-2 border-purple-200 animate-fadeIn">
              <button
                className="absolute top-3 right-4 text-gray-400 hover:text-red-600 text-3xl font-bold"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
              <img
                src={selectedProject.image || "/placeholder.svg"}
                alt={selectedProject.name}
                className="w-full h-56 object-cover rounded-xl mb-6 border border-purple-100 shadow"
              />
              <h2 className="text-2xl font-extrabold text-purple-700 mb-3">
                {selectedProject.name}
              </h2>
              <p className="text-gray-700 mb-4 text-base">
                {selectedProject.description}
              </p>
              {"Mentor" in selectedProject && (
                <div className="mb-2">
                  <span className="font-semibold">Mentor: </span>
                  <span
                    className="text-purple-700 underline cursor-pointer"
                    onClick={() => {
                      setShowModal(false);
                      navigate(
                        `/profile/${(selectedProject as MentorProject).Mentor}`
                      );
                    }}
                  >
                    {uidToUsername[(selectedProject as MentorProject).Mentor] ||
                      (selectedProject as MentorProject).Mentor}
                  </span>
                </div>
              )}
              {"mentor" in selectedProject && (
                <div className="mb-2">
                  <span className="font-semibold">Mentor: </span>
                  <span
                    className="text-purple-700 underline cursor-pointer"
                    onClick={() => {
                      setShowModal(false);
                      navigate(
                        `/profile/${(selectedProject as AdminProject).mentor}`
                      );
                    }}
                  >
                    {uidToUsername[(selectedProject as AdminProject).mentor] ||
                      (selectedProject as AdminProject).mentor}
                  </span>
                </div>
              )}
              {"students" in selectedProject &&
                (selectedProject as AdminProject).students.length > 0 && (
                  <div className="mb-2">
                    <span className="font-semibold">Students: </span>
                    {(selectedProject as AdminProject).students.map(
                      (uid: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs mr-1 underline cursor-pointer"
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
                )}
              {"createdAt" in selectedProject && (
                <div className="mb-2">
                  <span className="font-semibold">Created At: </span>
                  {(() => {
                    const createdAt = (selectedProject as MentorProject)
                      .createdAt;
                    if (createdAt) {
                      if (
                        typeof createdAt === "object" &&
                        createdAt !== null &&
                        typeof (createdAt as any).toDate === "function"
                      ) {
                        return (createdAt as any).toDate().toLocaleDateString();
                      } else {
                        const dateObj = new Date(createdAt);
                        return isNaN(dateObj.getTime())
                          ? ""
                          : dateObj.toLocaleDateString();
                      }
                    }
                    return "";
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Admin Projects Section - Grouped by type */}
        {allAdminTypes.map((type) => (
          <section
            className="mb-20 bg-white/80 rounded-2xl shadow-lg p-8 border border-purple-100"
            key={type}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-700 to-fuchsia-600 drop-shadow-lg">
                {type.charAt(0).toUpperCase() + type.slice(1)} Projects
              </h2>
              <Link
                to={`/all-projects/${type}`}
                className="text-purple-700 hover:text-fuchsia-600 font-semibold underline underline-offset-4 transition-colors"
              >
                See all {type} projects
              </Link>
            </div>
            <div className="flex flex-wrap gap-8 justify-center">
              {adminProjectsByType[type].slice(0, 5).map((project) => (
                <AdminProjectCard
                  key={project.id}
                  project={project}
                  uidToUsername={uidToUsername}
                  onClick={() => {
                    setSelectedProject(project);
                    setShowModal(true);
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default ProjectsPage;
