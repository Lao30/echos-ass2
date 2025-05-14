// components/RegisterPage.js
"use client";
import React, { useState, useEffect } from "react";

export default function RegisterPage({ onRegister, onSwitchToLogin}) {
    const [formData, setFormData] = useState({
        fullName: "",     
        email: "",
        phone: "",         
        userId: "",       
        password: "",
        role: "Attendance",
      });
      
      

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        // Handle registration error
        alert(data.error || 'Registration failed');
        return;
      }
  
      // Registration successful
      onRegister(formData.role);
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration');
    }
  };
  return (
    <div className={`min-h-screen flex bg-white transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0 text-black"}`}>
      {/* Left Side - Elevated Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 text-black ">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white p-8 space-y-6 rounded-2xl shadow-xl border border-gray-100"
        >
          <div className="space-y-6">
            {/* Form Header */}
           

            {/* Form Fields */}
            <div className="space-y-6 text-black">
              {[
  { label: "Full Name", name: "fullName", type: "text", placeholder: "John Doe" },
  { label: "Email", name: "email", type: "email", placeholder: "john@example.com" },
  { label: "Phone", name: "phone", type: "tel", placeholder: "089-668-987-23" },         // ✅ fixed
  { label: "User ID", name: "userId", type: "text", placeholder: "unique_id123" },        // ✅ fixed
  { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
]

.map((field, index) => (
                <div 
                  key={field.name}
                  className="relative animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity">
                    
                  </div>
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
                      className="w-full px-3 py-2 bg-transparent border-b border-gray-200 focus:border-black focus:ring-0 transition-all duration-300 placeholder-gray-400 rounded-none hover:border-gray-300 peer text-sm"
                      placeholder={field.placeholder}
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-500 peer-focus:w-full" />
                  </div>
                </div>
              ))}
              {/* Role Selection */}
              <div className="animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
  {/* Decorative arrow icon */}
  <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity">
    <svg viewBox="0 0 24 24" className="w-full h-full stroke-current" strokeWidth="1.5">
      <path d="M12 2.5l3 5.5-3 5.5-3-5.5 3-5.5z" fill="none" />
    </svg>
  </div>

  {/* Label for Role */}
  <label className="block text-sm font-medium text-gray-600 mb-2 ml-2 tracking-wide">
    Role
  </label>

  {/* Role Dropdown */}
  <div className="relative">
  <select
  name="role"
  value={formData.role}
  onChange={handleChange}
  className="w-full px-3 py-2 bg-transparent border-b border-gray-200 focus:border-black focus:ring-0 transition-all duration-300 appearance-none hover:border-gray-300 peer text-sm"
>
  <option value="Attendance">Attendance</option>
</select>
    {/* Animated line under select when focused */}
    <div className="absolute bottom-0 left-0 w-0 h-px bg-black transition-all duration-500 peer-focus:w-full" />
  </div>
</div>

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gray-900 text-white rounded-lg hover:bg-[#BF9264] transition-colors text-sm font-medium shadow-sm"
            >
              Register Now
            </button>

            {/* Login Prompt */}
            <div className="text-center text-sm text-gray-500 pt-4">
            Already have an account?{" "}
            <button 
              type="button"  // Change from <a> to <button>
              onClick={onSwitchToLogin}  // Add onClick handler
              className="text-gray-700 font-medium hover:text-gray-900 underline underline-offset-4"
            >
              Log In
            </button>
          </div>
          </div>
        </form>
      </div>

      {/* Right Side - EchoS Logo */}
      <div className="hidden lg:flex w-1/2 min-h-screen items-center justify-center p-12 bg-gray-50 relative">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100" />
        
        {/* Logo Container */}
        <div className="relative space-y-4 group">
          <h1 className="text-6xl font-black text-gray-900 tracking-tighter">
            <span className="block">EchoS</span>
            <div className="h-1 w-16 bg-gray-900 mt-2 transition-all duration-300 group-hover:w-24" />
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Precision Event Management
          </p>
        </div>
      </div>
    </div>
  );
}