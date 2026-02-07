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
  const [allocations, setAllocations] = useState([]);

  const [organName, setOrganName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const token = localStorage.getItem("token");

  const authHeader = {
    headers: {
      "x-access-token": localStorage.getItem("token")
    },
  };

  /* ================= LOAD ================= */

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchDashboard();
    fetchAllocations();
  }, []);

  /* ================= API CALLS ================= */

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/doctor/dashboard", authHeader);
      setDashboard(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAllocations = async () => {
    try {
      const res = await api.get("/doctor/allocations", authHeader);
      setAllocations(res.data.data);
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
      setOrganName("");
      setBloodGroup("");
    } catch (err) {
      console.log(err);
    }
  };

  const acceptOrgan = async (organId, requestId) => {
    try {
      await api.post(
        "/doctor/accept-organ",
        { organId, requestId },
        authHeader
      );
      fetchAllocations();
      fetchDashboard();
      alert("Organ accepted");
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= HELPERS ================= */

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      RESERVED: "bg-blue-100 text-blue-800 border-blue-200",
      CONFIRMED: "bg-green-100 text-green-800 border-green-200",
      ALLOCATED: "bg-purple-100 text-purple-800 border-purple-200",
      COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getRiskColor = (risk) => {
    const colors = {
      LOW: "bg-green-100 text-green-700",
      MEDIUM: "bg-yellow-100 text-yellow-700",
      HIGH: "bg-red-100 text-red-700",
    };
    return colors[risk] || "bg-gray-100 text-gray-700";
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="flex max-w-7xl mx-auto">
        {/* ================= SIDEBAR ================= */}
        <aside className="w-72 min-h-screen bg-white shadow-xl border-r border-gray-100 p-8 hidden lg:flex flex-col sticky top-0">
          {/* LOGO */}
          <div className="mb-12">
            <img
              src={logo}
              className="h-12 mb-3 cursor-pointer transition-transform hover:scale-105"
              onClick={() => navigate("/")}
              alt="VitaMatch Logo"
            />
            <div className="h-1 w-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
          </div>

          {/* NAV */}
          <nav className="flex flex-col gap-3 flex-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: "📊" },
              { id: "available", label: "Available Organs", icon: "🫀" },
              { id: "request", label: "Request Organ", icon: "➕" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl text-left font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg shadow-green-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* LOGOUT */}
          <button
            className="mt-auto flex items-center gap-4 px-5 py-4 rounded-xl text-left font-medium text-green-600 hover:bg-green-50 transition-all"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            <span className="text-2xl">🚪</span>
            <span>Logout</span>
          </button>
        </aside>

        {/* ================= MAIN ================= */}
        <main className="flex-1 p-6 lg:p-12">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Doctor Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Manage organ requests and hospital allocations 👨‍⚕️
            </p>
          </motion.div>

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Statistics Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-2xl shadow-xl text-white">
                  <div className="text-4xl font-bold mb-1">
                    {dashboard?.myRequests?.length || 0}
                  </div>
                  <p className="text-green-100">My Requests</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-6 rounded-2xl shadow-xl text-white">
                  <div className="text-4xl font-bold mb-1">
                    {dashboard?.hospitalRequests?.length || 0}
                  </div>
                  <p className="text-blue-100">Hospital Requests</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-2xl shadow-xl text-white">
                  <div className="text-4xl font-bold mb-1">
                    {available?.length || 0}
                  </div>
                  <p className="text-purple-100">Available Organs</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* MY REQUESTS */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                      <span className="text-3xl">👨‍⚕️</span>
                      My Requests
                    </h2>
                  </div>

                  <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    {dashboard?.myRequests?.length > 0 ? (
                      dashboard.myRequests.map((r, idx) => (
                        <motion.div
                          key={r._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-5 rounded-xl border border-gray-200 hover:shadow-md transition-all bg-gradient-to-r from-green-50 to-blue-50"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">
                                {r.organName}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Blood Group: <span className="font-semibold text-green-600">{r.bloodGroup}</span>
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                r.status
                              )}`}
                            >
                              {r.status}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-gray-400 text-lg">No requests created yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* HOSPITAL REQUESTS */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                      <span className="text-3xl">🏥</span>
                      Hospital Requests
                    </h2>
                  </div>

                  <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    {dashboard?.hospitalRequests?.length > 0 ? (
                      dashboard.hospitalRequests.map((h, idx) => (
                        <motion.div
                          key={h._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-5 rounded-xl border border-gray-200 hover:shadow-md transition-all bg-gradient-to-r from-blue-50 to-indigo-50"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">
                                {h.organName}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Blood Group: <span className="font-semibold text-blue-600">{h.bloodGroup}</span>
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                h.status
                              )}`}
                            >
                              {h.status}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">🏥</div>
                        <p className="text-gray-400 text-lg">No hospital requests available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* AVAILABLE ORGANS TAB */}
          {activeTab === "available" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Search Available Organs
                </h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    value={organName}
                    placeholder="Organ Name (e.g., Kidney)"
                    className="border border-gray-300 rounded-xl px-5 py-3 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    onChange={(e) => setOrganName(e.target.value)}
                  />
                  <input
                    value={bloodGroup}
                    placeholder="Blood Group (e.g., A+)"
                    className="border border-gray-300 rounded-xl px-5 py-3 w-full focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    onChange={(e) => setBloodGroup(e.target.value)}
                  />
                  <button
                    onClick={findAvailable}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:shadow-lg text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-[1.02] whitespace-nowrap"
                  >
                    🔍 Search
                  </button>
                </div>
              </div>

              {available.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-500 text-xl font-medium">
                    No available organs found
                  </p>
                  <p className="text-gray-400 mt-2">
                    Try adjusting your search criteria
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {available.map((o, idx) => (
                    <motion.div
                      key={o._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {o.organName}
                          </h3>
                          <p className="text-green-600 font-semibold mt-1">
                            {o.bloodGroup}
                          </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-xl">
                          <span className="text-2xl">🫀</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">📍 Distance:</span>
                          <span>{o.distance || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">⏱️ Duration:</span>
                          <span>{o.duration || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-600">⚠️ Risk:</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(
                              o.riskLevel
                            )}`}
                          >
                            {o.riskLevel || "LOW"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">📞 Phone:</span>
                          <span>{o.phoneNumber || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">🏠 Address:</span>
                          <span className="truncate">{o.address || "N/A"}</span>
                        </div>
                      </div>

                      <button
                        onClick={() =>{ acceptOrgan(o._id, o.requestId);
                          window.location.reload();;
                        }
                        }
                        className="bg-gradient-to-r from-emerald-500 to-green-500 hover:shadow-lg text-white w-full py-3 rounded-xl font-semibold transition-all transform hover:scale-[1.02]"
                      >
                        ✓ Accept Organ
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* REQUEST ORGAN TAB */}
          {activeTab === "request" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100">
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">➕</div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Request New Organ
                  </h2>
                  <p className="text-gray-600">
                    Fill in the details to create a new organ request
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organ Type
                    </label>
                    <input
                      value={organName}
                      className="border border-gray-300 rounded-xl w-full px-5 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      placeholder="e.g., Kidney, Liver, Heart"
                      onChange={(e) => setOrganName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group
                    </label>
                    <select
                      value={bloodGroup}
                      className="border border-gray-300 rounded-xl w-full px-5 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      onChange={(e) => setBloodGroup(e.target.value)}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <button
                    onClick={requestOrgan}
                    disabled={!organName || !bloodGroup}
                    className={`w-full py-4 rounded-xl font-semibold transition-all transform ${
                      organName && bloodGroup
                        ? "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg hover:scale-[1.02]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {organName && bloodGroup
                      ? "Submit Request ✓"
                      : "Please fill all fields"}
                  </button>
                </div>
              </div>

              {/* Info Cards */}
              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                  <div className="text-3xl mb-3">⏱️</div>
                  <h3 className="font-bold text-gray-800 mb-2">Quick Processing</h3>
                  <p className="text-sm text-gray-600">
                    Requests are processed immediately and matched with available donors
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <div className="text-3xl mb-3">🔔</div>
                  <h3 className="font-bold text-gray-800 mb-2">Real-time Updates</h3>
                  <p className="text-sm text-gray-600">
                    Get notified when a matching organ becomes available
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;