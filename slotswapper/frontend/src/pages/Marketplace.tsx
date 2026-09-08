import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  SlidersHorizontal,
  AlertCircle,
  User,
  CalendarDays,
  Clock,
  Users,
  MapPin,
} from "lucide-react";

import FacultyLayout from "../components/FacultyLayout.tsx";
import SwapModal from "../components/SwapModal.tsx";

interface MarketEvent {
  id: string;
  title: string;
  start: string;
  end: string;

  status:
    | "Busy"
    | "Swappable"
    | "Pending"
    | "Emergency"
    | "Free"
    | string;

  ownerId?: string;
  ownerName?: string;

  subject?: string;
  day?: string;
  periodNumber?: number;
  className?: string;
  room?: string;
}

interface UserEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

type DayFilter =
  | "All"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

type CategoryFilter =
  | "All"
  | "Emergency"
  | "Swappable"
  | "Free";

const Marketplace: React.FC = () => {
  const [events, setEvents] =
    useState<MarketEvent[]>([]);

  const [userEvents, setUserEvents] =
    useState<UserEvent[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [showSwapModal, setShowSwapModal] =
    useState(false);

  const [targetEvent, setTargetEvent] =
    useState<MarketEvent | null>(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [dayFilter, setDayFilter] =
    useState<DayFilter>("All");

  const [subjectFilter, setSubjectFilter] =
    useState("All");

  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>("All");

  const [userCollege, setUserCollege] =
    useState("");

  /* =========================================
     LOAD USER DETAILS
  ========================================= */

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      const user =
        JSON.parse(storedUser);

      setUserCollege(
        user.college || ""
      );
    } catch (err) {
      console.error(
        "Failed to parse user:",
        err
      );
    }
  }, []);

  /* =========================================
     FETCH MARKETPLACE EVENTS
  ========================================= */

  useEffect(() => {
    const fetchSwappable =
      async () => {
        setLoading(true);
        setError(null);

        try {
          const token =
            localStorage.getItem(
              "token"
            );

          const response =
            await fetch(
              "http://localhost:5000/api/events/marketplace",
              {
                headers: token
                  ? {
                      Authorization:
                        `Bearer ${token}`,
                    }
                  : undefined,
              }
            );

          if (!response.ok) {
            throw new Error(
              `Error ${response.status}`
            );
          }

          const data =
            await response.json();

          const mapped: MarketEvent[] =
            data.map(
              (event: any) => ({
                id: event._id,

                title:
                  event.title ||
                  event.subject ||
                  "Untitled Event",

                start:
                  event.start,

                end:
                  event.end,

                status:
                  event.status ||
                  "Swappable",

                ownerId:
                  event.ownerId,

                ownerName:
                  event.ownerName,

                subject:
                  event.subject ||
                  event.title,

                day:
                  event.day,

                periodNumber:
                  event.periodNumber,

                className:
                  event.className ||
                  event.class,

                room:
                  event.room,
              })
            );

          setEvents(
            mapped
          );
        } catch (err: unknown) {
          console.error(
            "Marketplace fetch error:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load marketplace"
          );
        } finally {
          setLoading(false);
        }
      };

    fetchSwappable();
  }, []);

  /* =========================================
     FETCH USER'S SWAPPABLE EVENTS
  ========================================= */

  useEffect(() => {
    const fetchUserEvents =
      async () => {
        try {
          const token =
            localStorage.getItem(
              "token"
            );

          if (!token) {
            return;
          }

          const response =
            await fetch(
              "http://localhost:5000/api/events/mine",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          if (!response.ok) {
            throw new Error(
              "Failed to fetch user events"
            );
          }

          const data =
            await response.json();

          const swappable =
            data
              .filter(
                (event: any) =>
                  event.status ===
                  "Swappable"
              )
              .map(
                (event: any) => ({
                  id:
                    event._id,

                  title:
                    event.title,

                  start:
                    new Date(
                      event.start
                    )
                      .toLocaleString()
                      .replace(
                        ",",
                        ""
                      ),

                  end:
                    new Date(
                      event.end
                    )
                      .toLocaleString()
                      .replace(
                        ",",
                        ""
                      ),
                })
              );

          setUserEvents(
            swappable
          );
        } catch (err) {
          console.error(
            "Error fetching user events:",
            err
          );
        }
      };

    fetchUserEvents();
  }, []);

  /* =========================================
     HELPERS
  ========================================= */

  const formatDate = (
    iso?: string
  ) => {
    if (!iso) {
      return "";
    }

    try {
      return new Date(
        iso
      )
        .toLocaleString()
        .replace(
          ",",
          ""
        );
    } catch {
      return iso;
    }
  };

  const getDayFromDate = (
    iso?: string
  ): DayFilter => {
    if (!iso) {
      return "All";
    }

    try {
      return new Date(
        iso
      ).toLocaleDateString(
        "en-US",
        {
          weekday:
            "long",
        }
      ) as DayFilter;
    } catch {
      return "All";
    }
  };

  const getEventDay = (
    event: MarketEvent
  ) => {
    if (event.day) {
      return event.day;
    }

    return getDayFromDate(
      event.start
    );
  };

  const getEventSubject = (
    event: MarketEvent
  ) => {
    return (
      event.subject ||
      event.title ||
      "Unknown"
    );
  };

  /* =========================================
     SUBJECT OPTIONS
  ========================================= */

  const subjects =
    useMemo(() => {
      const values =
        events.map(
          (event) =>
            getEventSubject(
              event
            )
        );

      return Array.from(
        new Set(
          values.filter(
            Boolean
          )
        )
      ).sort();
    }, [events]);

  /* =========================================
     FILTER EVENTS
  ========================================= */

  const filteredEvents =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return events.filter(
        (event) => {
          const title =
            event.title
              .toLowerCase();

          const subject =
            getEventSubject(
              event
            ).toLowerCase();

          const owner =
            (
              event.ownerName ||
              ""
            ).toLowerCase();

          const matchesSearch =
            !search ||
            title.includes(
              search
            ) ||
            subject.includes(
              search
            ) ||
            owner.includes(
              search
            );

          const matchesDay =
            dayFilter ===
              "All" ||
            getEventDay(
              event
            ) === dayFilter;

          const matchesSubject =
            subjectFilter ===
              "All" ||
            getEventSubject(
              event
            ) ===
              subjectFilter;

          const normalizedStatus =
            event.status.toLowerCase();

          let matchesCategory =
            true;

          if (
            categoryFilter ===
            "Emergency"
          ) {
            matchesCategory =
              normalizedStatus ===
                "emergency" ||
              normalizedStatus ===
                "urgent";
          }

          if (
            categoryFilter ===
            "Swappable"
          ) {
            matchesCategory =
              normalizedStatus ===
              "swappable";
          }

          if (
            categoryFilter ===
            "Free"
          ) {
            matchesCategory =
              normalizedStatus ===
                "free" ||
              normalizedStatus ===
                "free slot";
          }

          return (
            matchesSearch &&
            matchesDay &&
            matchesSubject &&
            matchesCategory
          );
        }
      );
    }, [
      events,
      searchTerm,
      dayFilter,
      subjectFilter,
      categoryFilter,
    ]);

  /* =========================================
     EVENT GROUPS
  ========================================= */

  const emergencyEvents =
    filteredEvents.filter(
      (event) =>
        event.status.toLowerCase() ===
        "emergency"
    );

  const swappableEvents =
    filteredEvents.filter(
      (event) =>
        event.status.toLowerCase() ===
        "swappable"
    );

  const freeEvents =
    filteredEvents.filter(
      (event) =>
        event.status.toLowerCase() ===
          "free" ||
        event.status.toLowerCase() ===
          "free slot"
    );

  const otherEvents =
    filteredEvents.filter(
      (event) => {
        const status =
          event.status.toLowerCase();

        return (
          status !==
            "emergency" &&
          status !==
            "swappable" &&
          status !==
            "free" &&
          status !==
            "free slot"
        );
      }
    );

  /* =========================================
     CLEAR FILTERS
  ========================================= */

  const clearFilters =
    () => {
      setSearchTerm("");
      setDayFilter("All");
      setSubjectFilter("All");
      setCategoryFilter("All");
    };

  /* =========================================
     SWAP MODAL
  ========================================= */

  const handleRequestSwap = (
    event: MarketEvent
  ) => {
    setTargetEvent(
      event
    );

    setShowSwapModal(
      true
    );
  };

  const handleConfirmSwap =
    async (
      offerEventId: string
    ) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        if (
          !token ||
          !targetEvent?.id
        ) {
          alert(
            "Missing event details or authentication."
          );

          return;
        }

        const response =
          await fetch(
            "http://localhost:5000/api/requests",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                targetEventId:
                  targetEvent.id,

                offerEventId:
                  offerEventId,
              }),
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to send swap request"
          );
        }

        const data =
          await response.json();

        console.log(
          "Swap request created:",
          data
        );

        setShowSwapModal(
          false
        );

        alert(
          "Swap request successfully sent!"
        );
      } catch (err) {
        console.error(
          "Error sending swap request:",
          err
        );

        alert(
          "Error sending swap request. Please try again."
        );
      }
    };

  /* =========================================
     EVENT CARD
  ========================================= */

  const renderEventCard = (
    event: MarketEvent
  ) => {
    const status =
      event.status;

    const isEmergency =
      status.toLowerCase() ===
      "emergency";

    const isFree =
      status.toLowerCase() ===
        "free" ||
      status.toLowerCase() ===
        "free slot";

    return (
      <div
        key={event.id}
        className={
          isEmergency
            ? "marketplace-event-card emergency"
            : isFree
            ? "marketplace-event-card free"
            : "marketplace-event-card"
        }
      >
        <div className="marketplace-event-status">
          {isEmergency && (
            <span className="marketplace-status emergency">
              🚨 Emergency
            </span>
          )}

          {!isEmergency &&
            !isFree && (
              <span className="marketplace-status swappable">
                🔄 Swappable
              </span>
            )}

          {isFree && (
            <span className="marketplace-status free">
              🟢 Free Slot
            </span>
          )}
        </div>

        <h3>
          {getEventSubject(
            event
          )}
        </h3>

        {event.ownerName && (
          <p className="marketplace-detail">
            <User
              size={17}
            />

            <span>
              {event.ownerName}
            </span>
          </p>
        )}

        <p className="marketplace-detail">
          <CalendarDays
            size={17}
          />

          <span>
            {getEventDay(
              event
            )}

            {event.periodNumber
              ? ` - Period ${event.periodNumber}`
              : ""}
          </span>
        </p>

        <p className="marketplace-detail">
          <Clock
            size={17}
          />

          <span>
            {formatDate(
              event.start
            )}
            {" - "}
            {formatDate(
              event.end
            )}
          </span>
        </p>

        {event.className && (
          <p className="marketplace-detail">
            <Users
              size={17}
            />

            <span>
              {event.className}
            </span>
          </p>
        )}

        {event.room && (
          <p className="marketplace-detail">
            <MapPin
              size={17}
            />

            <span>
              {event.room}
            </span>
          </p>
        )}

        {!isFree && (
          <button
            type="button"
            className="event-toggle-btn"
            onClick={() =>
              handleRequestSwap(
                event
              )
            }
          >
            Request Swap
          </button>
        )}
      </div>
    );
  };

  /* =========================================
     SECTION
  ========================================= */

  const renderSection = (
    title: string,
    count: number,
    eventsToRender: MarketEvent[],
    type:
      | "emergency"
      | "swappable"
      | "free"
      | "other"
  ) => {
    if (
      eventsToRender.length ===
      0
    ) {
      return null;
    }

    return (
      <section
        className={`marketplace-section ${type}`}
      >
        <div className="marketplace-section-heading">
          <div className="marketplace-section-title">
            {type ===
              "emergency" && (
              <AlertCircle
                size={21}
              />
            )}

            {type ===
              "swappable" && (
              <span>
                🔄
              </span>
            )}

            {type ===
              "free" && (
              <span>
                🟢
              </span>
            )}

            <h2>
              {title}
            </h2>

            <span className="marketplace-count">
              {count}
            </span>
          </div>
        </div>

        <div className="marketplace-event-grid">
          {eventsToRender.map(
            renderEventCard
          )}
        </div>
      </section>
    );
  };

  return (
    <FacultyLayout
      currentPage="marketplace"
      onLogout={() => {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        window.location.href =
          "/";
      }}
    >
      <div className="faculty-marketplace-page">
        {/* =================================
            HEADER
        ================================= */}

        <div className="faculty-page-heading">
          <h1>
            Marketplace
          </h1>

          <p>
            Browse available swap opportunities and free slots
            {userCollege
              ? ` at ${userCollege}`
              : ""}
          </p>
        </div>

        {/* =================================
            COLLEGE INFORMATION
        ================================= */}

        <div className="marketplace-info-banner">
          <div className="marketplace-info-icon">
            ℹ️
          </div>

          <div>
            <h3>
              College-Specific Marketplace
            </h3>

            <p>
              You can only see and
              request swaps from
              faculty at{" "}
              <strong>
                {userCollege ||
                  "your college"}
              </strong>
              . Events from other
              colleges are not
              visible.
            </p>
          </div>
        </div>

        {/* =================================
            FILTER PANEL
        ================================= */}

        <div className="marketplace-filter-panel">
          <div className="marketplace-filter-row">
            {/* SEARCH */}

            <div className="marketplace-search">
              <Search
                size={21}
              />

              <input
                type="text"
                placeholder="Search by subject or faculty name..."
                value={
                  searchTerm
                }
                onChange={(
                  event
                ) =>
                  setSearchTerm(
                    event.target
                      .value
                  )
                }
              />
            </div>

            {/* DAY */}

            <div className="marketplace-select">
              <select
                value={
                  dayFilter
                }
                onChange={(
                  event
                ) =>
                  setDayFilter(
                    event.target
                      .value as DayFilter
                  )
                }
              >
                <option value="All">
                  All Days
                </option>

                <option value="Monday">
                  Monday
                </option>

                <option value="Tuesday">
                  Tuesday
                </option>

                <option value="Wednesday">
                  Wednesday
                </option>

                <option value="Thursday">
                  Thursday
                </option>

                <option value="Friday">
                  Friday
                </option>

                <option value="Saturday">
                  Saturday
                </option>
              </select>
            </div>

            {/* SUBJECT */}

            <div className="marketplace-select">
              <select
                value={
                  subjectFilter
                }
                onChange={(
                  event
                ) =>
                  setSubjectFilter(
                    event.target
                      .value
                  )
                }
              >
                <option value="All">
                  All Subjects
                </option>

                {subjects.map(
                  (
                    subject
                  ) => (
                    <option
                      key={
                        subject
                      }
                      value={
                        subject
                      }
                    >
                      {subject}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* CATEGORY FILTERS */}

          <div className="marketplace-category-row">
            <SlidersHorizontal
              size={24}
            />

            <button
              type="button"
              className={
                categoryFilter ===
                "All"
                  ? "marketplace-category active"
                  : "marketplace-category"
              }
              onClick={() =>
                setCategoryFilter(
                  "All"
                )
              }
            >
              All
            </button>

            <button
              type="button"
              className={
                categoryFilter ===
                "Emergency"
                  ? "marketplace-category active emergency"
                  : "marketplace-category emergency"
              }
              onClick={() =>
                setCategoryFilter(
                  "Emergency"
                )
              }
            >
              🚨 Emergency
            </button>

            <button
              type="button"
              className={
                categoryFilter ===
                "Swappable"
                  ? "marketplace-category active"
                  : "marketplace-category"
              }
              onClick={() =>
                setCategoryFilter(
                  "Swappable"
                )
              }
            >
              🔄 Swappable
            </button>

            <button
              type="button"
              className={
                categoryFilter ===
                "Free"
                  ? "marketplace-category active"
                  : "marketplace-category"
              }
              onClick={() =>
                setCategoryFilter(
                  "Free"
                )
              }
            >
              🟢 Free Slots
            </button>

            {(searchTerm ||
              dayFilter !==
                "All" ||
              subjectFilter !==
                "All" ||
              categoryFilter !==
                "All") && (
              <button
                type="button"
                className="marketplace-clear-btn"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* =================================
            LOADING / ERROR
        ================================= */}

        {loading && (
          <div className="faculty-loading">
            Loading marketplace...
          </div>
        )}

        {error && (
          <div className="faculty-error">
            {error}
          </div>
        )}

        {/* =================================
            RESULTS
        ================================= */}

        {!loading &&
          !error && (
            <>
              {filteredEvents.length ===
              0 ? (
                <div className="marketplace-empty">
                  <Search
                    size={42}
                  />

                  <h2>
                    No matching events
                  </h2>

                  <p>
                    Try changing your
                    filters or search
                    term.
                  </p>
                </div>
              ) : (
                <>
                  {renderSection(
                    "Emergency Swaps",
                    emergencyEvents.length,
                    emergencyEvents,
                    "emergency"
                  )}

                  {renderSection(
                    "Swappable Slots",
                    swappableEvents.length,
                    swappableEvents,
                    "swappable"
                  )}

                  {renderSection(
                    "Free Slots",
                    freeEvents.length,
                    freeEvents,
                    "free"
                  )}

                  {renderSection(
                    "Other Opportunities",
                    otherEvents.length,
                    otherEvents,
                    "other"
                  )}
                </>
              )}
            </>
          )}
      </div>

      {/* =================================
          SWAP MODAL
      ================================= */}

      {showSwapModal && (
        <SwapModal
          isOpen={
            showSwapModal
          }
          onClose={() =>
            setShowSwapModal(
              false
            )
          }
          targetEvent={
            targetEvent
              ? {
                  id:
                    targetEvent.id,

                  title:
                    targetEvent.title,

                  ownerName:
                    targetEvent.ownerName ||
                    "Unknown",

                  start:
                    formatDate(
                      targetEvent.start
                    ),

                  end:
                    formatDate(
                      targetEvent.end
                    ),
                }
              : null
          }
          userEvents={
            userEvents
          }
          onConfirm={
            handleConfirmSwap
          }
        />
      )}
    </FacultyLayout>
  );
};

export default Marketplace;