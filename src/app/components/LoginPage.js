// components/LoginPage.js
"use client";
import React, { useState, useEffect } from "react";

export default function LoginPage({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),  // send email, password, role
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Login failed');
        return;
      }

      // Persist both email and user_id for later API calls
      // After successful login
localStorage.setItem('userEmail', data?.user?.email || 'Not available');
localStorage.setItem('user_name', data.user.fullName);
localStorage.setItem('user_id',   data?.user?.userId || '');
localStorage.setItem('phone_number', data?.phone_number || 'Not available');


      alert('Login successful!');
      onLogin(data.user.role);
    } catch (err) {
      console.error('Login error:', err);
      alert('Something went wrong');
    }
  };
  
  return (
    <div className={`min-h-screen flex bg-white transition-opacity duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] ${visible ? "opacity-100" : "opacity-0"}`}>
      {/* Left Side - Artistic Logo Panel */}
      <div className="hidden lg:flex w-1/2 min-h-screen items-center justify-center p-12 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#ffffff_0%,#f8fafc_100%)]" />
        <div className="relative space-y-4 group">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">
            <span className="block">EchoS</span>
            <div className="h-1 w-12 bg-gray-900 mt-2 transition-all duration-300 group-hover:w-16" />
          </h1>
          <p className="text-lg text-gray-600 font-light">Event Management System</p>
        </div>
      </div>

      {/* Right Side - Elevated Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 space-y-8 group rounded-4xl shadow-lg overflow-hidden">
          <div className="space-y-6 text-black">
            {[
              { label: "Email",    name: "email",    type: "email",    placeholder: "user@example.com" },
              { label: "Password", name: "password", type: "password", placeholder: "••••••••"     },
            ].map((field, idx) => (
              <div key={field.name} className="relative animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <label className="block text-sm font-medium text-gray-600 mb-2 ml-2 tracking-wide">
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 bg-transparent border-b border-gray-200 focus:border-black focus:ring-0 transition-all duration-300 placeholder-gray-400 rounded-none peer text-sm"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-500 peer-focus:w-full" />
                </div>
              </div>
            ))}

            {/* Role Selector */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              <label className="block text-sm font-medium text-gray-600 mb-2 ml-2 tracking-wide">Role</label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-transparent border-b border-gray-200 focus:border-black focus:ring-0 transition-all duration-300 appearance-none peer text-sm"
                >
                  <option value="" disabled>Select a role</option>
                  <option value="Admin">Admin</option>
                  <option value="Event Organizer">Event Organizer</option>
                  <option value="Attendance">Attendance</option>
                </select>
                <div className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-500 peer-focus:w-full" />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-black text-white font-medium rounded hover:bg-[#BF9264] transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden group text-sm"
          >
            <span className="relative z-10">Log In</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Switch to Register */}
          <div className="text-center text-sm text-gray-600 mt-4 relative h-[80px]">
            <span className="bg-white px-2 relative z-10">New user?</span>
            <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-0" />
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-black font-medium underline underline-offset-4 hover:text-gray-800 transition-colors mt-2 inline-block"
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
