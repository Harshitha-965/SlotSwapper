import React, { useState } from "react";

interface MarketplaceEvent {
  id: string;
  title: string;
  ownerName: string;
  start: string;
  end: string;
}

interface UserEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEvent: MarketplaceEvent | null;
  userEvents: UserEvent[];
  onConfirm: (offerEventId: string) => void;
}

const SwapModal: React.FC<SwapModalProps> = ({
  isOpen,
  onClose,
  targetEvent,
  userEvents,
  onConfirm,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedEventId) {
      onConfirm(selectedEventId);
      setSelectedEventId("");
    }
  };

  return (
    <div className="swap-modal-overlay">
      <div className="swap-modal-card">
        <h2>Confirm Swap Request</h2>

        {/* Requested Event */}
        <div className="swap-section">
          <p className="label">Requesting Slot:</p>
          <h3>{targetEvent?.title}</h3>
          <p className="subtext">
            {targetEvent?.start} - {targetEvent?.end}
          </p>
          {targetEvent?.ownerName && (
            <p className="owner">Owner: {targetEvent.ownerName}</p>
          )}
        </div>

        {/* Offer Event */}
        <div className="swap-section">
          <p className="label">Offer Your Slot:</p>
          {userEvents.length === 0 ? (
            <p className="subtext">
              You don’t have any swappable events. Please make one swappable
              first.
            </p>
          ) : (
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="swap-select"
            >
              <option value="">Select your event</option>
              {userEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} ({event.start})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Buttons */}
        <div className="swap-modal-actions">
          <button onClick={onClose} className="swap-btn-cancel">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedEventId}
            className="swap-btn-confirm"
          >
            Confirm Swap
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapModal;
