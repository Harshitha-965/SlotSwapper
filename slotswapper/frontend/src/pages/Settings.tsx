import React, {
  useEffect,
  useState,
} from "react";

import {
  User,
  Bell,
  CalendarDays,
  FileText,
  Save,
  Building2,
  Search,
  Download,
  Info,
} from "lucide-react";

import FacultyLayout from "../components/FacultyLayout.tsx";

import {
  getMyTimetable,
  saveTimetable,
} from "../api/timetable.ts";

import type {
  AcademicDay,
  DaySchedule,
  Period,
} from "../api/timetable.ts";


interface SettingsProps {
  onLogout: () => void;
}

type SettingsTab =
  | "profile"
  | "notifications"
  | "timetable"
  | "attendance"
  | "reports";


interface UserInfo {
  name?: string;
  email?: string;
  college?: string;
  role?: string;
  department?: string;
}




const academicDays: AcademicDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];




const createEmptyTimetable = (): DaySchedule[] => {
  return academicDays.map(
    (day) => ({
      day,
      periods: Array.from(
        { length: 7 },
        (_, index) =>
          ({
            id: `${day}-${index + 1}`,
            period:
              index + 1,
            startTime: "",
            endTime: "",
            subject: "",
            class: "",
            room: "",
            isFree: true,
            status: "Busy",
          }) as Period
      ),
    })
  );
};


const Settings: React.FC<
  SettingsProps
