import React, {
  useEffect,
  useState,
} from "react";
import { Download, Search } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar.tsx";
import { useNavigate } from "react-router-dom";

interface AttendanceRecord {
  _id: string;
  facultyId?: {
    _id: string;
    name: string;
    email: string;
    college: string;
  };
  date: string;
  day: string;
  periodNumber: number;
  subject: string;
  className: string;
  room?: string;
  completionTimestamp?: string;
  status: "Present" | "Absent" | "Free";
}

interface Faculty {
  _id: string;
  name: string;
  email: string;
  college: string;
}

const AdminAttendance: React.FC<{
  onLogout: () => void;
}> = ({ onLogout }) => {
  const navigate = useNavigate();

  const [records, setRecords] =
    useState<AttendanceRecord[]>([]);

  const [faculty, setFaculty] =
    useState<Faculty[]>([]);

  const [facultyId, setFacultyId] =
    useState("");

  const [college, setCollege] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [from, setFrom] =
    useState("");

  const [to, setTo] =
    useState("");

  const fetchFaculty = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const res = await fetch(
      "http://localhost:5000/api/admin/faculty",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      setFaculty(await res.json());
    }
  };

  const fetchAttendance = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    const params = new URLSearchParams();

    if (facultyId)
      params.append("facultyId", facultyId);

    if (college)
      params.append("college", college);

    if (status)
      params.append("status", status);

    if (from)
      params.append("from", from);

    if (to)
      params.append("to", to);

    const res = await fetch(
      `http://localhost:5000/api/admin/attendance?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      setRecords(await res.json());
    }
  };

  useEffect(() => {
    fetchFaculty();
    fetchAttendance();
  }, []);

  const handleFilter = () => {
    fetchAttendance();
  };

  const exportCSV = () => {
    const headers = [
      "Faculty",
      "College",
      "Date",
      "Day",
      "Period",
      "Subject",
      "Class",
      "Room",
      "Completion Time",
      "Status",
    ];

    const rows = records.map((record) => [
      record.facultyId?.name || "",
      record.facultyId?.college || "",
      new Date(record.date).toLocaleDateString(),
      record.day,
      record.periodNumber,
      record.subject,
      record.className,
      record.room || "",
      record.completionTimestamp
        ? new Date(
            record.completionTimestamp
          ).toLocaleString()
        : "",
      record.status,
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replaceAll(
              '"',
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "faculty-attendance.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="admin-container">
      <AdminSidebar
        currentPage="admin-attendance"
        onNavigate={(page) => {
          if (page === "admin-dashboard") {
            navigate("/admin-dashboard");
          }
          if (page === "admin-attendance")
            navigate("/admin-attendance");

          if (page === "admin-monday-order")
            navigate("/admin-monday-order");

          if (page === "admin-swaps")
            navigate("/admin-swaps");
        }}
        onLogout={onLogout}
      />

      <main className="admin-main">
        <div className="admin-page-header">
          <div>
            <h1>Faculty Attendance</h1>
            <p>
              Monitor attendance records across
              all faculty members.
            </p>
          </div>

          <div className="admin-export-buttons">
            <button
              onClick={exportCSV}
              className="admin-secondary-btn"
            >
              <Download size={18} />
              CSV
            </button>

            <button
              onClick={exportPDF}
              className="admin-primary-btn"
            >
              <Download size={18} />
              PDF
            </button>
          </div>
        </div>

        <section className="admin-card">
          <div className="admin-filter-title">
            <Search size={19} />
            <span>Filters</span>
          </div>

          <div className="admin-filters">
            <select
              value={facultyId}
              onChange={(e) =>
                setFacultyId(e.target.value)
              }
            >
              <option value="">
                All Faculty
              </option>

              {faculty.map((person) => (
                <option
                  key={person._id}
                  value={person._id}
                >
                  {person.name}
                </option>
              ))}
            </select>

            <select
              value={college}
              onChange={(e) =>
                setCollege(e.target.value)
              }
            >
              <option value="">
                All Colleges
              </option>

              <option value="RMK Engineering College">
                RMK Engineering College
              </option>

              <option value="RMD Engineering College">
                RMD Engineering College
              </option>

              <option value="RMKCET Engineering College">
                RMKCET Engineering College
              </option>
            </select>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
            >
              <option value="">
                All Status
              </option>

              <option value="Present">
                Present
              </option>

              <option value="Absent">
                Absent
              </option>

              <option value="Free">
                Free
              </option>
            </select>

            <input
              type="date"
              value={from}
              onChange={(e) =>
                setFrom(e.target.value)
              }
            />

            <input
              type="date"
              value={to}
              onChange={(e) =>
                setTo(e.target.value)
              }
            />

            <button
              onClick={handleFilter}
              className="admin-primary-btn"
            >
              Apply
            </button>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Period</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Room</th>
                  <th>Completed</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {records.length > 0 ? (
                  records.map((record) => (
                    <tr key={record._id}>
                      <td>
                        <strong>
                          {record.facultyId
                            ?.name || "Unknown"}
                        </strong>
                        <small>
                          {record.facultyId
                            ?.college || ""}
                        </small>
                      </td>

                      <td>
                        {new Date(
                          record.date
                        ).toLocaleDateString()}
                      </td>

                      <td>{record.day}</td>

                      <td>
                        {record.periodNumber}
                      </td>

                      <td>{record.subject}</td>

                      <td>
                        {record.className}
                      </td>

                      <td>
                        {record.room || "—"}
                      </td>

                      <td>
                        {record.completionTimestamp
                          ? new Date(
                              record.completionTimestamp
                            ).toLocaleString()
                          : "—"}
                      </td>

                      <td>
                        <span
                          className={`admin-status ${record.status.toLowerCase()}`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="admin-empty"
                    >
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminAttendance;