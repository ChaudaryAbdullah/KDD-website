import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

interface UserProfile {
  userName: string;
  firstName: string;
  lastName: string;
  role: string;
  rank: string;
  email?: string;
  profilePic?: string;
  description?: string;
  isActiveMember: boolean;
  social?: Record<string, string>;
  skills?: string[];
  projects?: { name: string; details: string; image: string }[];
}

const socialPlatforms = [
  {
    name: "LinkedIn",
    key: "linkedin",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg",
  },
  {
    name: "GitHub",
    key: "github",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  },
  {
    name: "Twitter",
    key: "twitter",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/twitter/twitter-original.svg",
  },
  {
    name: "Facebook",
    key: "facebook",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg",
  },
];

interface ProjectCardProps {
  name: string;
  details: string;
  image: string;
}

interface MentorProject {
  id: string;
  name: string;
  description: string;
  Mentor: string;
  image: string;
  status: string;
  createdAt: string;
}

export default function UserProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mentorProjects, setMentorProjects] = useState<MentorProject[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!uid) return;
      let userData: UserProfile | null = null;
      try {
        const userSnap = await getDoc(doc(db, "users", uid));
        if (userSnap.exists()) {
          userData = userSnap.data() as UserProfile;
        }
      } catch {}
      setUser(userData);
      setLoading(false);
    };
    fetchUser();
  }, [uid]);

  useEffect(() => {
    // If user is mentor, fetch their public projects from Firestore
    const fetchMentorProjects = async () => {
      if (user && user.role === "mentor" && uid) {
        const q = query(
          collection(db, "projects"),
          where("Mentor", "==", uid),
          where("status", "==", "public")
        );
        const snapshot = await getDocs(q);
        const projects: MentorProject[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          projects.push({ id: docSnap.id, ...data } as MentorProject);
        });
        setMentorProjects(projects);
      } else {
        setMentorProjects([]);
      }
    };
    fetchMentorProjects();
  }, [user, uid]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-center">User not found.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-800 via-purple-700 to-white py-8">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8"
        style={{ marginTop: 100 }}
      >
        <div className="flex flex-col items-center mb-8">
          <img
            src={user.profilePic || "/placeholder.svg"}
            alt={user.userName}
            className="w-32 h-32 rounded-full object-cover border-4 border-purple-300 shadow-lg mb-4"
          />
          <h2 className="text-3xl font-bold text-purple-700 mb-1 text-center">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-lg text-gray-700 mb-1">@{user.userName}</p>
          <p className="text-sm text-gray-500 mb-2">{user.email}</p>
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-2">
            {user.rank} {user.role}
          </span>
          {user.isActiveMember ? (
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold mb-2">
              Active
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold mb-2">
              Inactive
            </span>
          )}
        </div>
        {user.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">
              About
            </h3>
            <p className="text-gray-700 whitespace-pre-line">
              {user.description}
            </p>
          </div>
        )}
        {user.social && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">
              Social Links
            </h3>
            <div className="flex flex-wrap gap-3">
              {socialPlatforms.map((platform) =>
                user.social && user.social[platform.key] ? (
                  <a
                    key={platform.key}
                    href={user.social[platform.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 underline hover:text-blue-800 px-2 py-1 rounded bg-blue-50"
                  >
                    {platform.icon && (
                      <img
                        src={platform.icon}
                        alt={platform.name}
                        className="w-5 h-5"
                      />
                    )}
                    {platform.name}
                  </a>
                ) : null
              )}
            </div>
          </div>
        )}
        {user.skills && user.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* Projects Section */}
        {user.role === "student" &&
          user.projects &&
          user.projects.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-purple-700 mb-2">
                Projects
              </h3>
              <div className="space-y-4">
                {user.projects.map((proj, idx) => (
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
                  </div>
                ))}
              </div>
            </div>
          )}
        {user.role === "mentor" && mentorProjects.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">
              Public Projects
            </h3>
            <div className="space-y-4">
              {mentorProjects.map((proj) => (
                <div
                  key={proj.id}
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
                      {proj.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
