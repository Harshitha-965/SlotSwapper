import React, {
  useEffect,
  useState,
} from "react";

import {
  LayoutDashboard,
  CalendarDays,
  ShoppingBag,
  Repeat,
  LogOut,
  User,
  Settings,
} from "lucide-react";

interface SidebarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onLogout: () => void;
}

const Sidebar: React.FC<
  SidebarProps
> = ({
  onNavigate,
  currentPage,
  onLogout,
}) => {
  const [
    userName,
    setUserName,
  ] = useState<string>("User");

  const [
    userCollege,
    setUserCollege,
  ] = useState<string>("");

  const [
    userRole,
    setUserRole,
  ] = useState<string>(
    "Faculty"
  );

  useEffect(() => {
    const storedUser =
      localStorage.getItem(
        "user"
      );

    if (storedUser) {
      try {
        const user =
          JSON.parse(
            storedUser
          );

        setUserName(
          user.name || "User"
        );

        setUserCollege(
          user.college || ""
        );

        setUserRole(
          user.role || "Faculty"
        );
      } catch (err) {
        console.error(
          "Failed to parse stored user data:",
          err
        );
      }
    } else {
      const token =
        localStorage.getItem(
          "token"
        );

      if (token) {
        try {
          const payload =
            JSON.parse(
              atob(
                token.split(
                  "."
                )[1]
              )
            );

          setUserName(
            payload.name ||
              "User"
          );

          setUserCollege(
            payload.college ||
              ""
          );

          setUserRole(
            payload.role ||
              "Faculty"
          );
        } catch (err) {
          console.error(
            "Failed to decode token:",
            err
          );
        }
      }
    }
  }, []);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },

    {
      id: "my-events",
      label: "My Events",
      icon: CalendarDays,
    },

    {
      id: "marketplace",
      label: "Marketplace",
      icon: ShoppingBag,
    },

    {
      id: "requests",
      label: "Swap Requests",
      icon: Repeat,
    },
  ];

  return (
    <div className="sidebar">
      <div>
        

        {/* NAVIGATION */}
        <nav>
          {menuItems.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    onNavigate(
                      item.id
                    )
                  }
                  className={
                    currentPage ===
                    item.id
                      ? "active"
                      : ""
                  }
                >
                  <Icon className="w-5 h-5" />

                  {item.label}
                </button>
              );
            }
          )}

          {/* SETTINGS */}
          <button
            type="button"
            onClick={() =>
              onNavigate("settings")
            }
            className={
              currentPage === "settings"
                ? "active"
                : ""
            }
          >
            <Settings className="w-5 h-5" />

            Settings
          </button>
        </nav>
      </div>

      {/* USER SECTION */}
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">
            <User className="w-5 h-5 text-white" />
          </div>

          <div>
            <span>
              {userName}
            </span>

            <small
              style={{
                color:
                  "#a6a6a6",
              }}
            >
              {userRole}
            </small>

            <small
              style={{
                color:
                  "#777777",
                display:
                  "block",
                marginTop:
                  "2px",
              }}
            >
              {userCollege}
            </small>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          type="button"
          onClick={
            onLogout
          }
        >
          <LogOut className="w-5 h-5" />

          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;