import React, { useState, useEffect } from "react";

export default function AttendeeHome({ events, onTicketPurchase }) {
  const [processedEvents, setProcessedEvents] = useState([]);
  const [enteredPromo, setEnteredPromo] = useState({});
  const [appliedPromos, setAppliedPromos] = useState({});
  

  // Preprocess events to ensure originalPrice & discountedPrice
  useEffect(() => {
    const list = events.map((event) => {
      const basePrice = event.originalPrice ?? event.price;
      let bestDiscount = event.discountedPrice ?? basePrice;
      if (event.promotionData?.length) {
        event.promotionData.forEach((promo) => {
          let calc = basePrice;
          if (promo.discount_type === "percentage") {
            calc = basePrice - (basePrice * promo.discount_amount) / 100;
          } else {
            calc = basePrice - promo.discount_amount;
          }
          if (calc < bestDiscount) bestDiscount = Math.max(0, calc);
        });
      }
      return { ...event, originalPrice: basePrice, discountedPrice: bestDiscount };
    });
    setProcessedEvents(list);
  }, [events]);

  const handleApplyPromo = (eventId, event) => {
    const code = enteredPromo[eventId]?.trim().toLowerCase();
    const promo = event.promotionData?.find(
      (p) => p.promo_code.toLowerCase() === code
    );
    if (!promo) {
      alert("Invalid promo code");
      return;
    }
    const basePrice = event.originalPrice;
    let calc = basePrice;
    if (promo.discount_type === "percentage") {
      calc = basePrice - (basePrice * promo.discount_amount) / 100;
    } else {
      calc = basePrice - promo.discount_amount;
    }
    if (calc < 0) calc = 0;
    setAppliedPromos((prev) => ({
      ...prev,
      [eventId]: { discountedPrice: calc, originalPrice: basePrice },
    }));
  };

  return (
    <>
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Browse Upcoming Events
        </h1>
        <p className="text-gray-600">Discover curated experiences in your city</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {processedEvents.map((event) => {
          const promoApplied = appliedPromos[event.id];
          const basePrice = event.originalPrice;
          const displayedPrice = promoApplied
            ? promoApplied.discountedPrice
            : event.discountedPrice;
          const percentDiscount =
            basePrice > displayedPrice
              ? Math.round(((basePrice - displayedPrice) / basePrice) * 100)
              : 0;

          return (
            <div
              key={event.id}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 relative"
            >
              {/* Promotion Badge */}
              {event.promotion && (
                <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-xl text-sm font-medium z-10">
                  {event.promotion}
                </div>
              )}

              {event.banner_url && (
                <div className="relative">
                  <img
                    src={event.banner_url}
                    alt={event.event_name}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  {/* Price Overlay */}
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

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {event.event_name}
                  </h3>
                  <span className="bg-black text-white px-3 py-1 rounded-full text-sm">
                    {event.category}
                  </span>
                </div>

                {/* Display discount percent */}
                {percentDiscount > 0 && (
                  <div className="mb-4 text-sm text-green-600 font-medium">
                    {percentDiscount}% OFF
                  </div>
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-gray-600">{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-gray-600">
                        {new Date(event.event_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {event.start_time} - {event.end_time}
                      </p>
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {event.description}
                    </p>
                  )}

                  {/* Promo Code Input */}
                  {event.promotionData?.length > 0 && (
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

                <button
                  onClick={() =>
                    onTicketPurchase({
                      ...event,
                      finalPrice: displayedPrice,
                      appliedPromo: promoApplied?.appliedCode || null,
                    })
                  }
                  className="w-full py-2 bg-black text-white rounded-lg hover:bg-[#BF9264] transition-colors relative"
                >
                  {basePrice > displayedPrice && (
                    <span className="absolute -top-3 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      Save ${(basePrice - displayedPrice).toFixed(2)}
                    </span>
                  )}
                  Get Tickets
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}