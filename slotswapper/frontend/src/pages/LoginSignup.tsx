import React, { useState } from "react";
import { Input } from "../components/ui/Input.tsx";
import { Label } from "../components/ui/Label.tsx";
import { signup, login } from "../api/auth.ts";

interface LoginSignupProps {
  onLogin: () => void;
}

const LoginSignup: React.FC<LoginSignupProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await signup({ name, email, password });
      if (response.success) {
        setMessage("Signup successful! Please login.");
        setIsSignup(false);
        setName("");
        setEmail("");
        setPassword("");
      } else setMessage(response.message);
    } catch {
      setMessage("Signup failed. Try again.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await login({ email, password });
      if (response.success && response.token) {
        localStorage.setItem("token", response.token);
        setMessage("Login successful!");
        onLogin();
      } else setMessage(response.message);
    } catch {
      setMessage("Login failed. Try again.");
    }
  };

  return (
    <div className={`auth-container ${isSignup ? "signup-active" : ""}`}>
      {/* Orange Sliding Panel */}
      <div className="orange-panel">
        <div className="panel-content">
          <h1 className="brand">SlotSwapper 🔁</h1>
          <p className="tagline">
            Swap your booked time slots effortlessly and make every moment count.
          </p>
        </div>
      </div>

      {/* SIGN IN FORM */}
      <div className="auth-forms signin">
        <div className="card">
          <h2 className="form-title">Welcome Back 👋</h2>
          {message && !isSignup && <p className="message">{message}</p>}
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Login</button>
            <p className="switch-text">
              Don’t have an account?{" "}
              <span onClick={() => setIsSignup(true)}>Sign up</span>
            </p>
          </form>
        </div>
      </div>

      {/* SIGN UP FORM */}
      <div className="auth-forms signup">
        <div className="card">
          <h2 className="form-title">Create Account ✨</h2>
          {message && isSignup && <p className="message">{message}</p>}
          <form onSubmit={handleSignup}>
            <div className="input-group">
              <Label htmlFor="signup-name" className="text-white">Name</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <Label htmlFor="signup-email" className="text-white">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <Label htmlFor="signup-password" className="text-white">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Sign Up</button>
            <p className="switch-text">
              Already have an account?{" "}
              <span onClick={() => setIsSignup(false)}>Sign in</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
