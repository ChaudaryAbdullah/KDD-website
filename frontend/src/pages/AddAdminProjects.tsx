import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  setDoc,
  doc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddProjectAdmin = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mentor: "",
    selectedStudents: [] as string[],
    type: "fyp",
    image: "",
    file: null as File | null,
  });

  const [newStudentData, setNewStudentData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    rank: "",
  });

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const studentRankOptions = ["fypstudent", "internee", "alumni"];

  useEffect(() => {
    loadUsers();
    loadProjects();
  }, []);

  const loadUsers = async () => {
    try {
      const usersRef = collection(db, "users");
      const mentorQuery = query(usersRef, where("role", "==", "mentor"));
      const studentQuery = query(usersRef, where("role", "==", "student"));

      const mentorSnap = await getDocs(mentorQuery);
      const studentSnap = await getDocs(studentQuery);

      setMentors(mentorSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setStudents(
        studentSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (err) {
      console.error("Error loading users:", err);
      toast.error("Failed to load users");
    }
  };

  const loadProjects = async () => {
    try {
      const snap = await getDocs(collection(db, "adminprojects"));
      setProjects(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error loading projects:", err);
      toast.error("Failed to load projects");
    }
  };

  const uploadImage = async (file: File) => {
    const storageRef = ref(storage, `projectImages/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description, mentor, selectedStudents, type, file } =
      formData;
    if (
      !name ||
      !description ||
      !mentor ||
      selectedStudents.length === 0 ||
      !type
    ) {
      toast.error("Please fill all required fields!");
      return;
    }
    try {
      let imageUrl = formData.image;
      if (file) {
        imageUrl = await uploadImage(file);
      }
      if (editId) {
        // Update existing project
        await setDoc(doc(db, "adminprojects", editId), {
          name,
          description,
          mentor,
          students: selectedStudents,
          type,
          image: imageUrl || "/placeholder.svg",
          createdAt: new Date(),
          status: "private",
          isArchived: false,
        });
        toast.success("Project updated successfully!");
        setEditId(null);
      } else {
        // Add new project
        await addDoc(collection(db, "adminprojects"), {
          name,
          description,
          mentor,
          students: selectedStudents,
          type,
          image: imageUrl || "/placeholder.svg",
          createdAt: new Date(),
          status: "private",
          isArchived: false,
        });
        toast.success("Project added successfully!");
      }
      setFormData({
        name: "",
        description: "",
        mentor: "",
        selectedStudents: [],
        type: "fyp",
        image: "",
        file: null,
      });
      loadProjects();
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Failed to submit project");
    }
  };

  const handleAddStudent = async () => {
    const { userName, email, password, confirmPassword, rank } = newStudentData;

    if (!userName || !email || !password || !confirmPassword || !rank) {
      return toast.error("All fields are required for new student");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      const snapshot = await getDocs(collection(db, "users"));
      const duplicate = snapshot.docs.find(
        (doc) => doc.data().email === email || doc.data().userName === userName
      );
      if (duplicate) {
        return toast.error("Username or email already exists!");
      }

      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUid = userCred.user.uid;

      const studentDoc = {
        uid: newUid,
        userName,
        email,
        role: "student",
        rank,
        firstName: "",
        lastName: "",
        address: "",
        dob: "",
        profilePic: "",
        description: "",
        isActiveMember: false,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", newUid), studentDoc);

      toast.success("Student created successfully");

      const updatedStudents = [...students, studentDoc];
      setStudents(updatedStudents);

      if (formData.selectedStudents.length < 3) {
        setFormData((prev) => ({
          ...prev,
          selectedStudents: [...prev.selectedStudents, newUid],
        }));
      }

      setNewStudentData({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        rank: "",
      });
    } catch (err: any) {
      console.error("Error adding student:", err);
      toast.error("Failed to create student: " + err.message);
    }
  };

  const handleEditProject = (project: any) => {
    setEditId(project.id);
    setFormData({
      name: project.name || "",
      description: project.description || "",
      mentor: project.mentor || "",
      selectedStudents: project.students || [],
      type: project.type || "fyp",
      image: project.image || "",
      file: null,
    });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({
      name: "",
      description: "",
      mentor: "",
      selectedStudents: [],
      type: "fyp",
      image: "",
      file: null,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-800 via-purple-700 to-white py-8">
      <div
        style={{ marginTop: 100, marginBottom: 100 }}
        className="w-full max-w-7xl bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left: Form */}
        <div className="flex-1 p-8 md:p-12 bg-white">
          <div className="w-16 h-1 bg-purple-600 rounded mb-6" />
          <h2 className="text-2xl font-bold mb-6 text-purple-700">
            {editId ? "Edit Project" : "Add Project (Admin)"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Project Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, file: e.target.files?.[0] || null })
              }
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
            />
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
                className="mt-2 h-32 w-full object-cover rounded-lg border border-gray-200 shadow"
              />
            )}
            <textarea
              placeholder="Project Description"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            />
            <select
              value={formData.mentor}
              onChange={(e) =>
                setFormData({ ...formData, mentor: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            >
              <option value="">Select Mentor</option>
              {mentors.map((mentor) => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.userName}
                </option>
              ))}
            </select>
            <div>
              <label className="block mb-1 font-medium">
                Select Students (max 3)
              </label>
              <div className="flex gap-2 flex-wrap mb-2">
                {formData.selectedStudents.map((studentUid) => {
                  const student = students.find((s) => s.id === studentUid);
                  return (
                    <span
                      key={studentUid}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1 text-sm"
                    >
                      {student ? student.userName : studentUid}
                      <button
                        type="button"
                        className="ml-1 text-red-500 hover:text-red-700"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            selectedStudents: prev.selectedStudents.filter(
                              (s) => s !== studentUid
                            ),
                          }))
                        }
                        aria-label="Remove"
                      >
                        &times;
                      </button>
                    </span>
                  );
                })}
              </div>
              <select
                value=""
                disabled={formData.selectedStudents.length >= 3}
                onChange={(e) => {
                  const selected = e.target.value;
                  if (
                    selected &&
                    !formData.selectedStudents.includes(selected) &&
                    formData.selectedStudents.length < 3
                  ) {
                    setFormData((prev) => ({
                      ...prev,
                      selectedStudents: [...prev.selectedStudents, selected],
                    }));
                  }
                }}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
              >
                <option value="">Select Student</option>
                {students
                  .filter(
                    (student) => !formData.selectedStudents.includes(student.id)
                  )
                  .map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.userName}
                    </option>
                  ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setIsStudentModalOpen(true)}
              className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600"
            >
              Add Student
            </button>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            >
              <option value="fyp">FYP</option>
              <option value="ongoing">On Going</option>
            </select>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className={`flex-1 text-white p-3 rounded-lg font-semibold shadow transition-colors ${
                  editId
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {editId ? "Update Project" : "Add Project"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          {/* Student Modal */}
          {isStudentModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
                  onClick={() => setIsStudentModalOpen(false)}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h4 className="text-lg font-semibold text-purple-700 mb-4 text-center">
                  Add New Student
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Username"
                    value={newStudentData.userName}
                    onChange={(e) =>
                      setNewStudentData({
                        ...newStudentData,
                        userName: e.target.value,
                      })
                    }
                    className="border px-3 py-2 rounded"
                  />
                  <input
                    placeholder="Email"
                    type="email"
                    value={newStudentData.email}
                    onChange={(e) =>
                      setNewStudentData({
                        ...newStudentData,
                        email: e.target.value,
                      })
                    }
                    className="border px-3 py-2 rounded"
                  />
                  <input
                    placeholder="Password"
                    type="password"
                    value={newStudentData.password}
                    onChange={(e) =>
                      setNewStudentData({
                        ...newStudentData,
                        password: e.target.value,
                      })
                    }
                    className="border px-3 py-2 rounded"
                  />
                  <input
                    placeholder="Confirm Password"
                    type="password"
                    value={newStudentData.confirmPassword}
                    onChange={(e) =>
                      setNewStudentData({
                        ...newStudentData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="border px-3 py-2 rounded"
                  />
                  <select
                    value={newStudentData.rank}
                    onChange={(e) =>
                      setNewStudentData({
                        ...newStudentData,
                        rank: e.target.value,
                      })
                    }
                    className="col-span-2 border px-3 py-2 rounded"
                  >
                    <option value="">Select Rank</option>
                    {studentRankOptions.map((rank) => (
                      <option key={rank} value={rank}>
                        {rank.replace(/fypstudent/i, "FYP Student")}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await handleAddStudent();
                    setIsStudentModalOpen(false);
                  }}
                  className="w-full mt-4 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Create & Add Student
                </button>
              </div>
            </div>
          )}
          <ToastContainer />
        </div>
        {/* Right: Existing Projects */}
        <div className="flex-1 bg-gray-50 p-8 md:p-12 border-l border-gray-100 overflow-y-auto max-h-[60vh] md:max-h-[70vh] xl:max-h-[100vh]">
          <div className="w-16 h-1 bg-purple-600 rounded mb-6" />
          <h3 className="text-xl font-bold mb-6 text-purple-700">
            Existing Projects
          </h3>
          <div className="space-y-4 max-h-[75%] overflow-y-auto">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No projects found.
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className={`p-4 border rounded-lg transition-colors flex items-center justify-between bg-white border-gray-200`}
                >
                  <div>
                    <div className="font-semibold text-blue-700">
                      {project.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Mentor:{" "}
                      {mentors.find((m) => m.id === project.mentor)?.userName ||
                        project.mentor}
                    </div>
                    <div className="text-xs text-gray-500">
                      Type: {project.type}
                    </div>
                    <div className="text-sm text-gray-700 line-clamp-2 mt-1">
                      {project.description}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.students &&
                        project.students.map((uid: string) => (
                          <span
                            key={uid}
                            className="bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-xs"
                          >
                            {students.find((s) => s.id === uid)?.userName ||
                              uid}
                          </span>
                        ))}
                    </div>
                  </div>
                  <button
                    className="ml-3 px-4 py-2 text-sm rounded-lg font-semibold transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200"
                    onClick={() => handleEditProject(project)}
                  >
                    Edit
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProjectAdmin;
