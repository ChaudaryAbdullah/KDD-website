import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// Types
interface UserProfile {
  uid: string; // Added uid for navigation
  userName: string;
  firstName: string;
  lastName: string;
  role: string;
  rank: string;
  email?: string;
  profilePic?: string;
  description?: string;
  isActiveMember: boolean;
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

// Rank Hierarchy
const MENTOR_RANK_HIERARCHY = [
  "founder",
  "cofounder",
  "director",
  "head",
  "instructor",
  "researcher",
];

const STUDENT_RANK_HIERARCHY = ["fypstudent", "internee", "alumni"];

// Utilities
function getRankInfo(rank: string) {
  const rankLower = rank ? rank.toLowerCase() : "";
  const rankConfigs = {
    founder: {
      display: "Founder",
      color: "from-yellow-400 to-orange-500",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-300",
    },
    cofounder: {
      display: "Co-Founder",
      color: "from-yellow-300 to-orange-400",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-200",
    },
    director: {
      display: "Director",
      color: "from-purple-400 to-pink-500",
      textColor: "text-purple-800",
      borderColor: "border-purple-300",
    },
    head: {
      display: "Head",
      color: "from-blue-400 to-indigo-500",
      textColor: "text-blue-800",
      borderColor: "border-blue-300",
    },
    instructor: {
      display: "Instructor",
      color: "from-green-400 to-teal-500",
      textColor: "text-green-800",
      borderColor: "border-green-300",
    },
    researcher: {
      display: "Researcher",
      color: "from-green-400 to-teal-500",
      textColor: "text-green-800",
      borderColor: "border-green-300",
    },
    mentor: {
      display: "Mentor",
      color: "from-rose-400 to-pink-500",
      textColor: "text-rose-800",
      borderColor: "border-rose-300",
    },
    fypstudent: {
      display: "FYP Student",
      color: "from-indigo-400 to-purple-500",
      textColor: "text-indigo-800",
      borderColor: "border-indigo-300",
    },
    internee: {
      display: "Internee",
      color: "from-cyan-400 to-blue-500",
      textColor: "text-cyan-800",
      borderColor: "border-cyan-300",
    },
    alumni: {
      display: "Alumni",
      color: "from-gray-400 to-slate-500",
      textColor: "text-gray-800",
      borderColor: "border-gray-300",
    },
    other: {
      display: "Other",
      color: "from-gray-300 to-gray-400",
      textColor: "text-gray-700",
      borderColor: "border-gray-200",
    },
  };
  return (
    rankConfigs[rankLower as keyof typeof rankConfigs] || rankConfigs["other"]
  );
}

function groupUsersByRank(users: UserProfile[], hierarchy: string[]) {
  const grouped: Record<string, UserProfile[]> = {};
  users.forEach((user) => {
    const rank = user.rank?.toLowerCase() || "other";
    const validRank = hierarchy.includes(rank) ? rank : "other";
    if (!grouped[validRank]) grouped[validRank] = [];
    grouped[validRank].push(user);
  });
  Object.values(grouped).forEach((group) =>
    group.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(
        `${b.firstName} ${b.lastName}`
      )
    )
  );
  return grouped;
}

