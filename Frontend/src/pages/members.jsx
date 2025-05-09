import { motion } from "framer-motion";
import { Spotlight } from "../components/ui/spotlight";
import Header from "../components/header"
import Footer from "../components/footer"

const teamMembers = [
  {
    name: "Ayon Paul",
    role: "Frontend Developer",
    image: "/ayon.jpg",
  },
  {
    name: "Arnab Ghosh",
    role: "FullStack Developer",
    image: "/arnab.jpg",
  },
  {
    name: "Soumi Das",
    role: "UI/UX Designer",
    image: "/soumi.jpg",
  },
  {
    name: "Archismita Das",
    role: "Project Manager",
    image: "/archismita.jpg",
  },
  {
    name: "Archak Khandayit",
    role: "Fullstack Developer",
    image: "/archak.jpg",
  },
];

export default function MembersPage() {
  return (
    <div>
    <Header />
    <section className="relative z-10 overflow-hidden py-20 bg-gradient-to-b from-neutral-900 via-neutral-800 to-black">
      <Spotlight className="-top-40 left-1/2" fill="#9333ea" />
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-4xl md:text-5xl font-extrabold text-white mb-12"
        >
          Meet Our Team
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 justify-items-center">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, rotate: [0, 1, -1, 0] }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-purple-600 shadow-xl shadow-purple-500/20 hover:shadow-pink-500/30 text-center w-full max-w-xs backdrop-blur-md hover:scale-105 transition-transform"
            >
              <img
                src={member.image}
                alt={member.name}
                className="rounded-full mx-auto mb-4 w-45 h-45 object-cover border-4 border-purple-400 shadow-lg"
              />
              <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
              <p className="text-purple-300 text-sm">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    <Footer />
    </div>
  );
}
