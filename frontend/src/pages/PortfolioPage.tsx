import { useState, FormEvent, useRef } from "react";
import { Plus, User, GraduationCap, Eye, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Project {
  id: string;
  name: string;
  description: string;
  contributor: "student" | "mentor";
  image: string;
  createdAt: Date;
}

export default function PortfolioPage() {
  const heroRef = useRef(null);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "E-Commerce Platform",
      description:
        "A full-stack e-commerce solution built with Next.js and Stripe integration.",
      contributor: "student",
      image: "/placeholder.svg",
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "AI Chat Application",
      description:
        "An intelligent chatbot application using OpenAI API with real-time messaging.",
      contributor: "mentor",
      image: "/placeholder.svg",
      createdAt: new Date("2024-02-10"),
    },
    {
      id: "3",
      name: "Task Management System",
      description:
        "A collaborative project management tool with drag-and-drop functionality.",
      contributor: "student",
      image: "/placeholder.svg",
      createdAt: new Date("2024-03-05"),
    },
  ]);

  const [filter, setFilter] = useState<"all" | "student" | "mentor">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contributor: "" as "student" | "mentor" | "",
    image: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.contributor)
      return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      contributor: formData.contributor,
      image: formData.image || "/placeholder.svg",
      createdAt: new Date(),
    };

    setProjects([newProject, ...projects]);
    setFormData({ name: "", description: "", contributor: "", image: "" });
    setIsAddDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  const studentProjects = projects.filter((p) => p.contributor === "student");
  const mentorProjects = projects.filter((p) => p.contributor === "mentor");

  const filteredProjects =
    filter === "student"
      ? studentProjects
      : filter === "mentor"
      ? mentorProjects
      : projects;

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

        <div className="min-h-screen bg-slate-100 p-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard
                title="Total Projects"
                count={projects.length}
                icon="📊"
              />
              <StatCard
                title="Student Projects"
                count={studentProjects.length}
                icon={<GraduationCap className="w-4 h-4" />}
              />
              <StatCard
                title="Mentor Projects"
                count={mentorProjects.length}
                icon={<User className="w-4 h-4" />}
              />
            </div>

            {/* Filter Tabs */}
            <div className="mb-4 flex gap-4">
              <button
                onClick={() => setFilter("all")}
                className={`text-sm font-medium underline ${
                  filter === "all" ? "text-blue-800" : "text-blue-600"
                }`}
              >
                All ({projects.length})
              </button>
              <button
                onClick={() => setFilter("student")}
                className={`text-sm font-medium underline ${
                  filter === "student" ? "text-blue-800" : "text-blue-600"
                }`}
              >
                Students ({studentProjects.length})
              </button>
              <button
                onClick={() => setFilter("mentor")}
                className={`text-sm font-medium underline ${
                  filter === "mentor" ? "text-blue-800" : "text-blue-600"
                }`}
              >
                Mentors ({mentorProjects.length})
              </button>
            </div>

            <ProjectGrid
              projects={filteredProjects}
              onDelete={handleDelete}
              onView={setSelectedProject}
            />

            {/* Modal for Add */}
            {isAddDialogOpen && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg relative"
                >
                  <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                    onClick={() => setIsAddDialogOpen(false)}
                    aria-label="Close"
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <h2 className="text-2xl font-bold mb-4 text-blue-700">
                    Add New Project
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">
                        Project Name
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        placeholder="Enter project name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">
                        Contributor
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        value={formData.contributor}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contributor: e.target.value as "student" | "mentor",
                          })
                        }
                        required
                      >
                        <option value="">Select</option>
                        <option value="student">Student</option>
                        <option value="mentor">Mentor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">
                        Upload Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({
                                ...formData,
                                image: reader.result as string,
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {formData.image && (
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="mt-3 h-32 w-full object-cover rounded-lg border border-gray-200 shadow"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">
                        Description
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        required
                        placeholder="Describe your project"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddDialogOpen(false)}
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                      >
                        Add Project
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

            {/* Modal for View */}
            {selectedProject && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-xl relative"
                >
                  <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                    onClick={() => setSelectedProject(null)}
                    aria-label="Close"
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <h3 className="text-2xl font-bold mb-2 text-blue-700">
                    {selectedProject.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Added on {selectedProject.createdAt.toLocaleDateString()}
                  </p>
                  <div className="w-full h-56 mb-4 rounded-lg overflow-hidden border border-gray-200 shadow">
                    <img
                      src={selectedProject.image}
                      alt={selectedProject.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed">
                    {selectedProject.description}
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedProject.contributor === "student"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {selectedProject.contributor === "student" ? (
                        <GraduationCap className="w-4 h-4 mr-1" />
                      ) : (
                        <User className="w-4 h-4 mr-1" />
                      )}
                      {selectedProject.contributor.charAt(0).toUpperCase() +
                        selectedProject.contributor.slice(1)}
                    </span>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({
  title,
  count,
  icon,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-4 border rounded shadow-sm bg-white">
      <div className="flex justify-between items-center text-sm mb-2">
        <span className="font-medium">{title}</span>
        <span>{icon}</span>
      </div>
      <div className="text-xl font-bold">{count}</div>
    </div>
  );
}

function ProjectGrid({
  projects,
  onDelete,
  onView,
}: {
  projects: Project[];
  onDelete: (id: string) => void;
  onView: (project: Project) => void;
}) {
  if (projects.length === 0) {
    return <p className="text-center mt-10 text-gray-500">No projects found</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <div key={project.id} className="border rounded p-4 bg-white shadow-sm">
          <div className="relative h-40 mb-2">
            <img
              src={project.image}
              alt={project.name}
              className="object-cover rounded w-full h-full"
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>
          <h4 className="font-bold text-lg">{project.name}</h4>
          <p className="text-sm text-gray-500 mb-2">
            {project.createdAt.toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-700 line-clamp-2 mb-3">
            {project.description}
          </p>
          <div className="flex justify-between">
            <button
              onClick={() => onView(project)}
              className="text-blue-600 text-sm flex items-center gap-1"
            >
              <Eye className="w-4 h-4" /> View
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="text-red-600 text-sm flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
