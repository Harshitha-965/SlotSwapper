import {
  Router,
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";

import Attendance from "../models/Attendance";
import Timetable from "../models/Timetable";
import MondayRotation from "../models/MondayRotation";

import { JwtPayload } from "../types/JwtPayload";

const router = Router();

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your_secret_key_here";

const academicDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

type AcademicDay =
  (typeof academicDays)[number];

/*
 * VERIFY FACULTY
 */
const verifyFaculty = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader =
    req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message:
        "Authorization header missing",
    });
  }

  const token =
    authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token missing",
    });
  }

  try {
    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      ) as JwtPayload;

    if (
      decoded.role !== "Faculty"
    ) {
      return res.status(403).json({
        message:
          "Faculty access required",
      });
    }

    (req as any).userId =
      decoded.id;

    next();
  } catch {
    return res.status(403).json({
      message:
        "Invalid or expired token",
    });
  }
};

/*
 * GET DATE WITHOUT TIME
 */
const getDateOnly = (
  date: Date
): Date => {
  const result =
    new Date(date);

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
};

/*
 * GET MONDAY OF CURRENT WEEK
 */
const getWeekStart = (
  date: Date = new Date()
): Date => {
  const result =
    new Date(date);

  result.setHours(
    0,
    0,
    0,
    0
  );

  const day =
    result.getDay();

  const difference =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate() +
      difference
  );

  return result;
};

/*
 * GET TODAY'S ACADEMIC DAY
 */
const getTodayAcademicDay =
  async (
    date: Date
  ): Promise<AcademicDay | null> => {
    const day =
      date.getDay();

    /*
     * Sunday is not an
     * academic day.
     */
    if (day === 0) {
      return null;
    }

    /*
     * JavaScript:
     * Sunday = 0
     * Monday = 1
     * ...
     * Saturday = 6
     */
    const normalDay =
      academicDays[
        day - 1
      ];

    /*
     * Monday follows the
     * administrator's
     * weekly academic order.
     */
    if (
      normalDay ===
      "Monday"
    ) {
      const weekStart =
        getWeekStart(date);

      const rotation =
        await MondayRotation.findOne(
          {
            weekStart,
          }
        ).lean();

      if (!rotation) {
        return null;
      }

      if (
        !academicDays.includes(
          rotation.mondayOrder as AcademicDay
        )
      ) {
        return null;
      }

      return rotation.mondayOrder as AcademicDay;
    }

    return normalDay;
  };

/*
 * GET TODAY'S ATTENDANCE
 */
router.get(
  "/today",
  verifyFaculty,
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const today =
        getDateOnly(
          new Date()
        );

      const tomorrow =
        new Date(today);

      tomorrow.setDate(
        tomorrow.getDate() +
          1
      );

      const records =
        await Attendance.find({
          facultyId:
            (req as any).userId,

          date: {
            $gte: today,
            $lt: tomorrow,
          },

          status: "Present",
        })
          .sort({
            periodNumber: 1,
          })
          .lean();

      res.json(
        records
      );
    } catch (err) {
      console.error(
        "Error fetching today's attendance:",
        err
      );

      res.status(500).json({
        message:
          "Error fetching today's attendance",
      });
    }
  }
);

/*
 * MARK CLASS COMPLETED
 */
