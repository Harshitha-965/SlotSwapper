import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.tsx";
import SwapModal from "../components/SwapModal.tsx";

interface MarketEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status: "Busy" | "Swappable" | "Pending" | string;
  ownerId?: string;
  ownerName?: string;
}

interface UserEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

const Marketplace: React.FC = () => {
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [targetEvent, setTargetEvent] = useState<MarketEvent | null>(null);
  const navigate = useNavigate();

  // ✅ Fetch marketplace swappable events
  useEffect(() => {
    const fetchSwappable = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/events/marketplace", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();

        // ✅ Map Mongo _id → id for frontend
        const mapped = data.map((e: any) => ({
          id: e._id,
          title: e.title,
          start: e.start,
          end: e.end,
          status: e.status,
          ownerId: e.ownerId,
          ownerName: e.ownerName,
        }));

        setEvents(mapped);
      } catch (err: any) {
        console.error("Marketplace fetch error:", err);
        setError(err.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchSwappable();
  }, []);

  // ✅ Fetch user’s own swappable events
  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/events/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user events");
        const data = await res.json();

        const swappable = data
          .filter((e: any) => e.status === "Swappable")
          .map((e: any) => ({
            id: e._id,
            title: e.title,
            start: new Date(e.start).toLocaleString().replace(",", ""),
            end: new Date(e.end).toLocaleString().replace(",", ""),
          }));
        setUserEvents(swappable);
      } catch (err) {
        console.error("Error fetching user events:", err);
      }
    };

    fetchUserEvents();
  }, []);

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString().replace(",", "");
    } catch {
      return iso;
    }
  };

  // ✅ Handle opening swap modal
  const handleRequestSwap = (event: MarketEvent) => {
    setTargetEvent(event);
    setShowSwapModal(true);
  };

  // ✅ Handle confirming a swap (API integration)
  const handleConfirmSwap = async (offerEventId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !targetEvent?.id) {
        alert("Missing event details or authentication.");
        return;
      }

      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetEventId: targetEvent.id,
          offerEventId,
        }),
      });

      if (!res.ok) throw new Error("Failed to send swap request");

      const data = await res.json();
      console.log("✅ Swap request created:", data);

      setShowSwapModal(false);
      alert("Swap request successfully sent!");
    } catch (err) {
      console.error("Error sending swap request:", err);
      alert("Error sending swap request. Please try again.");
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        onLogout={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}
        onNavigate={(page) => navigate("/" + page)}
        currentPage="marketplace"
      />

      <main className="dashboard-main">
        <h1>Marketplace</h1>
        <p>Browse swappable events from other users.</p>

        {loading && <p>Loading...</p>}
        {error && <p className="message">{error}</p>}

        <div className="event-grid" style={{ marginTop: 16 }}>
          {events.length === 0 && !loading ? (
            <div className="event-card">
              <p className="text-gray-400">
                No swappable events available right now.
              </p>
            </div>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="event-card">
                <div className="event-header">
                  <h3>{ev.title}</h3>
                  <span
                    className={`event-status ${
                      ev.status === "Swappable" ? "swappable" : "busy"
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>

                <div className="event-details">
                  <p>
                    <strong>Start:</strong> {formatDate(ev.start)}
                  </p>
                  <p>
                    <strong>End:</strong> {formatDate(ev.end)}
                  </p>
                  {ev.ownerName && (
                    <p>
                      <strong>Owner:</strong> {ev.ownerName}
                    </p>
                  )}
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button
                    className="event-toggle-btn"
                    onClick={() => handleRequestSwap(ev)}
                  >
                    Request Swap
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {showSwapModal && (
        <SwapModal
          isOpen={showSwapModal}
          onClose={() => setShowSwapModal(false)}
          targetEvent={
            targetEvent
              ? {
                  id: targetEvent.id,
                  title: targetEvent.title,
                  ownerName: targetEvent.ownerName || "Unknown",
                  start: formatDate(targetEvent.start),
                  end: formatDate(targetEvent.end),
                }
              : null
          }
          userEvents={userEvents}
          onConfirm={handleConfirmSwap}
        />
      )}
    </div>
  );
};

export default Marketplace;
