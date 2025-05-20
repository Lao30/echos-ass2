// app/page.js (or wherever your Page component lives)
"use client";

import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import AdminDashboard from "./components/AdminDashboard";
import AttendeePage from "./components/AttendeePage";
import EventDetailPage from "./components/EventDetailPage";
import SeatSelectionPage from "./components/SeatSelectionWithPayment";
import TicketPaymentPage from "./components/TicketPaymentPage";
import OrganizerAnalytical from "./components/OrganizerAnalytical";  // ← import it

export default function Page() {
  const [isLoggedIn, setIsLoggedIn]       = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedPage, setSelectedPage]   = useState("Dashboard");
  const [userRole, setUserRole]           = useState(null);
  const [showPaymentPage, setShowPaymentPage]   = useState(false);
  const [selectedEvent, setSelectedEvent]       = useState(null);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [showEventDetail, setShowEventDetail]     = useState(false);
  const [paymentSuccess, setPaymentSuccess]   = useState(false);

  // Seat → payment flow data
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice]       = useState(0);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setSelectedPage(
      role === "Event Organizer" ? "Dashboard" :
      role === "Admin"           ? "UserRegister" :
                                   "Events"
    );
  };

  const handleRegister = (role) => {
    setIsLoggedIn(false);
    setIsRegistering(false);
    setUserRole(role);
  };

  const handleSwitchToRegister = () => setIsRegistering(true);
  const handleSwitchToLogin    = () => {
    setIsLoggedIn(false);
    setIsRegistering(false);
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      setShowPaymentPage(false);
      setPaymentSuccess(false);
    }, 3000);
  };

  const handleSeatSelection = (seats, total) => {
    setSelectedSeats(seats);
    setTotalPrice(total);
    setShowSeatSelection(false);
    setShowPaymentPage(true);
  };

  return (
    <>
      {/* 1) Not logged in */}
      {!isLoggedIn ? (
        isRegistering ? (
          <RegisterPage
            onRegister={handleRegister}
            onSwitchToLogin={handleSwitchToLogin}
          />
        ) : (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToRegister={handleSwitchToRegister}
          />
        )
      ) : userRole === "Event Organizer" ? (
        /* 2) Event Organizer view */
        <div className="flex min-h-screen bg-white">
          <Sidebar
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
          />

          <main className="flex-1 p-6">
            {selectedPage === "Analytical" ? (
              <OrganizerAnalytical />
            ) : (
              <MainContent
                selectedPage={selectedPage}
                setSelectedPage={setSelectedPage}
                onSwitchToLogin={handleSwitchToLogin}
                onCheckout={(event) => {
                  setSelectedEvent(event);
                  setShowEventDetail(true);
                }}
              />
            )}
          </main>
        </div>

      ) : userRole === "Admin" ? (
        /* 3) Admin view */
        <div className="flex min-h-screen bg-white">
          <Sidebar
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
            isAdmin={true}
          />
          <AdminDashboard
            selectedPage={selectedPage}
            onSwitchToLogin={handleSwitchToLogin}
          />
        </div>

      ) : showPaymentPage ? (
        /* 4) Payment Page */
        <TicketPaymentPage
          event={selectedEvent}
          onBack={() => {
            setShowPaymentPage(false);
            setShowSeatSelection(true);
          }}
          onSuccess={handlePaymentSuccess}
        />

      ) : showSeatSelection ? (
        /* 5) Seat Selection */
        <SeatSelectionPage
          event={selectedEvent}
          onBack={() => {
            setShowSeatSelection(false);
            setShowEventDetail(true);
          }}
          onCheckout={handleSeatSelection}
        />

      ) : showEventDetail ? (
        /* 6) Event Detail (Attendee) */
        <EventDetailPage
          event={selectedEvent}
          onBack={() => setShowEventDetail(false)}
          onCheckout={() => {
            setShowEventDetail(false);
            setShowSeatSelection(true);
          }}
        />

      ) : (
        /* 7) Default Attendee view */
        <AttendeePage
          onSwitchToLogin={handleSwitchToLogin}
          onTicketPurchase={(event) => {
            setSelectedEvent(event);
            setShowEventDetail(true);
          }}
        />
      )}

      {paymentSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up">
          Payment successful! Redirecting back to events...
        </div>
      )}
    </>
  );
}
