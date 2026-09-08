import React from "react";
import {
  Users,
  CalendarDays,
  Repeat,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

interface AdminSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentPage,
  onNavigate,
  onLogout,
}) => {
  const userString = localStorage.getItem("user");

  let user: any = null;

  try {
    user = userString
      ? JSON.parse(userString)
      : null;
  } catch {
    user = null;
  }

  const menuItems = [
    {
      id: "admin-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "admin-attendance",
      label: "Faculty Attendance",
      icon: Users,
    },
    {
      id: "admin-monday-order",
      label: "Monday Order",
      icon: CalendarDays,
    },
    {
      id: "admin-swaps",
      label: "Swap Activities",
      icon: Repeat,
    },
  ];

  return (
    <aside className="admin-sidebar">
      <div>
        <div className="admin-sidebar-header">
          <div className="admin-logo">🔁</div>

          <h2>
            Slot<span>Swapper</span>
          </h2>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={
                  currentPage === item.id
                    ? "admin-nav-item active"
                    : "admin-nav-item"
                }
                onClick={() =>
                  onNavigate(item.id)
                }
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="admin-sidebar-footer">
        <div className="admin-user-info">
          <div className="admin-avatar">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "A"}
          </div>

          <div>
            <strong>
              {user?.name || "Admin"}
            </strong>

            <span>Admin</span>

            <small>
              {user?.college || ""}
            </small>
          </div>
        </div>

        <button
          className="admin-logout"
          onClick={onLogout}
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;