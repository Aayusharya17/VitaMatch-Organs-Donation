import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LearnMore = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-6 md:px-12 py-20">

      {/* Gradient blobs */}
      <div className="absolute top-[-120px] left-[-120px] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-120px] right-[-120px] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative max-w-4xl mx-auto text-center"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
          Learn More About <span className="text-blue-600">Organ Donation</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Discover how <span className="font-semibold text-blue-600">VitaMatch</span>{" "}
          ethically connects donors, hospitals, and recipients to save lives.
        </p>
      </motion.div>

      {/* HERO IMAGE (REDUCED SIZE) */}
      <div className="max-w-4xl mx-auto mt-12">
        <img
          src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5"
          alt="Organ Donation"
          className="w-full max-h-[420px] object-cover rounded-3xl shadow-xl"
        />
      </div>

      {/* IMPACT STATS */}
      <div className="max-w-6xl mx-auto mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        {[
          { value: "8+", label: "Lives Saved per Donor" },
          { value: "500K+", label: "Patients Waiting" },
          { value: "90%", label: "Successful Transplants" },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
            <h3 className="text-4xl font-extrabold text-blue-600 mb-2">
              {item.value}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{item.label}</p>
          </div>
        ))}
      </div>

      {/* WHY DONATION */}
      <div className="max-w-6xl mx-auto mt-32">
        <h2 className="text-3xl font-bold text-center mb-14">
          Why Organ Donation Matters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              img: "https://cdn-icons-png.flaticon.com/512/2966/2966480.png",
              title: "Save Multiple Lives",
              desc: "One donor can save up to 8 lives and improve many more.",
            },
            {
              img: "https://cdn-icons-png.flaticon.com/512/4320/4320353.png",
              title: "Critical Shortage",
              desc: "Thousands wait every year due to lack of donors.",
            },
            {
              img: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png",
              title: "Long-Lasting Impact",
              desc: "Donation heals families and strengthens communities.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center"
            >
              <img src={item.img} alt={item.title} className="h-28 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-blue-600 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DONOR JOURNEY */}
      <div className="max-w-6xl mx-auto mt-32">
        <h2 className="text-3xl font-bold text-center mb-16">
          Donor Journey
        </h2>

        {/* OUTER CARD */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-3xl shadow-2xl px-8 py-14 md:px-14">

          <div className="relative">

            {/* CONNECTING LINE (ALIGNED AT TOP OF CIRCLES) */}
            <div className="hidden md:block absolute top-5 left-0 right-0 h-1 bg-blue-600/70" />

            <div className="flex flex-col md:flex-row justify-between gap-14">
              {[
                {
                  title: "Make the Decision",
                  desc: "A powerful choice driven by compassion.",
                  img: "https://cdn-icons-png.flaticon.com/512/2920/2920277.png",
                },
                {
                  title: "Register Securely",
                  desc: "Encrypted, consent-driven registration.",
                  img: "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
                },
                {
                  title: "Hospital Approval",
                  desc: "Verified hospitals ensure ethical use.",
                  img: "https://cdn-icons-png.flaticon.com/512/2966/2966480.png",
                },
                {
                  title: "Lives Are Saved",
                  desc: "Your choice gives others a second chance.",
                  img: "https://cdn-icons-png.flaticon.com/512/833/833472.png",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="relative flex flex-col items-center text-center w-full md:w-1/4"
                >
                  {/* STEP CIRCLE */}
                  <div className="relative z-10 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-4 border-white dark:border-gray-800">
                    {i + 1}
                  </div>

                  {/* INNER CARD */}
                  <div className="mt-6 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md hover:shadow-xl transition">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="h-20 mx-auto mb-4"
                    />
                    <h3 className="font-semibold text-blue-600 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="mt-36 text-center"
      >
        <h2 className="text-3xl font-bold mb-5">
          Ready to Make a Difference?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-10 text-lg">
          One decision today can save lives tomorrow.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button
            onClick={() => navigate("/signup")}
            className="px-10 py-4 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition"
          >
            Become a Donor
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-10 py-4 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-800 transition"
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LearnMore;
