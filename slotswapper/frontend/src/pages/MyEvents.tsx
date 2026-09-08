import React, {
  useEffect,
  useState,
} from "react";

import {
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  MapPin,
  AlertCircle,
  Save,
} from "lucide-react";

import FacultyLayout from "../components/FacultyLayout.tsx";

import {
  getMyTimetable,
  updateSlotStatus,
} from "../api/timetable.ts";

import type {
  DaySchedule,
  Period,
  SlotStatus,
} from "../api/timetable.ts";

interface MyEventsProps {
  onLogout: () => void;
}

const MyEvents: React.FC<
  MyEventsProps
> = ({
  onLogout,
}) => {
  const [
    schedule,
    setSchedule,
  ] = useState<
    DaySchedule[]
  >([]);

  const [
    mondayOrder,
    setMondayOrder,
  ] = useState<
    string | null
  >(null);

  const [
    expandedDay,
    setExpandedDay,
  ] = useState<
    string | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    savingId,
    setSavingId,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getMyTimetable();

        setSchedule(
          data.schedule
        );

        setMondayOrder(
          data.mondayOrder
        );
      } catch (err: unknown) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load timetable"
        );
      } finally {
        setLoading(false);
      }
    };

  const getWeekRange =
    () => {
      const now =
        new Date();

      const day =
        now.getDay();

      const monday =
        new Date(now);

      monday.setDate(
        now.getDate() -
          day +
          (day === 0
            ? -6
            : 1)
      );

      const saturday =
        new Date(
          monday
        );

      saturday.setDate(
        monday.getDate() +
          5
      );

      const format =
        (date: Date) => {
          const month =
            date.toLocaleDateString(
              "en-US",
              {
                month:
                  "short",
              }
            );

          const dayNumber =
            date.getDate();

          const dayName =
            date.toLocaleDateString(
              "en-US",
              {
                weekday:
                  "short",
              }
            );

          return `${month} ${dayNumber} (${dayName})`;
        };

      return `${format(
        monday
      )} – ${format(
        saturday
      )}`;
    };

  const toggleDay = (
    day: string
  ) => {
    setExpandedDay(
      (current) =>
        current === day
          ? null
          : day
    );
  };

  const changeStatus =
    async (
      period: Period,
      day: string,
      status: SlotStatus
    ) => {
      const id = `${day}-${period.period}`;

      try {
        setSavingId(id);

        const data =
          await updateSlotStatus(
            day as DaySchedule["day"],
            period.period,
            status
          );

        setSchedule(
          data.schedule
        );

        setMondayOrder(
          data.mondayOrder
        );
      } catch (err: unknown) {
        alert(
          err instanceof Error
            ? err.message
            : "Unable to update slot"
        );
      } finally {
        setSavingId("");
      }
    };

  const getStatusBadge =
    (
      period: Period
    ) => {
      if (period.isFree) {
        return (
          <span className="faculty-badge free">
            Free
          </span>
        );
      }

      if (
        period.status ===
        "Emergency"
      ) {
        return (
          <span className="faculty-badge emergency">
            🚨 Emergency
          </span>
        );
      }

      if (
        period.status ===
        "Swappable"
      ) {
        return (
          <span className="faculty-badge swappable">
            Swappable
          </span>
        );
      }

      return (
        <span className="faculty-badge busy">
          Busy
        </span>
      );
    };

  if (loading) {
    return (
      <FacultyLayout
        currentPage="my-events"
        onLogout={onLogout}
      >
        <div className="faculty-loading">
          Loading timetable...
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout
      currentPage="my-events"
      onLogout={onLogout}
    >
      <div className="faculty-dashboard-page">
        <div className="faculty-page-heading">
          <h1>
            My Timetable
          </h1>

          <p>
            Configure your weekly
            schedule and manage swap
            availability
          </p>
        </div>

        {error && (
          <div className="faculty-error">
            {error}
          </div>
        )}

        <div className="faculty-week-card">
          <div>
            <span>
              Academic Week
            </span>

            <strong>
              {getWeekRange()}
            </strong>
          </div>

          <div className="faculty-monday-order">
            Monday follows{" "}
            <strong>
              {mondayOrder ||
                "Not configured"}
            </strong>{" "}
            schedule
          </div>
        </div>

        <div className="faculty-info-card">
          <div className="faculty-info-icon">
            ℹ
          </div>

          <div>
            <h3>
              Timetable Management
            </h3>

            <p>
              • Click on a day card to
              expand and view all 7
              periods
            </p>

            <p>
              • Free periods are
              automatically detected
              and cannot be modified
            </p>

            <p>
              • Mark teaching periods
              as Swappable to make
              them available for
              marketplace
            </p>

            <p>
              • Emergency is available
              only for Swappable
              periods
            </p>

            <p>
              • Monday follows the
              academic order configured
              by the administrator
            </p>
          </div>
        </div>

        {!schedule.length ? (
          <div className="faculty-empty-card">
            <h2>
              Timetable not configured
            </h2>

            <p>
              Your timetable will
              appear here after it is
              configured.
            </p>
          </div>
        ) : (
          <div className="faculty-day-list">
            {schedule.map(
              (day) => {
                const isExpanded =
                  expandedDay ===
                  day.day;

                const classes =
                  day.periods.filter(
                    (period) =>
                      !period.isFree
                  ).length;

                const swappable =
                  day.periods.filter(
                    (period) =>
                      period.status ===
                      "Swappable"
                  ).length;

                const emergency =
                  day.periods.filter(
                    (period) =>
                      period.status ===
                      "Emergency"
                  ).length;

                return (
                  <div
                    key={
                      day.day
                    }
                    className="faculty-day-card"
                  >
                    <button
                      className="faculty-day-header"
                      onClick={() =>
                        toggleDay(
                          day.day
                        )
                      }
                    >
                      <div className="faculty-day-header-left">
                        <div>
                          <h2>
                            {
                              day.day
                            }
                          </h2>

                          {day.day ===
                            "Monday" &&
                            day.rotationDay && (
                              <span>
                                Follows{" "}
                                {
                                  day.rotationDay
                                }
                              </span>
                            )}
                        </div>

                        <div className="faculty-day-badges">
                          <span className="faculty-mini-badge">
                            {classes}{" "}
                            Classes
                          </span>

                          {swappable >
                            0 && (
                            <span className="faculty-mini-badge orange">
                              {
                                swappable
                              }{" "}
                              Swappable
                            </span>
                          )}

                          {emergency >
                            0 && (
                            <span className="faculty-mini-badge red">
                              {
                                emergency
                              }{" "}
                              Emergency
                            </span>
                          )}
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="faculty-expanded-periods">
                        {day.periods.map(
                          (
                            period
                          ) => {
                            const id = `${day.day}-${period.period}`;

                            const isMonday =
                              day.day ===
                              "Monday";

                            const saving =
                              savingId ===
                              id;

                            return (
                              <div
                                key={
                                  period.id
                                }
                                className={
                                  period.isFree
                                    ? "faculty-event-period free"
                                    : period.status ===
                                      "Emergency"
                                    ? "faculty-event-period emergency"
                                    : "faculty-event-period"
                                }
                              >
                                <div className="faculty-event-main">
                                  <div className="faculty-event-title">
                                    <span>
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

                                  {getStatusBadge(
                                    period
                                  )}

                                  {period.status ===
                                    "Emergency" && (
                                    <AlertCircle
                                      className="faculty-emergency-icon"
                                      size={
                                        18
                                      }
                                    />
                                  )}

                                  <div className="faculty-event-details">
                                    <span>
                                      <Clock
                                        size={
                                          16
                                        }
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
                                            size={
                                              16
                                            }
                                          />

                                          {
                                            period.class
                                          }
                                        </span>

                                        {period.room && (
                                          <span>
                                            <MapPin
                                              size={
                                                16
                                              }
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

                                {!period.isFree &&
                                  !isMonday && (
                                    <div className="faculty-status-controls">
                                      <button
                                        disabled={
                                          saving
                                        }
                                        className={
                                          period.status ===
                                          "Busy"
                                            ? "selected"
                                            : ""
                                        }
                                        onClick={() =>
                                          changeStatus(
                                            period,
                                            day.day,
                                            "Busy"
                                          )
                                        }
                                      >
                                        Busy
                                      </button>

                                      <button
                                        disabled={
                                          saving
                                        }
                                        className={
                                          period.status ===
                                            "Swappable" ||
                                          period.status ===
                                            "Emergency"
                                            ? "selected orange"
                                            : ""
                                        }
                                        onClick={() =>
                                          changeStatus(
                                            period,
                                            day.day,
                                            "Swappable"
                                          )
                                        }
                                      >
                                        Swappable
                                      </button>

                                      <button
                                        disabled={
                                          saving ||
                                          (period.status !==
                                            "Swappable" &&
                                            period.status !==
                                              "Emergency")
                                        }
                                        className={
                                          period.status ===
                                          "Emergency"
                                            ? "selected red"
                                            : ""
                                        }
                                        onClick={() =>
                                          changeStatus(
                                            period,
                                            day.day,
                                            "Emergency"
                                          )
                                        }
                                      >
                                        Emergency
                                      </button>
                                    </div>
                                  )}

                                {isMonday &&
                                  !period.isFree && (
                                    <div className="faculty-monday-note">
                                      Monday follows the{" "}
                                      {
                                        mondayOrder
                                      }{" "}
                                      schedule.
                                    </div>
                                  )}

                                {saving && (
                                  <div className="faculty-saving">
                                    <Save
                                      size={
                                        14
                                      }
                                    />

                                    Saving...
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}

        <div className="faculty-tips-card">
          <h3>
            Quick Tips
          </h3>

          <p>
            • Mark teaching periods as
            Swappable to make them
            available for swapping.
          </p>

          <p>
            • Emergency status can be
            selected only after making a
            period Swappable.
          </p>

          <p>
            • Monday automatically
            follows the administrator's
            academic order.
          </p>
        </div>
      </div>
    </FacultyLayout>
  );
};

export default MyEvents;