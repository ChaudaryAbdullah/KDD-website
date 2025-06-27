import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";

const socialPlatforms = [
  {
    name: "LinkedIn",
    key: "linkedin",
    placeholder: "https://linkedin.com/in/yourprofile",
  },
  {
    name: "GitHub",
    key: "github",
    placeholder: "https://github.com/yourprofile",
  },
  {
    name: "Twitter",
    key: "twitter",
    placeholder: "https://twitter.com/yourprofile",
  },
  {
    name: "Facebook",
    key: "facebook",
    placeholder: "https://facebook.com/yourprofile",
  },
];

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<any>({});
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [newProject, setNewProject] = useState({
    name: "",
    details: "",
    image: "",
  });
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUser({ ...data, uid: firebaseUser.uid });
          setEditData({ ...data });
          setSkills(data.skills || []);
          setProjects(data.projects || []);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (platform: string, value: string) => {
    setEditData({
      ...editData,
      social: { ...editData.social, [platform]: value },
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleProjectImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProjectImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProject((prev: any) => ({
          ...prev,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProject = () => {
    if (!newProject.name.trim() || !newProject.details.trim())
      toast.error("All fields are required!");
    setProjects([...projects, newProject]);
    setNewProject({ name: "", details: "", image: "" });
    setProjectImageFile(null);
  };

  const handleRemoveProject = (idx: number) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...editData,
        skills,
        projects,
        email: user.email, // Prevent email update
        userName: user.userName, // Prevent username update
      });
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-center">User not found.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-800 via-purple-700 to-white py-8">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8"
        style={{ marginTop: 100 }}
      >
        <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
          My Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              value={user.userName}
              disabled
              className="w-full p-2 border rounded bg-gray-100 mb-3"
            />
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              value={user.email}
              disabled
              className="w-full p-2 border rounded bg-gray-100 mb-3"
            />
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              name="firstName"
              value={editData.firstName || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3"
            />
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              name="lastName"
              value={editData.lastName || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3"
            />
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              name="address"
              value={editData.address || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3"
            />
            <label className="block text-sm font-medium mb-1">
              Date of Birth
            </label>
            <input
              name="dob"
              type="date"
              value={editData.dob || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3"
            />
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={editData.description || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-3"
              rows={3}
            />
            <label className="block text-sm font-medium mb-1">
              Profile Picture
            </label>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setEditData((prev: any) => ({
                        ...prev,
                        profilePic: reader.result as string,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="profile-pic-upload"
              />
              <button
                type="button"
                onClick={() =>
                  document.getElementById("profile-pic-upload")?.click()
                }
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Upload Image
              </button>
              {editData.profilePic && (
                <img
                  src={editData.profilePic}
                  alt="Profile"
                  className="h-16 w-16 object-cover rounded-full border"
                />
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Social Media Links
            </label>
            <div className="space-y-2 mb-4">
              {socialPlatforms.map((platform) => (
                <div key={platform.key}>
                  <input
                    placeholder={platform.placeholder}
                    value={editData.social?.[platform.key] || ""}
                    onChange={(e) =>
                      handleSocialChange(platform.key, e.target.value)
                    }
                    className="w-full p-2 border rounded mb-1"
                  />
                  <span className="text-xs text-gray-500 ml-1">
                    {platform.name}
                  </span>
                </div>
              ))}
            </div>
            <label className="block text-sm font-medium mb-2">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1 text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    className="ml-1 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                className="flex-1 p-2 border rounded"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Add
              </button>
            </div>
            {/* Student Projects Section */}
            {user.role === "student" && (
              <div className="mt-8">
                <label className="block text-sm font-medium mb-2 text-purple-700">
                  My Projects
                </label>
                <div className="space-y-4 mb-4">
                  {projects.length === 0 && (
                    <div className="text-gray-400 text-sm">
                      No projects added yet.
                    </div>
                  )}
                  {projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-3 flex gap-3 items-center bg-gray-50"
                    >
                      {proj.image && (
                        <img
                          src={proj.image}
                          alt="Project"
                          className="h-16 w-16 object-cover rounded border"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-purple-700">
                          {proj.name}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {proj.details}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 ml-2"
                        onClick={() => handleRemoveProject(idx)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border rounded-lg p-3 bg-white mb-2">
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                    placeholder="Project Name"
                    className="w-full p-2 border rounded mb-2"
                  />
                  <textarea
                    value={newProject.details}
                    onChange={(e) =>
                      setNewProject({ ...newProject, details: e.target.value })
                    }
                    placeholder="Project Details"
                    className="w-full p-2 border rounded mb-2"
                    rows={2}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProjectImageChange}
                    className="w-full p-2 border rounded mb-2"
                  />
                  {newProject.image && (
                    <img
                      src={newProject.image}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded border mb-2"
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full"
                  >
                    Add Project
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={handleSave}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 mt-4"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Dashboard;
