import React, { useEffect, useState } from "react";
import { db, storage, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  isArchived: boolean;
}

const MentorProjects = () => {
  const [mentorName, setMentorName] = useState("");
  const [mentorUsername, setMentorUsername] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    status: "private" as "private" | "public",
    file: null as File | null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setMentorName(user.uid);
        // Fetch username from users collection
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const usersSnapshot = await getDocs(q);
        let foundUsername = "";
        usersSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (docSnap.id === user.uid) {
            foundUsername = data.userName || user.uid;
          }
        });
        setMentorUsername(foundUsername || user.uid);
        loadProjects(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadProjects = async (mentor: string) => {
    try {
      const q = query(
        collection(db, "projects"),
        where("Mentor", "==", mentor)
      );
      const querySnapshot = await getDocs(q);
      const result: Project[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Project;
        result.push({ id: docSnap.id, ...data });
      });
      setProjects(result);
    } catch (err) {
      console.error("Error loading projects:", err);
      toast.error("Failed to load projects", { position: "top-right" });
    }
  };

  const uploadImage = async (file: File) => {
    try {
      const storageRef = ref(
        storage,
        `projectImages/${Date.now()}-${file.name}`
      );
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error("Failed to upload image", { position: "top-right" });
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description, status, file } = formData;

    if (!name || !description || !status || !mentorUsername) {
      toast.error("All fields are required!", { position: "top-right" });
      return;
    }

    try {
      let imageUrl = formData.image;

      if (file) {
        imageUrl = await uploadImage(file);
      }

      if (editId) {
        const docRef = doc(db, "projects", editId);
        const updateData: Partial<Project> = {
          name,
          description,
          status,
          image: imageUrl,
          Mentor: mentorName, // Use UID
        };

        // Only set isArchived if status is public (force false) or private (keep existing or false)
        if (status === "public") {
          updateData.isArchived = false;
        }

        await updateDoc(docRef, updateData);
        toast.success("Project updated!", { position: "top-right" });
      } else {
        await addDoc(collection(db, "projects"), {
          name,
          description,
          status,
          image: imageUrl || "/placeholder.svg",
          Mentor: mentorName, // Use UID
          createdAt: new Date(),
          isArchived: false,
        });
        toast.success("Project added!", { position: "top-right" });
      }

      setFormData({
        name: "",
        description: "",
        image: "",
        status: "private",
        file: null,
      });
      setEditId(null);
      loadProjects(mentorName);
    } catch (err) {
      console.error("Error submitting project:", err);
      toast.error(`Failed to submit project: ${err.message}`, {
        position: "top-right",
      });
    }
  };

  const handleEdit = (project: Project) => {
    if (project.isArchived) {
      toast.warn("Cannot edit archived projects.", { position: "top-right" });
      return;
    }
    setEditId(project.id);
    setFormData({
      name: project.name,
      description: project.description,
      image: project.image,
      status: project.status,
      file: null,
    });
  };

  const handleDelete = async (id: string) => {
    const project = projects.find((proj) => proj.id === id);
    if (project?.isArchived) {
      toast.warn("Cannot delete archived projects.", { position: "top-right" });
      return;
    }
    try {
      await deleteDoc(doc(db, "projects", id));
      toast.info("Project deleted", { position: "top-right" });
      loadProjects(mentorName);
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Failed to delete project", { position: "top-right" });
    }
  };

  const handleArchive = async (id: string) => {
    const project = projects.find((proj) => proj.id === id);
    if (project?.status !== "private") {
      toast.warn("Only private projects can be archived.", {
        position: "top-right",
      });
      return;
    }
    try {
      const docRef = doc(db, "projects", id);
      await updateDoc(docRef, {
        isArchived: !project?.isArchived,
      });
      toast.success(
        project?.isArchived ? "Project unarchived" : "Project archived",
        { position: "top-right" }
      );
      loadProjects(mentorName);
    } catch (err) {
      console.error("Error archiving project:", err);
      toast.error("Failed to archive project", { position: "top-right" });
    }
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

        {mentorUsername && (
          <p className="text-sm mb-4 text-gray-600">
            Mentor:{" "}
            <span className="font-semibold text-purple-700">
              {mentorUsername}
            </span>
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
            onChange={(e) =>
              setFormData({
                ...formData,
                file: e.target.files?.[0] || null,
              })
            }
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
              className={`border p-4 rounded shadow-sm ${
                project.isArchived ? "bg-gray-200 opacity-75" : "bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-bold">{project.name}</h4>
                  <div className="flex gap-2">
                    <p className="text-sm text-gray-600">{project.status}</p>
                    {project.isArchived && (
                      <span className="text-sm text-red-600 font-semibold">
                        [Archived]
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-blue-600 text-sm"
                    disabled={project.isArchived}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 text-sm"
                    disabled={project.isArchived}
                  >
                    Delete
                  </button>
                  {project.status === "private" && (
                    <button
                      onClick={() => handleArchive(project.id)}
                      className={`text-sm ${
                        project.isArchived
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {project.isArchived ? "Unarchive" : "Archive"}
                    </button>
                  )}
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

export default MentorProjects;
