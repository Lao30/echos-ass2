"use client";
import React, { useState, useEffect } from "react";
import { HomeIcon, TicketIcon } from "@heroicons/react/24/outline";
import AttendeeHome from "./AttendeeHome";
import MyTickets from "./MyTickets";

export default function AttendeePage({ onSwitchToLogin, onTicketPurchase }) {
  const [events, setEvents] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [user, setUser] = useState({ name: "", email: "", phone: "" });

  // ✅ Load user from individual localStorage keys on page load
  useEffect(() => {
    const name  = localStorage.getItem("user_name")    || "";
    const email = localStorage.getItem("userEmail")    || "";
    const phone = localStorage.getItem("phone_number") || "";
    setUser({ name, email, phone });
  }, []);

  // ✅ Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        const data = await response.json();
        if (response.ok) setEvents(data.events);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <div className="text-xl font-bold text-black">LOGO</div>
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setActivePage("home")}
                  className={`flex items-center font-semibold ${
                    activePage === "home"
                      ? "text-black border-b-2 border-black"
                      : "text-gray-600 hover:text-black"
                  }`}>
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Home
                </button>
                <button
                  onClick={() => setActivePage("tickets")}
                  className={`flex items-center font-semibold ${
                    activePage === "tickets"
                      ? "text-black border-b-2 border-black"
                      : "text-gray-600 hover:text-black"
                  }`}>
                  <TicketIcon className="h-5 w-5 mr-2" />
                  My Tickets
                </button>
              </div>
            </div>

            {/* Profile Icon */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-[#BF9264] transition-colors text-white">
                <span className="text-lg font-medium">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden text-black">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-medium text-gray-900">
                      {user.name || "Unknown User"}
                    </p>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">
                        {user.email || "no-email@example.com"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm">
                        {user.phone || "+000 000 0000"}
                      </span>
                    </div>

                    <button
                      onClick={onSwitchToLogin}
                      className="w-full mt-4 bg-black text-white py-2 rounded-lg hover:bg-[#BF9264] transition-colors text-sm">
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activePage === "home" ? (
          <AttendeeHome events={events} onTicketPurchase={onTicketPurchase} />
        ) : (
          <MyTickets email={user.email} />
        )}
      </div>
    </div>
  );
}