> = ({
  onLogout,
}) => {

  const [
    activeTab,
    setActiveTab,
  ] = useState<SettingsTab>(
    "profile"
  );


  /* =====================================================
     PROFILE
  ===================================================== */

  const [
    userInfo,
    setUserInfo,
  ] = useState<UserInfo>({
    name: "",
    email: "",
    college: "",
    role: "Faculty",
    department: "Computer Science",
  });


  const [
    profileSaved,
    setProfileSaved,
  ] = useState(false);


  useEffect(() => {
    const storedUser =
      localStorage.getItem(
        "user"
      );

    if (!storedUser) {
      return;
    }

    try {
      const user =
        JSON.parse(
          storedUser
        );

      setUserInfo({
        name:
          user.name || "",
        email:
          user.email || "",
        college:
          user.college || "",
        role:
          user.role ||
          "Faculty",
        department:
          user.department ||
          "Computer Science",
      });
    } catch (err) {
      console.error(
        "Failed to load user information:",
        err
      );
    }
  }, []);


  const handleProfileChange = (
    field: keyof UserInfo,
    value: string
  ) => {
    setUserInfo(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

    setProfileSaved(false);
  };


  const handleSaveProfile = () => {
    const storedUser =
      localStorage.getItem(
        "user"
      );

    let existingUser:
      Record<string, unknown> =
      {};

    if (storedUser) {
      try {
        existingUser =
          JSON.parse(
            storedUser
          );
      } catch {
        existingUser = {};
      }
    }

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...existingUser,
        name:
          userInfo.name,
        email:
          userInfo.email,
        department:
          userInfo.department,
      })
    );

    setProfileSaved(true);

    setTimeout(() => {
      setProfileSaved(false);
    }, 2500);
  };


  /* =====================================================
     NOTIFICATIONS
     Dummy for now
  ===================================================== */

  const [
    notifications,
    setNotifications,
  ] = useState({
    email: true,
    inApp: true,
    emergency: true,
    swapUpdates: true,
  });


  const toggleNotification = (
    key:
      | "email"
      | "inApp"
      | "emergency"
      | "swapUpdates"
  ) => {
    setNotifications(
      (previous) => ({
        ...previous,
        [key]:
          !previous[key],
      })
    );
  };


  const [
    notificationSaved,
    setNotificationSaved,
  ] = useState(false);


  const handleSaveNotifications =
    () => {
      setNotificationSaved(
        true
      );

      setTimeout(() => {
        setNotificationSaved(
          false
        );
      }, 2500);
    };


  /* =====================================================
     TIMETABLE
  ===================================================== */

  const [
    timetable,
    setTimetable,
  ] = useState<
    DaySchedule[]
  >(
    createEmptyTimetable()
  );


  const [
    selectedDay,
    setSelectedDay,
  ] = useState<AcademicDay>(
    "Monday"
  );


  const [
    timetableLoading,
    setTimetableLoading,
  ] = useState(false);


  const [
    timetableSaving,
    setTimetableSaving,
  ] = useState(false);


  const [
    timetableMessage,
    setTimetableMessage,
  ] = useState("");


  useEffect(() => {
    if (
      activeTab !==
      "timetable"
    ) {
      return;
    }

    const loadTimetable =
      async () => {
        try {
          setTimetableLoading(
            true
          );

          setTimetableMessage(
            ""
          );

          const data =
            await getMyTimetable();

          if (
            data.configured &&
            data.schedule?.length
          ) {
            setTimetable(
              data.schedule
            );
          } else {
            setTimetable(
              createEmptyTimetable()
            );
          }
        } catch (
          err: unknown
        ) {
          console.error(
            "Failed to load timetable:",
            err
          );

          setTimetableMessage(
            err instanceof Error
              ? err.message
              : "Unable to load timetable"
          );
        } finally {
          setTimetableLoading(
            false
          );
        }
      };

    loadTimetable();
  }, [
    activeTab,
  ]);


  const selectedSchedule =
    timetable.find(
      (day) =>
        day.day ===
        selectedDay
    );


  const updatePeriod = (
    periodNumber: number,
    field:
      | "subject"
      | "startTime"
      | "endTime"
      | "class"
      | "room",
    value: string
  ) => {
    setTimetable(
      (previous) =>
        previous.map(
          (day) => {
            if (
              day.day !==
              selectedDay
            ) {
              return day;
            }

            return {
              ...day,
              periods:
                day.periods.map(
                  (period) => {
                    if (
                      period.period !==
                      periodNumber
                    ) {
                      return period;
                    }

                    return {
                      ...period,
                      [field]:
                        value,
                      isFree:
                        field ===
                          "subject"
                          ? !value.trim() ||
                            !period.class.trim()
                          : field ===
                            "class"
                          ? !period.subject.trim() ||
                            !value.trim()
                          : period.isFree,
                    };
                  }
                ),
            };
          }
        )
    );

    setTimetableMessage(
      ""
    );
  };


  const handleSaveTimetable =
    async () => {
      try {
        setTimetableSaving(
          true
        );

        setTimetableMessage(
          ""
        );

        const payload =
          timetable.map(
            (day) => ({
              day:
                day.day,

              periods:
                day.periods.map(
                  (period) => ({
                    periodNumber:
                      period.period,

                    subject:
                      period.subject,

                    startTime:
                      period.startTime,

                    endTime:
                      period.endTime,

                    className:
                      period.class,

                    room:
                      period.room,
                  })
                ),
            })
          );

        await saveTimetable(
          payload
        );

        setTimetableMessage(
          "Timetable saved successfully."
        );
      } catch (
        err: unknown
      ) {
        console.error(
          "Failed to save timetable:",
          err
        );

        setTimetableMessage(
          err instanceof Error
            ? err.message
            : "Unable to save timetable"
        );
      } finally {
        setTimetableSaving(
          false
        );
      }
    };


  /* =====================================================
     TAB CONFIGURATION
  ===================================================== */

  const tabs = [
    {
      id: "profile" as SettingsTab,
      label: "Profile",
      icon: User,
    },

    {
      id: "notifications" as SettingsTab,
      label: "Notifications",
      icon: Bell,
    },

    {
      id: "timetable" as SettingsTab,
      label: "Timetable",
      icon: CalendarDays,
    },

    {
      id: "attendance" as SettingsTab,
      label: "Attendance",
      icon: FileText,
    },

    {
      id: "reports" as SettingsTab,
      label: "Reports",
      icon: FileText,
    },
  ];


  /* =====================================================
     TOGGLE COMPONENT
  ===================================================== */

  const Toggle = ({
    enabled,
    onClick,
  }: {
    enabled: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      className={
        enabled
          ? "settings-toggle active"
          : "settings-toggle"
      }
      onClick={onClick}
      aria-label="Toggle notification"
    >
      <span />
    </button>
  );


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <FacultyLayout
      currentPage="settings"
      onLogout={
        onLogout
      }
    >

      <div className="faculty-settings-page">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="faculty-page-heading">

          <h1>
            Settings
          </h1>

          <p>
            Manage your profile,
            preferences, and view
            reports
          </p>

        </div>


        {/* =================================================
            TABS
        ================================================= */}

        <div className="settings-tabs">

          {tabs.map(
            (tab) => {
              const Icon =
                tab.icon;

              return (
                <button
                  key={
                    tab.id
                  }
                  type="button"
                  className={
                    activeTab ===
                    tab.id
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab(
                      tab.id
                    )
                  }
                >
                  <Icon
                    size={18}
                  />

                  <span>
                    {
                      tab.label
                    }
                  </span>
                </button>
              );
            }
          )}

        </div>


        {/* =================================================
            PROFILE
        ================================================= */}

        {activeTab ===
          "profile" && (
          <section className="settings-card">

            <div className="settings-card-heading">
              <h2>
                Personal Information
              </h2>
            </div>


            <div className="settings-form">

              <div className="settings-field">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  value={
                    userInfo.name ||
                    ""
                  }
                  onChange={(event) =>
                    handleProfileChange(
                      "name",
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter your full name"
                />

              </div>


              <div className="settings-field">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  value={
                    userInfo.email ||
                    ""
                  }
                  onChange={(event) =>
                    handleProfileChange(
                      "email",
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter your email"
                />

              </div>


              <div className="settings-field">

                <label>
                  College
                </label>

                <div className="settings-locked-field">

                  <Building2
                    size={19}
                  />

                  <span>
                    {
                      userInfo.college ||
                      "College not available"
                    }
                  </span>

                  <small>
                    (Cannot be changed)
                  </small>

                </div>

              </div>


              <div className="settings-field">

                <label>
                  Department
                </label>

                <input
                  type="text"
                  value={
                    userInfo.department ||
                    ""
                  }
                  onChange={(event) =>
                    handleProfileChange(
                      "department",
                      event.target
                        .value
                    )
                  }
                  placeholder="Enter your department"
                />

              </div>


              <div className="settings-readonly-row">

                <span>
                  Role
                </span>

                <strong>
                  {
                    userInfo.role ||
                    "Faculty"
                  }
                </strong>

              </div>


              <div className="settings-save-row">

                <button
                  type="button"
                  className="settings-primary-btn"
                  onClick={
                    handleSaveProfile
                  }
                >
                  <Save
                    size={18}
                  />

                  Save Changes
                </button>

                {profileSaved && (
                  <span className="settings-success-message">
                    Profile saved.
                  </span>
                )}

              </div>

            </div>

          </section>
        )}


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        {activeTab ===
          "notifications" && (
          <section className="settings-card">

            <div className="settings-card-heading">
              <h2>
                Notification Preferences
              </h2>
            </div>


            <div className="settings-notification-list">

              <div className="settings-notification-row">

                <div>
                  <strong>
                    Email Notifications
                  </strong>

                  <p>
                    Receive notifications
                    via email
                  </p>
                </div>

                <Toggle
                  enabled={
                    notifications.email
                  }
                  onClick={() =>
                    toggleNotification(
                      "email"
                    )
                  }
                />

              </div>


              <div className="settings-notification-row">

                <div>
                  <strong>
                    In-App Notifications
                  </strong>

                  <p>
                    Show notifications
                    within the application
                  </p>
                </div>

                <Toggle
                  enabled={
                    notifications.inApp
                  }
                  onClick={() =>
                    toggleNotification(
                      "inApp"
                    )
                  }
                />

              </div>


              <div className="settings-notification-row emergency">

                <div>
                  <strong>
                    Emergency Swap Alerts
                  </strong>

                  <p>
                    Get immediate alerts
                    for emergency swap
                    requests
                  </p>
                </div>

                <Toggle
                  enabled={
                    notifications.emergency
                  }
                  onClick={() =>
                    toggleNotification(
                      "emergency"
                    )
                  }
                />

              </div>


              <div className="settings-notification-row">

                <div>
                  <strong>
                    Swap Request Updates
                  </strong>

                  <p>
                    Notifications when
                    requests are accepted
                    or rejected
                  </p>
                </div>

                <Toggle
                  enabled={
                    notifications.swapUpdates
                  }
                  onClick={() =>
                    toggleNotification(
                      "swapUpdates"
                    )
                  }
                />

              </div>

            </div>


            <div className="settings-save-row">

              <button
                type="button"
                className="settings-primary-btn"
                onClick={
                  handleSaveNotifications
                }
              >
                <Save
                  size={18}
                />

                Save Preferences
              </button>

              {notificationSaved && (
                <span className="settings-success-message">
                  Preferences saved.
                </span>
              )}

            </div>

          </section>
        )}


        {/* =================================================
            TIMETABLE
        ================================================= */}

        {activeTab ===
          "timetable" && (
          <section className="settings-card">

            <div className="settings-card-heading">

              <h2>
                Timetable Management
              </h2>

              <p>
                Configure your permanent
                weekly timetable. This
                schedule is reused by your
                Dashboard, My Events and
                attendance system.
              </p>

            </div>


            <div className="settings-timetable-info">

              <Info
                size={21}
              />

              <div>
                <strong>
                  Timetable Tips
                </strong>

                <p>
                  • Configure Monday
                  through Saturday
                </p>

                <p>
                  • Each day contains
                  exactly 7 periods
                </p>

                <p>
                  • Leave Subject and
                  Class empty for a
                  free period
                </p>

                <p>
                  • This timetable is
                  saved once and reused
                  throughout the system
                </p>
              </div>

            </div>


            <div className="settings-day-tabs">

              {academicDays.map(
                (day) => (
                  <button
                    key={
                      day
                    }
                    type="button"
                    className={
                      selectedDay ===
                      day
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setSelectedDay(
                        day
                      )
                    }
                  >
                    {day}
                  </button>
                )
              )}

            </div>


            {timetableLoading ? (
              <div className="settings-loading">
                Loading timetable...
              </div>
            ) : (
              <div className="settings-timetable-table">

                <div className="settings-timetable-header">

                  <span>
                    Period
                  </span>

                  <span>
                    Start
                  </span>

                  <span>
                    End
                  </span>

                  <span>
                    Subject
                  </span>

                  <span>
                    Class
                  </span>

                  <span>
                    Room
                  </span>

                </div>


                {selectedSchedule?.periods.map(
                  (
                    period
                  ) => (
                    <div
                      key={
                        period.id
                      }
                      className="settings-timetable-row"
                    >

                      <div className="settings-period-number">
                        {
                          period.period
                        }
                      </div>


                      <input
                        type="time"
                        value={
                          period.startTime
                        }
                        onChange={(
                          event
                        ) =>
                          updatePeriod(
                            period.period,
                            "startTime",
                            event.target
                              .value
                          )
                        }
                      />


                      <input
                        type="time"
                        value={
                          period.endTime
                        }
                        onChange={(
                          event
                        ) =>
                          updatePeriod(
                            period.period,
                            "endTime",
                            event.target
                              .value
                          )
                        }
                      />


                      <input
                        type="text"
                        value={
                          period.subject
                        }
                        onChange={(
                          event
                        ) =>
                          updatePeriod(
                            period.period,
                            "subject",
                            event.target
                              .value
                          )
                        }
                        placeholder="Subject"
                      />


                      <input
                        type="text"
                        value={
                          period.class
                        }
                        onChange={(
                          event
                        ) =>
                          updatePeriod(
                            period.period,
                            "class",
                            event.target
                              .value
                          )
                        }
                        placeholder="Class"
                      />


                      <input
                        type="text"
                        value={
                          period.room
                        }
                        onChange={(
                          event
                        ) =>
                          updatePeriod(
                            period.period,
                            "room",
                            event.target
                              .value
                          )
                        }
                        placeholder="Room"
                      />

                    </div>
                  )
                )}

              </div>
            )}


            {timetableMessage && (
              <div
                className={
                  timetableMessage.includes(
                    "successfully"
                  )
                    ? "settings-success-box"
                    : "settings-error-box"
                }
              >
                {timetableMessage}
              </div>
            )}


            <div className="settings-save-row">

              <button
                type="button"
                className="settings-primary-btn"
                disabled={
                  timetableSaving ||
                  timetableLoading
                }
                onClick={
                  handleSaveTimetable
                }
              >
                <Save
                  size={18}
                />

                {timetableSaving
                  ? "Saving..."
                  : "Save Timetable"}
              </button>

            </div>

          </section>
        )}


        {/* =================================================
            ATTENDANCE
        ================================================= */}

        {activeTab ===
          "attendance" && (
          <section className="settings-card">

            <div className="settings-report-header">

              <div>
                <h2>
                  Attendance History
                </h2>

                <p>
                  Complete record of all
                  marked attendance
                </p>
              </div>

              <button
                type="button"
                className="settings-export-btn"
                disabled
              >
                <Download
                  size={17}
                />

                Export CSV
              </button>

            </div>


            <div className="settings-report-filters">

              <div className="settings-search-box">

                <Search
                  size={19}
                />

                <input
                  type="text"
                  placeholder="Search by subject or class..."
                  disabled
                />

              </div>


              <select
                disabled
                defaultValue="all"
              >
                <option value="all">
                  All Status
                </option>

                <option value="Present">
                  Present
                </option>

                <option value="Absent">
                  Absent
                </option>
              </select>

            </div>


            <div className="settings-empty-report">

              <FileText
                size={60}
              />

              <h3>
                Attendance History
              </h3>

              <p>
                Your complete attendance
                table and PDF/CSV export
                will appear here.
              </p>

              <small>
                Attendance history API
                integration is the next
                step.
              </small>

            </div>

          </section>
        )}


        {/* =================================================
            REPORTS
        ================================================= */}

        {activeTab ===
          "reports" && (
          <section className="settings-card">

            <div className="settings-report-header">

              <div>
                <h2>
                  Swap Activity Reports
                </h2>

                <p>
                  Permanent record of your
                  swap-related activities
                </p>
              </div>

              <button
                type="button"
                className="settings-export-btn"
                disabled
              >
                <Download
                  size={17}
                />

                Export CSV
              </button>

            </div>


            <div className="settings-audit-banner">

              <div className="settings-audit-icon">
                🔐
              </div>

              <div>

                <strong>
                  Permanent Audit Trail
                </strong>

                <p>
                  Swap activities are
                  recorded for
                  administrative review
                  and audit purposes.
                </p>

              </div>

            </div>


            <div className="settings-report-filters">

              <div className="settings-search-box">

                <Search
                  size={19}
                />

                <input
                  type="text"
                  placeholder="Search by faculty or subject..."
                  disabled
                />

              </div>


              <select
                disabled
                defaultValue="all"
              >
                <option value="all">
                  All Actions
                </option>

                <option value="sent">
                  Sent
                </option>

                <option value="received">
                  Received
                </option>

                <option value="accepted">
                  Accepted
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>

            </div>


            <div className="settings-empty-report">

              <FileText
                size={60}
              />

              <h3>
                No Activity Records
              </h3>

              <p>
                Your swap request activity
                and downloadable reports
                will appear here.
              </p>

              <small>
                Swap activity report
                integration is the next
                step.
              </small>

            </div>

          </section>
        )}

      </div>

    </FacultyLayout>
  );
};


export default Settings;