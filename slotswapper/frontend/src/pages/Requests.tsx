import React, {
  useEffect,
  useState,
} from "react";

import {
  Check,
  X,
  Trash2,
} from "lucide-react";

import FacultyLayout from "../components/FacultyLayout.tsx";

interface SwapRequest {
  _id: string;

  requesterName: string;

  responderName: string;

  offeredSlot: {
    title: string;
    start: string;
    end: string;
  };

  requestedSlot: {
    title: string;
    start: string;
    end: string;
  };

  status:
    | "pending"
    | "accepted"
    | "rejected";
}

interface RequestsProps {
  onLogout: () => void;
}

const Requests: React.FC<
  RequestsProps
> = ({
  onLogout,
}) => {
  const [
    activeTab,
    setActiveTab,
  ] = useState<
    "incoming" | "outgoing"
  >("incoming");

  const [
    incomingRequests,
    setIncomingRequests,
  ] = useState<
    SwapRequest[]
  >([]);

  const [
    outgoingRequests,
    setOutgoingRequests,
  ] = useState<
    SwapRequest[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const formatDate = (
    iso: string
  ) => {
    try {
      return new Date(
        iso
      )
        .toLocaleString()
        .replace(",", "");
    } catch {
      return iso;
    }
  };

  /* =====================================================
     FETCH REQUESTS
  ===================================================== */

  useEffect(() => {
    const fetchRequests =
      async () => {
        setLoading(true);
        setError(null);

        try {
          const token =
            localStorage.getItem(
              "token"
            );

          if (!token) {
            setError(
              "Unauthorized"
            );
            return;
          }

          const [
            incomingRes,
            outgoingRes,
          ] = await Promise.all([
            fetch(
              "http://localhost:5000/api/requests/incoming",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            ),

            fetch(
              "http://localhost:5000/api/requests/outgoing",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            ),
          ]);

          if (
            !incomingRes.ok ||
            !outgoingRes.ok
          ) {
            throw new Error(
              "Failed to fetch requests"
            );
          }

          const incomingData =
            await incomingRes.json();

          const outgoingData =
            await outgoingRes.json();

          setIncomingRequests(
            incomingData
          );

          setOutgoingRequests(
            outgoingData
          );
        } catch (
          err: unknown
        ) {
          console.error(
            "Error fetching swap requests:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Error fetching requests"
          );
        } finally {
          setLoading(false);
        }
      };

    fetchRequests();
  }, []);

  /* =====================================================
     ACCEPT REQUEST
  ===================================================== */

  const handleAccept =
    async (
      id: string
    ) => {
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
            `http://localhost:5000/api/requests/${id}/accept`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to accept request"
          );
        }

        setIncomingRequests(
          (previous) =>
            previous.map(
              (request) =>
                request._id === id
                  ? {
                      ...request,
                      status:
                        "accepted",
                    }
                  : request
            )
        );
      } catch (
        err: unknown
      ) {
        console.error(
          "Error accepting request:",
          err
        );
      }
    };

  /* =====================================================
     REJECT REQUEST
  ===================================================== */

  const handleReject =
    async (
      id: string
    ) => {
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
            `http://localhost:5000/api/requests/${id}/reject`,
            {
              method: "PATCH",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to reject request"
          );
        }

        setIncomingRequests(
          (previous) =>
            previous.map(
              (request) =>
                request._id === id
                  ? {
                      ...request,
                      status:
                        "rejected",
                    }
                  : request
            )
        );
      } catch (
        err: unknown
      ) {
        console.error(
          "Error rejecting request:",
          err
        );
      }
    };

  /* =====================================================
     DELETE REQUEST
  ===================================================== */

  const handleDelete =
    async (
      id: string
    ) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this request?"
        )
      ) {
        return;
      }

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
            `http://localhost:5000/api/requests/${id}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to delete request"
          );
        }

        setIncomingRequests(
          (previous) =>
            previous.filter(
              (request) =>
                request._id !== id
            )
        );

        setOutgoingRequests(
          (previous) =>
            previous.filter(
              (request) =>
                request._id !== id
            )
        );
      } catch (
        err: unknown
      ) {
        console.error(
          "Error deleting request:",
          err
        );
      }
    };

  /* =====================================================
     STATUS BADGE
  ===================================================== */

  const getStatusBadge = (
    status: SwapRequest["status"]
  ) => {
    switch (status) {
      case "pending":
        return (
          <span className="badge badge-pending">
            Pending
          </span>
        );

      case "accepted":
        return (
          <span className="badge badge-accepted">
            Accepted
          </span>
        );

      case "rejected":
        return (
          <span className="badge badge-rejected">
            Rejected
          </span>
        );
    }
  };

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <FacultyLayout
      currentPage="requests"
      onLogout={onLogout}
    >
      <div className="faculty-requests-page">

        {/* PAGE HEADER */}

        <div className="faculty-page-heading">
          <h1>
            Swap Requests
          </h1>

          <p>
            Manage your incoming and outgoing swap requests
          </p>
        </div>

        {/* TABS */}

        <div className="requests-tabs">
          <button
            type="button"
            className={
              activeTab ===
              "incoming"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "incoming"
              )
            }
          >
            Incoming Requests

            {incomingRequests.length >
              0 && (
              <span>
                {
                  incomingRequests.length
                }
              </span>
            )}
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "outgoing"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(
                "outgoing"
              )
            }
          >
            Outgoing Requests

            {outgoingRequests.length >
              0 && (
              <span>
                {
                  outgoingRequests.length
                }
              </span>
            )}
          </button>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="faculty-loading">
            Loading requests...
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="faculty-error">
            {error}
          </div>
        )}

        {/* =================================================
            INCOMING REQUESTS
        ================================================= */}

        {!loading &&
          !error &&
          activeTab ===
            "incoming" && (
            <section className="requests-section">

              <div className="requests-section-heading">
                <div>
                  <h2>
                    Incoming Requests
                  </h2>

                  <p>
                    Swap requests received from other faculty
                  </p>
                </div>

                <span className="requests-count">
                  {
                    incomingRequests.length
                  }
                </span>
              </div>

              {incomingRequests.length ===
              0 ? (
                <div className="requests-empty-card">
                  <div className="requests-empty-icon">
                    🔄
                  </div>

                  <h3>
                    No Incoming Requests
                  </h3>

                  <p>
                    You don't have any incoming swap requests right now.
                  </p>
                </div>
              ) : (
                <div className="requests-grid">

                  {incomingRequests.map(
                    (request) => (
                      <div
                        key={
                          request._id
                        }
                        className="request-card"
                      >

                        <div className="request-card-header">
                          <div>
                            <span className="request-label">
                              Request From
                            </span>

                            <h3>
                              {
                                request.requesterName
                              }
                            </h3>
                          </div>

                          {getStatusBadge(
                            request.status
                          )}
                        </div>

                        <div className="request-swap-details">

                          <div className="request-slot offered">
                            <span>
                              They Offer
                            </span>

                            <strong>
                              {
                                request
                                  .offeredSlot
                                  .title
                              }
                            </strong>

                            <small>
                              {
                                formatDate(
                                  request
                                    .offeredSlot
                                    .start
                                )}
                              </small>

                            <small>
                              →
                              {" "}
                              {
                                formatDate(
                                  request
                                    .offeredSlot
                                    .end
                                )}
                            </small>
                          </div>

                          <div className="request-swap-arrow">
                            ⇄
                          </div>

                          <div className="request-slot requested">
                            <span>
                              Your Slot
                            </span>

                            <strong>
                              {
                                request
                                  .requestedSlot
                                  .title
                              }
                            </strong>

                            <small>
                              {
                                formatDate(
                                  request
                                    .requestedSlot
                                    .start
                                )}
                              </small>

                            <small>
                              →
                              {" "}
                              {
                                formatDate(
                                  request
                                    .requestedSlot
                                    .end
                                )}
                            </small>
                          </div>

                        </div>

                        {request.status ===
                        "pending" ? (
                          <div className="request-actions">

                            <button
                              type="button"
                              className="request-reject-btn"
                              onClick={() =>
                                handleReject(
                                  request._id
                                )
                              }
                            >
                              <X
                                size={17}
                              />

                              Reject
                            </button>

                            <button
                              type="button"
                              className="request-accept-btn"
                              onClick={() =>
                                handleAccept(
                                  request._id
                                )
                              }
                            >
                              <Check
                                size={17}
                              />

                              Accept
                            </button>

                          </div>
                        ) : (
                          <button
                            type="button"
                            className="request-delete-btn"
                            onClick={() =>
                              handleDelete(
                                request._id
                              )
                            }
                          >
                            <Trash2
                              size={17}
                            />

                            Delete
                          </button>
                        )}

                      </div>
                    )
                  )}

                </div>
              )}

            </section>
          )}

        {/* =================================================
            OUTGOING REQUESTS
        ================================================= */}

        {!loading &&
          !error &&
          activeTab ===
            "outgoing" && (
            <section className="requests-section">

              <div className="requests-section-heading">
                <div>
                  <h2>
                    Outgoing Requests
                  </h2>

                  <p>
                    Swap requests you have sent to other faculty
                  </p>
                </div>

                <span className="requests-count">
                  {
                    outgoingRequests.length
                  }
                </span>
              </div>

              {outgoingRequests.length ===
              0 ? (
                <div className="requests-empty-card">
                  <div className="requests-empty-icon">
                    📤
                  </div>

                  <h3>
                    No Outgoing Requests
                  </h3>

                  <p>
                    You haven't sent any swap requests yet.
                  </p>
                </div>
              ) : (
                <div className="requests-grid">

                  {outgoingRequests.map(
                    (request) => (
                      <div
                        key={
                          request._id
                        }
                        className="request-card"
                      >

                        <div className="request-card-header">
                          <div>
                            <span className="request-label">
                              Request To
                            </span>

                            <h3>
                              {
                                request.responderName
                              }
                            </h3>
                          </div>

                          {getStatusBadge(
                            request.status
                          )}
                        </div>

                        <div className="request-swap-details">

                          <div className="request-slot offered">
                            <span>
                              You Offered
                            </span>

                            <strong>
                              {
                                request
                                  .offeredSlot
                                  .title
                              }
                            </strong>

                            <small>
                              {
                                formatDate(
                                  request
                                    .offeredSlot
                                    .start
                                )}
                            </small>

                            <small>
                              →
                              {" "}
                              {
                                formatDate(
                                  request
                                    .offeredSlot
                                    .end
                                )}
                            </small>
                          </div>

                          <div className="request-swap-arrow">
                            ⇄
                          </div>

                          <div className="request-slot requested">
                            <span>
                              Requested
                            </span>

                            <strong>
                              {
                                request
                                  .requestedSlot
                                  .title
                              }
                            </strong>

                            <small>
                              {
                                formatDate(
                                  request
                                    .requestedSlot
                                    .start
                                )}
                            </small>

                            <small>
                              →
                              {" "}
                              {
                                formatDate(
                                  request
                                    .requestedSlot
                                    .end
                                )}
                            </small>
                          </div>

                        </div>

                        <button
                          type="button"
                          className="request-delete-btn"
                          onClick={() =>
                            handleDelete(
                              request._id
                            )
                          }
                        >
                          <Trash2
                            size={17}
                          />

                          Delete
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

            </section>
          )}

      </div>
    </FacultyLayout>
  );
};

export default Requests;