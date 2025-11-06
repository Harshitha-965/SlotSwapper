import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.tsx";
import { useNavigate } from "react-router-dom";
import { Check, X, Trash2 } from "lucide-react";

interface SwapRequest {
  _id: string;
  requesterName: string;
  responderName: string;
  offeredSlot: {
    title: string;
    start: string;
    end: string;
  };
  requestedSlot: {
    title: string;
    start: string;
    end: string;
  };
  status: "pending" | "accepted" | "rejected";
}

const Requests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");
  const [incomingRequests, setIncomingRequests] = useState<SwapRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString().replace(",", "");
    } catch {
      return iso;
    }
  };

  /** ✅ Fetch requests */
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized");
          return;
        }

        const [incomingRes, outgoingRes] = await Promise.all([
          fetch("http://localhost:5000/api/requests/incoming", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/requests/outgoing", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!incomingRes.ok || !outgoingRes.ok)
          throw new Error("Failed to fetch requests");

        const incomingData = await incomingRes.json();
        const outgoingData = await outgoingRes.json();
        setIncomingRequests(incomingData);
        setOutgoingRequests(outgoingData);
      } catch (err: any) {
        console.error("Error fetching swap requests:", err);
        setError(err.message || "Error fetching requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  /** ✅ Accept a swap request */
  const handleAccept = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`http://localhost:5000/api/requests/${id}/accept`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to accept request");

      setIncomingRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, status: "accepted" } : req))
      );
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  /** ✅ Reject a swap request */
  const handleReject = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`http://localhost:5000/api/requests/${id}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to reject request");

      setIncomingRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, status: "rejected" } : req))
      );
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  /** ✅ Delete a swap request */
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`http://localhost:5000/api/requests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete request");

      setIncomingRequests((prev) => prev.filter((req) => req._id !== id));
      setOutgoingRequests((prev) => prev.filter((req) => req._id !== id));
    } catch (err) {
      console.error("Error deleting request:", err);
    }
  };

  const getStatusBadge = (status: SwapRequest["status"]) => {
    switch (status) {
      case "pending":
        return <span className="badge badge-pending">Pending</span>;
      case "accepted":
        return <span className="badge badge-accepted">Accepted</span>;
      case "rejected":
        return <span className="badge badge-rejected">Rejected</span>;
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
        currentPage="requests"
      />

      <main className="dashboard-main">
        <h1>Swap Requests</h1>
        <p>Manage your incoming and outgoing swap requests</p>

        {/* Tabs */}
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === "incoming" ? "active" : ""}`}
            onClick={() => setActiveTab("incoming")}
          >
            Incoming Requests
          </button>
          <button
            className={`tab-btn ${activeTab === "outgoing" ? "active" : ""}`}
            onClick={() => setActiveTab("outgoing")}
          >
            Outgoing Requests
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="message">{error}</p>}

        {/* Incoming Requests */}
        {activeTab === "incoming" && (
          <div className="event-grid">
            {incomingRequests.length === 0 ? (
              <div className="event-card">
                <p className="text-gray-400">No incoming requests right now.</p>
              </div>
            ) : (
              incomingRequests.map((req) => (
                <div key={req._id} className="event-card">
                  <div className="event-header">
                    <h3>From: {req.requesterName}</h3>
                    {getStatusBadge(req.status)}
                  </div>

                  <div className="event-details">
                    <div className="swap-block">
                      <p><strong>They offer:</strong> {req.offeredSlot.title}</p>
                      <p>
                        {formatDate(req.offeredSlot.start)} - {formatDate(req.offeredSlot.end)}
                      </p>
                    </div>
                    <div className="swap-block">
                      <p><strong>For your:</strong> {req.requestedSlot.title}</p>
                      <p>
                        {formatDate(req.requestedSlot.start)} - {formatDate(req.requestedSlot.end)}
                      </p>
                    </div>
                  </div>

                  <div className="event-actions" style={{ marginTop: "1rem" }}>
                    {req.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleReject(req._id)}
                          className="event-toggle-btn"
                          style={{ background: "#ef4444" }}
                        >
                          <X size={16} /> Reject
                        </button>
                        <button
                          onClick={() => handleAccept(req._id)}
                          className="event-toggle-btn"
                          style={{ background: "#10b981" }}
                        >
                          <Check size={16} /> Accept
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDelete(req._id)}
                        className="event-toggle-btn"
                        style={{ background: "#444" }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Outgoing Requests */}
        {activeTab === "outgoing" && (
          <div className="event-grid">
            {outgoingRequests.length === 0 ? (
              <div className="event-card">
                <p className="text-gray-400">No outgoing requests yet.</p>
              </div>
            ) : (
              outgoingRequests.map((req) => (
                <div key={req._id} className="event-card">
                  <div className="event-header">
                    <h3>To: {req.responderName}</h3>
                    {getStatusBadge(req.status)}
                  </div>

                  <div className="event-details">
                    <div className="swap-block">
                      <p><strong>You offered:</strong> {req.offeredSlot.title}</p>
                      <p>
                        {formatDate(req.offeredSlot.start)} - {formatDate(req.offeredSlot.end)}
                      </p>
                    </div>
                    <div className="swap-block">
                      <p><strong>Requesting:</strong> {req.requestedSlot.title}</p>
                      <p>
                        {formatDate(req.requestedSlot.start)} - {formatDate(req.requestedSlot.end)}
                      </p>
                    </div>
                  </div>

                  <div className="event-actions" style={{ marginTop: "1rem" }}>
                    <button
                      onClick={() => handleDelete(req._id)}
                      className="event-toggle-btn"
                      style={{ background: "#444" }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Requests;