// Components
function ProfileCard({
  user,
  showInactiveLabel = false,
}: {
  user: UserProfile;
  showInactiveLabel?: boolean;
}) {
  const rankInfo = getRankInfo(user.rank);
  const navigate = useNavigate();
  const isClickable = user.isActiveMember && user.uid;
  return (
    <motion.div
      whileHover={
        isClickable
          ? { scale: 1.06, boxShadow: "0 8px 32px rgba(80,0,120,0.12)" }
          : {}
      }
      className={`bg-gradient-to-br ${
        rankInfo.color
      } p-6 rounded-2xl shadow-xl flex flex-col items-center border-2 ${
        rankInfo.borderColor
      } transition-all duration-200 ${
        !user.isActiveMember
          ? "opacity-75"
          : isClickable
          ? "cursor-pointer hover:ring-4 hover:ring-purple-300"
          : ""
      } min-w-[250px] max-w-full sm:min-w-[250px] sm:max-w-[300px] md:min-w-[300px] md:max-w-[400px] w-full`}
      onClick={() => isClickable && navigate(`/profile/${user.uid}`)}
      style={{ pointerEvents: isClickable ? "auto" : "none" }}
    >
      <div className="relative mb-4">
        <img
          src={user.profilePic || "/placeholder.svg"}
          alt={user.userName}
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
        />
        <span
          className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold bg-white ${rankInfo.textColor} shadow-md border`}
        >
          {rankInfo.display}
        </span>
        {showInactiveLabel && !user.isActiveMember && (
          <span className="absolute -bottom-2 -right-2 px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-md border">
            Inactive
          </span>
        )}
      </div>
      <h2 className="text-xl font-bold text-white mb-1 text-center">
        {user.firstName} {user.lastName}
      </h2>
      <p className="text-sm font-semibold text-white/90 mb-1">
        @{user.userName}
      </p>
      <p className="text-xs text-white/80 text-center">{user.email}</p>
      {user.description && (
        <p className="text-xs text-white/80 text-center mt-2 line-clamp-2">
          {user.description}
        </p>
      )}
    </motion.div>
  );
}

function ProjectCard({ project }: { project: Project }) {
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
      // Try parsing as string or number
      const dateObj = new Date(project.createdAt);
      displayDate = isNaN(dateObj.getTime())
        ? ""
        : dateObj.toLocaleDateString();
    }
  }
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 rounded-2xl shadow-lg border border-blue-200 flex flex-col transition-all duration-200 w-full"
    >
      <div className="relative mb-3 h-40 rounded-xl overflow-hidden shadow">
        <img
          src={project.image || "/placeholder.svg"}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold shadow bg-purple-600 text-white">
          {project.Mentor}
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

function RankSection({
  rank,
  users,
  showInactiveLabel = false,
}: {
  rank: string;
  users: UserProfile[];
  showInactiveLabel?: boolean;
}) {
  const rankInfo = getRankInfo(rank);

  // Dynamic grid classes based on number of users
  const getGridClasses = (userCount: number) => {
    if (userCount === 1) {
      return "flex justify-center"; // Single card centered
    } else if (userCount === 2) {
      return "grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center max-w-2xl mx-auto"; // Two cards centered
    } else if (userCount <= 6) {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center"; // Small groups
    } else {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center"; // Large groups
    }
  };

  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className={`text-4xl font-bold ${rankInfo.textColor} mb-2`}>
          {rankInfo.display}s
        </h2>
        <div
          className={`w-32 h-1 bg-gradient-to-r ${rankInfo.color} mx-auto rounded-full`}
        ></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={getGridClasses(users.length)}>
          {users.map((user) => (
            <ProfileCard
              key={user.userName}
              user={user}
              showInactiveLabel={showInactiveLabel}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function InactiveUsersSection({
  inactiveMentors,
  inactiveStudents,
}: {
  inactiveMentors: Record<string, UserProfile[]>;
  inactiveStudents: Record<string, UserProfile[]>;
}) {
  // Combine all inactive users
  const allInactiveUsers: UserProfile[] = [];

  // Add inactive mentors
  MENTOR_RANK_HIERARCHY.forEach((rank) => {
    if (inactiveMentors[rank]?.length > 0) {
      allInactiveUsers.push(...inactiveMentors[rank]);
    }
  });

  // Add inactive students
  STUDENT_RANK_HIERARCHY.forEach((rank) => {
    if (inactiveStudents[rank]?.length > 0) {
      allInactiveUsers.push(...inactiveStudents[rank]);
    }
  });

  if (allInactiveUsers.length === 0) return null;

  // Dynamic layout for inactive users
  const getInactiveGridClasses = (userCount: number) => {
    if (userCount === 1) {
      return "flex justify-center";
    } else if (userCount === 2) {
      return "grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center max-w-2xl mx-auto";
    } else if (userCount <= 6) {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center";
    } else {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center";
    }
  };

  return (
    <div className="mb-16 bg-gray-50 py-12 rounded-2xl">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-600 mb-2">
          Inactive Members
        </h2>
        <div className="w-32 h-1 bg-gradient-to-r from-gray-400 to-gray-500 mx-auto rounded-full"></div>
        <p className="text-lg text-gray-500 mt-4">
          Former team members who are no longer active
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Inactive Mentors */}
        {MENTOR_RANK_HIERARCHY.some(
          (rank) => inactiveMentors[rank]?.length > 0
        ) && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-700 mb-6 text-center">
              Mentors
            </h3>
            <div
              className={getInactiveGridClasses(
                MENTOR_RANK_HIERARCHY.reduce(
                  (acc, rank) => acc + (inactiveMentors[rank]?.length || 0),
                  0
                )
              )}
            >
              {MENTOR_RANK_HIERARCHY.map((rank) =>
                inactiveMentors[rank]?.map((user) => (
                  <ProfileCard
                    key={user.userName}
                    user={user}
                    showInactiveLabel={true}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Inactive Students */}
        {STUDENT_RANK_HIERARCHY.some(
          (rank) => inactiveStudents[rank]?.length > 0
        ) && (
          <div>
            <h3 className="text-2xl font-bold text-gray-700 mb-6 text-center">
              Students
            </h3>
            <div
              className={getInactiveGridClasses(
                STUDENT_RANK_HIERARCHY.reduce(
                  (acc, rank) => acc + (inactiveStudents[rank]?.length || 0),
                  0
                )
              )}
            >
              {STUDENT_RANK_HIERARCHY.map((rank) =>
                inactiveStudents[rank]?.map((user) => (
                  <ProfileCard
                    key={user.userName}
                    user={user}
                    showInactiveLabel={true}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Portfolio Page
export default function PortfolioPage() {
  const [activeMentorsByRank, setActiveMentorsByRank] = useState<
    Record<string, UserProfile[]>
  >({});
  const [inactiveMentorsByRank, setInactiveMentorsByRank] = useState<
    Record<string, UserProfile[]>
  >({});
  const [activeStudentsByRank, setActiveStudentsByRank] = useState<
    Record<string, UserProfile[]>
  >({});
  const [inactiveStudentsByRank, setInactiveStudentsByRank] = useState<
    Record<string, UserProfile[]>
  >({});
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const users: UserProfile[] = [];
        const mentorUidToUsername: Record<string, string> = {};

        usersSnapshot.forEach((docSnap) => {
          const userData = docSnap.data() as Omit<UserProfile, "uid">;
          users.push({ ...userData, uid: docSnap.id }); // Attach uid
          // Map UID to username if UID is present
          if (docSnap.id && userData.userName) {
            mentorUidToUsername[docSnap.id] = userData.userName;
          }
        });

        const mentors = users.filter((u) => u.role === "mentor");
        const students = users.filter((u) => u.role === "student");

        const activeMentors = mentors.filter((m) => m.isActiveMember);
        const inactiveMentors = mentors.filter((m) => !m.isActiveMember);
        const activeStudents = students.filter((s) => s.isActiveMember);
        const inactiveStudents = students.filter((s) => !s.isActiveMember);

        setActiveMentorsByRank(
          groupUsersByRank(activeMentors, MENTOR_RANK_HIERARCHY)
        );
        setInactiveMentorsByRank(
          groupUsersByRank(inactiveMentors, MENTOR_RANK_HIERARCHY)
        );
        setActiveStudentsByRank(
          groupUsersByRank(activeStudents, STUDENT_RANK_HIERARCHY)
        );
        setInactiveStudentsByRank(
          groupUsersByRank(inactiveStudents, STUDENT_RANK_HIERARCHY)
        );

        // Fetch projects after users so we can map mentor UID to username
        try {
          const projectsSnapshot = await getDocs(collection(db, "projects"));
          const parsedProjects: Project[] = [];

          projectsSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status === "public") {
              // Replace Mentor UID with username if possible
              let mentorUsername = data.Mentor;
              if (mentorUidToUsername[data.Mentor]) {
                mentorUsername = mentorUidToUsername[data.Mentor];
              }
              parsedProjects.push({
                id: doc.id,
                ...data,
                Mentor: mentorUsername,
              } as Project);
            }
          });

          // Sort projects by date descending
          parsedProjects.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setProjects(parsedProjects);
        } catch (error) {
          console.error("Error loading projects from Firestore:", error);
        }
      } catch (error) {
        console.error("Error loading users from Firestore:", error);
      }
    };

    fetchData();
  }, []);

  // Dynamic grid classes for projects
  const getProjectGridClasses = (projectCount: number) => {
    if (projectCount === 1) {
      return "flex justify-center max-w-md mx-auto";
    } else if (projectCount === 2) {
      return "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto";
    } else {
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
    }
  };

  return (
    <div className="pt-24 bg-gradient-to-br from-violet-800 via-purple-700 to-purple-600">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <section className="py-20 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Portfolio Gallery</h1>
          <p className="text-xl opacity-90">
            Showcase of our team members and projects organized by hierarchy
          </p>
        </section>

        <div className="py-16 bg-gradient-to-b from-white to-gray-100">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Our Team</h1>
            <p className="text-lg text-gray-600">
              Meet our amazing team members organized by their roles
            </p>
          </div>

          {/* Active Mentors */}
          {MENTOR_RANK_HIERARCHY.map(
            (rank) =>
              activeMentorsByRank[rank]?.length > 0 && (
                <RankSection
                  key={`mentor-${rank}-active`}
                  rank={rank}
                  users={activeMentorsByRank[rank]}
                />
              )
          )}

          {/* Active Students */}
          {STUDENT_RANK_HIERARCHY.map(
            (rank) =>
              activeStudentsByRank[rank]?.length > 0 && (
                <RankSection
                  key={`student-${rank}-active`}
                  rank={rank}
                  users={activeStudentsByRank[rank]}
                />
              )
          )}

          {/* Inactive Users Section */}
          <InactiveUsersSection
            inactiveMentors={inactiveMentorsByRank}
            inactiveStudents={inactiveStudentsByRank}
          />

          {/* Projects Section */}
          {projects.length > 0 && (
            <>
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-blue-700 mb-4">
                  Our Projects
                </h1>
                <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                  className={`${getProjectGridClasses(projects.length)} pb-10`}
                >
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
