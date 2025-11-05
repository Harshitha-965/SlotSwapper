import React, { useEffect, useState } from "react";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    // Example: extract user info from token (if JWT contains email)
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode JWT payload (assuming base64 encoded)
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserEmail(payload.email || "User");
      } catch (err) {
        console.error("Failed to parse token", err);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground font-sans p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome, {userEmail}!</h1>
      <p className="mb-6 text-center text-lg">
        You are now logged in. This is your dashboard.
      </p>
      <button
        onClick={onLogout}
        className="bg-primary hover:bg-accent text-foreground py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,106,0,0.5)] hover:scale-[1.02] active:scale-[0.98]"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
