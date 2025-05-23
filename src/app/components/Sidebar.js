"use client";
import React from 'react';
import '../../app/globals.css';

const organizerMenuItems = [
  { name: 'Dashboard', icon: '🏠' },
  { name: 'CreateEvents', icon: '🗓️' },
  { name: 'Analytical', icon: '📊' },
];

const adminMenuItems = [
  { name: 'UserRegister', icon: '👥' },
  { name: 'AnalyticalReport', icon: '📊' },
];

export default function Sidebar({ selectedPage, setSelectedPage, isAdmin }) {
  const itemsToDisplay = isAdmin ? adminMenuItems : organizerMenuItems;

  return (
    <div className="mt-10 ml-5 w-[300px] h-[900px] bg-[#e3e3e3] p-4 shadow-md rounded-4xl justify-center items-center">
      <div className="text-2xl font-bold mb-6">LOGO</div>
      {itemsToDisplay.map((item) => (
        <div
          key={item.name}
          onClick={() => setSelectedPage(item.name)}
          className={`flex items-center p-3 mb-2 cursor-pointer rounded-md text-black ${
            selectedPage === item.name ? 'bg-[#BF9264] font-bold' : ''
          }`}
        >
          <span className="w-6 h-6 text-sm text-black flex items-center justify-center rounded-full mr-3">
            {item.icon}
          </span>
          {item.name}
        </div>
      ))}
    </div>
  );
}