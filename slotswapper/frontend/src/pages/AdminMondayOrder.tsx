import React, {
  useState,
} from "react";
import AdminSidebar from "../components/AdminSidebar.tsx";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";

const AdminMondayOrder: React.FC<{
  onLogout: () => void;
}> = ({ onLogout }) => {
  const navigate = useNavigate();

  const [weekStart, setWeekStart] =
    useState("");

  const [mondayOrder, setMondayOrder] =
    useState("");

  const [message, setMessage] =
    useState("");

  const saveMondayOrder = async () => {
    if (!weekStart || !mondayOrder) {
      setMessage(
        "Please select the week and Monday order."
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/monday-rotation",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            weekStart,
            mondayOrder,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.message ||
            "Failed to save Monday order."
        );
        return;
      }

      setMessage(
        "Monday order saved successfully."
      );
    } catch (err) {
      console.error(err);
      setMessage(
        "Unable to save Monday order."
      );
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar
        currentPage="admin-monday-order"
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
            <h1>Monday Order</h1>

            <p>
              Set which academic day order Monday
              follows for each week.
            </p>
          </div>
        </div>

        <section className="admin-card monday-card">
          <div className="monday-icon">
            <CalendarDays size={28} />
          </div>

          <h2>
            Weekly Timetable Rotation
          </h2>

          <p>
            Select the Monday academic order.
            Faculty My Events will automatically
            use this setting for the selected week.
          </p>

          <div className="monday-form">
            <div>
              <label>
                Week Starting
              </label>

              <input
                type="date"
                value={weekStart}
                onChange={(e) =>
                  setWeekStart(e.target.value)
                }
              />
            </div>

            <div>
              <label>
                Monday Follows
              </label>

              <select
                value={mondayOrder}
                onChange={(e) =>
                  setMondayOrder(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Day Order
                </option>

                <option value="Monday">
                  Monday Order
                </option>

                <option value="Tuesday">
                  Tuesday Order
                </option>

                <option value="Wednesday">
                  Wednesday Order
                </option>

                <option value="Thursday">
                  Thursday Order
                </option>

                <option value="Friday">
                  Friday Order
                </option>

                <option value="Saturday">
                  Saturday Order
                </option>
              </select>
            </div>
          </div>

          <button
            onClick={saveMondayOrder}
            className="admin-primary-btn monday-save"
          >
            Save Monday Order
          </button>

          {message && (
            <p className="admin-message">
              {message}
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminMondayOrder;