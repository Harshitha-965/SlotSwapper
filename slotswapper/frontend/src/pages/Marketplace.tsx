import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.tsx";

interface MarketEvent {
  id: string | number;
  title: string;
  start: string;
  end: string;
  status: "Busy" | "Swappable" | "Pending" | string;
  ownerId?: string;
  ownerName?: string;
}

const Marketplace: React.FC = () => {
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        setEvents(data);
      } catch (err: any) {
        console.error("Marketplace fetch error:", err);
        setError(err.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchSwappable();
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

  return (
    <div className="dashboard-container">
      <Sidebar
        onLogout={() => {
          localStorage.removeItem("token");
          navigate("/"); // redirect to login
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
                  <button className="event-toggle-btn" disabled>
                    Request Swap
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
