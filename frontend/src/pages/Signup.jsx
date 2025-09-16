// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    nic: "",
    email: "",
    phoneNo: "",
    address: "",
    gender: "",
    dob: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    // Client validation
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError("Enter a valid email.");
    if (!form.fullName || !form.nic || !form.phoneNo || !form.address || !form.gender || !form.dob)
      return setError("Please complete all required fields.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!form.agree) return setError("You must agree to Terms & Privacy Policy.");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: form.fullName,
          nic: form.nic,
          email: form.email,
          phoneNo: form.phoneNo,
          address: form.address,
          gender: form.gender,
          dob: form.dob,
          password: form.password,
          role: "patient",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Signup failed.");

      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Branding */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Bot className="h-7 w-7 text-blue-600"/>
          <h1 className="font-semibold text-xl text-gray-900">AI Language Tutor</h1>
        </div>

        <div className="bg-white border rounded-2xl shadow p-6">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {error && <div className="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</div>}
            {success && <div className="md:col-span-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">{success}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input name="fullName" value={form.fullName} onChange={onChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">NIC</label>
              <input name="nic" value={form.nic} onChange={onChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={form.email} onChange={onChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="tel" name="phoneNo" value={form.phoneNo} onChange={onChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring focus:border-blue-500"/>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input name="address" value={form.address} onChange={onChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select name="gender" value={form.gender} onChange={onChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring focus:border-blue-500">
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input type="date" name="dob" value={form.dob} onChange={onChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" name="password" value={form.password} onChange={onChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring focus:border-blue-500"/>
            </div>

            <div className="md:col-span-2 flex items-center gap-2 text-sm">
              <input type="checkbox" name="agree" checked={form.agree} onChange={onChange} className="rounded"/>
              <span>I agree to the <a href="#" className="text-blue-600 hover:underline">Terms</a> & <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a></span>
            </div>

            <div className="md:col-span-2">
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 transition">
                {loading ? "Creating account…" : "Create account"}
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account? <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
