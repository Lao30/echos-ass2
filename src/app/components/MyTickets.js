"use client";

import React, { useState, useEffect } from "react";

export default function MyTickets({ email }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!email) return;

    async function loadTickets() {
      try {
        const res = await fetch(`/api/my-tickets?email=${encodeURIComponent(email)}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Failed to load tickets");
        }
        setTickets(json.tickets);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [email]);

  if (loading) {
    return <p className="text-center py-20">Loading your tickets…</p>;
  }

  if (error) {
    return <p className="text-center py-20 text-red-600">Error: {error}</p>;
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Your Tickets</h2>
        <p className="mt-4 text-gray-600">You haven’t bought any tickets yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-6 text-black">
      <h2 className="text-2xl font-bold">My Tickets</h2>
      {tickets.map((t) => (
        <div
          key={t.id}
          className="flex justify-between p-6 border rounded-lg bg-white shadow-sm"
        >
          <div>
            <h3 className="text-lg font-semibold">{t.event_name}</h3>
            <p className="text-sm text-gray-600">
              {new Date(t.event_date).toLocaleDateString()} • {t.start_time}–{t.end_time}
            </p>
            <p className="text-sm text-gray-600">Venue: {t.venue}</p>
            <p className="text-sm text-gray-600">Seat: {t.seat}</p>
            <p className="text-sm text-gray-600">Category: {t.category}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">Rp {t.amount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              Purchased: {new Date(t.purchased_at).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
