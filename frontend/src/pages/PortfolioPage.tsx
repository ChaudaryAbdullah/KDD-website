import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Types
interface UserProfile {
  userName: string;
  firstName: string;
  lastName: string;
  role: "mentor" | "student";
  email?: string;
  profilePic?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  Mentor: string;
  image: string;
  status: "private" | "public";
  createdAt: string;
}

// Profile card for mentors/students
function ProfileCard({ user }: { user: UserProfile }) {
  return (
    <motion.div
      whileHover={{ scale: 1.06, boxShadow: "0 8px 32px rgba(80,0,120,0.12)" }}
      className="bg-gradient-to-br from-purple-100 via-white to-blue-100 p-6 rounded-2xl shadow-xl flex flex-col items-center border border-purple-200 transition-all duration-200"
    >
      <div className="relative mb-4">
        <img
          src={user.profilePic || "/placeholder.svg"}
          alt={user.userName}
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
        />
        <span
          className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${
            user.role === "mentor"
              ? "bg-purple-600 text-white"
              : "bg-blue-600 text-white"
          }`}
          title={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        >
          {user.role === "mentor" ? "M" : "S"}
        </span>
      </div>
      <h2 className="text-xl font-bold text-purple-800 mb-1">
        {user.userName}
      </h2>
      <p
        className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
          user.role === "mentor" ? "text-purple-600" : "text-blue-600"
        }`}
      >
        {user.firstName + " " + user.lastName}
      </p>
      <p
        className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
          user.role === "mentor" ? "text-purple-600" : "text-blue-600"
        }`}
      >
        {user.role}
      </p>
      <p className="text-sm text-gray-500">{user.email}</p>
    </motion.div>
  );
}

// Project card for public projects
function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(0,80,180,0.13)" }}
      className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 rounded-2xl shadow-lg border border-blue-200 flex flex-col transition-all duration-200"
    >
      <div className="relative mb-3 h-40 rounded-xl overflow-hidden shadow">
        <img
          src={project.image || "/placeholder.svg"}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold shadow  bg-purple-600 text-white
          }`}
        >
          {project.Mentor.charAt(0).toUpperCase() + project.Mentor.slice(1)}
        </span>
      </div>
      <h3 className="font-bold text-lg text-blue-900 mb-1">{project.name}</h3>
      <p className="text-sm text-gray-700 mb-2 line-clamp-3">
        {project.description.length > 120
          ? project.description.slice(0, 120) + "..."
          : project.description}
      </p>
      <div className="flex justify-between items-center mt-auto">
        <span className="text-xs text-gray-400">
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            project.status === "public"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </span>
      </div>
    </motion.div>
  );
}

export default function PortfolioPage() {
  const [mentors, setMentors] = useState<UserProfile[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const userListRaw = sessionStorage.getItem("signupDataList");
    const projectListRaw = localStorage.getItem("mentorProjects");

    if (userListRaw) {
      const parsedUsers: UserProfile[] = JSON.parse(userListRaw);
      setMentors(parsedUsers.filter((u) => u.role === "mentor"));
      setStudents(parsedUsers.filter((u) => u.role === "student"));
    }

    if (projectListRaw) {
      const parsedProjects: Project[] = JSON.parse(projectListRaw);
      setProjects(parsedProjects.filter((p) => p.status === "public"));
    }
  }, []);

  return (
    <div className="pt-24 bg-gradient-to-br from-violet-800 via-purple-700 to-purple-600">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <section className="py-20 bg-gradient-to-br from-violet-800 via-purple-700 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              Portfolio Gallery
            </h1>
            <p className="text-xl text-white/85 max-w-3xl mx-auto">
              Showcase of student and mentor projects
            </p>
          </div>
        </section>

        <div className="py-16 bg-gradient-to-b from-white via- to-gray-100 ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-6 text-center text-purple-700 ">
              Our Mentors
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              {mentors.map((mentor) => (
                <ProfileCard key={mentor.userName} user={mentor} />
              ))}
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-6 text-center text-blue-700">
            Our Projects
          </h1>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-6 text-center text-green-700">
            Our Students
          </h1>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-10">
              {students.map((student) => (
                <ProfileCard key={student.userName} user={student} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
