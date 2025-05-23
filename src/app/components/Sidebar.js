"use client";
import React from 'react';

const organizerMenuItems = [
  { name: 'Dashboard', icon: '🏠' },
  { name: 'CreateEvents', icon: '🗓️' },
  { name: 'Analytical', icon: '📊' },
  { name: 'Waitlist', icon: '⏳' },   // ← baru
];

const adminMenuItems = [
  { name: 'UserRegister', icon: '👥' },
  { name: 'AnalyticalReport', icon: '📊' },
];

export default function Sidebar({ selectedPage, setSelectedPage, isAdmin }) {
  const itemsToDisplay = isAdmin ? adminMenuItems : organizerMenuItems;

  return (
    <div className="mt-10 ml-5 w-[300px] h-[900px] bg-[#e3e3e3] p-4 shadow-md rounded-4xl">
      <div className='flex items-center mb-10'>
        <img src='/assets/logo.png' className='h-[50px] w-[50px]'/>
        <h1 className='ml-2 text-black font-extrabold text-[18px]'>EchoS</h1>
      </div>
      {itemsToDisplay.map(item => (
        <div
          key={item.name}
          onClick={() => setSelectedPage(item.name)}
          className={`flex items-center p-3 mb-2 cursor-pointer rounded-md text-black ${
            selectedPage === item.name ? 'bg-[#BF9264] font-bold' : ''
          }`}
        >
          <span className="mr-3 text-xl">{item.icon}</span>
          {item.name}
        </div>
      ))}
    </div>
  );
}
