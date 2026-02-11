import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState(null);

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
  }, [token, navigate]);

  /* ================= API CALLS ================= */

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/doctor/dashboard", authHeader);
      if (res.data.success) {
        setDashboard(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      alert("Failed to load dashboard data");
    }
  };

  const fetchAllocations = async () => {
    try {
      const res = await api.get(`/doctor/allocations?status=ALL_ACTIVE`, authHeader);
      if (res.data.success) {
        setAllocations(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching allocations:", err);
    }
  };

  const findAvailable = async () => {
    if (!organName || !bloodGroup) {
      alert("Please select both organ type and blood group");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Searching for available organs...");
    
    try {
      const res = await api.get(
        `/doctor/availableOrgans?organName=${organName}&bloodGroup=${bloodGroup}`,
        authHeader
      );
      
      if (res.data.success) {
        setAvailable(res.data.data);
        if (res.data.data.length === 0) {
          alert("No available organs found matching your criteria");
        }
      }
    } catch (err) {
      console.error("Error finding organs:", err);
      const errorMessage = err.response?.data?.message || "Failed to search organs";
      alert(errorMessage);
      setAvailable([]);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const requestOrgan = async () => {
    if (!organName || !bloodGroup) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Creating organ request...");
    
    try {
      const res = await api.post(
        "/doctor/requestOrgan",
        { organName, bloodGroup, urgencyScore: 10 },
        authHeader
      );
      
      if (res.data.success) {
        alert("Organ requested successfully!");
        await fetchDashboard();
        setOrganName("");
        setBloodGroup("");
        setActiveTab("dashboard");
      }
    } catch (err) {
      console.error("Error requesting organ:", err);
      const errorMessage = err.response?.data?.message || "Failed to request organ";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const viewRequest = async (requestId) => {
    setIsLoading(true);
    setLoadingMessage("Loading request details...");
    
    try {
      const res = await api.get(`/doctor/viewRequest?id=${requestId}`, authHeader);
      
      if (res.data.success) {
        setSelectedRequestData(res.data.data);
        setShowRequestModal(true);
      }
    } catch (err) {
      console.error("Error loading request:", err);
      const errorMessage = err.response?.data?.message || "Failed to load request details";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const acceptOrgan = async (organId, requestId) => {
    if (!window.confirm("Are you sure you want to accept this organ? This will reserve it for your patient.")) {
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Accepting organ...");
    
    try {
      const res = await api.post(
        "/doctor/accept-organ",
        { organId, requestId },
        authHeader
      );
      
      if (res.data.success) {
        alert("Organ accepted successfully! The donor will be notified to confirm.");
        await fetchAllocations();
        await fetchDashboard();
        await findAvailable(); // Refresh available organs
      }
    } catch (err) {
      console.error("Error accepting organ:", err);
      const errorMessage = err.response?.data?.message || "Failed to accept organ";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const completeAllocation = async (allocationId) => {
    if (!window.confirm("Are you sure you want to mark this allocation as completed? This action cannot be undone.")) {
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage("Completing allocation...");
    
    try {
      const res = await api.post(
        "/doctor/complete-allocation",
        { allocationId },
        authHeader
      );
      
      if (res.data.success) {
        alert("Allocation completed successfully! The transplant has been recorded.");
        await fetchAllocations();
        await fetchDashboard();
      }
    } catch (err) {
      console.error("Error completing allocation:", err);
      const errorMessage = err.response?.data?.message || "Failed to complete allocation";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const failAllocation = async (allocationId) => {
    const reason = prompt("Please provide a reason for failing this allocation:");
    
    if (!reason || reason.trim() === "") {
      alert("Reason is required to fail an allocation");
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage("Processing failure...");
    
    try {
      const res = await api.post(
        "/doctor/fail-allocation",
        { allocationId, reason: reason.trim() },
        authHeader
      );
      
      if (res.data.success) {
        alert("Allocation marked as failed. The organ has been returned to the available pool.");
        await fetchAllocations();
        await fetchDashboard();
      }
    } catch (err) {
      console.error("Error failing allocation:", err);
      const errorMessage = err.response?.data?.message || "Failed to update allocation";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  /* ================= HELPERS ================= */

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      PENDING_CONFIRMATION: "bg-yellow-100 text-yellow-800 border-yellow-200",
      RESERVED: "bg-blue-100 text-blue-800 border-blue-200",
      CONFIRMED: "bg-green-100 text-green-800 border-green-200",
      ALLOCATED: "bg-purple-100 text-purple-800 border-purple-200",
      COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
      MATCHED: "bg-cyan-100 text-cyan-800 border-cyan-200",
      WAITING: "bg-orange-100 text-orange-800 border-orange-200",
      FAILED: "bg-red-100 text-red-800 border-red-200",
      TRANSPLANTED: "bg-green-100 text-green-800 border-green-200",
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

  const formatBloodGroup = (bloodGroup) => {
    if (!bloodGroup) return "";
    
    const mapping = {
      "A_POS": "A+",
      "A_NEG": "A-",
      "B_POS": "B+",
      "B_NEG": "B-",
      "O_POS": "O+",
      "O_NEG": "O-",
      "AB_POS": "AB+",
      "AB_NEG": "AB-"
    };
    
    return mapping[bloodGroup] || bloodGroup;
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Loading Modal */}
      <AnimatePresence>
        {isLoading && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50"></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Processing...
                  </h3>
                  <p className="text-gray-600 text-center">{loadingMessage}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View Request Modal */}
      <AnimatePresence>
        {showRequestModal && selectedRequestData && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowRequestModal(false)}
            ></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Request Details
                  </h2>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-600">Organ Name</label>
                      <p className="text-xl font-bold text-gray-900 mt-1">{selectedRequestData.organName}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-600">Blood Group</label>
                      <p className="text-xl font-bold text-gray-900 mt-1">{formatBloodGroup(selectedRequestData.bloodGroup)}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-2">
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(selectedRequestData.status)}`}>
                        {selectedRequestData.status}
                      </span>
                    </div>
                  </div>

                  {selectedRequestData.doctorId && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-600">Doctor</label>
                      <p className="text-gray-900 mt-1 font-semibold">{selectedRequestData.doctorId.name}</p>
                      {selectedRequestData.doctorId.phoneNumber && (
                        <p className="text-sm text-gray-600 mt-1">📞 {selectedRequestData.doctorId.phoneNumber}</p>
                      )}
                    </div>
                  )}

                  {selectedRequestData.hospitalId && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-600">Hospital</label>
                      <p className="text-gray-900 mt-1 font-semibold">{selectedRequestData.hospitalId.name}</p>
                      {selectedRequestData.hospitalId.address && (
                        <p className="text-sm text-gray-600 mt-1">🏥 {selectedRequestData.hospitalId.address}</p>
                      )}
                    </div>
                  )}

                  {selectedRequestData.urgencyScore && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-600">Urgency Score</label>
                      <p className="text-gray-900 mt-1 font-semibold">{selectedRequestData.urgencyScore}/10</p>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-600">Request ID</label>
                    <p className="text-sm text-gray-900 font-mono mt-1 break-all">{selectedRequestData._id}</p>
                  </div>

                  {selectedRequestData.createdAt && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-600">Created At</label>
                      <p className="text-gray-900 mt-1">{new Date(selectedRequestData.createdAt).toLocaleString()}</p>
                    </div>
                  )}

                  {selectedRequestData.updatedAt && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-600">Last Updated</label>
                      <p className="text-gray-900 mt-1">{new Date(selectedRequestData.updatedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
              { id: "allocations", label: "My Allocations", icon: "📦" },
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
              if (window.confirm("Are you sure you want to logout?")) {
                localStorage.removeItem("token");
                navigate("/login");
              }
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
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-2xl shadow-xl text-white">
                  <div className="text-4xl font-bold mb-1">
                    {dashboard?.totalRequests || 0}
                  </div>
                  <p className="text-green-100">Total Requests</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-6 rounded-2xl shadow-xl text-white">
                  <div className="text-4xl font-bold mb-1">
                    {dashboard?.activeAllocations || 0}
                  </div>
                  <p className="text-blue-100">Active Allocations</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-2xl shadow-xl text-white">
                  <div className="text-4xl font-bold mb-1">
                    {dashboard?.completedTransplants || 0}
                  </div>
                  <p className="text-purple-100">Completed</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-6 rounded-2xl shadow-xl text-white">
                  <div className="text-4xl font-bold mb-1">
                    {dashboard?.failedAllocations || 0}
                  </div>
                  <p className="text-orange-100">Failed</p>
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
                          className="p-5 rounded-xl border border-gray-200 hover:shadow-md transition-all bg-gradient-to-r from-green-50 to-blue-50 cursor-pointer"
                          onClick={() => viewRequest(r._id)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">
                                {r.organName}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Blood Group: <span className="font-semibold text-green-600">{formatBloodGroup(r.bloodGroup)}</span>
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
                          <p className="text-xs text-gray-500 mt-2">Click to view details</p>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-gray-400 text-lg">No requests created yet</p>
                        <button
                          onClick={() => setActiveTab("request")}
                          className="mt-4 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                          Create Request
                        </button>
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
                          className="p-5 rounded-xl border border-gray-200 hover:shadow-md transition-all bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer"
                          onClick={() => viewRequest(h._id)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">
                                {h.organName}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Blood Group: <span className="font-semibold text-blue-600">{formatBloodGroup(h.bloodGroup)}</span>
                              </p>
                              {h.doctorId && (
                                <p className="text-xs text-gray-500 mt-1">
                                  By: Dr. {h.doctorId.name}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                h.status
                              )}`}
                            >
                              {h.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Click to view details</p>
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
                  <select
                    value={bloodGroup}
                    className="border border-gray-300 rounded-xl px-5 py-3 w-full md:w-64 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    onChange={(e) => setBloodGroup(e.target.value)}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A_POS">A+</option>
                    <option value="A_NEG">A-</option>
                    <option value="B_POS">B+</option>
                    <option value="B_NEG">B-</option>
                    <option value="O_POS">O+</option>
                    <option value="O_NEG">O-</option>
                    <option value="AB_POS">AB+</option>
                    <option value="AB_NEG">AB-</option>
                  </select>
                  <button
                    onClick={findAvailable}
                    disabled={!organName || !bloodGroup}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all transform whitespace-nowrap ${
                      organName && bloodGroup
                        ? "bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg hover:scale-[1.02]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    🔍 Search
                  </button>
                </div>
              </div>

              {available.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-500 text-xl font-medium">
                    {organName || bloodGroup ? "No available organs found" : "Enter search criteria to find organs"}
                  </p>
                  <p className="text-gray-400 mt-2">
                    {organName || bloodGroup ? "Try adjusting your search criteria" : "Select organ type and blood group above"}
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
                            {formatBloodGroup(o.bloodGroup)}
                          </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-xl">
                          <span className="text-2xl">🫀</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-5">
                        {o.distance && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">📍 Distance:</span>
                            <span>{o.distance}</span>
                          </div>
                        )}
                        {o.duration && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">⏱️ Duration:</span>
                            <span>{o.duration}</span>
                          </div>
                        )}
                        {o.riskLevel && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-600">⚠️ Risk:</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(
                                o.riskLevel
                              )}`}
                            >
                              {o.riskLevel}
                            </span>
                          </div>
                        )}
                        {o.matchScore !== undefined && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">🎯 Match Score:</span>
                            <span className="font-semibold text-green-600">{o.matchScore}</span>
                          </div>
                        )}
                        {o.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">📞 Phone:</span>
                            <span>{o.phoneNumber}</span>
                          </div>
                        )}
                        {o.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">🏠 Address:</span>
                            <span className="truncate">{o.address}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => acceptOrgan(o._id, o.requestId)}
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

          {/* MY ALLOCATIONS TAB */}
          {activeTab === "allocations" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-bold mb-6">My Allocations</h2>

              {allocations.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-400 text-xl">No allocations yet</p>
                  <p className="text-gray-500 text-sm mt-2">Allocations will appear here when organs are matched</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {allocations.map((a, idx) => (
                    <motion.div
                      key={a._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-2 text-gray-800">
                            {a.organId?.organName || "Organ"}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">
                            Blood Group: <span className="font-semibold">{formatBloodGroup(a.organId?.bloodGroup)}</span>
                          </p>
                          {a.hospitalId?.name && (
                            <p className="text-sm text-gray-600 mb-1">
                              Hospital: <span className="font-semibold">{a.hospitalId.name}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          a.status
                        )}`}
                      >
                        {a.status}
                      </span>

                      {a.matchScore && (
                        <div className="mt-3 text-sm text-gray-600">
                          Match Score: <span className="font-semibold text-green-600">{a.matchScore}</span>
                        </div>
                      )}

                      {/* ACTIONS ONLY IF MATCHED */}
                      {a.status === "MATCHED" && (
                        <div className="flex gap-3 mt-5">
                          <button
                            onClick={() => completeAllocation(a._id)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-[1.02]"
                          >
                            ✅ Complete
                          </button>

                          <button
                            onClick={() => failAllocation(a._id)}
                            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-[1.02]"
                          >
                            ❌ Fail
                          </button>
                        </div>
                      )}
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
                      <option value="A_POS">A+</option>
                      <option value="A_NEG">A-</option>
                      <option value="B_POS">B+</option>
                      <option value="B_NEG">B-</option>
                      <option value="O_POS">O+</option>
                      <option value="O_NEG">O-</option>
                      <option value="AB_POS">AB+</option>
                      <option value="AB_NEG">AB-</option>
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