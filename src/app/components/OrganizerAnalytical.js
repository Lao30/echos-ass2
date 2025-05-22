"use client";
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';


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

   const processPurchaseData = (purchases) => {
    const grouped = purchases.reduce((acc, purchase) => {
      const date = new Date(purchase.purchasedAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + purchase.amount;
      return acc;
    }, {});
    return Object.entries(grouped).map(([date, amount]) => ({ date, amount }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Event Analytics Dashboard</h2>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-4 rounded-lg mb-8">
            <p className="text-red-600 font-medium">⚠️ Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Summary Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Sales Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="eventName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Tickets Sold" fill="#4F46E5" />
                    <Bar dataKey="revenue" name="Revenue (Rp)" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets Sold</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summary.map(s => (
                      <tr key={s.eventId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.eventName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{s.count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                          Rp{s.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Purchases */}
            {summary.map(s => (
              <div key={s.eventId} className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Purchase Trends for “{s.eventName}”</h3>
                
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={processPurchaseData(details[s.eventId] || [])}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name="Daily Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(details[s.eventId] || []).map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.userEmail}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                            Rp{p.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {p.purchasedAt ? new Date(p.purchasedAt).toLocaleString() : "N/A"}
                          </td>
                        </tr>
                      ))}
                      {(!details[s.eventId] || details[s.eventId].length === 0) && (
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                            No purchases found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}