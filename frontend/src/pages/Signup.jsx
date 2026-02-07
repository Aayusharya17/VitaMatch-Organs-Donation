import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import signupImage from "../assets/Signup.png"
const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

export default function Signup() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); 

  const [formData, setFormData] = useState({
    role: "DONOR",
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    hospitalName: "",
    city: "",
  });

  const changeHandler = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/user/signup", formData);
      localStorage.setItem("token", res.data.data);

      formData.role === "DONOR"
        ? navigate("/donor-dashboard")
        : navigate("/doctor-dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center p-6">

      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* LEFT */}
        <div className="p-10 flex flex-col justify-center">

          <h2 className="text-3xl font-bold mb-2">Create an account</h2>

          {/* ================= STEP 1 ROLE ================= */}
          {step === 1 && (
            <>
              <p className="text-gray-500 mb-6">
                Choose how you want to register
              </p>

              <div className="space-y-4 mb-8">

                <div
                  onClick={() => setFormData(p => ({ ...p, role: "DONOR" }))}
                  className={`border rounded-lg p-4 cursor-pointer flex justify-between items-center ${
                    formData.role === "DONOR"
                      ? "border-indigo-600 ring-2 ring-indigo-200"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-medium">I'm a donor</p>
                    <p className="text-sm text-gray-500">
                      Register as organ donor
                    </p>
                  </div>
                  {formData.role === "DONOR" && "✅"}
                </div>

                <div
                  onClick={() => setFormData(p => ({ ...p, role: "DOCTOR" }))}
                  className={`border rounded-lg p-4 cursor-pointer flex justify-between ${
                    formData.role === "DOCTOR"
                      ? "border-indigo-600 ring-2 ring-indigo-200"
                  : ""}`}
                >
                  <div>
                    <p className="font-medium">I'm a doctor</p>
                    <p className="text-sm text-gray-500">
                      Hospital access
                    </p>
                  </div>
                  {formData.role === "DOCTOR" && "✅"}
                </div>

              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg"
              >
                Continue
              </button>
            </>
          )}

          {/* ================= STEP 2 FORM ================= */}
          {step === 2 && (
  <form onSubmit={submitHandler} className="mt-6 space-y-4 max-w-sm">

    {[
      { name: "name", label: "Full name" },
      { name: "email", label: "Email" },
      { name: "password", label: "Password", type: "password" },
      { name: "phone", label: "Phone" },
      { name: "address", label: "Address" },
    ].map((field) => (
      <div key={field.name} className="relative">

        <input
          type={field.type || "text"}
          name={field.name}
          required
          value={formData[field.name]}
          onChange={changeHandler}
          className="peer input pt-5"
        />

        <label className="absolute left-4 top-3 text-gray-700 font-medium text-sm transition-all
          peer-focus:text-xs peer-focus:-top-2 peer-focus:bg-white peer-focus:px-1
          peer-valid:text-xs peer-valid:-top-2 peer-valid:bg-white peer-valid:px-1">
          {field.label}
        </label>

      </div>
    ))}

    {formData.role === "DOCTOR" && (
      <div className="relative">
        <input
          name="hospitalName"
          value={formData.hospitalName}
          onChange={changeHandler}
          className="peer input pt-5"
        />
        <label className="absolute left-4 top-3 text-gray-700 font-medium text-sm transition-all
          peer-focus:text-xs peer-focus:-top-2 peer-focus:bg-white peer-focus:px-1
          peer-valid:text-xs peer-valid:-top-2 peer-valid:bg-white peer-valid:px-1">
          Hospital Name
        </label>
      </div>
    )}

    <button className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-3 rounded-lg font-medium shadow">
      {loading ? "Creating..." : "Register"}
    </button>

  </form>
)}


          {/* PROGRESS */}
          <div className="flex gap-2 mt-8">
            <span className={`w-8 h-2 rounded-full ${step===1?"bg-indigo-600":"bg-gray-200"}`}></span>
            <span className={`w-8 h-2 rounded-full ${step===2?"bg-indigo-600":"bg-gray-200"}`}></span>
          </div>

        </div>

        {/* RIGHT PREVIEW */}
        <div className="hidden md:flex items-center justify-center">
          <img src={signupImage} className="w-[90%]" />
        </div>

      </div>
    </div>
  );
}
