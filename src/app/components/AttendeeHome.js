// components/AttendeeHome.js
import React, { useState, useEffect } from "react";

export default function AttendeeHome({
  events,
  onTicketPurchase,
  onJoinWaitlist, // callback opsional untuk parent
}) {
  const [processedEvents, setProcessedEvents] = useState([]);
  const [enteredPromo, setEnteredPromo] = useState({});
  const [appliedPromos, setAppliedPromos] = useState({});
  const [availability, setAvailability] = useState({});
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // 0) Load user info dari localStorage
  useEffect(() => {
    setUserName(localStorage.getItem("user_name") || "");
    setUserEmail(localStorage.getItem("userEmail") || "");
  }, []);

  // 1) Hitung originalPrice & discountedPrice
  useEffect(() => {
    const list = events.map((event) => {
      const base = event.originalPrice ?? event.price ?? 0;
      let best = event.discountedPrice ?? base;
      event.promotionData?.forEach((promo) => {
        const calc =
          promo.discount_type === "percentage"
            ? base - (base * promo.discount_amount) / 100
            : base - promo.discount_amount;
        best = Math.min(best, Math.max(0, calc));
      });
      return { ...event, originalPrice: base, discountedPrice: best };
    });
    setProcessedEvents(list);
  }, [events]);

  // 2) Fetch total capacity & reservedCount per event
  useEffect(() => {
    async function loadAvailability() {
      const map = {};
      await Promise.all(
        events.map(async (evt) => {
          // a) total kapasitas
          const secRes = await fetch(`/api/ticket?eventId=${evt.id}`);
          const { sections = [] } = await secRes.json();
          const capacity = sections.reduce((sum, s) => sum + Number(s.capacity || 0), 0);

          // b) reserved seats count
          const resRes = await fetch(`/api/seats/reserved?eventId=${evt.id}`);
          const { reserved = [] } = await resRes.json();
          const reservedCount = reserved.length;

          map[evt.id] = { capacity, reservedCount };
        })
      );
      setAvailability(map);
    }
    if (events.length) loadAvailability();
  }, [events]);

  // 3) Apply promo
  const handleApplyPromo = (eventId, event) => {
    const code = (enteredPromo[eventId] || "").trim().toLowerCase();
    const promo = event.promotionData?.find((p) => p.promo_code.toLowerCase() === code);
    if (!promo) {
      alert("Invalid promo code");
      return;
    }
    const base = event.originalPrice;
    const calc =
      promo.discount_type === "percentage"
        ? base - (base * promo.discount_amount) / 100
        : base - promo.discount_amount;

    setAppliedPromos((prev) => ({
      ...prev,
      [eventId]: {
        appliedCode:     promo.promo_code,
        discountedPrice: Math.max(0, calc),
        originalPrice:   base,
      },
    }));
  };

  // 4) Join waitlist: POST ke /api/waitlist
  const joinWaitlist = async (evt) => {
    alert("Join waitlist success");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id:    evt.id,
          event_name:  evt.event_name,   // ← pastikan dikirim
          user_name:   userName,
          user_email:  userEmail,
        }),
      });
      if (!res.ok) throw new Error("Failed to join waitlist");
      const data = await res.json();
      onJoinWaitlist?.({
        eventId:    evt.id,
        eventName:  evt.event_name,
        userName,
        userEmail,
        time: data.entry?.created_at,
      });
    } catch (err) {
      console.error(err);
      alert("Gagal menambahkan ke waitlist");
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Browse Upcoming Events
        </h1>
        <p className="text-gray-600">Discover curated experiences in your city</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {processedEvents.map((event) => {
          const promoApplied = appliedPromos[event.id];
          const basePrice     = event.originalPrice;
          const displayedPrice = promoApplied
            ? promoApplied.discountedPrice
            : event.discountedPrice;
          const percentDiscount =
            basePrice > displayedPrice
              ? Math.round(((basePrice - displayedPrice) / basePrice) * 100)
              : 0;

          const { capacity = 0, reservedCount = 0 } = availability[event.id] || {};
          const available = capacity - reservedCount;
          const soldOut   = capacity > 0 && available <= 0;

          return (
            <div
              key={event.id}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 relative"
            >
              {/* Badge promo */}
              {event.promotion && (
                <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-xl text-sm font-medium z-10">
                  {event.promotion}
                </div>
              )}

              {/* Banner */}
              {event.banner_url && (
                <div className="relative">
                  <img
                    src={event.banner_url}
                    alt={event.event_name}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  {basePrice > displayedPrice && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">
                          ${displayedPrice.toFixed(2)}
                        </span>
                        <span className="text-gray-300 line-through text-sm">
                          ${basePrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Konten utama */}
              <div className="p-6 text-black">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold">{event.event_name}</h3>
                  <span className="bg-black text-white px-3 py-1 rounded-full text-sm">
                    {event.category}
                  </span>
                </div>

                {percentDiscount > 0 && (
                  <div className="mb-4 text-sm text-green-600 font-medium">
                    {percentDiscount}% OFF
                  </div>
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">
                      {new Date(event.event_date).toLocaleDateString()}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {event.description}
                    </p>
                  )}

                  {/* Input promo (jika belum sold out) */}
                  {event.promotionData?.length > 0 && !soldOut && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={enteredPromo[event.id] || ""}
                        onChange={(e) =>
                          setEnteredPromo({
                            ...enteredPromo,
                            [event.id]: e.target.value,
                          })
                        }
                        placeholder="Enter promo code"
                        className="border border-gray-300 rounded px-2 py-1 w-full mb-2"
                      />
                      <button
                        onClick={() => handleApplyPromo(event.id, event)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 rounded"
                      >
                        Apply Promo
                      </button>
                    </div>
                  )}
                </div>

                {/* Button aksi */}
                {soldOut ? (
                  <button
                    onClick={() => joinWaitlist(event)}
                    className="w-full py-2 rounded-lg bg-black text-white hover:bg-[#BF9264]"
                  >
                    Join Waitlist
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      onTicketPurchase({
                        ...event,
                        finalPrice:   displayedPrice,
                        appliedPromo: promoApplied?.appliedCode || null,
                      })
                    }
                    className="w-full py-2 rounded-lg bg-black text-white hover:bg-[#BF9264]"
                  >
                    Get Tickets
                  </button>
                )}

                {soldOut && (
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    Event is sold out.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