router.post(
  "/mark-completed",
  verifyFaculty,
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        periodNumber,
      } = req.body;

      /*
       * Frontend sends only
       * periodNumber.
       */
      if (
        periodNumber ===
          undefined ||
        periodNumber === null
      ) {
        return res.status(400).json({
          message:
            "periodNumber is required",
        });
      }

      const numericPeriod =
        Number(
          periodNumber
        );

      if (
        !Number.isInteger(
          numericPeriod
        ) ||
        numericPeriod < 1 ||
        numericPeriod > 7
      ) {
        return res.status(400).json({
          message:
            "Period number must be between 1 and 7",
        });
      }

      const facultyId =
        (req as any).userId;

      const now =
        new Date();

      /*
       * Determine today's
       * academic day.
       */
      const academicDay =
        await getTodayAcademicDay(
          now
        );

      if (!academicDay) {
        return res.status(400).json({
          message:
            "Attendance cannot be marked on Sunday or before Monday order is configured",
        });
      }

      /*
       * Get faculty timetable.
       */
      const timetable =
        await Timetable.findOne({
          facultyId,
        }).lean();

      if (!timetable) {
        return res.status(404).json({
          message:
            "Timetable not configured",
        });
      }

      /*
       * Monday may use a different
       * source timetable day.
       */
      const visibleDay =
        now.getDay() === 1
          ? "Monday"
          : academicDay;

      let sourceDay =
        academicDay;

      if (
        visibleDay ===
        "Monday"
      ) {
        const rotation =
          await MondayRotation.findOne(
            {
              weekStart:
                getWeekStart(
                  now
                ),
            }
          ).lean();

        if (!rotation) {
          return res.status(400).json({
            message:
              "Monday order is not configured for this week",
          });
        }

        sourceDay =
          rotation.mondayOrder as AcademicDay;
      }

      /*
       * Find source day's
       * timetable.
       */
      const daySchedule =
        timetable.schedule.find(
          (item) =>
            item.day ===
            sourceDay
        );

      if (!daySchedule) {
        return res.status(404).json({
          message:
            "Day schedule not found",
        });
      }

      /*
       * Find selected period.
       */
      const period =
        daySchedule.periods.find(
          (item) =>
            item.periodNumber ===
            numericPeriod
        );

      if (!period) {
        return res.status(404).json({
          message:
            "Period not found",
        });
      }

      /*
       * Determine whether
       * this is a Free period.
       */
      const isFree =
        !period.subject?.trim() ||
        !period.className?.trim();

      if (isFree) {
        return res.status(400).json({
          message:
            "Free periods cannot be marked completed",
        });
      }

      /*
       * Convert timetable end time
       * into today's Date object.
       */
      const [
        endHour,
        endMinute,
      ] =
        period.endTime
          .split(":")
          .map(Number);

      if (
        Number.isNaN(
          endHour
        ) ||
        Number.isNaN(
          endMinute
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid period end time",
        });
      }

      const classEnd =
        new Date(now);

      classEnd.setHours(
        endHour,
        endMinute,
        0,
        0
      );

      /*
       * Attendance is available
       * for 10 minutes after
       * class completion.
       */
      const allowedUntil =
        new Date(
          classEnd.getTime() +
            10 * 60 * 1000
        );

      /*
       * Too early.
       */
      if (
        now < classEnd
      ) {
        return res.status(400).json({
          message:
            "Attendance can only be marked after the class ends",
        });
      }

      /*
       * Too late.
       */
      if (
        now > allowedUntil
      ) {
        return res.status(400).json({
          message:
            "The 10-minute attendance window has expired",
        });
      }

      /*
       * Check whether attendance
       * was already marked.
       */
      const today =
        getDateOnly(
          now
        );

      const tomorrow =
        new Date(today);

      tomorrow.setDate(
        tomorrow.getDate() +
          1
      );

      const existing =
        await Attendance.findOne({
          facultyId,

          date: {
            $gte: today,
            $lt: tomorrow,
          },

          periodNumber:
            numericPeriod,

          status: "Present",
        });

      if (existing) {
        return res.status(400).json({
          message:
            "Attendance already marked for this period",
        });
      }

      /*
       * Save attendance.
       *
       * Store the actual visible
       * academic day.
       */
      const attendance =
        new Attendance({
          facultyId,

          date: today,

          day: visibleDay,

          periodNumber:
            numericPeriod,

          subject:
            period.subject,

          className:
            period.className,

          room:
            period.room ||
            "",

          completionTimestamp:
            now,

          status: "Present",
        });

      await attendance.save();

      res.status(201).json({
        message:
          "Attendance marked successfully",

        attendance,
      });
    } catch (err) {
      console.error(
        "Error marking attendance:",
        err
      );

      res.status(500).json({
        message:
          "Error marking attendance",
      });
    }
  }
);

export default router;