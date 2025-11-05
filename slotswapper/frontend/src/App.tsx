import React, { useState, useEffect, type JSX } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginSignup from "./pages/LoginSignup.tsx";
import Dashboard from "./pages/Dashboard.tsx";

// NEW: PrivateRoute component inline for simplicity
const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists on app load
    const token = localStorage.getItem("token");
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/"
        element={!isAuthenticated ? <LoginSignup onLogin={handleLogin} /> : <Navigate to="/dashboard" replace />}
      />

      {/* Protected route */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard onLogout={handleLogout} />
          </PrivateRoute>
        }
      />

      {/* Catch-all: redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
