// components/SeatSelectionWithPayment.js
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Script from "next/script";
import { jsPDF } from "jspdf";

export default function SeatSelectionWithPayment({
  event,
  onBack,
  onSuccess = () => {},
}) {
  const router = useRouter();
  const [seatSections, setSeatSections] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Auto-load name & email from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("user_name");
    const storedEmail = localStorage.getItem("userEmail");
    if (storedName) setName(storedName);
    if (storedEmail) setEmail(storedEmail);
  }, []);

  // Fetch seat sections
  useEffect(() => {
    async function fetchSeatSections() {
      try {
        const res = await fetch(`/api/ticket?eventId=${event.id}`);
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const { sections } = await res.json();
        setSeatSections(sections.map(sec => ({ ...sec, price: Number(sec.price) })));
      } catch (err) {
        console.error("Error loading sections", err);
      }
    }
    if (event?.id) fetchSeatSections();
  }, [event]);

  // Fetch promotions
  const [promotions, setPromotions] = useState([]);
  const [enteredCode, setEnteredCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [discountedTotal, setDiscountedTotal] = useState(null);

  useEffect(() => {
    async function fetchPromos() {
      try {
        const res = await fetch(`/api/promotions?eventId=${event.id}`);
        const data = await res.json();
        if (data.success) setPromotions(data.promotions);
      } catch (err) {
        console.error("Error loading promotions", err);
      }
    }
    if (event?.id) fetchPromos();
  }, [event]);

  // Seat toggle
  const toggleSeat = useCallback((id, price) => {
    setSelectedSeat(prev => (prev?.id === id ? null : { id, price }));
    setDiscountedTotal(null);
    setEnteredCode("");
    setPromoError("");
  }, []);

  const calculateTotal = selectedSeat ? selectedSeat.price : 0;

  // Apply promo code
  const handleApplyCode = () => {
    setPromoError("");
    if (!enteredCode) return setPromoError("Please enter a code");
    const promo = promotions.find(
      p => p.promo_code.toLowerCase() === enteredCode.trim().toLowerCase()
    );
    if (!promo) return setPromoError("Invalid promo code");
    if (new Date(promo.valid_until) < new Date()) return setPromoError("Promo expired");

    let total = calculateTotal;
    if (promo.discount_type === "percentage") {
      total -= (total * promo.discount_amount) / 100;
    } else {
      total -= promo.discount_amount;
    }
    setDiscountedTotal(Math.max(0, total));
  };

  // Handle payment
  const handlePayment = async () => {
    if (!selectedSeat || !name) return;
    setIsProcessing(true);

    try {
      const amount = Math.round(discountedTotal ?? calculateTotal);
      const items  = [{ ...selectedSeat, price: amount }];

      const res = await fetch(`/api/events/${event.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, seats: items, name, email }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Payment failed");
      }
      const { token } = await res.json();

      window.snap?.pay(token, {
        onSuccess: () => {
          alert("Pembayaran berhasil! Siapkan receipt...");
          const seatNum = selectedSeat.id.match(/\d+/)[0];
          const doc     = new jsPDF();
          let y = 20;
          doc.setFontSize(18);
          doc.text("Payment Receipt", 20, y);
          y += 20;
          doc.setFontSize(12);
          doc.text(`Name: ${name}`, 20, y); y += 10;
          doc.text(`Email: ${email}`, 20, y); y += 10;
          doc.text(`Event: ${event.event_name}`, 20, y); y += 10;
          doc.text(`Seat: ${seatNum}`, 20, y); y += 10;
          if (discountedTotal != null) {
            doc.text(`Promo Code: ${enteredCode}`, 20, y); y += 10;
          }
          doc.text(`Total Paid: Rp ${amount.toLocaleString()}`, 20, y);

          const blob = doc.output("blob");
          setReceiptUrl(URL.createObjectURL(blob));
          setShowModal(true);
          onSuccess();
        },
        onError: () => alert("Pembayaran gagal"),
      });
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Receipt Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 text-center text-black">
            <h3 className="text-xl font-bold mb-4 ">Success!</h3>
            <p className="mb-4">Download your receipt below:</p>
            <a
              href={receiptUrl}
              download="receipt.pdf"
              className="bg-black text-white px-4 py-2 rounded mb-2 inline-block hover:bg-[#BF9264]"
            >
              Download Receipt
            </a>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-600 hover:text-black block"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="min-h-screen bg-white">
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <button
            onClick={onBack}
            className="flex items-center mb-8 text-gray-600 hover:text-black"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back
          </button>

          <h1 className="text-3xl font-bold mb-6 text-black">
            Select Your Seat — {event.event_name}
          </h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Seat Map */}
            <div className="flex-1 bg-white p-6 rounded-xl border border-gray-100 text-black">
              <div className="text-center mb-8">
                <div className="h-2 bg-gray-200 rounded-full mb-2" />
                <span className="text-sm text-gray-600">STAGE</span>
              </div>
              {seatSections.map((sec, idx) => {
                const rows = [];
                for (let i = 1; i <= sec.capacity; i += 10) {
                  rows.push(
                    Array.from(
                      { length: Math.min(10, sec.capacity - i + 1) },
                      (_, j) => i + j
                    )
                  );
                }
                return (
                  <div key={idx} className="mb-10">
                    <h3 className="font-semibold mb-3">
                      {sec.name} — Rp {sec.price.toLocaleString()}
                    </h3>
                    {rows.map((row, rIdx) => (
                      <div key={rIdx} className="flex justify-center gap-2 mb-2">
                        {row.map(num => {
                          const id = `${num}${sec.name}`;
                          const sel = selectedSeat?.id === id;
                          return (
                            <button
                              key={id}
                              onClick={() => toggleSeat(id, sec.price)}
                              className={`w-8 h-8 rounded text-sm font-medium ${
                                sel
                                  ? "bg-[#BF9264] text-white"
                                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Summary & Payment */}
            <div className="lg:w-96 bg-white p-6 rounded-xl border border-black text-black">
              <h2 className="text-xl text-black font-bold mb-4">Summary & Payment</h2>

              {/* Selected Seat & Totals */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Seat</span>
                  <span>{selectedSeat?.id || "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {calculateTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-4 text-black">
                <input
                  type="text"
                  placeholder="Promo Code"
                  value={enteredCode}
                  onChange={e => setEnteredCode(e.target.value)}
                  className="w-full mb-2 p-2 border rounded"
                />
                <button
                  onClick={handleApplyCode}
                  className="w-full bg-black hover:bg-[#BF9264] text-white py-2 rounded"
                >
                  Apply Code
                </button>
                {promoError && <p className="text-red-600 text-sm mt-1">{promoError}</p>}
              </div>

              {/* Total */}
              <div className="flex justify-between font-bold mb-4">
                <span>Total</span>
                <span>Rp {(discountedTotal ?? calculateTotal).toLocaleString()}</span>
              </div>

              {/* Name (editable) */}
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
              />

              {/* Pay Now */}
              <button
                onClick={handlePayment}
                disabled={!selectedSeat || !name || isProcessing}
                className="w-full bg-black hover:bg-[#BF9264] text-white py-2 rounded"
              >
                {isProcessing ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
