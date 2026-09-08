import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  Clock,
  Users,
  MapPin,
  AlertCircle,
  Check,
} from "lucide-react";

import FacultyLayout from "../components/FacultyLayout.tsx";

import {
  getMyTimetable,
} from "../api/timetable.ts";

import type {
  DaySchedule,
  Period,
} from "../api/timetable.ts";

import {
  getTodayAttendance,
  markAttendanceCompleted,
} from "../api/attendance.ts";

import type {
  AttendanceResponse,
} from "../api/attendance.ts";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  onLogout,
}) => {
  const [schedule, setSchedule] =
    useState<DaySchedule[]>([]);

  const [attendance, setAttendance] =
    useState<AttendanceResponse[]>([]);

  const [userName, setUserName] =
    useState("Faculty");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [now, setNow] =
    useState(new Date());

  useEffect(() => {
    const userString =
      localStorage.getItem("user");

    if (userString) {
      try {
        const user =
          JSON.parse(userString);

        setUserName(
          user.name || "Faculty"
        );
      } catch {
        setUserName("Faculty");
      }
    }
  }, []);

  useEffect(() => {
    const loadData =
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            timetable,
            todayAttendance,
          ] = await Promise.all([
            getMyTimetable(),
            getTodayAttendance(),
          ]);

          setSchedule(
            timetable.schedule
          );

          setAttendance(
            todayAttendance
          );
        } catch (err: unknown) {
          console.error(err);

          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard"
          );
        } finally {
          setLoading(false);
        }
      };

    loadData();
  }, []);

  /*
   * Keep the 10-minute button
   * live without page refresh.
   */
  useEffect(() => {
    const interval =
      setInterval(() => {
        setNow(new Date());
      }, 15000);

    return () =>
      clearInterval(interval);
  }, []);

  const currentDay =
    useMemo(() => {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      return days[now.getDay()];
    }, [now]);

  const todaySchedule =
    useMemo(() => {
      if (
        currentDay ===
        "Sunday"
      ) {
        return null;
      }

      return (
        schedule.find(
          (day) =>
            day.day ===
            currentDay
        ) || null
      );
    }, [
      schedule,
      currentDay,
    ]);

  const totalClasses =
    todaySchedule?.periods.filter(
      (period) =>
        !period.isFree
    ).length || 0;

  const swappableSlots =
    todaySchedule?.periods.filter(
      (period) =>
        period.status ===
        "Swappable"
    ).length || 0;

  const emergencySwaps =
    todaySchedule?.periods.filter(
      (period) =>
        period.status ===
        "Emergency"
    ).length || 0;

  const isCompleted = (
    periodNumber: number
  ) => {
    return attendance.some(
      (record) =>
        record.attendance?.periodNumber ===
        periodNumber &&
        record.attendance?.status ===
        "Present"
    );
  };

  const canMarkComplete = (
    period: Period
  ) => {
    if (period.isFree) {
      return false;
    }

    if (
      isCompleted(
        period.period
      )
    ) {
      return false;
    }

    const [
      hours,
      minutes,
    ] =
      period.endTime
        .split(":")
        .map(Number);

    const endTime =
      new Date(now);

    endTime.setHours(
      hours,
      minutes,
      0,
      0
    );

    const tenMinutesAfter =
      new Date(
        endTime.getTime() +
          10 * 60 * 1000
      );

    return (
      now >= endTime &&
      now <=
        tenMinutesAfter
    );
  };

  const handleMarkCompleted =
    async (
      period: Period
    ) => {
      try {
        await markAttendanceCompleted(
          period.period
        );

        const updated =
          await getTodayAttendance();

        setAttendance(
          updated
        );
      } catch (err: unknown) {
        alert(
          err instanceof Error
            ? err.message
            : "Unable to mark attendance"
        );
      }
    };

  if (loading) {
    return (
      <FacultyLayout
        currentPage="dashboard"
        onLogout={onLogout}
      >
        <div className="faculty-loading">
          Loading dashboard...
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout
      currentPage="dashboard"
      onLogout={onLogout}
    >
      <div className="faculty-dashboard-page">
        <div className="faculty-page-heading">
          <h1>
            Welcome back,{" "}
            <span>
              {userName}
            </span>
            !
          </h1>

          <p>
            {currentDay ===
            "Sunday"
              ? "No classes today. Enjoy your day off!"
              : `Here's your schedule for ${currentDay}`}
          </p>
        </div>

        {error && (
          <div className="faculty-error">
            {error}
          </div>
        )}

        {!todaySchedule &&
        currentDay !==
          "Sunday" ? (
          <div className="faculty-empty-card">
            <h2>
              Timetable not configured
            </h2>

            <p>
              Your weekly timetable
              has not been configured
              yet.
            </p>
          </div>
        ) : (
          <>
            <div className="faculty-stat-grid">
              <div className="faculty-stat-card">
                <div>
                  <p>
                    Total Classes Today
                  </p>

                  <strong>
                    {totalClasses}
                  </strong>
                </div>

                <div className="faculty-stat-icon orange">
                  <BookOpen
                    size={24}
                  />
                </div>
              </div>

              <div className="faculty-stat-card">
                <div>
                  <p>
                    Swappable Slots
                  </p>

                  <strong>
                    {swappableSlots}
                  </strong>
                </div>

                <div className="faculty-stat-icon blue">
                  🔄
                </div>
              </div>

              <div className="faculty-stat-card">
                <div>
                  <p>
                    Emergency Swaps
                  </p>

                  <strong>
                    {emergencySwaps}
                  </strong>
                </div>

                <div className="faculty-stat-icon red">
                  <AlertCircle
                    size={24}
                  />
                </div>
              </div>
            </div>

            {todaySchedule ? (
              <section className="faculty-schedule-card">
                <div className="faculty-section-heading">
                  <h2>
                    Today's Schedule
                  </h2>

                  <p>
                    All 7 periods for{" "}
                    {currentDay}
                  </p>
                </div>

                <div className="faculty-period-list">
                  {todaySchedule.periods.map(
                    (period) => {
                      const completed =
                        isCompleted(
                          period.period
                        );

                      const active =
                        canMarkComplete(
                          period
                        );

                      return (
                        <div
                          key={
                            period.id
                          }
                          className={
                            period.isFree
                              ? "faculty-period-card free"
                              : period.status ===
                                "Emergency"
                              ? "faculty-period-card emergency"
                              : "faculty-period-card"
                          }
                        >
                          <div className="faculty-period-info">
                            <div className="faculty-period-top">
                              <div>
                                <span className="faculty-period-number">
                                  Period{" "}
                                  {
                                    period.period
                                  }
                                </span>

                                <h3>
                                  {period.isFree
                                    ? "Free Period"
                                    : period.subject}
                                </h3>
                              </div>

                              {!period.isFree && (
                                <div className="faculty-period-badges">
                                  {period.status ===
                                    "Swappable" && (
                                    <span className="faculty-badge swappable">
                                      Swappable
                                    </span>
                                  )}

                                  {period.status ===
                                    "Busy" && (
                                    <span className="faculty-badge busy">
                                      Busy
                                    </span>
                                  )}

                                  {period.status ===
                                    "Emergency" && (
                                    <span className="faculty-badge emergency">
                                      🚨 Emergency
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="faculty-period-details">
                              <span>
                                <Clock
                                  size={16}
                                />

                                {
                                  period.startTime
                                }{" "}
                                -{" "}
                                {
                                  period.endTime
                                }
                              </span>

                              {!period.isFree && (
                                <>
                                  <span>
                                    <Users
                                      size={16}
                                    />

                                    {
                                      period.class
                                    }
                                  </span>

                                  {period.room && (
                                    <span>
                                      <MapPin
                                        size={16}
                                      />

                                      {
                                        period.room
                                      }
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {!period.isFree && (
                            <div className="faculty-complete-area">
                              <button
                                disabled={
                                  !active &&
                                  !completed
                                }
                                onClick={() =>
                                  handleMarkCompleted(
                                    period
                                  )
                                }
                                className={
                                  completed
                                    ? "faculty-complete-btn completed"
                                    : active
                                    ? "faculty-complete-btn active"
                                    : "faculty-complete-btn"
                                }
                              >
                                <Check
                                  size={18}
                                />

                                {completed
                                  ? "Completed"
                                  : "Mark Completed"}
                              </button>

                              {!completed &&
                                !active && (
                                  <small>
                                    Available only
                                    from class end
                                    until 10 minutes
                                    after
                                  </small>
                                )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            ) : (
              <div className="faculty-empty-card">
                <BookOpen
                  size={50}
                />

                <h2>
                  No Classes Today
                </h2>

                <p>
                  Enjoy your day off!
                </p>
              </div>
            )}
          </>
        )}

        <div className="faculty-tips-card">
          <h3>
            Quick Tips
          </h3>

          <p>
            • Mark Completed becomes
            active immediately after
            the class ends and remains
            available for 10 minutes.
          </p>

          <p>
            • Attendance is automatically
            saved when you mark a class
            completed.
          </p>

          <p>
            • Go to My Events to manage
            Busy, Swappable and Emergency
            availability.
          </p>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default Dashboard;