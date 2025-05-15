"use client";
import React, { useState, useEffect } from 'react';

export default function TicketSeatSetup({ eventId, goBack }) {
  const [showPopup, setShowPopup] = useState(false);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [deletedSectionIds, setDeletedSectionIds] = useState([]);

  // Load existing sections when eventId changes
  useEffect(() => {
    const loadSections = async () => {
      try {
        if (!eventId) {
          setSections([]);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/ticket?eventId=${eventId}`);
        if (!response.ok) throw new Error('Failed to load sections');
        
        const data = await response.json();
        setSections(data.sections);
        setHasChanges(false);
      } catch (err) {
        console.error("Error loading sections:", err);
        alert('Failed to load ticket configuration');
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    loadSections();
  }, [eventId]);

  const handleSaveClick = () => {
    if (hasChanges) {
      setShowPopup(true);
    } else {
      goBack();
    }
  };

  // Update the handleYes function
const handleYes = async () => {
  setShowPopup(false);
  try {
    const response = await fetch('/api/ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: Number(eventId),
        sections: Array.isArray(sections) ? sections.map(({ id, tempId, ...rest }) => ({
          ...rest,
          id: id ? Number(id) : null
        })) : [],
        deletedSectionIds: Array.isArray(deletedSectionIds) ? deletedSectionIds.map(Number) : []
      })
      
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Save failed');
    }

    // Refresh data after successful save
    const refreshResponse = await fetch(`/api/ticket?eventId=${eventId}`);
    const newData = await refreshResponse.json();
    
    setSections(newData.sections);
    setDeletedSectionIds([]);
    setHasChanges(false);
    alert('Configuration saved successfully!');
  } catch (err) {
    console.error("Save error:", err);
    alert(err.message);
  }
};
  
  // Section management functions
  const addNewSection = () => {
    setSections(prev => [...prev, {
      name: '',
      type: 'regular',
      capacity: 0,
      price: 0,
      tempId: Date.now()
    }]);
    setHasChanges(true);
  };

  const updateSection = (id, field, value) => {
    setSections(prev => prev.map(section => 
      (section.id === id || section.tempId === id) ? 
      { ...section, [field]: value } : 
      section
    ));
    setHasChanges(true);
  };

 // In TicketSeatSetup.js - Update deleteSection
 // Update the deleteSection function
 const deleteSection = async (sectionId) => {
  if (!eventId) {
    console.error("Event ID is missing");
    return;
  }

  // Optimistically update UI
  setSections(prev =>
    prev.filter(section => section.id !== sectionId && section.tempId !== sectionId)
  );

  // Track deleted section ID if it's a saved section
  const isExisting = sections.find(s => s.id === sectionId);
  if (isExisting) {
    setDeletedSectionIds(prev => [...prev, sectionId]);
  }

  setHasChanges(true);
};




  if (!eventId) {
    return (
      <div className="p-8 text-center text-red-500">
        No event selected. Please go back and select an event.
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading ticket configuration...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 p-8 gap-8 text-black">
      {/* Configuration Panel */}
      <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Seating Configuration</h2>
          <div className="flex gap-4">
          
            <button 
              onClick={addNewSection}
              className="bg-black text-white px-4 py-2 rounded-full hover:bg-[#BF9264] transition flex items-center gap-2"
            >
              <span className="text-xl">＋</span> Add Section
            </button>
          </div>
        </div>

        {/* Sections List */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id || section.tempId} className="border rounded-lg p-4 relative group hover:border-gray-400 transition-all">
              <button
                onClick={() => deleteSection(section.id || section.tempId)}
                className="absolute -top-3 -right-3 bg-red-500 text-white w-6 h-6 rounded-full 
                         flex items-center justify-center hover:bg-red-600 transition opacity-0 
                         group-hover:opacity-100 shadow-md"
                title="Delete section"
              >
                ×
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Section Fields */}
                <div>
                  <label className="block text-sm font-medium mb-2">Section Name</label>
                  <input
                    type="text"
                    value={section.name}
                    onChange={(e) => updateSection(section.id || section.tempId, 'name', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ticket Type</label>
                  <select
                    value={section.type}
                    onChange={(e) => updateSection(section.id || section.tempId, 'type', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="vip">VIP</option>
                    <option value="premium">Premium</option>
                    <option value="regular">Regular</option>
                    <option value="standing">Standing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Capacity</label>
                  <input
                    type="number"
                    value={section.capacity}
                    onChange={(e) => updateSection(section.id || section.tempId, 'capacity', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={section.price}
                    onChange={(e) => updateSection(section.id || section.tempId, 'price', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview & Save Section */}
      <div className="w-96 bg-white p-6 rounded-xl shadow-lg h-fit sticky top-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Pricing Preview</h2>
        
        <div className="space-y-4 mb-8">
          {sections.map(section => (
            <div key={section.id || section.tempId} className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-semibold">{section.name || "New Section"}</h3>
                  <span className="text-sm text-gray-500 capitalize">{section.type}</span>
                </div>
                <span className="text-lg font-bold">${section.price}</span>
              </div>
              <div className="text-sm text-gray-600">
                {section.capacity} seats available
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-6">
          <button 
            onClick={handleSaveClick}
            className={`w-full py-3 text-white rounded-lg transition ${
              hasChanges ? 'bg-black hover:bg-[#BF9264]' : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!hasChanges}
          >
            {hasChanges ? 'Save Changes' : 'No Changes to Save'}
          </button>
          
          {/* Confirmation Popup */}
          {showPopup && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
              <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-6 w-80 transition-all">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Confirm Changes
                  </h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to save these changes?
                  </p>
                  <div className="flex justify-center gap-3 mt-4">
                    <button
                      onClick={handleYes}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowPopup(false)}
                      className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}