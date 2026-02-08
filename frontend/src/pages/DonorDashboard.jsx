import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import impact from "../assets/impact.json";
import logo from "../assets/logo.png";

const DonorDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ================= STATE ================= */

  const [step, setStep] = useState(1);
  const [organId, setOrganId] = useState(null);
  const [consent, setConsent] = useState(false);
  const [consentType, setConsentType] = useState("");

  const [available, setAvailable] = useState([]);
  const [activeTab, setActiveTab] = useState("needs");
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [myRequests, setMyRequests] = useState([]);

  const [organName, setOrganName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const [formData, setFormData] = useState({
    organ: "",
    bloodgroup: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchMyRequests();
  }, [token, navigate]);

  /* ================= API ================= */

  const fetchNeeds = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/v1/donor/waitingOrgans",
        {
          params: { organName, bloodGroup },
          headers: { "x-access-token": token },
        }
      );
      setAvailable(res.data.data || []);
    } catch (err) {
      console.error(err);
      setAvailable([]);
    }
  };

  const fetchMyRequests = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/v1/donor/all",
      { headers: { "x-access-token": token } }
    );
    setMyRequests(res.data.data || []);
  };

  const acceptOrganById = async (organId) => {
    setIsLoading(true);
    setLoadingMessage("Accepting organ request...");
    
    try {
      await axios.post(
        "http://localhost:5000/api/v1/donor/accept-organ",
        { organId },
        {
          headers: { "x-access-token": token }
        }
      );

      alert("Organ accepted successfully");

      // refresh UI
      await fetchNeeds();
      await fetchMyRequests();
      setActiveTab("myRequests");

    } catch (err) {
      console.error(err);
      alert("Failed to accept organ");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
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
      { headers: { "x-access-token": token } }
    );
    setOrganId(res.data.data._id);
    setStep(2);
  };

  const submitConsent = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMessage("Processing your donation consent...");
    
    try {
      await axios.post(
        "http://localhost:5000/api/v1/donor/confirmDonation",
        { organId, consentType },
        { headers: { "x-access-token": token } }
      );
      
      setShowForm(false);
      setActiveTab("myRequests");
      await fetchMyRequests();
    } catch (error) {
      console.error(error);
      alert("Failed to confirm donation. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const confirmAllocation = async (id) => {
    setIsLoading(true);
    setLoadingMessage("Confirming allocation...");
    
    try {
      await axios.post(
        `http://localhost:5000/api/v1/donor/confirm-allocation/${id}`,
        {},
        { headers: { "x-access-token": token } }
      );
      await fetchMyRequests();
    } catch (error) {
      console.error(error);
      alert("Failed to confirm allocation. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const rejectAllocation = async (id) => {
    setIsLoading(true);
    setLoadingMessage("Rejecting allocation...");
    
    try {
      await axios.post(
        `http://localhost:5000/api/v1/donor/reject-allocation/${id}`,
        {},
        { headers: { "x-access-token": token } }
      );
      await fetchMyRequests();
    } catch (error) {
      console.error(error);
      alert("Failed to reject allocation. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const openDonationForm = (req = {}) => {
    setSelectedRequest(req);
    setFormData({
      organ: req.organName || "",
      bloodgroup: req.bloodGroup || "",
    });
    setConsent(false);
    setConsentType("");
    setStep(1);
    setShowForm(true);
  };

  /* ================= HELPERS ================= */

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      RESERVED: "bg-blue-100 text-blue-800 border-blue-200",
      CONFIRMED: "bg-green-100 text-green-800 border-green-200",
      REJECTED: "bg-red-100 text-red-800 border-red-200",
      ALLOCATED: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
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
                  {/* Spinner */}
                  <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
                  
                  {/* Message */}
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Processing...
                  </h3>
                  <p className="text-gray-600 text-center">
                    {loadingMessage}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="w-72 min-h-screen bg-white shadow-xl border-r border-gray-100 p-8 hidden lg:flex flex-col sticky top-0">
          <div className="mb-12">
            <img
              src={logo}
              className="h-12 mb-3 cursor-pointer transition-transform hover:scale-105"
              onClick={() => navigate("/")}
              alt="Logo"
            />
            <div className="h-1 w-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
          </div>

          <nav className="flex flex-col gap-3 flex-1">
            <button
              onClick={() => setActiveTab("needs")}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl text-left font-medium transition-all ${
                activeTab === "needs"
                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg shadow-green-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-2xl">🏥</span>
              <span>Hospital Needs</span>
            </button>

            <button
              onClick={() => setActiveTab("voluntary")}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl text-left font-medium transition-all ${
                activeTab === "voluntary"
                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg shadow-green-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-2xl">❤️</span>
              <span>Willing Donation</span>
            </button>

            <button
              onClick={() => setActiveTab("myRequests")}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl text-left font-medium transition-all ${
                activeTab === "myRequests"
                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg shadow-green-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-2xl">📄</span>
              <span>My Requests</span>
            </button>

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
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-10">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Welcome, Donor
              </h1>
              <p className="text-gray-600 text-lg">
                Your generosity can save lives ❤️
              </p>
            </div>

            {/* Donation Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl mb-10 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {step === 1 ? "Donation Details" : "Consent Form"}
                    </h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex items-center gap-2 mb-8">
                    <div
                      className={`flex-1 h-2 rounded-full ${
                        step >= 1 ? "bg-green-500" : "bg-gray-200"
                      }`}
                    ></div>
                    <div
                      className={`flex-1 h-2 rounded-full ${
                        step >= 2 ? "bg-green-500" : "bg-gray-200"
                      }`}
                    ></div>
                  </div>

                  {step === 1 && (
                    <form onSubmit={submitDonation} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organ Type
                        </label>
                        <input
                          value={formData.organ}
                          onChange={(e) =>
                            setFormData({ ...formData, organ: e.target.value })
                          }
                          className="border border-gray-300 w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                          placeholder="e.g., Kidney, Liver, Heart"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Blood Group
                        </label>
                        <input
                          value={formData.bloodgroup}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bloodgroup: e.target.value,
                            })
                          }
                          className="border border-gray-300 w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                          placeholder="e.g., A+, B-, O+"
                          required
                        />
                      </div>

                      <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white w-full py-4 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02]">
                        Continue to Consent →
                      </button>
                    </form>
                  )}

                  {step === 2 && (
                    <form onSubmit={submitConsent} className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Donation Type
                        </label>
                        <select
                          className="border border-gray-300 w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                          value={consentType}
                          onChange={(e) => setConsentType(e.target.value)}
                          required
                        >
                          <option value="">Select consent type</option>
                          <option value="LIVING">Living Donation</option>
                          <option value="POST_DEATH">Post-Death Donation</option>
                        </select>
                      </div>

                      {/* Guidelines Section */}
                      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-4">
                          <h3 className="text-lg font-bold">
                            Organ Donation Guidelines & Regulations
                          </h3>
                          <p className="text-sm text-green-50 mt-1">
                            Please read carefully before proceeding
                          </p>
                        </div>

                        <div className="px-6 py-5 max-h-96 overflow-y-auto space-y-6 text-sm text-gray-700 leading-relaxed">
                          {/* Section 1 */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <span className="text-green-500">1.</span>
                              Voluntary Consent
                            </h4>
                            <p>
                              This donation is entirely voluntary and without any
                              coercion, inducement, or undue influence. You have
                              the right to withdraw your consent at any time
                              before the donation procedure, without any penalty
                              or loss of benefits to which you are otherwise
                              entitled.
                            </p>
                          </div>

                          {/* Section 2 */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <span className="text-green-500">2.</span>
                              Medical Evaluation
                            </h4>
                            <p>
                              You will undergo a comprehensive medical evaluation
                              to determine your suitability as a donor. This
                              includes physical examination, laboratory tests,
                              imaging studies, and psychological assessment. The
                              medical team will ensure that the donation will not
                              significantly compromise your health.
                            </p>
                          </div>

                          {/* Section 3 */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <span className="text-green-500">3.</span>
                              Risks and Complications
                            </h4>
                            <p>
                              All surgical procedures carry risks. Organ donation
                              surgery may involve risks including but not limited
                              to: bleeding, infection, blood clots, adverse
                              reactions to anesthesia, damage to surrounding
                              organs, prolonged recovery time, and in rare cases,
                              death. Long-term risks may include chronic pain,
                              fatigue, and changes in organ function.
                            </p>
                          </div>

                          {/* Section 4 */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <span className="text-green-500">4.</span>
                              No Financial Compensation
                            </h4>
                            <p>
                              Organ donation is a gift of life and cannot be
                              bought or sold. You will not receive any monetary
                              compensation for your organ donation. However,
                              reasonable medical expenses directly related to the
                              donation may be covered as per applicable
                              regulations.
                            </p>
                          </div>

                          {/* Section 5 */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <span className="text-green-500">5.</span>
                              Confidentiality
                            </h4>
                            <p>
                              Your personal and medical information will be kept
                              confidential and will only be shared with authorized
                              medical personnel involved in the donation process.
                              Your identity will be protected in accordance with
                              applicable privacy laws and regulations.
                            </p>
                          </div>

                          {/* Section 6 */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <span className="text-green-500">6.</span>
                              Post-Donation Care
                            </h4>
                            <p>
                              You will receive comprehensive post-operative care
                              and follow-up. Regular medical check-ups will be
                              scheduled to monitor your recovery and long-term
                              health. You should maintain a healthy lifestyle and
                              report any complications immediately to your
                              healthcare provider.
                            </p>
                          </div>

                          {/* Section 7 */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <span className="text-green-500">7.</span>
                              Legal Compliance
                            </h4>
                            <p>
                              This donation process complies with all applicable
                              laws and regulations governing organ donation in
                              your jurisdiction. The donation will be conducted in
                              accordance with the highest ethical and medical
                              standards.
                            </p>
                          </div>

                          {/* Section 8 */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <span className="text-green-500">8.</span>
                              Right to Information
                            </h4>
                            <p>
                              You have the right to ask questions and receive
                              clear answers about the donation process, risks,
                              benefits, alternatives, and any other concerns you
                              may have. You should not proceed if you have any
                              unanswered questions or concerns.
                            </p>
                          </div>

                          {/* Section 9 */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <span className="text-green-500">9.</span>
                              Future Health Considerations
                            </h4>
                            <p>
                              Living with one organ (in case of paired organs like
                              kidneys) is generally safe, but you must take extra
                              precautions to protect your remaining organ. You may
                              have restrictions on certain activities or
                              medications. Inform all future healthcare providers
                              about your donation history.
                            </p>
                          </div>

                          {/* Section 10 */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <span className="text-green-500">10.</span>
                              Acknowledgment
                            </h4>
                            <p>
                              By proceeding with this consent, you acknowledge
                              that you have read, understood, and agree to all the
                              terms and conditions outlined in this document. You
                              confirm that you are of sound mind, acting of your
                              own free will, and are not under any pressure or
                              influence to make this decision.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Consent Checkbox */}
                      <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
                        <label className="flex items-start gap-4 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            className="mt-1 w-6 h-6 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                            required
                          />
                          <span className="text-sm text-gray-800 leading-relaxed font-medium">
                            I have carefully read and understood all the
                            guidelines, regulations, risks, and responsibilities
                            outlined above. I hereby give my informed consent to
                            donate my organ(s) and understand that this is a
                            voluntary decision made without any coercion. I have
                            been given the opportunity to ask questions and all my
                            concerns have been addressed.
                          </span>
                        </label>
                      </div>

                      <button
                        disabled={!consent}
                        className={`w-full py-4 rounded-xl font-semibold transition-all transform ${
                          consent
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:scale-[1.02]"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {consent ? "Confirm Donation ✓" : "Please Accept Terms to Continue"}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Needs Tab */}
            {activeTab === "needs" && !showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Search Available Requests
                  </h3>
                  <div className="flex flex-col lg:flex-row gap-4">
                    <input
                      type="text"
                      placeholder="Search by organ (e.g., Kidney)"
                      value={organName}
                      onChange={(e) => setOrganName(e.target.value)}
                      className="border border-gray-300 px-5 py-3 rounded-xl w-full focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    />

                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="border border-gray-300 px-5 py-3 rounded-xl w-full lg:w-64 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    >
                      <option value="">All Blood Groups</option>
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
                      onClick={fetchNeeds}
                      className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02] whitespace-nowrap"
                    >
                      🔍 Search
                    </button>
                  </div>
                </div>

                {available.length === 0 ? (
                  <>
                    {/* Empty State */}
                    <div className="text-center py-12 bg-white rounded-2xl shadow-lg mb-8">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-gray-500 text-xl font-medium">
                        No matching requests found
                      </p>
                      <p className="text-gray-400 mt-2">
                        Try adjusting your search filters
                      </p>
                    </div>

                    {/* Impact Statistics */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="grid md:grid-cols-3 gap-6 mb-8"
                    >
                      <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-8 rounded-2xl shadow-xl text-white text-center">
                        <div className="text-5xl font-bold mb-2">100K+</div>
                        <p className="text-green-100 text-lg">Patients Waiting</p>
                        <p className="text-sm text-green-50 mt-2">for organ transplants worldwide</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-8 rounded-2xl shadow-xl text-white text-center">
                        <div className="text-5xl font-bold mb-2">8</div>
                        <p className="text-green-100 text-lg">Lives Saved</p>
                        <p className="text-sm text-green-50 mt-2">by one organ donor</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-8 rounded-2xl shadow-xl text-white text-center">
                        <div className="text-5xl font-bold mb-2">95%</div>
                        <p className="text-blue-100 text-lg">Success Rate</p>
                        <p className="text-sm text-blue-50 mt-2">in organ transplantation</p>
                      </div>
                    </motion.div>

                    {/* Donor Stories */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mb-8"
                    >
                      <h2 className="text-3xl font-bold text-gray-800 mb-6">
                        Real Stories, Real Impact 💝
                      </h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                          <div className="h-48 bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center">
                            <div className="text-white text-7xl">👨‍⚕️</div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                              John's Kidney Donation Journey
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                              "I donated my kidney to a complete stranger. Seeing him
                              walk again, play with his kids... that moment made
                              everything worth it. I have one kidney and two working
                              legs - he needed one more than I did."
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full font-medium">
                                Living Donor
                              </span>
                              <span>• 2 years ago</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                          <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
                            <div className="text-white text-7xl">👩‍⚕️</div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                              Sarah's Gift of Life
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-4">
                              "After my father's passing, our family chose to donate
                              his organs. We later learned that five people received
                              a second chance at life. Knowing his legacy lives on
                              brings us comfort and pride."
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full font-medium">
                                Deceased Donor Family
                              </span>
                              <span>• 1 year ago</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Educational Content */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200"
                    >
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="text-3xl">📚</span>
                        Organ Donation Facts
                      </h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                          <div className="text-3xl mb-3">🫀</div>
                          <h3 className="font-bold text-gray-800 mb-2">
                            Which organs can be donated?
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Kidneys, liver, heart, lungs, pancreas, intestines, and
                            tissues like corneas, skin, bone, and heart valves can
                            all be donated to save or improve lives.
                          </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm">
                          <div className="text-3xl mb-3">⏰</div>
                          <h3 className="font-bold text-gray-800 mb-2">
                            When can organs be donated?
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Living donation (typically kidney or liver segment) or
                            after death. Most donated organs come from deceased
                            donors who have registered their consent.
                          </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm">
                          <div className="text-3xl mb-3">🩺</div>
                          <h3 className="font-bold text-gray-800 mb-2">
                            Is it safe for living donors?
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Yes! Living donors undergo thorough medical and
                            psychological evaluations. Most live normal, healthy
                            lives post-donation with minimal long-term effects.
                          </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm">
                          <div className="text-3xl mb-3">🌍</div>
                          <h3 className="font-bold text-gray-800 mb-2">
                            Who can become a donor?
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Almost anyone can register as a donor regardless of age
                            or medical history. Medical professionals determine
                            suitability at the time of donation.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Call to Action */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-10 text-center text-white shadow-2xl"
                    >
                      <h2 className="text-3xl font-bold mb-3">
                        Ready to Make a Difference?
                      </h2>
                      <p className="text-xl text-green-50 mb-6">
                        Your decision today could save a life tomorrow
                      </p>
                      <button
                        onClick={() => setActiveTab("voluntary")}
                        className="bg-white text-green-600 px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
                      >
                        Start Your Donation Journey →
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {available.map((h, idx) => (
                      <motion.div
                        key={h._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">
                              {h.organName}
                            </h3>
                            <p className="text-green-600 font-semibold mt-1">
                              {h.bloodGroup}
                            </p>
                          </div>
                          <div className="bg-green-100 p-3 rounded-xl">
                            <span className="text-2xl">🫀</span>
                          </div>
                        </div>

                        <button
                          onClick={() => openDonationForm(h)}
                          className="bg-gradient-to-r from-green-500 to-blue-500 text-white w-full py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.02]"
                        >
                          Donate Now
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Voluntary */}
            {activeTab === "voluntary" && !showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl mx-auto text-center"
              >
                <div className="bg-white p-10 rounded-2xl shadow-2xl border border-gray-100">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Make a Voluntary Donation
                  </h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Your selfless act of kindness can give someone a second
                    chance at life
                  </p>

                  <button
                    onClick={() => openDonationForm()}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xl font-semibold px-12 py-5 rounded-2xl hover:shadow-2xl transition-all transform hover:scale-[1.05] mb-6"
                  >
                    Start Donation Process →
                  </button>

                  <Lottie
                    animationData={impact}
                    loop
                    className="w-80 mx-auto"
                  />
                </div>
              </motion.div>
            )}

            {/* My Requests */}
            {activeTab === "myRequests" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  My Donation Requests
                </h2>

                {myRequests.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-gray-500 text-xl font-medium">
                      No requests yet
                    </p>
                    <p className="text-gray-400 mt-2">
                      Your donation requests will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myRequests.map((r, idx) => (
                      <motion.div
                        key={r._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-800">
                                {r.organName}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                                  r.status
                                )}`}
                              >
                                {r.status}
                              </span>
                            </div>
                            <p className="text-gray-600">
                              Blood Group: <span className="font-semibold">{r.bloodGroup}</span>
                            </p>
                          </div>

                          {r.status === "RESERVED" && (
                            <div className="flex gap-3">
                              <button
                                onClick={() => confirmAllocation(r._id)}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.05]"
                              >
                                ✓ Confirm
                              </button>
                              <button
                                onClick={() => rejectAllocation(r._id)}
                                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-[1.05]"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DonorDashboard;