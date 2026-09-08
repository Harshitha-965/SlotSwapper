export type AcademicDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type SlotStatus =
  | "Busy"
  | "Swappable"
  | "Emergency";

export interface Period {
  id: string;
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  class: string;
  room: string;
  isFree: boolean;
  status: SlotStatus;
}

export interface DaySchedule {
  day: AcademicDay;
  rotationDay?: AcademicDay | null;
  periods: Period[];
}

export interface TimetableResponse {
  schedule: DaySchedule[];
  mondayOrder: AcademicDay | null;
  weekStart: string;
  configured: boolean;
}

const API_URL =
  "http://localhost:5000";

const getHeaders = () => {
  const token =
    localStorage.getItem(
      "token"
    );

  return {
    "Content-Type":
      "application/json",

    Authorization:
      `Bearer ${token}`,
  };
};

/*
 * GET FACULTY TIMETABLE
 */
export const getMyTimetable =
  async (): Promise<TimetableResponse> => {
    const response =
      await fetch(
        `${API_URL}/api/timetable/mine`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to fetch timetable"
      );
    }

    return data;
  };

/*
 * SAVE / UPDATE PERMANENT
 * FACULTY TIMETABLE
 */
export const saveTimetable =
  async (
    schedule: unknown[]
  ) => {
    const response =
      await fetch(
        `${API_URL}/api/timetable/mine`,
        {
          method: "PUT",

          headers:
            getHeaders(),

          body: JSON.stringify({
            schedule,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to save timetable"
      );
    }

    return data;
  };

/*
 * UPDATE CURRENT WEEK
 * SLOT STATUS
 */
export const updateSlotStatus =
  async (
    day: AcademicDay,
    periodNumber: number,
    status: SlotStatus
  ): Promise<TimetableResponse> => {
    const response =
      await fetch(
        `${API_URL}/api/timetable/status`,
        {
          method: "PATCH",

          headers:
            getHeaders(),

          body: JSON.stringify({
            day,
            periodNumber,
            status,
          }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to update slot status"
      );
    }

    return data;
  };