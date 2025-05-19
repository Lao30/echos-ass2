"use client";
import React, { useState, useEffect } from 'react';

export default function OrganizerAnalytical() {
  const [summary, setSummary] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) throw new Error('Organizer ID not found in localStorage');

        const evRes = await fetch(`/api/organizer/events?user_id=${encodeURIComponent(userId)}`);
        const evData = await evRes.json();
        if (!evRes.ok) throw new Error(evData.error || 'Failed to fetch organizer events');

        const [sums, dets] = await Promise.all([
          Promise.all(evData.events.map(async e => {
            const res = await fetch(`/api/events/${e.id}/analytics`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Analytics failed for event ${e.id}`);
            return {
              eventId: e.id,
              eventName: e.event_name,
              count: data.count,
              revenue: data.revenue,
            };
          })),
          (async () => {
            const map = {};
            await Promise.all(evData.events.map(async e => {
              const res = await fetch(`/api/events/${e.id}/purchases`);
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || `Purchases failed for event ${e.id}`);
              map[e.id] = data.purchases;
            }));
            return map;
          })()
        ]);

        setSummary(sums);
        setDetails(dets);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 text-black">
      <h2 className="text-2xl font-bold mb-4 text-black">Sales Analytics</h2>

      <table className="w-full border border-black mb-8 text-black">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border border-black text-black">Event</th>
            <th className="p-2 border border-black text-black">Tickets Sold</th>
            <th className="p-2 border border-black text-black">Total Revenue (Rp)</th>
          </tr>
        </thead>
        <tbody>
          {summary.map(s => (
            <tr key={s.eventId}>
              <td className="p-2 border border-black text-black">{s.eventName}</td>
              <td className="p-2 border border-black text-black">{s.count}</td>
              <td className="p-2 border border-black text-black">{s.revenue.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {summary.map(s => (
        <div key={s.eventId} className="mb-6 text-black">
          <h3 className="text-xl font-semibold mb-2 text-black">
            Purchases for “{s.eventName}”
          </h3>
          <table className="w-full border border-black text-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border border-black text-black">Email</th>
                <th className="p-2 border border-black text-black">Amount Paid (Rp)</th>
                <th className="p-2 border border-black text-black">Date</th>
              </tr>
            </thead>
            <tbody>
              {(details[s.eventId] || []).map((p, idx) => (
                <tr key={idx}>
                  <td className="p-2 border border-black text-black">{p.userEmail}</td>
                  <td className="p-2 border border-black text-black">{p.amount.toLocaleString()}</td>
                  <td className="p-2 border border-black text-black">
                    {p.purchasedAt
                      ? new Date(p.purchasedAt).toLocaleString()
                      : "No date"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
