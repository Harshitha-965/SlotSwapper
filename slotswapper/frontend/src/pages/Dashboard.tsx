import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.tsx";
import AddEventModal from "../components/AddEventModal.tsx";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  onLogout: () => void;
}

interface EventType {
  _id?: string;
  id?: number;
  title: string;
  start: string;
  end: string;
  status: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [userName, setUserName] = useState<string>("User");
  const [events, setEvents] = useState<EventType[]>([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUserName(parsed.name || "User");
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  /** ✅ Fetch events from backend */
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/events/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /** ✅ Add new event (save to DB) */
  const handleAddEvent = async (newEvent: Omit<EventType, "id">) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEvent),
      });

      if (!res.ok) throw new Error("Failed to add event");

      await res.json();
      await fetchEvents(); // ✅ Refresh list after adding
      setShowAddEventModal(false);
    } catch (err) {
      console.error("Error adding event:", err);
    }
  };

  /** ✅ Toggle event status (Busy ↔ Swappable) */
  const toggleStatus = async (id: string | number | undefined, currentStatus: string) => {
    if (!id) return;
    const newStatus = currentStatus === "Busy" ? "Swappable" : "Busy";

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      await res.json();
      await fetchEvents(); // ✅ Refresh list after status change
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  /** ✅ Delete event from DB */
  const handleDelete = async (id: string | number | undefined) => {
    if (!id) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete event");

      await fetchEvents(); // ✅ Refresh list after delete
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar
        onLogout={onLogout}
        onNavigate={(page) => navigate("/" + page)} // ✅ navigation fixed
        currentPage="dashboard"
      />

      {/* Main Dashboard */}
      <div className="dashboard-main">
        <h1>
          Welcome, <span>{userName} 👋</span>
        </h1>
        <p>Here’s your schedule overview and event management panel.</p>

        {/* Title + Button Row */}
        <div
          className="mb-6"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <h2
            className="text-xl font-semibold"
            style={{
              margin: 0,
              flex: "1",
              whiteSpace: "nowrap",
            }}
          >
            Your Events
          </h2>

          <button
            onClick={() => setShowAddEventModal(true)}
            className="add-event-btn"
            style={{
              flexShrink: 0,
              marginRight: "5rem",
            }}
          >
            + Add Event
          </button>
        </div>

        {/* ✅ Events Grid */}
        <div className="event-grid">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event._id || event.id} className="event-card">
                <div className="event-header">
                  <h3>{event.title}</h3>
                  <span
                    className={`event-status ${
                      event.status === "Busy" ? "busy" : "swappable"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>

                <div className="event-details">
                  <p>
                    <strong>Start:</strong>{" "}
                    {new Date(event.start).toLocaleString().replace(",", "")}
                  </p>
                  <p>
                    <strong>End:</strong>{" "}
                    {new Date(event.end).toLocaleString().replace(",", "")}
                  </p>
                </div>

                <div className="event-actions">
                  <button
                    onClick={() => toggleStatus(event._id, event.status)}
                    className="event-toggle-btn"
                  >
                    {event.status === "Busy"
                      ? "Make Swappable"
                      : "Revert to Busy"}
                  </button>

                  <button
                    onClick={() => handleDelete(event._id)}
                    className="event-delete-btn"
                    title="Delete Event"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">
              No events added yet. Click “+ Add Event” to create one.
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      {showAddEventModal && (
        <AddEventModal
          onClose={() => setShowAddEventModal(false)}
          onSave={handleAddEvent}
        />
      )}
    </div>
  );
};

export default Dashboard;
