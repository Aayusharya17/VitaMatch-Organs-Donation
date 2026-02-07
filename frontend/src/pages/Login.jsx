import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("DONOR");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("LOGIN CLICKED");

    try {
      const res = await api.post("/user/login", {
        email,
        password,
        role,
      });

      console.log("LOGIN RESPONSE:", res.data);

      // Store JWT
      localStorage.setItem("token", res.data.data);

      console.log("TOKEN SAVED:", localStorage.getItem("token"));

      // Redirect
      if (role === "DONOR") {
        navigate("/donor-dashboard");
      } else {
        navigate("/doctor-dashboard");
      }

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-sky-200">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border">

        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

        {/* ROLE */}
        <div className="flex mb-6 rounded overflow-hidden">
          <button
            onClick={() => setRole("DONOR")}
            className={`w-1/2 py-2 ${role === "DONOR" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Donor
          </button>

          <button
            onClick={() => setRole("DOCTOR")}
            className={`w-1/2 py-2 ${role === "DOCTOR" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Doctor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            required
            className="border w-full p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="border w-full p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2"
          >
            {loading ? "Logging in..." : `Login as ${role}`}
          </button>

        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;