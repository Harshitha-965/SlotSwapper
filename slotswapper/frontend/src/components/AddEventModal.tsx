import React, { useState } from "react";

interface AddEventModalProps {
  onClose: () => void;
  onSave: (event: { title: string; start: string; end: string; status: string }) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [status, setStatus] = useState("Busy");

  const handleSave = () => {
    if (!title || !start || !end) return;
    onSave({ title, start, end, status });
  };

  return (
    <div className="add-event-overlay">
      <div className="add-event-card">
        <h2>Add New Event</h2>

        <div className="mb-3">
          <label>Event Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter event name"
          />
        </div>

        <div className="mb-3">
          <label>Start Time</label>
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label>End Time</label>
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Busy">Busy</option>
            <option value="Swappable">Swappable</option>
          </select>
        </div>

        <div className="add-event-actions">
          <button onClick={onClose} className="add-event-btn-cancel">
            Cancel
          </button>
          <button onClick={handleSave} className="add-event-btn-save">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
