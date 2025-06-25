import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Types
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
function ProfileCard({ user }: { user: UserProfile }) {
  const rankInfo = getRankInfo(user.rank);
  return (
    <motion.div
      whileHover={{ scale: 1.06, boxShadow: "0 8px 32px rgba(80,0,120,0.12)" }}
      className={`bg-gradient-to-br ${rankInfo.color} p-6 rounded-2xl shadow-xl flex flex-col items-center border-2 ${rankInfo.borderColor} transition-all duration-200`}
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
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 rounded-2xl shadow-lg border border-blue-200 flex flex-col transition-all duration-200"
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
          {project.status}
        </span>
      </div>
    </motion.div>
  );
}

function RankSection({ rank, users }: { rank: string; users: UserProfile[] }) {
  const rankInfo = getRankInfo(rank);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {users.map((user) => (
            <ProfileCard key={user.userName} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Portfolio Page
export default function PortfolioPage() {
  const [mentorsByRank, setMentorsByRank] = useState<
    Record<string, UserProfile[]>
  >({});
  const [studentsByRank, setStudentsByRank] = useState<
    Record<string, UserProfile[]>
  >({});
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const usersRaw = localStorage.getItem("signupDataList");
    const projectsRaw = localStorage.getItem("mentorProjects");

    if (usersRaw) {
      const users: UserProfile[] = JSON.parse(usersRaw);

      const mentors = users.filter((u) => u.role === "mentor");
      const students = users.filter((u) => u.role === "student");

      const activeMentors = mentors.filter((m) => m.isActiveMember);
      const inactiveMentors = mentors.filter((m) => !m.isActiveMember);
      const activeStudents = students.filter((s) => s.isActiveMember);
      const inactiveStudents = students.filter((s) => !s.isActiveMember);

      console.log(activeStudents);
      const groupedMentors = {
        ...groupUsersByRank(activeMentors, MENTOR_RANK_HIERARCHY),
        ...groupUsersByRank(inactiveMentors, MENTOR_RANK_HIERARCHY),
      };
      const groupedStudents = {
        ...groupUsersByRank(activeStudents, STUDENT_RANK_HIERARCHY),
        ...groupUsersByRank(inactiveStudents, STUDENT_RANK_HIERARCHY),
      };

      setMentorsByRank(groupedMentors);
      setStudentsByRank(groupedStudents);
    }

    if (projectsRaw) {
      const parsedProjects: Project[] = JSON.parse(projectsRaw);
      setProjects(parsedProjects.filter((p) => p.status === "public"));
    }
  }, []);

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

          {MENTOR_RANK_HIERARCHY.map((rank) => (
            <>
              {mentorsByRank[rank]?.filter((m) => m.isActiveMember).length >
                0 && (
                <RankSection
                  key={`mentor-${rank}-active`}
                  rank={rank}
                  users={mentorsByRank[rank].filter((m) => m.isActiveMember)}
                />
              )}
              {mentorsByRank[rank]?.filter((m) => !m.isActiveMember).length >
                0 && (
                <RankSection
                  key={`mentor-${rank}-inactive`}
                  rank={rank}
                  users={mentorsByRank[rank].filter((m) => !m.isActiveMember)}
                />
              )}
            </>
          ))}

          {STUDENT_RANK_HIERARCHY.map((rank) => (
            <>
              {studentsByRank[rank]?.filter((s) => s.isActiveMember).length >
                0 && (
                <RankSection
                  key={`student-${rank}-active`}
                  rank={rank}
                  users={studentsByRank[rank].filter((s) => s.isActiveMember)}
                />
              )}
              {studentsByRank[rank]?.filter((s) => !s.isActiveMember).length >
                0 && (
                <RankSection
                  key={`student-${rank}-inactive`}
                  rank={rank}
                  users={studentsByRank[rank].filter((s) => !s.isActiveMember)}
                />
              )}
            </>
          ))}

          {projects.length > 0 && (
            <>
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-blue-700 mb-4">
                  Our Projects
                </h1>
                <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-10">
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

// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";

// // Types
// interface UserProfile {
//   userName: string;
//   firstName: string;
//   lastName: string;
//   role: "mentor" | "student";
//   rank: string;
//   email?: string;
//   profilePic?: string;
//   description?: string;
//   isActiveMember: boolean;
// }

// interface Project {
//   id: string;
//   name: string;
//   description: string;
//   Mentor: string;
//   image: string;
//   status: "private" | "public";
//   createdAt: string;
// }

// // Mentor rank hierarchy (in order of display)
// const MENTOR_RANK_HIERARCHY = [
//   "founder",
//   "cofounder",
//   "director",
//   "head",
//   "researcher",
// ];

// // Student rank hierarchy (in order of display)
// const STUDENT_RANK_HIERARCHY = ["fypstudent", "internee", "alumni"];

// // Get rank display name and styling
// function getRankInfo(rank: string) {
//   const rankLower = rank ? rank.toLowerCase() : "";
//   const rankConfigs = {
//     founder: {
//       display: "Founder",
//       color: "from-yellow-400 to-orange-500",
//       textColor: "text-yellow-800",
//       borderColor: "border-yellow-300",
//     },
//     cofounder: {
//       display: "Co-Founder",
//       color: "from-yellow-300 to-orange-400",
//       textColor: "text-yellow-700",
//       borderColor: "border-yellow-200",
//     },
//     director: {
//       display: "Director",
//       color: "from-purple-400 to-pink-500",
//       textColor: "text-purple-800",
//       borderColor: "border-purple-300",
//     },
//     head: {
//       display: "Head",
//       color: "from-blue-400 to-indigo-500",
//       textColor: "text-blue-800",
//       borderColor: "border-blue-300",
//     },
//     instructer: {
//       display: "Instructer",
//       color: "from-green-400 to-teal-500",
//       textColor: "text-green-800",
//       borderColor: "border-green-300",
//     },
//     researcher: {
//       display: "Researcher",
//       color: "from-green-400 to-teal-500",
//       textColor: "text-green-800",
//       borderColor: "border-green-300",
//     },
//     mentor: {
//       display: "Mentor",
//       color: "from-rose-400 to-pink-500",
//       textColor: "text-rose-800",
//       borderColor: "border-rose-300",
//     },
//     fypstudent: {
//       display: "FYP Student",
//       color: "from-indigo-400 to-purple-500",
//       textColor: "text-indigo-800",
//       borderColor: "border-indigo-300",
//     },
//     internee: {
//       display: "Internee",
//       color: "from-cyan-400 to-blue-500",
//       textColor: "text-cyan-800",
//       borderColor: "border-cyan-300",
//     },
//     alumni: {
//       display: "Alumni",
//       color: "from-gray-400 to-slate-500",
//       textColor: "text-gray-800",
//       borderColor: "border-gray-300",
//     },
//   };

//   return (
//     rankConfigs[rankLower as keyof typeof rankConfigs] || {
//       display: rank,
//       color: "from-gray-300 to-gray-400",
//       textColor: "text-gray-700",
//       borderColor: "border-gray-200",
//     }
//   );
// }

// // Profile card with rank-based styling
// function ProfileCard({ user }: { user: UserProfile }) {
//   const rankInfo = getRankInfo(user.rank);

//   return (
//     <motion.div
//       whileHover={{ scale: 1.06, boxShadow: "0 8px 32px rgba(80,0,120,0.12)" }}
//       className={`bg-gradient-to-br ${rankInfo.color} p-6 rounded-2xl shadow-xl flex flex-col items-center border-2 ${rankInfo.borderColor} transition-all duration-200`}
//     >
//       <div className="relative mb-4">
//         <img
//           src={user.profilePic || "/placeholder.svg"}
//           alt={user.userName}
//           className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
//         />
//         <span
//           className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold bg-white ${rankInfo.textColor} shadow-md border`}
//           title={rankInfo.display}
//         >
//           {rankInfo.display}
//         </span>
//       </div>
//       <h2 className="text-xl font-bold text-white mb-1 text-center">
//         {user.firstName} {user.lastName}
//       </h2>
//       <p className="text-sm font-semibold text-white/90 mb-1">
//         @{user.userName}
//       </p>
//       <p className="text-xs text-white/80 text-center">{user.email}</p>
//       {user.description && (
//         <p className="text-xs text-white/80 text-center mt-2 line-clamp-2">
//           {user.description}
//         </p>
//       )}
//     </motion.div>
//   );
// }

// // Project card for public projects
// function ProjectCard({ project }: { project: Project }) {
//   return (
//     <motion.div
//       whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(0,80,180,0.13)" }}
//       className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 rounded-2xl shadow-lg border border-blue-200 flex flex-col transition-all duration-200"
//     >
//       <div className="relative mb-3 h-40 rounded-xl overflow-hidden shadow">
//         <img
//           src={project.image || "/placeholder.svg"}
//           alt={project.name}
//           className="w-full h-full object-cover"
//         />
//         <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold shadow bg-purple-600 text-white">
//           {project.Mentor.charAt(0).toUpperCase() + project.Mentor.slice(1)}
//         </span>
//       </div>
//       <h3 className="font-bold text-lg text-blue-900 mb-1">{project.name}</h3>
//       <p className="text-sm text-gray-700 mb-2 line-clamp-3">
//         {project.description.length > 120
//           ? project.description.slice(0, 120) + "..."
//           : project.description}
//       </p>
//       <div className="flex justify-between items-center mt-auto">
//         <span className="text-xs text-gray-400">
//           {new Date(project.createdAt).toLocaleDateString()}
//         </span>
//         <span
//           className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//             project.status === "public"
//               ? "bg-green-100 text-green-700"
//               : "bg-gray-200 text-gray-500"
//           }`}
//         >
//           {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
//         </span>
//       </div>
//     </motion.div>
//   );
// }

// // Section component for each rank
// function RankSection({ rank, users }: { rank: string; users: UserProfile[] }) {
//   if (users.length === 0) return null;

//   const rankInfo = getRankInfo(rank);

//   return (
//     <div className="mb-16">
//       <div className="text-center mb-8">
//         <h2 className={`text-4xl font-bold ${rankInfo.textColor} mb-2`}>
//           {rankInfo.display}s
//         </h2>
//         <div
//           className={`w-32 h-1 bg-gradient-to-r ${rankInfo.color} mx-auto rounded-full`}
//         ></div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {users.map((user) => (
//             <ProfileCard key={user.userName} user={user} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function PortfolioPage() {
//   const [mentorsByRank, setMentorsByRank] = useState<
//     Record<string, UserProfile[]>
//   >({});
//   const [mentorsWithoutRank, setMentorsWithoutRank] = useState<UserProfile[]>(
//     []
//   );
//   const [studentsByRank, setStudentsByRank] = useState<
//     Record<string, UserProfile[]>
//   >({});
//   const [studentsWithoutRank, setStudentsWithoutRank] = useState<UserProfile[]>(
//     []
//   );
//   const [projects, setProjects] = useState<Project[]>([]);

//   useEffect(() => {
//     const userListRaw = localStorage.getItem("signupDataList");
//     const projectListRaw = localStorage.getItem("mentorProjects");

//     if (userListRaw) {
//       const parsedUsers: UserProfile[] = JSON.parse(userListRaw);

//       // Separate users by role
//       const mentors: UserProfile[] = [];
//       const students: UserProfile[] = [];

//       parsedUsers.forEach((user) => {
//         if (user.role === "mentor") {
//           mentors.push(user);
//         } else {
//           students.push(user);
//         }
//       });

//       // Process mentors
//       const mentorsWithRanks: UserProfile[] = [];
//       const mentorsWithoutRanks: UserProfile[] = [];

//       mentors.forEach((mentor) => {
//         if (
//           mentor.rank &&
//           mentor.rank.trim() !== "" &&
//           MENTOR_RANK_HIERARCHY.includes(mentor.rank.toLowerCase())
//         ) {
//           mentorsWithRanks.push(mentor);
//         } else {
//           mentorsWithoutRanks.push(mentor);
//         }
//       });

//       // Group mentors with ranks
//       const groupedMentors = mentorsWithRanks.reduce((acc, mentor) => {
//         const rank = mentor.rank.toLowerCase();
//         if (!acc[rank]) {
//           acc[rank] = [];
//         }
//         acc[rank].push(mentor);
//         return acc;
//       }, {} as Record<string, UserProfile[]>);

//       // Process students
//       const studentsWithRanks: UserProfile[] = [];
//       const studentsWithoutRanks: UserProfile[] = [];

//       students.forEach((student) => {
//         if (
//           student.rank &&
//           student.rank.trim() !== "" &&
//           STUDENT_RANK_HIERARCHY.includes(student.rank.toLowerCase())
//         ) {
//           studentsWithRanks.push(student);
//         } else {
//           studentsWithoutRanks.push(student);
//         }
//       });

//       // Group students with ranks
//       const groupedStudents = studentsWithRanks.reduce((acc, student) => {
//         const rank = student.rank.toLowerCase();
//         if (!acc[rank]) {
//           acc[rank] = [];
//         }
//         acc[rank].push(student);
//         return acc;
//       }, {} as Record<string, UserProfile[]>);

//       // Sort users within each rank by name
//       Object.keys(groupedMentors).forEach((rank) => {
//         groupedMentors[rank].sort((a, b) =>
//           `${a.firstName} ${a.lastName}`.localeCompare(
//             `${b.firstName} ${b.lastName}`
//           )
//         );
//       });

//       Object.keys(groupedStudents).forEach((rank) => {
//         groupedStudents[rank].sort((a, b) =>
//           `${a.firstName} ${a.lastName}`.localeCompare(
//             `${b.firstName} ${b.lastName}`
//           )
//         );
//       });

//       // Sort users without ranks by name
//       mentorsWithoutRanks.sort((a, b) =>
//         `${a.firstName} ${a.lastName}`.localeCompare(
//           `${b.firstName} ${b.lastName}`
//         )
//       );

//       studentsWithoutRanks.sort((a, b) =>
//         `${a.firstName} ${a.lastName}`.localeCompare(
//           `${b.firstName} ${b.lastName}`
//         )
//       );

//       setMentorsByRank(groupedMentors);
//       setMentorsWithoutRank(mentorsWithoutRanks);
//       setStudentsByRank(groupedStudents);
//       setStudentsWithoutRank(studentsWithoutRanks);
//     }

//     if (projectListRaw) {
//       const parsedProjects: Project[] = JSON.parse(projectListRaw);
//       setProjects(parsedProjects.filter((p) => p.status === "public"));
//     }
//   }, []);

//   // Get ordered ranks that have users
//   const orderedMentorRanks = MENTOR_RANK_HIERARCHY.filter(
//     (rank) => mentorsByRank[rank] && mentorsByRank[rank].length > 0
//   );

//   const orderedStudentRanks = STUDENT_RANK_HIERARCHY.filter(
//     (rank) => studentsByRank[rank] && studentsByRank[rank].length > 0
//   );

//   return (
//     <div className="pt-24 bg-gradient-to-br from-violet-800 via-purple-700 to-purple-600">
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         {/* Hero Section */}
//         <section className="py-20 bg-gradient-to-br from-violet-800 via-purple-700 to-purple-600">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//             <h1 className="text-5xl font-bold text-white mb-4">
//               Portfolio Gallery
//             </h1>
//             <p className="text-xl text-white/85 max-w-3xl mx-auto">
//               Showcase of our team members and projects organized by hierarchy
//             </p>
//           </div>
//         </section>

//         <div className="py-16 bg-gradient-to-b from-white to-gray-100">
//           {/* Team Members by Rank */}
//           <div className="mb-20">
//             <div className="text-center mb-12">
//               <h1 className="text-5xl font-bold text-gray-800 mb-4">
//                 Our Team
//               </h1>
//               <p className="text-lg text-gray-600">
//                 Meet our amazing team members organized by their roles
//               </p>
//             </div>

//             {/* Display mentors with ranks first */}
//             {orderedMentorRanks.map((rank) => (
//               <RankSection key={rank} rank={rank} users={mentorsByRank[rank]} />
//             ))}

//             {/* Display mentors without ranks */}
//             {mentorsWithoutRank.length > 0 && (
//               <RankSection rank="mentor" users={mentorsWithoutRank} />
//             )}

//             {/* Display students with ranks */}
//             {orderedStudentRanks.map((rank) => (
//               <RankSection
//                 key={rank}
//                 rank={rank}
//                 users={studentsByRank[rank]}
//               />
//             ))}

//             {/* Display students without ranks */}
//             {studentsWithoutRank.length > 0 && (
//               <RankSection rank="student" users={studentsWithoutRank} />
//             )}
//           </div>

//           {/* Projects Section */}
//           {projects.length > 0 && (
//             <>
//               <div className="text-center mb-12">
//                 <h1 className="text-4xl font-bold text-blue-700 mb-4">
//                   Our Projects
//                 </h1>
//                 <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
//               </div>
//               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-10">
//                   {projects.map((project) => (
//                     <ProjectCard key={project.id} project={project} />
//                   ))}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </motion.div>
//     </div>
//   );
// }
