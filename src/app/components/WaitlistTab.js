import React, { useState, useEffect } from "react";

export default function WaitlistTab({ eventId, eventName }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!eventId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/waitlist?eventId=${eventId}`);
        const data = await res.json();
        if (data.success) setEntries(data.entries);
      } catch (err) {
        console.error("Failed to fetch waitlist:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  const handleAccept = async (id) => {
    if (!confirm("Accept this user and remove from waitlist?")) return;
    try {
      const res = await fetch(`/api/waitlist/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      } else {
        throw new Error(data.error || "Failed to accept entry");
      }
    } catch (err) {
      console.error("Error accepting waitlist entry:", err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg
          className="animate-spin h-8 w-8 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {eventName} Waitlist
      </h2>

      {entries.length === 0 ? (
        <p className="text-gray-500 italic">Nobody has joined the waitlist yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {e.event_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {e.user_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {e.user_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleAccept(e.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Accept
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
