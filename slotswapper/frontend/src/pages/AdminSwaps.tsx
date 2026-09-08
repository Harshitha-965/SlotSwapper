import React, {
  useEffect,
  useState,
} from "react";
import {
  Download,
  Search,
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar.tsx";
import { useNavigate } from "react-router-dom";

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

  status:
    | "pending"
    | "accepted"
    | "rejected";

  createdAt: string;
}

const AdminSwaps: React.FC<{
  onLogout: () => void;
}> = ({ onLogout }) => {
  const navigate = useNavigate();

  const [requests, setRequests] =
    useState<SwapRequest[]>([]);

  const [status, setStatus] =
    useState("");

  const [from, setFrom] =
    useState("");

  const [to, setTo] =
    useState("");

  const fetchSwaps = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const params = new URLSearchParams();

    if (status)
      params.append("status", status);

    if (from)
      params.append("from", from);

    if (to)
      params.append("to", to);

    const res = await fetch(
      `http://localhost:5000/api/admin/swaps?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      setRequests(await res.json());
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, []);

  const exportCSV = () => {
    const headers = [
      "Requester",
      "Receiver",
      "Requested Slot",
      "Offered Slot",
      "Status",
      "Timestamp",
    ];

    const rows = requests.map(
      (request) => [
        request.requesterName,
        request.responderName,
        `${request.requestedSlot.title} (${request.requestedSlot.start} - ${request.requestedSlot.end})`,
        `${request.offeredSlot.title} (${request.offeredSlot.start} - ${request.offeredSlot.end})`,
        request.status,
        new Date(
          request.createdAt
        ).toLocaleString(),
      ]
    );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replaceAll(
              '"',
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "swap-activities.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-container">
      <AdminSidebar
        currentPage="admin-swaps"
        onNavigate={(page) => {
          if (page === "admin-dashboard") {
            navigate("/admin-dashboard");
          }
          if (page === "admin-attendance")
            navigate("/admin-attendance");

          if (page === "admin-monday-order")
            navigate("/admin-monday-order");

          if (page === "admin-swaps")
            navigate("/admin-swaps");
        }}
        onLogout={onLogout}
      />

      <main className="admin-main">
        <div className="admin-page-header">
          <div>
            <h1>Swap Activities</h1>

            <p>
              View all faculty swap requests and
              their current status.
            </p>
          </div>

          <div className="admin-export-buttons">
            <button
              onClick={exportCSV}
              className="admin-secondary-btn"
            >
              <Download size={18} />
              CSV
            </button>

            <button
              onClick={() =>
                window.print()
              }
              className="admin-primary-btn"
            >
              <Download size={18} />
              PDF
            </button>
          </div>
        </div>

        <section className="admin-card">
          <div className="admin-filter-title">
            <Search size={19} />
            <span>Filters</span>
          </div>

          <div className="admin-filters">
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >
              <option value="">
                All Status
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="accepted">
                Accepted
              </option>

              <option value="rejected">
                Rejected
              </option>
            </select>

            <input
              type="date"
              value={from}
              onChange={(e) =>
                setFrom(e.target.value)
              }
            />

            <input
              type="date"
              value={to}
              onChange={(e) =>
                setTo(e.target.value)
              }
            />

            <button
              onClick={fetchSwaps}
              className="admin-primary-btn"
            >
              Apply
            </button>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Receiver</th>
                  <th>Requested Slot</th>
                  <th>Offered Slot</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <tr key={request._id}>
                      <td>
                        {request.requesterName}
                      </td>

                      <td>
                        {request.responderName}
                      </td>

                      <td>
                        <strong>
                          {
                            request
                              .requestedSlot
                              .title
                          }
                        </strong>

                        <small>
                          {
                            request
                              .requestedSlot
                              .start
                          }{" "}
                          -{" "}
                          {
                            request
                              .requestedSlot
                              .end
                          }
                        </small>
                      </td>

                      <td>
                        <strong>
                          {
                            request
                              .offeredSlot
                              .title
                          }
                        </strong>

                        <small>
                          {
                            request
                              .offeredSlot
                              .start
                          }{" "}
                          -{" "}
                          {
                            request
                              .offeredSlot
                              .end
                          }
                        </small>
                      </td>

                      <td>
                        <span
                          className={`admin-status ${request.status}`}
                        >
                          {request.status}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          request.createdAt
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="admin-empty"
                    >
                      No swap activities found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminSwaps;