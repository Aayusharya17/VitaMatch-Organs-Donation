import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import loginImage from "../assets/Signup.png"

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

const Login = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState("DONOR");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/user/login", {
        email,
        password,
        role,
      });

      localStorage.setItem("token", res.data.data);

      role === "DONOR"
        ? navigate("/donor-dashboard")
        : navigate("/doctor-dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-green-100 flex items-center justify-center p-6">

    <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full grid grid-cols-1 md:grid-cols-[40%_60%] overflow-hidden">

      {/* LEFT */}
      <div className="px-12 flex flex-col justify-center">

        <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
        <p className="text-gray-500 mb-6">Login to continue</p>

        {/* STEP 1 ROLE */}
        {step === 1 && (
          <>
            <div className="space-y-4 mb-8">

              <div
                onClick={() => setRole("DONOR")}
                className={`border rounded-lg p-4 cursor-pointer flex justify-between items-center ${
                  role === "DONOR"
                    ? "border-indigo-600 ring-2 ring-indigo-200"
                    : ""
                }`}
              >
                <div>
                  <p className="font-medium">I'm a donor</p>
                  <p className="text-sm text-gray-500">Login as organ donor</p>
                </div>
                {role === "DONOR" && "✓"}
              </div>

              <div
                onClick={() => setRole("DOCTOR")}
                className={`border rounded-lg p-4 cursor-pointer flex justify-between items-center ${
                  role === "DOCTOR"
                    ? "border-indigo-600 ring-2 ring-indigo-200"
                    : ""
                }`}
              >
                <div>
                  <p className="font-medium">I'm a doctor</p>
                  <p className="text-sm text-gray-500">Hospital login</p>
                </div>
                {role === "DOCTOR" && "✓"}
              </div>

            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-3 rounded-lg font-medium shadow"
            >
              Continue
            </button>
          </>
        )}

        {/* STEP 2 FORM */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-sm">

            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer input pt-5"
              />
              <label className="absolute left-4 top-3 text-gray-700 font-medium text-sm transition-all
                peer-focus:text-xs peer-focus:-top-2 peer-focus:bg-white peer-focus:px-1
                peer-valid:text-xs peer-valid:-top-2 peer-valid:bg-white peer-valid:px-1">
                Email
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer input pt-5"
              />
              <label className="absolute left-4 top-3 text-gray-700 font-medium text-sm transition-all
                peer-focus:text-xs peer-focus:-top-2 peer-focus:bg-white peer-focus:px-1
                peer-valid:text-xs peer-valid:-top-2 peer-valid:bg-white peer-valid:px-1">
                Password
              </label>
            </div>

            <button className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-3 rounded-lg font-medium shadow">
              {loading ? "Logging in..." : `Login as ${role}`}
            </button>
          </form>
        )}

        <p className="text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </p>

          <div className="flex gap-2 mt-8">
            <span className={`w-8 h-2 rounded-full ${step===1?"bg-indigo-600":"bg-gray-200"}`}></span>
            <span className={`w-8 h-2 rounded-full ${step===2?"bg-indigo-600":"bg-gray-200"}`}></span>
          </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="hidden md:flex items-center justify-center">
        <img src={loginImage} className="w-[90%] h-[70vh]" />
      </div>

    </div>
  </div>
);

};

export default Login;
