"use client";
import { useState, useEffect } from 'react';
import '../../app/globals.css';
import TicketSeatSetup from './TicketSeatSetup';
import Promotions from './Promotions';


  

export default function MainContent({ selectedPage, setSelectedPage, onSwitchToLogin }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [category, setCategory] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [createdEvents, setCreatedEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editBannerUrl, setEditBannerUrl] = useState('');
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Pull stored user info
  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
  const userId    = typeof window !== 'undefined' ? localStorage.getItem('user_id')   : null;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBannerUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateEvent = async () => {
    const email = localStorage.getItem('userEmail');
    const uid   = localStorage.getItem('user_id');

    if (!eventName.trim() || !location.trim() || !eventDate.trim() || !startTime.trim() || !endTime.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const payload = {
      user_id:    uid,
      email:      email,
      event_name: eventName,
      description,
      event_date: eventDate,
      start_time: startTime,
      end_time:   endTime,
      venue:      location,
      banner_url: bannerUrl || null,
      category:   category  || null,
    };

    console.log('📦 Sending request with data:', payload);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create event');
      const data = await response.json();
      console.log('✅ Event created:', data);
      setSelectedPage('Dashboard');
    } catch (err) {
      console.error('❌ Error creating event:', err.message);
      alert('Failed to create event');
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const uid = localStorage.getItem('user_id');
      try {
        const response = await fetch(`/api/events?user_id=${uid}`);
        if (!response.ok) throw new Error('Failed to load events');
        const data = await response.json();
        setCreatedEvents(data.events);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (selectedPage === 'Dashboard') fetchEvents();
  }, [selectedPage]);

  const handleDelete = async (id) => {
    console.log("Deleting event with ID:", id);
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      alert('Deleted successfully!');
      setCreatedEvents(prev => prev.filter(event => event.id !== id));
    } catch (error) {
      console.error("Delete failed:", error.message);
    }
  };

  const handleUpdateEvent = async () => {
    try {
      const response = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: editingEvent.event_name,
          description: editingEvent.description,
          event_date: editingEvent.event_date,
          start_time: editingEvent.start_time,
          end_time: editingEvent.end_time,
          venue: editingEvent.venue,
          banner_url: editBannerUrl,
          category: editingEvent.category,
        }),
      });
      if (!response.ok) throw new Error('Update failed');
      const updatedEvent = await response.json();
      setCreatedEvents(prev =>
        prev.map(event =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      setEditingEvent(null);
      alert('Event updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update event');
    }
  };

