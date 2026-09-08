import React, { useState, useEffect } from "react";
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

    // Check role if a specific role is required
    if (allowedRole && user.role !== allowedRole) {
      if (user.role === "Admin") {
        return <Navigate to="/admin-dashboard" replace />;
      }

      return <Navigate to="/dashboard" replace />;
    }

    return children;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/" replace />;
  }
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean | null>(null);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /** Validate token with backend */
  const validateToken = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/validate",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Token validation error:", err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /** Run token validation on mount */
  useEffect(() => {
    validateToken();
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

  /** Show loading until token validation finishes */
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background:
            "radial-gradient(circle at top left, #1a1a1d, #0b0b0d)",
          color: "#ff7b00",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <h2>Loading...</h2>
      </div>
    );
  }

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