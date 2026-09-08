import React from "react";
import {
  Users,
  CalendarDays,
  Repeat,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.tsx";

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
}) => {
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");

  let user: any = null;

  try {
    user = userString
      ? JSON.parse(userString)
      : null;
  } catch {
    user = null;
  }

  const navigateAdmin = (page: string) => {
    if (page === "admin-dashboard") {
      navigate("/admin-dashboard");
    }
    if (page === "admin-attendance") {
      navigate("/admin-attendance");
    }

    if (page === "admin-monday-order") {
      navigate("/admin-monday-order");
    }

    if (page === "admin-swaps") {
      navigate("/admin-swaps");
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <AdminSidebar
        currentPage="admin-dashboard"
        onNavigate={navigateAdmin}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <div className="admin-page-header">
          <div>
            <h1>
              Welcome back,{" "}
              <span className="admin-highlight">
                {user?.name || "Admin"}
              </span>
            </h1>

            <p>
              Manage faculty attendance, timetable
              rotation and swap activities.
            </p>
          </div>
        </div>

        {/* Admin Summary */}
        <div className="admin-summary-grid">
          <div className="admin-summary-card">
            <div className="admin-summary-icon">
              <Users size={24} />
            </div>

            <div>
              <span>Faculty Management</span>
              <strong>Attendance</strong>
            </div>
          </div>

          <div className="admin-summary-card">
            <div className="admin-summary-icon">
              <CalendarDays size={24} />
            </div>

            <div>
              <span>Weekly Rotation</span>
              <strong>Monday Order</strong>
            </div>
          </div>

          <div className="admin-summary-card">
            <div className="admin-summary-icon">
              <Repeat size={24} />
            </div>

            <div>
              <span>Faculty Activity</span>
              <strong>Swap Requests</strong>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <section className="admin-dashboard-section">
          <div className="admin-section-heading">
            <h2>Administration</h2>

            <p>
              Select an area to manage the SlotSwapper
              faculty scheduling system.
            </p>
          </div>

          <div className="admin-management-grid">
            {/* Attendance */}
            <div className="admin-management-card">
              <div className="admin-management-top">
                <div className="admin-management-icon">
                  <Users size={26} />
                </div>

                <span>FACULTY</span>
              </div>

              <h3>Faculty Attendance</h3>

              <p>
                Monitor attendance records of all
                faculty members with filters and
                downloadable reports.
              </p>

              <button
                onClick={() =>
                  navigate("/admin-attendance")
                }
                className="admin-management-button"
              >
                View Attendance
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Monday Order */}
            <div className="admin-management-card">
              <div className="admin-management-top">
                <div className="admin-management-icon">
                  <CalendarDays size={26} />
                </div>

                <span>WEEKLY SETUP</span>
              </div>

              <h3>Monday Order</h3>

              <p>
                Configure which academic day order
                Monday follows for the selected week.
              </p>

              <button
                onClick={() =>
                  navigate("/admin-monday-order")
                }
                className="admin-management-button"
              >
                Set Monday Order
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Swap Activities */}
            <div className="admin-management-card">
              <div className="admin-management-top">
                <div className="admin-management-icon">
                  <Repeat size={26} />
                </div>

                <span>ACTIVITY</span>
              </div>

              <h3>Swap Activities</h3>

              <p>
                View and analyse all faculty swap
                requests with status and date filters.
              </p>

              <button
                onClick={() =>
                  navigate("/admin-swaps")
                }
                className="admin-management-button"
              >
                View Swap Activities
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* College Information */}
        <section className="admin-info-card">
          <div>
            <span>Logged-in Administrator</span>

            <h3>
              {user?.name || "Admin"}
            </h3>

            <p>
              {user?.college || "College"}
            </p>
          </div>

          <div className="admin-role-badge">
            Administrator
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;