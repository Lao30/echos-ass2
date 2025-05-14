"use client";
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import AdminDashboard from "./components/AdminDashboard";
import AttendeePage from "./components/AttendeePage"; 
import EventDetailPage from "./components/EventDetailPage";
import SeatSelectionPage from "./components/SeatSelectionPage";
import TicketPaymentPage from "./components/TicketPaymentPage";

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedPage, setSelectedPage] = useState("Dashboard");
  const [userRole, setUserRole] = useState(null);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [editingEvent, setEditingEvent] = useState(null);
 

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    setSelectedPage(role === "Event Organizer" ? "Dashboard" : 
      role === "Admin" ? "UserRegister" : 
      "Events"
    );
  };

  const handleRegister = (role) => {
    setIsLoggedIn(false);
    setIsRegistering(false);
    setUserRole(role);
  };

  const handleSwitchToRegister = () => {
    setIsRegistering(true);
  };

  const handleSwitchToLogin = () => {
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
  const [showEventDetail, setShowEventDetail] = useState(false);

  const handleSeatSelection = (seats, total) => {
    setSelectedSeats(seats);
    setTotalPrice(total);
    setShowSeatSelection(false);
    setShowPaymentPage(true);  // Go to payment page after seat selection
  };
  return (
    <>
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
        <div className="flex min-h-screen bg-white">
          <Sidebar selectedPage={selectedPage} setSelectedPage={setSelectedPage} />
          <MainContent selectedPage={selectedPage} setSelectedPage={setSelectedPage}  onSwitchToLogin={handleSwitchToLogin}/>
        </div>
      ) : userRole === "Admin" ? (
        <div className="flex min-h-screen bg-white">
          <Sidebar selectedPage={selectedPage} setSelectedPage={setSelectedPage} isAdmin={true} />
          <AdminDashboard selectedPage={selectedPage} onSwitchToLogin={handleSwitchToLogin} />
        </div>
      ) : showPaymentPage ? (
        <TicketPaymentPage 
          event={selectedEvent}
          onBack={() => {
            setShowPaymentPage(false);
            setShowSeatSelection(true); // Go back to seat selection
          }}
          onSuccess={handlePaymentSuccess}
        />
      ) : showSeatSelection ? (
        <SeatSelectionPage
          event={selectedEvent}
          onBack={() => {
            setShowSeatSelection(false);
            setShowEventDetail(true);
          }}
          onCheckout={handleSeatSelection}
        />
      ) :showEventDetail ? (
        <EventDetailPage 
          event={selectedEvent}
          onBack={() => setShowEventDetail(false)}
          onCheckout={() => {
            setShowEventDetail(false);
            setShowSeatSelection(true);
          }}
        />
      ) : (
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