import React, {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Sidebar from "./Sidebar.tsx";
import FacultyTopbar from "./FacultyTopbar.tsx";

interface FacultyLayoutProps {
  currentPage:
    | "dashboard"
    | "my-events"
    | "marketplace"
    | "requests"
    | "settings";

  onLogout: () => void;

  children: React.ReactNode;
}

const FacultyLayout: React.FC<
  FacultyLayoutProps
> = ({
  currentPage,
  onLogout,
  children,
}) => {
  const [
    lightMode,
    setLightMode,
  ] = useState(() => {
    return (
      localStorage.getItem(
        "facultyTheme"
      ) === "light"
    );
  });

  const navigate =
    useNavigate();

  const handleNavigate = (
    page: string
  ) => {
    navigate(
      `/${page}`
    );
  };

  const handleToggleTheme =
    () => {
      setLightMode(
        (current) => {
          const next =
            !current;

          localStorage.setItem(
            "facultyTheme",
            next
              ? "light"
              : "dark"
          );

          return next;
        }
      );
    };

  return (
    <div
      className={
        lightMode
          ? "faculty-shell faculty-light"
          : "faculty-shell"
      }
    >
      <Sidebar
        currentPage={
          currentPage
        }
        onNavigate={
          handleNavigate
        }
        onLogout={
          onLogout
        }
      />

      <div className="faculty-content">
        <FacultyTopbar
          lightMode={
            lightMode
          }
          onToggleTheme={
            handleToggleTheme
          }
        />

        <main className="faculty-page">
          {children}
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout;