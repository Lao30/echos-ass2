"use client";
import { useState, useEffect } from 'react';

export default function Promotions({ setSelectedPage, selectedEventId }) {
  const [promoCode, setPromoCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountAmount, setDiscountAmount] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [promotions, setPromotions] = useState([]);

  const handleCreatePromotion = async (e) => {
    e.preventDefault();
    if (!promoCode || !discountAmount || !validUntil) {
      alert('Please fill in all required fields');
      return;
    }
  
    try {
        const response = await fetch('/api/promotions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              promo_code: promoCode,
              discount_type: discountType,
              discount_amount: discountAmount,
              valid_until: validUntil,
              event_id: selectedEventId
            }),
          });
          
  
      const data = await response.json();
  
      if (!data.success) {
        console.error('❌ Error:', data.error);
        throw new Error(data.error);
      }
  
      setPromotions([...promotions, data.promotion]);
      setPromoCode('');
      setDiscountAmount('');
      setValidUntil('');
  
    } catch (err) {
      console.error('❌ Error creating promotion:', err);
    }
  };

  const handleDeletePromotion = async (promotionId) => {
  try {
    const response = await fetch(`/api/promotions/${promotionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
  const text = await response.text();
  console.error('Server Error:', text);
  throw new Error('Failed to delete promotion');
}

    const data = await response.json();

    if (!data.success) {
      console.error('❌ Error:', data.error);
      throw new Error(data.error);
    }

    // Update state to remove the deleted promotion
    setPromotions(promotions.filter(promo => promo.id !== promotionId));
  } catch (err) {
    console.error('❌ Error deleting promotion:', err);
  }
};

  
  useEffect(() => {
  const fetchPromotions = async () => {
    try {
      const response = await fetch(`/api/promotions?eventId=${selectedEventId}`);
      const data = await response.json(); // ✅ Fix: parse the JSON first
      if (data.success) {
        setPromotions(data.promotions);
      } else {
        console.error('❌ Failed to load promotions:', data.error);
      }
    } catch (error) {
      console.error('❌ Error loading promotions:', error);
    }
  };

  if (selectedEventId) {
    fetchPromotions();
  }
}, [selectedEventId]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Promotion Management</h2>
        <button
          onClick={() => setSelectedPage('Dashboard')}
          className="text-gray-600 hover:text-blue-600 flex items-center"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Create Promotion Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8 text-black">
        <h3 className="text-xl font-semibold mb-4">Create New Promotion</h3>
        <form onSubmit={handleCreatePromotion} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Promo Code</label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="percentage">Percentage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {discountType === 'percentage' ? 'Discount (%)' : 'Discount ($)'}
              </label>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Valid Until</label>
              <input
                type="datetime-local"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 px-4 rounded hover:bg-[#BF9264] "
          >
            Create Promotion
          </button>
        </form>
      </div>

      {/* Existing Promotions Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold mb-4 text-black">Active Promotions</h3>

        {promotions.length === 0 ? (
          <p className="text-black text-center py-4">No active promotions found</p>
        ) : (
          <div className="overflow-x-auto text-black">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Discount</th>
                  <th className="text-left p-2">Valid Until</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo) => (
                  <tr key={promo.id} className="border-b">
                    <td className="p-2 font-medium">{promo.promo_code}</td>
                    <td className="p-2">
                      {promo.discount_type === 'percentage'
                        ? `${promo.discount_amount}%`
                        : `$${promo.discount_amount}`}
                    </td>
                    <td className="p-2">
                      {new Date(promo.valid_until).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => handleDeletePromotion(promo.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
