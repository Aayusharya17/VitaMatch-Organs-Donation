import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import heart from "../assets/heart.json";
// import donor from "../assets/doner.png";
import logo from "../assets/logo.png";

const footerLinks = [
  { label: "Home", path: "/" },
  { label: "Become a Donor", path: "/signup" },
  { label: "Hospitals & Clinics", path: "/signup" },
  { label: "How It Works", path: "/learn-more" },
  { label: "FAQs", path: "/faq" },
];

const Home = () => {
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">

      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} alt="VitaMatch Logo" className="h-[60px] w-auto " />
            
          </div>

          {/* Center / Right */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-blue-600 transition"
            >
              Home
            </button>

            <button
              onClick={() => navigate("/login")}
              className="hover:text-blue-600 transition"
            >
              Login
            </button>

            <button
              onClick={toggleDark}
              className="text-xl"
              aria-label="Toggle Dark Mode"
            >
              {dark ? "🌞" : "🌙"}
            </button>
          </div>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <div className="px-6 md:px-12 pt-32">
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex flex-col md:flex-row items-center justify-between gap-10
                     bg-white dark:bg-gray-900
                     rounded-2xl p-8 md:p-12
                     shadow-md hover:shadow-xl
                     transition-shadow duration-300"
        >
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-lg"
          >
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Give Life a Second Chance
            </h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">
              VitaMatch is a secure organ donation platform connecting verified
              donors, hospitals, and patients to ensure timely life-saving
              transplants.
            </p>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg
                           shadow-md hover:bg-blue-700 hover:shadow-lg
                           transition-all"
              >
                Become a Donor
              </button>

              <button
                onClick={() => navigate("/learn-more")}
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg
                           hover:bg-blue-50 dark:hover:bg-gray-800 transition"
              >
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Right Animation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Lottie animationData={heart} loop className="w-[320px] md:w-[420px]" />
          </motion.div>
        </motion.div>
      </div>

      {/* ================= WHY SECTION ================= */}
      <div className="text-center py-20 max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-4">
          Why Organ Donation Matters
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Every year, thousands of patients wait for organ transplants, but many
          never receive them. A single donor can save{" "}
          <span className="font-semibold">up to 8 lives</span> and improve many
          more.
        </p>
      </div>

      {/* ================= HOW IT WORKS ================= */}
      <div className="py-16 px-6 md:px-12">
        <h2 className="text-3xl font-bold text-center mb-12">
          How VitaMatch Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Register as Donor",
              desc: "Sign up and securely register your consent for organ donation.",
            },
            {
              title: "Hospital Verification",
              desc: "Hospitals verify donor and patient information for authenticity.",
            },
            {
              title: "Life-Saving Match",
              desc: "Our system connects donors with patients who need them most.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition"
            >
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ================= IMAGE + STORY ================= */}
      <div className="py-20 px-6 md:px-12 flex flex-col md:flex-row items-center gap-10">
        {/* <img
          src={donor}
          alt="Organ Donation"
          className="w-full md:w-1/2 rounded-2xl shadow-lg"
        /> */}

        <div className="max-w-xl">
          <h2 className="text-3xl font-bold mb-4">
            One Decision Can Save Many Lives
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Organ donation is an act of compassion. Your choice today can give
            someone another chance to live tomorrow.
          </p>

          <button
            onClick={() => navigate("/signup")}
            className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Pledge to Donate
          </button>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 px-6 md:px-12">
        {[
          { value: "8+", label: "Lives Saved per Donor" },
          { value: "50,000+", label: "Patients Waiting" },
          { value: "1 Act", label: "Can Change a Life" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow text-center"
          >
            <div className="text-4xl font-bold text-blue-600 mb-1">{s.value}</div>
            <div className="text-gray-700 dark:text-gray-300">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-100 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">

  <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

    {/* Brand & Mission */}
    <div className="lg:col-span-2">
      <h3 className="text-2xl font-bold tracking-wide">VitaMatch</h3>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        VitaMatch is a secure organ donation coordination platform designed to
        ethically connect verified donors, hospitals, and patients while
        maintaining privacy, transparency, and compliance with medical
        regulations.
      </p>

      <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
        Built for social impact. Powered by technology.
      </p>
    </div>

    {/* Platform */}
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-4">
        Platform
      </h4>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
  {footerLinks.map((link, i) => (
    <li key={i}>
      <Link
        to={link.path}
        className="hover:text-blue-600 transition-colors"
      >
        {link.label}
      </Link>
    </li>
  ))}
</ul>

    </div>

    {/* Legal */}
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-4">
        Legal
      </h4>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <li className="hover:text-blue-600 cursor-pointer">Privacy Policy</li>
        <li className="hover:text-blue-600 cursor-pointer">Terms of Service</li>
        <li className="hover:text-blue-600 cursor-pointer">Medical Disclaimer</li>
        <li className="hover:text-blue-600 cursor-pointer">Consent Policy</li>
        <li className="hover:text-blue-600 cursor-pointer">Data Protection</li>
      </ul>
    </div>

    {/* Trust & Compliance */}
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-4">
        Trust & Compliance
      </h4>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <li>✔ Verified Medical Institutions</li>
        <li>✔ Encrypted Health Records</li>
        <li>✔ Ethical Transplant Guidelines</li>
        <li>✔ Government Norms Followed</li>
        <li>✔ Secure Consent Management</li>
      </ul>
    </div>
  </div>

  {/* Bottom Bar */}
  <div className="border-t border-gray-200 dark:border-gray-800 py-6 px-6">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">

      <p>
        © {new Date().getFullYear()} VitaMatch. All rights reserved.
      </p>

      <p className="text-center md:text-right text-xs leading-relaxed">
        VitaMatch does not facilitate organ trade. All donations are voluntary
        and comply with applicable medical and legal regulations.
      </p>

    </div>
  </div>
</footer>
    </div>
  );
};

export default Home;
