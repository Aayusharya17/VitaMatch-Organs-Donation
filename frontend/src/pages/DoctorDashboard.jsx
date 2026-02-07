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
      "x-access-token": token
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

  const fetchAllocations = async () => {
    try {
      const res = await api.get("/doctor/allocations?status=all", authHeader);
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
      fetchAllocations();
      alert("Organ accepted");
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex">

      {/* SIDEBAR */}
      <aside className="w-64 border-r p-6 hidden md:flex flex-col">
        <img src={logo} alt="logo" className="h-10 mb-10 cursor-pointer" onClick={() => navigate("/")} />

        <nav className="flex flex-col gap-4">
          <button onClick={() => setActiveTab("dashboard")}>📊 Dashboard</button>
          <button onClick={() => setActiveTab("available")}>🫀 Available Organs</button>
          <button onClick={() => setActiveTab("request")}>➕ Request Organ</button>

          <button
            className="mt-auto text-red-500"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10">

        <h1 className="text-3xl font-bold mb-6">Doctor Dashboard 👨‍⚕️</h1>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="grid md:grid-cols-2 gap-8">

            <div>
              <h2 className="text-xl font-bold mb-4">🧑‍⚕️ My Requests</h2>
              {dashboard?.myRequests?.map(r => (
                <div key={r._id} className="border p-4 rounded mb-3 shadow">
                  <p><b>Organ:</b> {r.organName}</p>
                  <p><b>Blood:</b> {r.bloodGroup}</p>
                  <p><b>Status:</b> {r.status}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">🏥 Hospital Requests</h2>
              {dashboard?.hospitalRequests?.map(h => (
                <div key={h._id} className="border p-4 rounded mb-3 shadow">
                  <p><b>Organ:</b> {h.organName}</p>
                  <p><b>Blood:</b> {h.bloodGroup}</p>
                  <p><b>Status:</b> {h.status}</p>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* AVAILABLE */}
        {activeTab === "available" && (
          <>
            <div className="flex gap-3 mb-5">
              <input
                value={organName}
                placeholder="Organ"
                className="border p-2"
                onChange={(e) => setOrganName(e.target.value)}
              />

              <input
                value={bloodGroup}
                placeholder="Blood Group"
                className="border p-2"
                onChange={(e) => setBloodGroup(e.target.value)}
              />

              <button onClick={findAvailable} className="bg-blue-600 text-white px-4">
                Search
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {available.map(o => (
                <motion.div key={o._id} className="border p-6 rounded-xl shadow">
                  <h3 className="font-bold">{o.organName}</h3>
                  <p>{o.bloodGroup}</p>

                  <button
                    onClick={() => acceptOrgan(o._id, o.requestId)}
                    className="bg-green-600 text-white px-3 py-1 mt-3 rounded"
                  >
                    Accept
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* REQUEST */}
        {activeTab === "request" && (
          <div className="w-[400px]">
            <input
              value={organName}
              className="border w-full p-2 mb-2"
              placeholder="Organ Name"
              onChange={(e) => setOrganName(e.target.value)}
            />

            <input
              value={bloodGroup}
              className="border w-full p-2 mb-3"
              placeholder="Blood Group"
              onChange={(e) => setBloodGroup(e.target.value)}
            />

            <button onClick={requestOrgan} className="bg-blue-600 text-white w-full py-2">
              Request Organ
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default DoctorDashboard;