"use client";
import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function AdminDashboard({ selectedPage, onSwitchToLogin }) {
  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  


// In your AdminDashboard component
const [analytics, setAnalytics] = useState({
  totalOrganizers: 0,
  avgEventsPerOrg: 0,
  growthData: []
});

// Add this useEffect
useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/organizers');
      const res = await response.json();
const data = res.data; // 👈 extract the actual data object

      
  setAnalytics({
  totalOrganizers: data.total || 0,
  avgEventsPerOrg: data.avgEvents || 0,
  activeEvents: data.activeEvents || 0,
  growthData: Array.isArray(data.growth)
    ? data.growth.map(item => ({
        month: new Date(item.month + "-01").toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: Number(item.count)
      }))
    : []
});



      
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setErrorMessage('Failed to load analytics data');
    }
  };

  if (selectedPage === 'AnalyticalReport') {
    fetchAnalytics();
  }
}, [selectedPage]);

  // Fetch users when UserRegister section is active
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/getuser');
        
        if (!response.ok) {
          console.error('Error response:', await response.text());
          return;
        }
        
        const data = await response.json();
        setUsers(data.users);
        
      } catch (error) {
        console.error('Failed to load user data:', error);
        setErrorMessage('Failed to load user data');
      }
    };
  
    if (selectedPage === 'UserRegister') {
      fetchUsers();
    }
  }, [selectedPage]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
  
    const form = event.target;
    const formData = {
      fullName: form.fullName.value,
      email: form.email.value.trim().toLowerCase(),
      phone: form.phone.value,
      password: form.password.value
    };

    const emailExists = users.some(user => user.email.toLowerCase() === formData.email);
  if (emailExists) {
    window.alert('This email has already been registered!');
    return;
  }

    try {
      const response = await fetch('/api/myadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const responseText = await response.text();
      
      try {
        const data = JSON.parse(responseText);
        
        if (response.ok) {
          form.reset();
          window.alert('Event Organizer account successfully created!');
          // Refresh user list
          const usersResponse = await fetch('/api/getuser');
          const usersData = await usersResponse.json();
          setUsers(usersData.users);
        } else {
          setErrorMessage(data.error || 'Failed to create account');
        }
      } catch (e) {
        setErrorMessage(responseText || 'Invalid server response');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Connection to server failed');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
  
    try {
      const response = await fetch(`/api/deleteuser?userId=${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
  
      if (response.ok) {
        setUsers(prev => prev.filter(user => user.user_id !== userId));
        window.alert('User successfully deleted');
      } else {
        setErrorMessage(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setErrorMessage('Server error occurred');
    }
  };

  
  const renderContent = () => {
    switch (selectedPage) {
      case 'UserRegister':
        return (
          <div className="mt-8 bg-gradient-to-br from-white via-gray-50 to-white p-10 rounded-xl shadow-lg border border-gray-200 text-black max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center text-[#1F2937] mb-8 relative after:content-[''] after:block after:w-16 after:h-1 after:bg-[#BF9264] after:mx-auto after:mt-2">
              Register New Event Organiser
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
  {[
    { label: 'Full Name', name: 'fullName', type: 'text', placeholder: 'Enter organizer name' },
    { label: 'Email', name: 'email', type: 'email', placeholder: 'Enter email address' },
    { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: 'Enter phone number' },
    { label: 'Password', name: 'password', type: 'password', placeholder: 'Enter password' },
  ].map((field, index) => (
    <div key={index}>
      <label className="block text-sm font-medium text-gray-800 mb-1">{field.label}</label>
      <input
        name={field.name}  // Set the name attribute to match backend
        type={field.type}
        placeholder={field.placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#BF9264] focus:outline-none transition duration-150 ease-in-out"
        required
      />
    </div>
  ))}

  <button
    type="submit"
    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
  >
    Create Account
  </button>
</form>


<div className="mt-12 border-t pt-8">
  <h3 className="text-xl font-semibold mb-4 text-gray-800">Registered Event Organizer</h3>
  <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
    {users.length === 0 ? (
      <p>There are no registered users yet</p>
    ) : (
      <ul className="space-y-2">
        {users.map(user => (
          <li 
            key={user.user_id}
            className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{user.full_name}</h4>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
        {user.role}
      </span>
      <button 
  onClick={() => handleDelete(user.user_id)}
  className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
</button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
            Registered on: {new Date(user.created_at).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>
  </div>
        );

case 'AnalyticalReport':
  return (
    <div className="mt-8 bg-gradient-to-br from-white via-gray-50 to-white p-8 rounded-xl shadow-lg border border-gray-200 text-black max-w-4xl mx-auto">
      <h2 className="text-3xl font-extrabold text-center text-[#1F2937] mb-8 relative after:content-[''] after:block after:w-16 after:h-1 after:bg-[#BF9264] after:mx-auto after:mt-2">
        Organizer Analytics
      </h2>

      {/* Key Metrics Card */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Organizers</p>
              <p className="text-2xl font-bold mt-1">{analytics.totalOrganizers}</p>
              <p className="text-xs text-gray-400 mt-1">Registered organizers</p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Organizer Growth Over Time</h3>
        <LineChart width={600} height={300} data={analytics.growthData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#8884d8" 
            strokeWidth={2} 
            name="New Organizers"
          />
        </LineChart>
      </div>
    </div>
  );
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">{selectedPage}</h1>
        <button 
          onClick={onSwitchToLogin}
          className="px-4 py-2 bg-black hover:bg-[#BF9264] rounded-2xl text-sm"
        >
          Logout
        </button>
      </div>
      
      {renderContent()}
    </div>
  );
}