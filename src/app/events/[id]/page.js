"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SeatSelectionWithPayment from "@/components/SeatSelectionWithPayment";

export default function EventBooking({ params }) {
  const router = useRouter();
  const { id } = params;
  const [event, setEvent] = useState(null);

  // Fetch event details once on mount
  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setEvent(json.event);
        } else {
          console.error("Failed to load event:", json.error);
        }
      })
      .catch((err) => {
        console.error("Error fetching event:", err);
      });
  }, [id]);

  if (!event) return <div>Loading event…</div>;

  return (
    <SeatSelectionWithPayment
      event={event}
      onBack={() => router.back()}
      onSuccess={(customerEmail) => {
        // after payment+receipt, go to My Tickets page with ?email=
        router.push(`/my-tickets?email=${encodeURIComponent(customerEmail)}`);
      }}
    />
  );
}
