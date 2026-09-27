import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import LoginSignup from "./pages/LoginSignup.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Marketplace from "./pages/Marketplace.tsx";
import Requests from "./pages/Requests.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminAttendance from "./pages/AdminAttendance.tsx";
import AdminMondayOrder from "./pages/AdminMondayOrder.tsx";
import AdminSwaps from "./pages/AdminSwaps.tsx";
import MyEvents from "./pages/MyEvents.tsx";
import Settings from "./pages/Settings.tsx";

interface PrivateRouteProps {
  children: React.ReactElement;
  allowedRole?: "Admin" | "Faculty";
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  allowedRole,
}) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  if (!token || !userString) {
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(userString);

    if (allowedRole && user.role !== allowedRole) {
      return user.role === "Admin" ? <Navigate to="/admin-dashboard" replace /> : <Navigate to="/dashboard" replace />;
    }

    return children;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/" replace />;
  }
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      return;
    }

    fetch("http://localhost:5000/api/auth/validate", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Invalid token");
        }

        try {
          const user = JSON.parse(userString);
          if (user.role === "Admin" || user.role === "Faculty") {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setIsAuthenticated(false);
          }
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      });
  }, []);

  /** Handle login success */
  const handleLogin = () => {
    setIsAuthenticated(true);

    const userString = localStorage.getItem("user");

    if (userString) {
      try {
        const user = JSON.parse(userString);

        if (user.role === "Admin") {
          navigate("/admin-dashboard", {
            replace: true,
          });
        } else {
          navigate("/dashboard", {
            replace: true,
          });
        }
      } catch {
        navigate("/dashboard", {
          replace: true,
        });
      }
    } else {
      navigate("/dashboard", {
        replace: true,
      });
    }
  };

  /** Handle logout */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsAuthenticated(false);

    navigate("/", {
      replace: true,
    });
  };

  return (
    <Routes>
      {/* Login / Signup */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginSignup onLogin={handleLogin} />
          )
        }
      />

      {/* Faculty Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRole="Faculty">
            <Dashboard onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/my-events"
        element={
          <PrivateRoute allowedRole="Faculty">
            <MyEvents
              onLogout={
                handleLogout
              }
            />
          </PrivateRoute>
        }
      />

      {/* Faculty Marketplace */}
      <Route
        path="/marketplace"
        element={
          <PrivateRoute allowedRole="Faculty">
            <Marketplace />
          </PrivateRoute>
        }
      />

      {/* Faculty Requests */}
      <Route
        path="/requests"
        element={
          <PrivateRoute allowedRole="Faculty">
            <Requests 
              onLogout={handleLogout}
            />
          </PrivateRoute>
        }
      />
      {/* Faculty Settings */}
      <Route
        path="/settings"
        element={
          <PrivateRoute allowedRole="Faculty">
            <Settings
              onLogout={handleLogout}
            />
          </PrivateRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin-dashboard"
        element={
          <PrivateRoute allowedRole="Admin">
            <AdminDashboard onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin-attendance"
        element={
          <PrivateRoute allowedRole="Admin">
            <AdminAttendance onLogout={handleLogout} />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin-monday-order"
        element={
          <PrivateRoute allowedRole="Admin">
            <AdminMondayOrder onLogout={handleLogout} />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin-swaps"
        element={
          <PrivateRoute allowedRole="Admin">
            <AdminSwaps onLogout={handleLogout} />
          </PrivateRoute>
        }
      />

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default App;