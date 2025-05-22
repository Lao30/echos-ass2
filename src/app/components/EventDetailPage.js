// components/EventDetailPage.js
"use client";
import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function EventDetailPage({ event, onBack, onCheckout }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-black mb-8"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <img 
              src={event.banner_url} // Use the backend field name
              alt={event.event_name}
              className="w-full md:w-96 h-64 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-black mb-4">{event.event_name}</h1>

              <div className="mb-4">
                <p className="text-gray-700">
                  <strong>Date:</strong> {event.event_date}
                </p>
                <p className="text-gray-700">
                  <strong>Time:</strong> {event.start_time} - {event.end_time}
                </p>
                <p className="text-gray-700">
                  <strong>Venue:</strong> {event.venue}
                </p>
                <p className="text-gray-700">
                  <strong>Category:</strong> {event.category}
                </p>
              </div>

              <button
                onClick={onCheckout}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-[#BF9264] transition-colors"
              >
                Check Out
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-black mb-4">Event Description</h2>
            <p className="text-gray-600 whitespace-pre-line">
              {event.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
