import {
  Router,
  Request,
  Response,
  NextFunction,
} from "express";
import jwt from "jsonwebtoken";

import Timetable from "../models/Timetable";
import WeeklySlotState, {
  SlotStatus,
} from "../models/WeeklySlotState";
import MondayRotation from "../models/MondayRotation";

import {
  JwtPayload,
} from "../types/JwtPayload";

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
      decoded.role !==
      "Faculty"
    ) {
      return res.status(403).json({
        message:
          "Faculty access required",
      });
    }

    (req as any).userId =
      decoded.id;

    (req as any).userName =
      decoded.name;

    (req as any).userCollege =
      (decoded as any).college;

    next();
  } catch {
    return res.status(403).json({
      message:
        "Invalid or expired token",
    });
  }
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
 * GET ADMIN MONDAY ORDER
 */
const getMondayRotation =
  async (
    weekStart: Date
  ): Promise<
    AcademicDay | null
  > => {
    const rotation =
      await MondayRotation.findOne(
        {
          weekStart,
        }
      ).lean();

    if (
      !rotation
    ) {
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
  };

/*
 * GET CURRENT WEEK SLOT STATUS
 */
const getSlotStatus =
  async (
    facultyId: string,
    day: AcademicDay,
    periodNumber: number
  ): Promise<SlotStatus> => {
    const weekStart =
      getWeekStart();

    const weeklyState =
      await WeeklySlotState.findOne(
        {
          facultyId,
          weekStart,
        }
      ).lean();

    const slot =
      weeklyState?.slots.find(
        (item) =>
          item.day === day &&
          item.periodNumber ===
            periodNumber
      );

    return (
      slot?.status ||
      "Busy"
    );
  };

/*
 * BUILD FACULTY WEEKLY VIEW
 */
const buildSchedule =
  async (
    facultyId: string
  ) => {
    const timetable =
      await Timetable.findOne(
        {
          facultyId,
        }
      ).lean();

    if (!timetable) {
      return {
        schedule: [],
        mondayOrder: null,
        weekStart:
          getWeekStart(),
        configured: false,
      };
    }

    const weekStart =
      getWeekStart();

    const mondayOrder =
      await getMondayRotation(
        weekStart
      );

    const weeklyState =
      await WeeklySlotState.findOne(
        {
          facultyId,
          weekStart,
        }
      ).lean();

    const getStatus = (
      day: AcademicDay,
      periodNumber: number
    ): SlotStatus => {
      const slot =
        weeklyState?.slots.find(
          (item) =>
            item.day === day &&
            item.periodNumber ===
              periodNumber
        );

      return (
        slot?.status ||
        "Busy"
      );
    };

    /*
     * Create a normal day.
     */
    const createDay =
      (
        actualDay: AcademicDay,
        sourceDay: AcademicDay
      ) => {
        const source =
          timetable.schedule.find(
            (item) =>
              item.day ===
              sourceDay
          );

        if (!source) {
          return {
            day: actualDay,
            rotationDay:
              actualDay ===
              "Monday"
                ? mondayOrder
                : null,
            periods: [],
          };
        }

        return {
          day: actualDay,

          rotationDay:
            actualDay ===
            "Monday"
              ? mondayOrder
              : null,

          periods:
            source.periods.map(
              (period) => {
                const isFree =
                  !period.subject?.trim() ||
                  !period.className?.trim();

                return {
                  id: `${actualDay}-${period.periodNumber}`,

                  period:
                    period.periodNumber,

                  startTime:
                    period.startTime,

                  endTime:
                    period.endTime,

                  subject:
                    isFree
                      ? ""
                      : period.subject,

                  class:
                    isFree
                      ? ""
                      : period.className,

                  room:
                    isFree
                      ? ""
                      : period.room ||
                        "",

                  isFree,

                  status: isFree
                    ? "Busy"
                    : getStatus(
                        actualDay,
                        period.periodNumber
                      ),
                };
              }
            ),
        };
      };

    /*
     * Monday uses the
     * administrator's
     * selected academic day.
     */
    const schedule =
      academicDays.map(
        (day) => {
          if (
            day ===
              "Monday" &&
            mondayOrder
          ) {
            return createDay(
              "Monday",
              mondayOrder
            );
          }

          return createDay(
            day,
            day
          );
        }
      );

    return {
      schedule,
      mondayOrder,
      weekStart,
      configured: true,
    };
  };

/*
 * GET FACULTY TIMETABLE
 */
router.get(
  "/mine",
  verifyFaculty,
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const result =
        await buildSchedule(
          (req as any).userId
        );

      res.json(result);
    } catch (err) {
      console.error(
        "Error fetching timetable:",
        err
      );

      res.status(500).json({
        message:
          "Error fetching timetable",
      });
    }
  }
);

/*
 * SAVE / UPDATE PERMANENT
 * FACULTY TIMETABLE
 */
