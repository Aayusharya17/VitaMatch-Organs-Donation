import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

/* ================= AXIOS INSTANCE ================= */
const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

/* ================= COMPONENT ================= */
const DoctorDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState({});
  const [available, setAvailable] = useState([]);
  const [organName, setOrganName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const token = localStorage.getItem("token");
  const authHeader = { headers: { "x-access-token": token } };

 useEffect(() => {
    // if (!token) {
    //   navigate("/login");
    //   return;
    // }

    fetchDashboard();
    fetchAllocations();
  }, []);
  
  useEffect(() => {
    console.log("Allocations updated:", allocations);
  }, [allocations]);

  /* ================= API CALLS ================= */
  const fetchDashboard = async () => {
    try {
      const res = await api.get("/doctor/dashboard", authHeader);
      setDashboard(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const findAvailable = async () => {
    try {
      const res = await api.get(
        `/doctor/availableOrgans?organName=${organName}&bloodGroup=${bloodGroup}`,
        authHeader
      );
      setAvailable(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const requestOrgan = async () => {
    try {
      await api.post(
        "/doctor/requestOrgan",
        { organName, bloodGroup },
        authHeader
      );
      alert("Organ requested successfully");
      fetchDashboard();
    } catch (err) {
      console.log(err);
    }
  };

  const acceptOrgan = async (organId, requestId) => {
    try {
      await api.post(
        "/doctor/accept-organ",
        { organId, requestId: requestId || null },
        authHeader
      );
      alert("Organ accepted");
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-cyan-50 via-white to-blue-50">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 hidden md:flex flex-col p-6 text-white
        bg-gradient-to-b from-teal-700 via-cyan-700 to-blue-800 shadow-2xl">

        {/* LOGO */}
        <div
          className="flex items-center gap-3 mb-12 cursor-pointer ml-10"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="logo" className="h-10 drop-shadow-lg " />
        </div>

        {/* NAV */}
        <nav className="flex flex-col gap-2 flex-1">
          {[
            { id: "dashboard", label: "📊 Dashboard" },
            { id: "available", label: "🫀 Available Organs" },
            { id: "request", label: "➕ Request Organ" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-3 rounded-xl text-left font-medium transition-all
                ${
                  activeTab === item.id
                    ? "bg-white/20 shadow-lg border border-white/20"
                    : "hover:bg-white/10 hover:translate-x-1"
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* LOGOUT */}
        <button
          className="mt-6 px-4 py-2 rounded-xl text-red-100
          hover:bg-red-500/30 hover:text-white transition"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          🚪 Logout
        </button>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 flex flex-col">

        {/* TOP BAR (FIXED DOCTOR PANEL POSITION) */}
        <div className="bg-white shadow-sm border-b px-10 py-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Doctor Dashboard 👨‍⚕️
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Organ request monitoring & hospital allocation overview
          </p>
        </div>

        {/* CONTENT */}
        <div className="p-10 flex-1">

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="grid lg:grid-cols-2 gap-10">

              {/* MY REQUESTS */}
              <div className="bg-white rounded-3xl shadow-xl border border-cyan-100">
                <div className="p-6 border-b border-cyan-100">
                  <h2 className="text-xl font-semibold text-cyan-700">
                    👨‍⚕️ My Requests
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  {dashboard?.myRequests?.length > 0 ? (
                    dashboard.myRequests.map((r) => (
                      <motion.div
                        key={r._id}
                        whileHover={{ scale: 1.03 }}
                        className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200"
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {r.organName}
                            </p>
                            <p className="text-sm text-slate-500">
                              Blood Group: {r.bloodGroup}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-sm
                            bg-cyan-200 text-cyan-800">
                            {r.status}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-10">
                      No requests created yet
                    </p>
                  )}
                </div>
              </div>

              {/* HOSPITAL REQUESTS */}
              <div className="bg-white rounded-3xl shadow-xl border border-teal-100">
                <div className="p-6 border-b border-teal-100">
                  <h2 className="text-xl font-semibold text-teal-700">
                    🏥 Hospital Requests
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  {dashboard?.hospitalRequests?.length > 0 ? (
                    dashboard.hospitalRequests.map((h) => (
                      <motion.div
                        key={h._id}
                        whileHover={{ scale: 1.03 }}
                        className="p-4 rounded-2xl bg-teal-50 border border-teal-200"
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="font-semibold text-slate-800">
                              {h.organName}
                            </p>
                            <p className="text-sm text-slate-500">
                              Blood Group: {h.bloodGroup}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-sm
                            bg-teal-200 text-teal-800">
                            {h.status}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-10">
                      No hospital requests available
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AVAILABLE ORGANS */}
          {activeTab === "available" && (
            <>
              <div className="flex gap-3 mb-8">
                <input
                  value={organName}
                  placeholder="Organ Name"
                  className="border rounded-xl px-4 py-2"
                  onChange={(e) => setOrganName(e.target.value)}
                />
                <input
                  value={bloodGroup}
                  placeholder="Blood Group"
                  className="border rounded-xl px-4 py-2"
                  onChange={(e) => setBloodGroup(e.target.value)}
                />
                <button
                  onClick={findAvailable}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 rounded-xl"
                >
                  Search
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {available.map((o) => (
                  <motion.div
                    key={o._id}
                    whileHover={{ scale: 1.04 }}
                    className="bg-white rounded-3xl p-6 shadow border"
                  >
                    <h3 className="text-xl font-semibold">{o.organName}</h3>
                    <p className="text-slate-500">{o.bloodGroup}</p>
                    <button
                      onClick={() => acceptOrgan(o._id, o.requestId)}
                      className="bg-emerald-500 hover:bg-emerald-600
                        text-white px-5 py-2 mt-5 rounded-xl"
                    >
                      Accept Organ
                    </button>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* REQUEST ORGAN */}
          {activeTab === "request" && (
            <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl border">
              <h2 className="text-2xl font-semibold text-cyan-700 mb-6">
                Request New Organ
              </h2>

              <input
                value={organName}
                className="border rounded-xl w-full px-4 py-2 mb-4"
                placeholder="Organ Name"
                onChange={(e) => setOrganName(e.target.value)}
              />
              <input
                value={bloodGroup}
                className="border rounded-xl w-full px-4 py-2 mb-6"
                placeholder="Blood Group"
                onChange={(e) => setBloodGroup(e.target.value)}
              />

              <button
                onClick={requestOrgan}
                className="bg-cyan-600 hover:bg-cyan-700
                  text-white w-full py-3 rounded-xl"
              >
                Submit Request
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="border-t py-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Organ Transplant Management System
        </footer>
      </main>
    </div>
  );
};

export default DoctorDashboard;
