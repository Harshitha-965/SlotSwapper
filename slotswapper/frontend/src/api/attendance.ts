export interface AttendanceRecord {
  id: string;
  date: string;
  day: string;
  periodNumber: number;
  subject: string;
  className: string;
  room?: string;
  completionTimestamp?: string;
  status:
    | "Present"
    | "Absent"
    | "Free";
}

export interface AttendanceResponse {
  message: string;

  attendance?: AttendanceRecord;
}

const API_URL =
  "http://localhost:5000";

/*
 * GET TODAY'S ATTENDANCE
 */
export const getTodayAttendance =
  async (): Promise<
    AttendanceResponse[]
  > => {
    const token =
      localStorage.getItem(
        "token"
      );

    const response =
      await fetch(
        `${API_URL}/api/attendance/today`,
        {
          method: "GET",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to fetch today's attendance"
      );
    }

    /*
     * Backend returns an array
     * of attendance documents.
     *
     * Convert each record into
     * the structure expected by
     * Dashboard.tsx.
     */
    if (
      !Array.isArray(data)
    ) {
      return [];
    }

    return data.map(
      (
        record: AttendanceRecord
      ) => ({
        message:
          "Attendance already marked",

        attendance: {
          id:
            record.id,

          date:
            record.date,

          day:
            record.day,

          periodNumber:
            record.periodNumber,

          subject:
            record.subject,

          className:
            record.className,

          room:
            record.room,

          completionTimestamp:
            record.completionTimestamp,

          status:
            record.status,
        },
      })
    );
  };

/*
 * MARK CLASS COMPLETED
 */
export const markAttendanceCompleted =
  async (
    periodNumber: number
  ): Promise<AttendanceResponse> => {
    const token =
      localStorage.getItem(
        "token"
      );

    const response =
      await fetch(
        `${API_URL}/api/attendance/mark-completed`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            periodNumber,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to mark attendance"
      );
    }

    return data;
  };