const [user, setUser] = useState({
    name: 'Guest',
    email: 'Not available',
    phone: 'Not available',
  });

  useEffect(() => {
    const storedName = localStorage.getItem('user_name') || 'Guest';
    const storedEmail = localStorage.getItem('userEmail') || 'Not available';
    const storedPhone = localStorage.getItem('phone_number') || 'Not available';

    setUser({
      name: storedName,
      email: storedEmail,
      phone: storedPhone,
    });
  }, []);




  const handleLogout = () => {
    // Add your logout logic here
    console.log("User logged out");
  };


  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold text-cyan-900">{selectedPage}</h1>
    {selectedPage === 'Dashboard' && (
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSelectedPage('CreateEvents')}
          className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-[#BF9264] transition"
        >
          <span className="text-xl">＋</span> Create Event
        </button>

        {/* Profile Icon */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-[#BF9264] transition-colors"
          >
            <span className="text-lg font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden text-black">
              <div className="p-4 border-b border-gray-200">
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">{user.email}</span>
                </div>

                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm">{user.phone}</span>
                </div>
              </div>

              <div className="border-t border-gray-200">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>

  {/* Created Event Display */}
  {selectedPage === 'Dashboard' && createdEvents.length > 0 && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
    {createdEvents.map((event) => (
      <div 
        key={event.event_id} 
        className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 w-full max-w-[500px] mx-auto lg:max-w-none lg:w-auto flex flex-col"
      >
        <div className="relative flex-grow">
          {event.banner_url && (
            <img 
              src={event.banner_url} 
              alt="Event Banner" 
              className="w-full h-56 object-cover rounded-xl mb-4 border-2 border-gray-100"
            />
          )}
          <div className="absolute top-4 right-4 bg-black/90 text-white px-4 py-1.5 rounded-full text-sm font-medium">
            {event.category}
          </div>
        </div>

        <h3 className="text-2xl font-bold text-cyan-900 mb-4 leading-tight">
          {event.event_name}
        </h3>
        
        <div className="space-y-3 mb-4 flex-grow">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-lg font-medium text-gray-700">{event.venue}</span>
          </div>

          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {new Date(event.event_date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-gray-500">
                {event.start_time} - {event.end_time}
              </p>
            </div>
          </div>

          {event.description && (
            <div className="mt-3 text-gray-600 leading-relaxed line-clamp-3">
              {event.description}
            </div>
          )}
        </div>

        <div className="space-y-3 mt-auto">
          <button
            onClick={() => {
              setSelectedPage('Tickets');
              setSelectedEventId(event.id);
            }}
            className="w-full px-6 py-3 bg-black text-white rounded-xl hover:bg-[#BF9264] transition-all flex items-center justify-center gap-3 text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Ticket Setup
          </button>

          <button
            onClick={() => {
              setSelectedPage('Promotion');
              setSelectedEventId(event.id);
            }}
            className="w-full px-6 py-3 bg-[#BF9264]/90 text-white rounded-xl hover:bg-[#a87a50] transition-all flex items-center justify-center gap-3 text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Promotion Setup
          </button>

          <div className="flex gap-3 mt-3">
            <button
              onClick={() => {
                setEditingEvent(event);
                setEditBannerUrl(event.banner_url || '');
              }}
              className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
            >
              Edit Event
            </button>
            <button
              onClick={() => handleDelete(event.id)}
              className="flex-1 px-5 py-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    ))}

  </div>
)}

      {selectedPage === 'CreateEvents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-black">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Event Name</label>
              <input
  type="text"
  value={eventName}
  onChange={(e) => setEventName(e.target.value)}
  className="w-full p-2 border rounded-lg"
/>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium mb-2">Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
</div>

              <div>
              <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select a category</option>
                  {['Concert', 'Conference', 'Festival', 'Workshop', 'Sports', 'Exhibition', 'Charity'].map((cat) => (
  <option key={cat} value={cat}>{cat}</option>
))}

                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
        <div>
        <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
        </div>
        <div>
        <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
        </div>
      </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  className="w-full p-2 border rounded-lg h-32"
/>
            </div>
          </div>

          {/* Right Column - Banner Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Event Banner</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4">Drop your image here</p>
              <p className="text-gray-400 text-sm">or</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-[#BF9264] cursor-pointer"
              />
              {bannerUrl && (
              <div className="mt-4">
                <p className="text-gray-500">Preview:</p>
                <img src={bannerUrl} alt="Event Banner Preview" className="mt-2 w-full h-auto rounded-lg" />
              </div>
            )}
            </div>
          </div>

          <div className="md:col-span-2">
    <button 
      onClick={handleCreateEvent}
      className="w-full mt-8 px-6 py-3 bg-black text-white rounded-lg hover:bg-[#BF9264]"
    >
     Create Event
    </button>
  </div>
        </div>
      )}

{selectedPage === 'Tickets' && (
   <div className="max-w-4xl mx-auto p-4">
   <div className="flex justify-between items-center mb-8">
     <h2 className="text-3xl font-bold text-gray-800">TicketSeatSetup</h2>
     <button
       onClick={() => setSelectedPage('Dashboard')}
       className="text-gray-600 hover:text-blue-600 flex items-center"
     >
       ← Back to Dashboard
     </button>
   </div>
    <TicketSeatSetup 
      eventId={selectedEventId}
      goBack={() => {
        setSelectedPage('Dashboard');
        setSelectedEventId(null);
      }}
    />
  </div>
)}

      {/* Add VIP Zone Section */}
      {selectedPage === 'VIP Zone' && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-amber-600">VIP Zone Management</h2>
          {/* You can add VIP-specific content here */}
        </div>
      )}

{selectedPage === 'Promotion' && (
  selectedEventId ? (
    <Promotions
      setSelectedPage={setSelectedPage}
      selectedEventId={selectedEventId}
    />
  ) : (
    <div className="text-center mt-20 p-8">
      <div className="text-2xl text-gray-600 mb-4">⚠️ Invalid Access</div>
      <p className="text-gray-500 mb-6">
        Please select an event to manage promotions
      </p>
      <button
        onClick={() => setSelectedPage('Dashboard')}
        className="px-6 py-2 bg-[#BF9264] text-white rounded-lg hover:bg-[#a87a50] transition"
      >
        Back to Events List
      </button>
    </div>
  )
)}
      {/* Edit Event Modal */}
{editingEvent && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Edit Event</h2>
        <button
          onClick={() => setEditingEvent(null)}
          className="text-black hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-black">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Event Name</label>
            <input
              type="text"
              value={editingEvent.event_name}
              onChange={(e) => setEditingEvent({...editingEvent, event_name: e.target.value})}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              value={editingEvent.venue}
              onChange={(e) => setEditingEvent({...editingEvent, venue: e.target.value})}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Event Date</label>
              <input
                type="date"
                value={editingEvent.event_date}
                onChange={(e) => setEditingEvent({...editingEvent, event_date: e.target.value})}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={editingEvent.category}
                onChange={(e) => setEditingEvent({...editingEvent, category: e.target.value})}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select category</option>
                {['Concert', 'Conference', 'Festival', 'Workshop', 'Sports', 'Exhibition', 'Charity'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Time</label>
              <input
                type="time"
                value={editingEvent.start_time}
                onChange={(e) => setEditingEvent({...editingEvent, start_time: e.target.value})}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Time</label>
              <input
                type="time"
                value={editingEvent.end_time}
                onChange={(e) => setEditingEvent({...editingEvent, end_time: e.target.value})}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={editingEvent.description}
              onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
              className="w-full p-2 border rounded-lg h-32"
            />
          </div>
        </div>

        {/* Right Column - Banner Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Event Banner</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            {editBannerUrl && (
              <img 
                src={editBannerUrl} 
                alt="Banner Preview" 
                className="mb-4 w-full h-48 object-cover rounded-lg"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setEditBannerUrl(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-[#BF9264] cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={() => setEditingEvent(null)}
          className="px-6 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdateEvent}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-[#BF9264]"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

      {/* Update the fallback content */}
      {!['Dashboard', 'CreateEvents', 'Tickets', 'VIP Zone', 'Promotion'].includes(selectedPage) && (
        <div className="text-black text-center mt-20">
          This is the {selectedPage} page content.
        </div>
      )}

    </div>
  );
}