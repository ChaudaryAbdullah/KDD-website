import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "private" | "public";
  Mentor: string;
  image: string;
  createdAt: Date;
}

const AddProject = () => {
  const [mentorName, setMentorName] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [editId, setEditId] = useState<string | null>(null); // for editing
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    status: "private" as "private" | "public",
  });

  useEffect(() => {
    const userId = localStorage.getItem("data");
    if (userId) {
      const users = JSON.parse(
        sessionStorage.getItem("signupDataList") || "[]"
      );
      const currentUser = users.find((user: any) => user.userName === userId);
      if (currentUser?.role === "mentor") {
        setMentorName(currentUser.userName);

        const allProjects = JSON.parse(
          localStorage.getItem("mentorProjects") || "[]"
        );

        //Filter only projects belonging to this mentor
        const myProjects = allProjects.filter(
          (proj: Project) => proj.Mentor === currentUser.userName
        );

        setProjects(myProjects);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !mentorName ||
      !formData.status
    ) {
      toast.error("All fields are required!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    if (editId) {
      // Editing existing project
      const updatedProjects = projects.map((proj) =>
        proj.id === editId
          ? {
              ...proj,
              name: formData.name,
              description: formData.description,
              image: formData.image || proj.image,
              status: formData.status,
            }
          : proj
      );
      setProjects(updatedProjects);
      localStorage.setItem("mentorProjects", JSON.stringify(updatedProjects));
      toast.success("Project updated!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setEditId(null);
    } else {
      // Adding new project
      const newProject: Project = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        status: formData.status,
        Mentor: mentorName,
        image: formData.image || "/placeholder.svg",
        createdAt: new Date(),
      };
      const updatedProjects = [newProject, ...projects];
      setProjects(updatedProjects);
      localStorage.setItem("mentorProjects", JSON.stringify(updatedProjects));
      toast.success("Project added!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }

    setFormData({ name: "", description: "", image: "", status: "private" });
  };

  const handleEdit = (project: Project) => {
    setEditId(project.id);
    setFormData({
      name: project.name,
      description: project.description,
      image: project.image,
      status: project.status,
    });
  };

  const handleDelete = (id: string) => {
    const updatedProjects = projects.filter((proj) => proj.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem("mentorProjects", JSON.stringify(updatedProjects));
    toast.info("Project deleted", {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-violet-800 via-purple-700 to-white px-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ marginTop: 100, marginBottom: 100 }}
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg relative"
      >
        <h2 className="text-2xl font-bold mb-4 text-blue-700">
          {editId ? "Edit Project" : "Add New Project"}
        </h2>

        {mentorName && (
          <p className="text-sm mb-4 text-gray-600">
            Mentor:{" "}
            <span className="font-semibold text-purple-700">{mentorName}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setFormData({ ...formData, image: reader.result as string });
                };
                reader.readAsDataURL(file);
              }
            }}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {formData.image && (
            <img
              src={formData.image}
              alt="Preview"
              className="mt-2 h-32 w-full object-cover rounded border"
            />
          )}

          <textarea
            placeholder="Project Description"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full border border-gray-300 rounded px-3 py-2"
          />

          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as "private" | "public",
              })
            }
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editId ? "Update Project" : "Add Project"}
          </button>
        </form>

        <hr className="my-6 border-gray-300" />

        <h3 className="text-lg font-semibold mb-3">Your Projects</h3>
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border p-4 rounded shadow-sm bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-bold">{project.name}</h4>
                  <p className="text-sm text-gray-600">{project.status}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-blue-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700">{project.description}</p>
            </div>
          ))}
        </div>
        <ToastContainer />
      </motion.div>
    </div>
  );
};

export default AddProject;
