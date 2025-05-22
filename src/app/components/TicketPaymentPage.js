"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Script from "next/script";

// ✅ Get client key from .env.local
const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

export default function TicketPaymentPage({
  event = {},
  selectedSeats = [],
  totalAmount = 0,
  onBack,
  onSuccess,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const title = event.event_name || event.title || "-";
  const image = event.banner_url || event.image;
  const date = event.event_date
    ? new Date(event.event_date).toLocaleDateString()
    : event.date || "-";
  const time = event.start_time || event.time || "-";

  useEffect(() => {
    console.log("⏱️ TicketPaymentPage props:", {
      event,
      selectedSeats,
      totalAmount,
    });
  }, [event, selectedSeats, totalAmount]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/events/${event.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount, seats: selectedSeats, name, email }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Payment failed");
      }

      const { token } = await res.json();

      // ✅ Trigger Midtrans Snap
      window.snap?.pay(token, {
        onSuccess: () => {
          onSuccess();
          alert("Payment successful!");
        },
        onError: () => alert("Payment error"),
      });
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto p-6">
        <button
          onClick={onBack}
          className="flex items-center mb-6 text-gray-600 hover:text-black"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back
        </button>
        <h2 className="text-2xl font-bold mb-4">Complete Your Purchase</h2>

        {/* Event Info */}
        <div className="flex items-center gap-4 mb-4">
          {image && (
            <img
              src={image}
              alt={title}
              className="w-16 h-16 rounded"
            />
          )}
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-gray-600">
              {date} • {time}
            </p>
          </div>
        </div>

        {/* Selected Seats */}
        <div className="mb-4">
          <h3 className="font-semibold">Selected Seats</h3>
          <ul className="list-disc list-inside">
            {selectedSeats.length ? (
              selectedSeats.map((s) => (
                <li key={s.id}>
                  {s.id} — ${s.price.toLocaleString()}
                </li>
              ))
            ) : (
              <li className="text-gray-500">None</li>
            )}
          </ul>
        </div>

        {/* Total */}
        <div className="flex justify-between font-bold mb-6">
          <span>Total:</span>
          <span>${totalAmount.toLocaleString()}</span>
        </div>

        {/* Customer Info */}
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-6 p-2 border rounded"
        />

        <button
          onClick={handlePayment}
          disabled={isProcessing || !selectedSeats.length}
          className="w-full bg-black text-white py-3 rounded-lg disabled:opacity-50"
        >
          {isProcessing ? "Processing…" : "Confirm Payment"}
        </button>

        {/* ✅ Midtrans Snap.js Script */}
        <Script
  src="https://app.sandbox.midtrans.com/snap/snap.js"
  data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
/>

      </div>
    </div>
  );
}


