import React, { useEffect, useState } from "react";
import { LayoutDashboard, ShoppingBag, Repeat, LogOut, User } from "lucide-react";

interface SidebarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentPage, onLogout }) => {
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("user@example.com");


  useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      setUserName(user.name || "User");
      setUserEmail(user.email || "user@example.com");
    } catch (err) {
      console.error("Failed to parse stored user data:", err);
    }
  } else {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserName(payload.name || "User");
        setUserEmail(payload.email || "user@example.com");
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }
}, []);


  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
    { id: "requests", label: "Requests", icon: Repeat },
  ];

  return (
    <div className="sidebar">
      <div>
        <div className="sidebar-header">
          <h2>
            Slot<span>Swapper 🔁</span>
          </h2>
        </div>

        <nav>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={currentPage === item.id ? "active" : ""}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <span>{userName}</span>
            <small style={{ color: "#a6a6a6" }}>{userEmail}</small>
          </div>
        </div>
        <button onClick={onLogout}>
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
