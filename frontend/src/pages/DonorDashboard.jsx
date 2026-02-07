import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import impact from "../assets/impact.json";
import logo from "../assets/logo.png";

const DonorDashboard = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [organId,setOrganId]= useState(null);
  const [consent, setConsent] = useState(false);
  const [consentType, setConsentType] = useState("");

  const [available, setAvailable] = useState([]);
  const [activeTab, setActiveTab] = useState("needs");
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [myRequests, setMyRequests] = useState([]);

  const [organName,setOrganName]=useState("");
  const [bloodGroup,setBloodGroup]=useState("");

  const [formData, setFormData] = useState({
    organ: "",
    bloodgroup: ""
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
  if (!token) {
    navigate("/login");
    return;
  }

  fetchNeeds();
  fetchMyRequests();
}, [token, navigate]);


  /* ================= API ================= */

  const fetchNeeds = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/v1/donor/waitingOrgans?organName=${organName}&bloodGroup=${bloodGroup}`,
      { headers:{ "x-access-token":token }}
    );

    setAvailable(res.data.data);
  };

  const fetchMyRequests = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/v1/donor/all",
      { headers:{ "x-access-token":token }}
    );

    setMyRequests(res.data.data);
  };

  const submitDonation = async (e) => {
    e.preventDefault();

    const res = await axios.post(
      "http://localhost:5000/api/v1/donor/donateOrgan",
      {
        organName: formData.organ,
        bloodGroup: formData.bloodgroup,
        requestId: selectedRequest?._id,
      },
      { headers:{ "x-access-token":token }}
    );

    setOrganId(res.data.data._id);
    setStep(2);
  };

  const submitConsent = async (e) => {
    e.preventDefault();

    await axios.post(
      "http://localhost:5000/api/v1/donor/confirmDonation",
      { organId, consentType },
      { headers:{ "x-access-token":token }}
    );

    setShowForm(false);
    fetchMyRequests();
    setActiveTab("myRequests");
  };

  const confirmAllocation = async (id) => {
    await axios.post(
      `http://localhost:5000/api/v1/donor/confirm-allocation/${id}`,
      {},
      { headers:{ "x-access-token":token }}
    );
    fetchMyRequests();
  };

  const rejectAllocation = async (id) => {
    await axios.post(
      `http://localhost:5000/api/v1/donor/reject-allocation/${id}`,
      {},
      { headers:{ "x-access-token":token }}
    );
    fetchMyRequests();
  };

  const openDonationForm = (req={}) => {
    setSelectedRequest(req);
    setFormData({
      organ:req.organName||"",
      bloodgroup:req.bloodGroup||""
    });
    setConsent(false);
    setConsentType("");
    setStep(1);
    setShowForm(true);
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex">

      <aside className="w-64 border-r p-6 hidden md:flex flex-col">
        <img src={logo} className="h-10 mb-10 cursor-pointer" onClick={()=>navigate("/")}/>

        <nav className="flex flex-col gap-4">
          <button onClick={()=>setActiveTab("needs")}>🏥 Hospital Needs</button>
          <button onClick={()=>setActiveTab("voluntary")}>❤️ Willing Donation</button>
          <button onClick={()=>setActiveTab("myRequests")}>📄 My Requests</button>

          <button className="mt-auto text-red-500" onClick={()=>{localStorage.removeItem("token");navigate("/login")}}>
            🚪 Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-10">

        <h1 className="text-3xl font-bold mb-6">Welcome Donor ❤️</h1>

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow max-w-xl mb-10">

            {step===1 && (
              <form onSubmit={submitDonation} className="space-y-3">
                <input value={formData.organ} onChange={e=>setFormData({...formData,organ:e.target.value})} className="border w-full p-2" placeholder="Organ"/>
                <input value={formData.bloodgroup} onChange={e=>setFormData({...formData,bloodgroup:e.target.value})} className="border w-full p-2" placeholder="Blood Group"/>
                <button className="bg-blue-600 text-white w-full py-2">Continue</button>
              </form>
            )}

            {step===2 && (
              <form onSubmit={submitConsent} className="space-y-3">
                <select className="border w-full p-2" value={consentType} onChange={e=>setConsentType(e.target.value)} required>
                  <option value="">Select Consent</option>
                  <option value="LIVING">Living</option>
                  <option value="POST_DEATH">Post Death</option>
                </select>

                <label className="flex gap-2">
                  <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required/>
                  I consent
                </label>

                <button className="bg-green-600 text-white w-full py-2">Confirm</button>
              </form>
            )}

          </div>
        )}

        {activeTab==="needs" && !showForm && (
          <div className="grid md:grid-cols-2 gap-6">
            {available.map(h=>(
              <motion.div key={h._id} className="border p-6 rounded-xl">
                <h3>{h.organName}</h3>
                <p>{h.bloodGroup}</p>
                <button onClick={()=>openDonationForm(h)} className="bg-blue-600 text-white mt-3 px-3 py-1">Donate</button>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab==="voluntary" && !showForm && (
          <div>
            <button onClick={()=>openDonationForm()} className="bg-green-600 text-white w-full py-3">Proceed</button>
            <Lottie animationData={impact} loop className="w-72 mx-auto mt-6"/>
          </div>
        )}

        {activeTab==="myRequests" && (
          <div>
            {myRequests.map(r=>(
              <div key={r._id} className="border p-4 mb-3">
                <p>{r.organName}</p>
                <span>{r.status}</span>

                {r.status==="RESERVED" && (
                  <div className="flex gap-3 mt-3">
                    <button onClick={()=>confirmAllocation(r._id)} className="bg-green-600 text-white px-3">Confirm</button>
                    <button onClick={()=>rejectAllocation(r._id)} className="bg-red-600 text-white px-3">Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default DonorDashboard;
