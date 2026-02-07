import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

const Signup = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

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

  const changeHandler = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // backend assumed:
      // POST /user/signup

      const res = await api.post("/user/signup", formData);
      console.log(res);
      // save JWT
      localStorage.setItem("token", res.data.data);
      
      if (formData.role === "DONOR") {
        navigate("/donor-dashboard");
      } else {
        navigate("/doctor-dashboard");
      }

    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 p-4">

      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        {/* ROLE */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, role: "DONOR" }))}
            className={`px-4 py-2 rounded-full ${
              formData.role === "DONOR" ? "bg-blue-600 text-white" : "border"
            }`}
          >
            Donor
          </button>

          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, role: "DOCTOR" }))}
            className={`px-4 py-2 rounded-full ${
              formData.role === "DOCTOR" ? "bg-blue-600 text-white" : "border"
            }`}
          >
            Doctor
          </button>
        </div>

        <form onSubmit={submitHandler} className="space-y-4">

          <input name="name" placeholder="Name" required className="border w-full p-2"
            value={formData.name} onChange={changeHandler} />

          <input name="email" placeholder="Email" required className="border w-full p-2"
            value={formData.email} onChange={changeHandler} />

          <input name="password" placeholder="Password" type="password" required className="border w-full p-2"
            value={formData.password} onChange={changeHandler} />

          <input name="phone" placeholder="Phone" required className="border w-full p-2"
            value={formData.phone} onChange={changeHandler} />

          <input name="address" placeholder="Address" required className="border w-full p-2"
            value={formData.address} onChange={changeHandler} />

          {formData.role === "DOCTOR" && (
            <>
              <input name="hospitalName" placeholder="Hospital Name" required className="border w-full p-2"
                value={formData.hospitalName} onChange={changeHandler} />

              <input name="city" placeholder="City" required className="border w-full p-2"
                value={formData.city} onChange={changeHandler} />
            </>
          )}

          <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
            {loading ? "Creating..." : "Register"}
          </button>

        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?
          <span onClick={() => navigate("/login")} className="text-blue-600 ml-1 cursor-pointer">
            Login
          </span>
        </p>

      </div>
    </div>
  );
};

export default Signup;