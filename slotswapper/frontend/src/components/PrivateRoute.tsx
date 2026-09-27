import React, { type JSX, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRole?: "Admin" | "Faculty";
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRole }) => {
  const [authState, setAuthState] = useState<"checking" | "authorized" | "redirect">("checking");
  const [redirectTo, setRedirectTo] = useState<string>("/");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) {
      setAuthState("redirect");
      setRedirectTo("/");
      return;
    }

    try {
      const user = JSON.parse(userString);

      if (allowedRole && user.role !== allowedRole) {
        setAuthState("redirect");
        setRedirectTo(user.role === "Admin" ? "/admin-dashboard" : "/dashboard");
        return;
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthState("redirect");
      setRedirectTo("/");
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

        setAuthState("authorized");
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setAuthState("redirect");
        setRedirectTo("/");
      });
  }, [allowedRole]);

  if (authState === "checking") {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "radial-gradient(circle at top left, #1a1a1d, #0b0b0d)",
          color: "#ff7b00",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <h2>Loading...</h2>
      </div>
    );
  }

  if (authState === "redirect") {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default PrivateRoute;
