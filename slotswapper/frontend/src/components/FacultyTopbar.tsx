import React from "react";
import {
  Sun,
  Moon,
} from "lucide-react";

interface FacultyTopbarProps {
  lightMode: boolean;
  onToggleTheme: () => void;
}

const FacultyTopbar: React.FC<
  FacultyTopbarProps
> = ({
  lightMode,
  onToggleTheme,
}) => {
  const now =
    new Date();

  const month =
    now.toLocaleDateString(
      "en-US",
      {
        month: "long",
      }
    );

  const day =
    now.getDate();

  const year =
    now.getFullYear();

  return (
    <header className="faculty-topbar">
      <div className="faculty-topbar-brand">
        <div className="faculty-topbar-logo">
          🔁
        </div>

        <strong>
          SlotSwapper
        </strong>
      </div>

      <div className="faculty-topbar-actions">
        <div className="faculty-date-card">
          <span>
            {month}
          </span>

          <strong>
            {day}
          </strong>

          <div />

          <small>
            {year}
          </small>
        </div>

        <button
          className="faculty-theme-toggle"
          onClick={
            onToggleTheme
          }
          title={
            lightMode
              ? "Switch to dark mode"
              : "Switch to light mode"
          }
        >
          {lightMode ? (
            <Moon size={20} />
          ) : (
            <Sun size={20} />
          )}
        </button>
      </div>
    </header>
  );
};

export default FacultyTopbar;