router.put(
  "/mine",
  verifyFaculty,
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        schedule,
      } = req.body;

      if (
        !Array.isArray(
          schedule
        )
      ) {
        return res.status(400).json({
          message:
            "schedule must be an array",
        });
      }

      if (
        schedule.length !== 6
      ) {
        return res.status(400).json({
          message:
            "Timetable must contain Monday to Saturday",
        });
      }

      for (
        const day of schedule
      ) {
        if (
          !academicDays.includes(
            day.day as AcademicDay
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid academic day",
          });
        }

        if (
          !Array.isArray(
            day.periods
          )
        ) {
          return res.status(400).json({
            message:
              "Periods must be an array",
          });
        }

        if (
          day.periods.length !==
          7
        ) {
          return res.status(400).json({
            message:
              `Day ${day.day} must contain exactly 7 periods`,
          });
        }

        for (
          const period of day.periods
        ) {
          if (
            period.periodNumber <
              1 ||
            period.periodNumber >
              7
          ) {
            return res.status(400).json({
              message:
                "Period number must be between 1 and 7",
            });
          }

          if (
            !period.startTime ||
            !period.endTime
          ) {
            return res.status(400).json({
              message:
                "Each period requires start and end time",
            });
          }

          if (
            typeof period.subject !==
            "string"
          ) {
            return res.status(400).json({
              message:
                "Subject must be a string",
            });
          }

          if (
            typeof period.className !==
            "string"
          ) {
            return res.status(400).json({
              message:
                "Class name must be a string",
            });
          }
        }
      }

      const college =
        (req as any)
          .userCollege;

      if (!college) {
        return res.status(400).json({
          message:
            "Faculty college information is missing",
        });
      }

      const timetable =
        await Timetable.findOneAndUpdate(
          {
            facultyId:
              (req as any).userId,
          },
          {
            facultyId:
              (req as any).userId,

            college,

            schedule,
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
          }
        );

      res.json({
        message:
          "Timetable saved successfully",

        timetable,
      });
    } catch (err) {
      console.error(
        "Error saving timetable:",
        err
      );

      res.status(500).json({
        message:
          "Error saving timetable",
      });
    }
  }
);

/*
 * UPDATE CURRENT WEEK
 * SLOT STATUS
 */
router.patch(
  "/status",
  verifyFaculty,
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        day,
        periodNumber,
        status,
      } = req.body;

      const validStatuses: SlotStatus[] =
        [
          "Busy",
          "Swappable",
          "Emergency",
        ];

      if (
        !day ||
        !periodNumber ||
        !validStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "day, periodNumber and valid status are required",
        });
      }

      if (
        !academicDays.includes(
          day as AcademicDay
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid academic day",
        });
      }

      const numericPeriod =
        Number(
          periodNumber
        );

      if (
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

      /*
       * Monday's visible schedule
       * comes from the admin rotation.
       */
      let sourceDay =
        day as AcademicDay;

      if (
        day === "Monday"
      ) {
        const mondayOrder =
          await getMondayRotation(
            getWeekStart()
          );

        if (!mondayOrder) {
          return res.status(400).json({
            message:
              "Monday order is not configured for this week",
          });
        }

        sourceDay =
          mondayOrder;
      }

      /*
       * Verify that this is
       * actually a teaching period.
       */
      const timetable =
        await Timetable.findOne(
          {
            facultyId,
          }
        ).lean();

      if (!timetable) {
        return res.status(404).json({
          message:
            "Timetable not configured",
        });
      }

      const sourceSchedule =
        timetable.schedule.find(
          (item) =>
            item.day ===
            sourceDay
        );

      if (!sourceSchedule) {
        return res.status(404).json({
          message:
            "Day schedule not found",
        });
      }

      const period =
        sourceSchedule.periods.find(
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

      const isFree =
        !period.subject?.trim() ||
        !period.className?.trim();

      if (isFree) {
        return res.status(400).json({
          message:
            "Free periods cannot be modified",
        });
      }

      /*
       * Emergency is allowed
       * only after selecting
       * Swappable.
       */
      if (
        status ===
        "Emergency"
      ) {
        const weekStart =
          getWeekStart();

        const weeklyState =
          await WeeklySlotState.findOne(
            {
              facultyId,
              weekStart,
            }
          ).lean();

        const currentSlot =
          weeklyState?.slots.find(
            (slot) =>
              slot.day === day &&
              slot.periodNumber ===
                numericPeriod
          );

        if (
          currentSlot?.status !==
          "Swappable"
        ) {
          return res.status(400).json({
            message:
              "A slot must be Swappable before it can be marked Emergency",
          });
        }
      }

      const weekStart =
        getWeekStart();

      let weeklyState =
        await WeeklySlotState.findOne(
          {
            facultyId,
            weekStart,
          }
        );

      if (!weeklyState) {
        weeklyState =
          new WeeklySlotState({
            facultyId,

            weekStart,

            slots: [
              {
                day,
                periodNumber:
                  numericPeriod,
                status,
              },
            ],
          });
      } else {
        const existing =
          weeklyState.slots.find(
            (slot) =>
              slot.day === day &&
              slot.periodNumber ===
                numericPeriod
          );

        if (existing) {
          existing.status =
            status;
        } else {
          weeklyState.slots.push({
            day,
            periodNumber:
              numericPeriod,
            status,
          });
        }
      }

      await weeklyState.save();

      const result =
        await buildSchedule(
          facultyId
        );

      res.json({
        message:
          "Slot status updated successfully",

        ...result,
      });
    } catch (err) {
      console.error(
        "Error updating slot status:",
        err
      );

      res.status(500).json({
        message:
          "Error updating slot status",
      });
    }
  }
);

export default router;