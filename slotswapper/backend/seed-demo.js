require('ts-node/register/transpile-only');
require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('./models/User').default || require('./models/User');
const Timetable = require('./models/Timetable').default || require('./models/Timetable');
const WeeklySlotState = require('./models/WeeklySlotState').default || require('./models/WeeklySlotState');
const MondayRotation = require('./models/MondayRotation').default || require('./models/MondayRotation');
const Attendance = require('./models/Attendance').default || require('./models/Attendance');
const SwapRequest = require('./models/SwapRequest').default || require('./models/SwapRequest');
const Event = require('./models/Event').default || require('./models/Event');

const MONGO_URI = process.env.MONGO_URI;

const demoPassword = 'DemoPass@123';
const academicDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const seedUsers = async () => {
  const admin = await User.findOneAndUpdate(
    { email: 'admin@slotswapper.com' },
    {
      name: 'Dr. Arun Kumar',
      email: 'admin@slotswapper.com',
      password: await bcrypt.hash(demoPassword, 10),
      college: 'RMK Engineering College',
      role: 'Admin',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const faculty1 = await User.findOneAndUpdate(
    { email: 'teacher1@slotswapper.com' },
    {
      name: 'Dr. Priya Sharma',
      email: 'teacher1@slotswapper.com',
      password: await bcrypt.hash(demoPassword, 10),
      college: 'RMK Engineering College',
      role: 'Faculty',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const faculty2 = await User.findOneAndUpdate(
    { email: 'teacher2@slotswapper.com' },
    {
      name: 'Dr. Rahul Menon',
      email: 'teacher2@slotswapper.com',
      password: await bcrypt.hash(demoPassword, 10),
      college: 'RMK Engineering College',
      role: 'Faculty',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const faculty3 = await User.findOneAndUpdate(
    { email: 'teacher3@slotswapper.com' },
    {
      name: 'Dr. Sneha Iyer',
      email: 'teacher3@slotswapper.com',
      password: await bcrypt.hash(demoPassword, 10),
      college: 'RMK Engineering College',
      role: 'Faculty',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { admin, faculty1, faculty2, faculty3 };
};

const scheduleTemplate = {
  Monday: [
    { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Data Structures', className: 'CSE-A', room: 'CS101' },
    { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Operating Systems', className: 'CSE-B', room: 'CS202' },
    { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: 'Software Engineering', className: 'CSE-A', room: 'CS204' },
    { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Web Technology', className: 'CSE-C', room: 'IT208' },
    { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: '', className: '', room: '' },
    { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Computer Networks', className: 'CSE-B', room: 'CS114' },
    { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: 'Object Oriented Programming', className: 'CSE-A', room: 'CS201' },
  ],
  Tuesday: [
    { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Database Management Systems', className: 'CSE-A', room: 'DB201' },
    { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Cloud Computing', className: 'CSE-C', room: 'CS305' },
    { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: 'Data Structures', className: 'CSE-B', room: 'CS101' },
    { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: '', className: '', room: '' },
    { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Artificial Intelligence', className: 'CSE-A', room: 'AI101' },
    { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Operating Systems', className: 'CSE-B', room: 'CS202' },
    { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: '', className: '', room: '' },
  ],
  Wednesday: [
    { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Computer Architecture', className: 'CSE-A', room: 'CS108' },
    { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Software Engineering', className: 'CSE-B', room: 'CS204' },
    { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: '', className: '', room: '' },
    { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Web Technology', className: 'CSE-A', room: 'IT208' },
    { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Cyber Security', className: 'CSE-C', room: 'CS345' },
    { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Database Management Systems', className: 'CSE-B', room: 'DB201' },
    { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: 'Object Oriented Programming', className: 'CSE-A', room: 'CS201' },
  ],
  Thursday: [
    { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Machine Learning', className: 'CSE-A', room: 'ML201' },
    { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: '', className: '', room: '' },
    { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: 'Operating Systems', className: 'CSE-B', room: 'CS202' },
    { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Computer Networks', className: 'CSE-A', room: 'CS114' },
    { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Data Structures', className: 'CSE-C', room: 'CS101' },
    { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: '', className: '', room: '' },
    { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: 'Cloud Computing', className: 'CSE-B', room: 'CS305' },
  ],
  Friday: [
    { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Web Technology', className: 'CSE-A', room: 'IT208' },
    { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Database Management Systems', className: 'CSE-B', room: 'DB201' },
    { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: '', className: '', room: '' },
    { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Software Engineering', className: 'CSE-C', room: 'CS204' },
    { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Computer Architecture', className: 'CSE-A', room: 'CS108' },
    { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Artificial Intelligence', className: 'CSE-B', room: 'AI101' },
    { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: '', className: '', room: '' },
  ],
  Saturday: [
    { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Cyber Security', className: 'CSE-A', room: 'CS345' },
    { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Machine Learning', className: 'CSE-B', room: 'ML201' },
    { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: 'Object Oriented Programming', className: 'CSE-C', room: 'CS201' },
    { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: '', className: '', room: '' },
    { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Operating Systems', className: 'CSE-A', room: 'CS202' },
    { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Cloud Computing', className: 'CSE-B', room: 'CS305' },
    { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: '', className: '', room: '' },
  ],
};

const normalizeFreePeriod = (period) => {
  const cleaned = { ...period };

  if (!cleaned.subject || !String(cleaned.subject).trim()) {
    delete cleaned.subject;
  }

  if (!cleaned.className || !String(cleaned.className).trim()) {
    delete cleaned.className;
  }

  if (!cleaned.room || !String(cleaned.room).trim()) {
    delete cleaned.room;
  }

  return cleaned;
};

const createTimetableFor = (faculty, dayMap) => {
  const timetable = {
    facultyId: faculty._id,
    college: faculty.college,
    schedule: academicDays.map((day) => ({
      day,
      periods: dayMap[day].map((period) => {
        const cleaned = normalizeFreePeriod({
          periodNumber: period.periodNumber,
          subject: period.subject,
          startTime: period.startTime,
          endTime: period.endTime,
          className: period.className,
          room: period.room,
        });

        return cleaned;
      }),
    })),
  };

  return timetable;
};

const seedMondayRotation = async ({ admin }) => {
  const weekStart = getWeekStart(new Date());

  await MondayRotation.findOneAndUpdate(
    { weekStart },
    {
      weekStart,
      mondayOrder: 'Tuesday',
      setBy: admin._id,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );
};

const seedEvents = async ({ faculty1, faculty2, faculty3 }) => {
  const weekStart = getWeekStart(new Date());

  const makeDate = (dayOffset, hour, minute) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const events = [
    {
      ownerId: faculty1._id,
      ownerName: faculty1.name,
      title: 'Software Engineering',
      start: makeDate(0, 9, 0).toISOString(),
      end: makeDate(0, 9, 50).toISOString(),
      status: 'Busy',
    },
    {
      ownerId: faculty1._id,
      ownerName: faculty1.name,
      title: 'Database Management Systems',
      start: makeDate(2, 10, 55).toISOString(),
      end: makeDate(2, 11, 45).toISOString(),
      status: 'Swappable',
    },
    {
      ownerId: faculty1._id,
      ownerName: faculty1.name,
      title: 'Artificial Intelligence',
      start: makeDate(3, 9, 50).toISOString(),
      end: makeDate(3, 10, 40).toISOString(),
      status: 'Swappable',
    },
    {
      ownerId: faculty1._id,
      ownerName: faculty1.name,
      title: 'Web Technology',
      start: makeDate(4, 10, 55).toISOString(),
      end: makeDate(4, 11, 45).toISOString(),
      status: 'Swappable',
    },
    {
      ownerId: faculty2._id,
      ownerName: faculty2.name,
      title: 'Operating Systems',
      start: makeDate(0, 10, 55).toISOString(),
      end: makeDate(0, 11, 45).toISOString(),
      status: 'Swappable',
    },
    {
      ownerId: faculty2._id,
      ownerName: faculty2.name,
      title: 'Computer Networks',
      start: makeDate(2, 13, 30).toISOString(),
      end: makeDate(2, 14, 20).toISOString(),
      status: 'Swappable',
    },
    {
      ownerId: faculty2._id,
      ownerName: faculty2.name,
      title: 'Cloud Computing',
      start: makeDate(5, 9, 0).toISOString(),
      end: makeDate(5, 9, 50).toISOString(),
      status: 'Swappable',
    },
    {
      ownerId: faculty3._id,
      ownerName: faculty3.name,
      title: 'Cyber Security',
      start: makeDate(0, 14, 20).toISOString(),
      end: makeDate(0, 15, 10).toISOString(),
      status: 'Swappable',
    },
    {
      ownerId: faculty3._id,
      ownerName: faculty3.name,
      title: 'Object Oriented Programming',
      start: makeDate(3, 11, 45).toISOString(),
      end: makeDate(3, 12, 35).toISOString(),
      status: 'Swappable',
    },
    {
      ownerId: faculty3._id,
      ownerName: faculty3.name,
      title: 'Data Structures',
      start: makeDate(4, 9, 50).toISOString(),
      end: makeDate(4, 10, 40).toISOString(),
      status: 'Busy',
    },
  ];

  for (const event of events) {
    await Event.findOneAndUpdate(
      {
        ownerId: event.ownerId,
        title: event.title,
        start: event.start,
        end: event.end,
      },
      event,
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    );
  }
};

const seedTimetables = async ({ faculty1, faculty2, faculty3 }) => {
  const facultySchedules = {
    [faculty1._id.toString()]: {
      Monday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Data Structures', className: 'CSE-A', room: 'CS101' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Database Management Systems', className: 'CSE-B', room: 'DB201' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: 'Operating Systems', className: 'CSE-A', room: 'CS202' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: '', className: '', room: '' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Web Technology', className: 'CSE-C', room: 'IT208' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Object Oriented Programming', className: 'CSE-A', room: 'CS201' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: 'Cyber Security', className: 'CSE-B', room: 'CS345' },
      ],
      Tuesday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Machine Learning', className: 'CSE-B', room: 'ML201' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: '', className: '', room: '' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: 'Software Engineering', className: 'CSE-A', room: 'CS204' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Computer Networks', className: 'CSE-B', room: 'CS114' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Data Structures', className: 'CSE-A', room: 'CS101' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Operating Systems', className: 'CSE-C', room: 'CS202' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: '', className: '', room: '' },
      ],
      Wednesday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Database Management Systems', className: 'CSE-A', room: 'DB201' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Object Oriented Programming', className: 'CSE-B', room: 'CS201' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: '', className: '', room: '' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Computer Architecture', className: 'CSE-A', room: 'CS108' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Web Technology', className: 'CSE-C', room: 'IT208' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Cyber Security', className: 'CSE-A', room: 'CS345' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: 'Machine Learning', className: 'CSE-B', room: 'ML201' },
      ],
      Thursday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Operating Systems', className: 'CSE-A', room: 'CS202' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Artificial Intelligence', className: 'CSE-B', room: 'AI101' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: '', className: '', room: '' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Cloud Computing', className: 'CSE-A', room: 'CS305' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Database Management Systems', className: 'CSE-C', room: 'DB201' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Software Engineering', className: 'CSE-B', room: 'CS204' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: '', className: '', room: '' },
      ],
      Friday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Computer Networks', className: 'CSE-A', room: 'CS114' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Data Structures', className: 'CSE-B', room: 'CS101' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: 'Web Technology', className: 'CSE-C', room: 'IT208' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: '', className: '', room: '' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Object Oriented Programming', className: 'CSE-A', room: 'CS201' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Artificial Intelligence', className: 'CSE-B', room: 'AI101' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: 'Cloud Computing', className: 'CSE-C', room: 'CS305' },
      ],
      Saturday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Software Engineering', className: 'CSE-A', room: 'CS204' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: '', className: '', room: '' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: 'Database Management Systems', className: 'CSE-B', room: 'DB201' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Machine Learning', className: 'CSE-C', room: 'ML201' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Cyber Security', className: 'CSE-A', room: 'CS345' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: '', className: '', room: '' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: 'Operating Systems', className: 'CSE-B', room: 'CS202' },
      ],
    },
    [faculty2._id.toString()]: {
      Monday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Artificial Intelligence', className: 'CSE-A', room: 'AI101' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Operating Systems', className: 'CSE-B', room: 'CS202' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: '', className: '', room: '' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Web Technology', className: 'CSE-A', room: 'IT208' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Computer Architecture', className: 'CSE-C', room: 'CS108' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Software Engineering', className: 'CSE-B', room: 'CS204' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: '', className: '', room: '' },
      ],
      Tuesday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Database Management Systems', className: 'CSE-B', room: 'DB201' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Machine Learning', className: 'CSE-A', room: 'ML201' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: 'Cloud Computing', className: 'CSE-C', room: 'CS305' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: '', className: '', room: '' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Computer Networks', className: 'CSE-A', room: 'CS114' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Object Oriented Programming', className: 'CSE-B', room: 'CS201' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: 'Cyber Security', className: 'CSE-C', room: 'CS345' },
      ],
      Wednesday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Operating Systems', className: 'CSE-A', room: 'CS202' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: '', className: '', room: '' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: 'Data Structures', className: 'CSE-B', room: 'CS101' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Web Technology', className: 'CSE-C', room: 'IT208' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Artificial Intelligence', className: 'CSE-A', room: 'AI101' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Machine Learning', className: 'CSE-B', room: 'ML201' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: '', className: '', room: '' },
      ],
      Thursday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Software Engineering', className: 'CSE-A', room: 'CS204' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Database Management Systems', className: 'CSE-B', room: 'DB201' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: 'Computer Architecture', className: 'CSE-C', room: 'CS108' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: '', className: '', room: '' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Cloud Computing', className: 'CSE-A', room: 'CS305' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Computer Networks', className: 'CSE-B', room: 'CS114' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: 'Object Oriented Programming', className: 'CSE-C', room: 'CS201' },
      ],
      Friday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Operating Systems', className: 'CSE-A', room: 'CS202' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Cyber Security', className: 'CSE-B', room: 'CS345' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: '', className: '', room: '' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Data Structures', className: 'CSE-A', room: 'CS101' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Web Technology', className: 'CSE-C', room: 'IT208' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Machine Learning', className: 'CSE-B', room: 'ML201' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: '', className: '', room: '' },
      ],
      Saturday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Cloud Computing', className: 'CSE-A', room: 'CS305' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: '', className: '', room: '' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: 'Database Management Systems', className: 'CSE-B', room: 'DB201' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Software Engineering', className: 'CSE-C', room: 'CS204' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Computer Networks', className: 'CSE-A', room: 'CS114' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: '', className: '', room: '' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: 'Artificial Intelligence', className: 'CSE-B', room: 'AI101' },
      ],
    },
    [faculty3._id.toString()]: {
      Monday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Computer Networks', className: 'IT-A', room: 'IT205' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Cloud Computing', className: 'IT-B', room: 'IT320' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: '', className: '', room: '' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Cyber Security', className: 'IT-A', room: 'IT220' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Operating Systems', className: 'IT-B', room: 'IT212' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Data Structures', className: 'IT-A', room: 'IT110' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: 'Machine Learning', className: 'IT-B', room: 'IT330' },
      ],
      Tuesday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Database Management Systems', className: 'IT-A', room: 'IT115' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Web Technology', className: 'IT-B', room: 'IT208' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: 'Software Engineering', className: 'IT-A', room: 'IT310' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: '', className: '', room: '' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Object Oriented Programming', className: 'IT-B', room: 'IT210' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Cloud Computing', className: 'IT-A', room: 'IT320' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: '', className: '', room: '' },
      ],
      Wednesday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Artificial Intelligence', className: 'IT-A', room: 'IT310' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: '', className: '', room: '' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: 'Data Structures', className: 'IT-B', room: 'IT110' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Cyber Security', className: 'IT-A', room: 'IT220' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Database Management Systems', className: 'IT-B', room: 'IT115' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Software Engineering', className: 'IT-A', room: 'IT310' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: 'Web Technology', className: 'IT-B', room: 'IT208' },
      ],
      Thursday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Operating Systems', className: 'IT-A', room: 'IT212' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Computer Networks', className: 'IT-B', room: 'IT205' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: '', className: '', room: '' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Machine Learning', className: 'IT-A', room: 'IT330' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Cloud Computing', className: 'IT-B', room: 'IT320' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: '', className: '', room: '' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: 'Object Oriented Programming', className: 'IT-A', room: 'IT210' },
      ],
      Friday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Cyber Security', className: 'IT-A', room: 'IT220' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Artificial Intelligence', className: 'IT-B', room: 'IT310' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: 'Data Structures', className: 'IT-A', room: 'IT110' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: '', className: '', room: '' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Operating Systems', className: 'IT-B', room: 'IT212' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: 'Machine Learning', className: 'IT-A', room: 'IT330' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: 'Computer Networks', className: 'IT-B', room: 'IT205' },
      ],
      Saturday: [
        { periodNumber: 1, startTime: '09:00', endTime: '09:50', subject: 'Database Management Systems', className: 'IT-A', room: 'IT115' },
        { periodNumber: 2, startTime: '09:50', endTime: '10:40', subject: 'Cloud Computing', className: 'IT-B', room: 'IT320' },
        { periodNumber: 3, startTime: '10:55', endTime: '11:45', subject: '', className: '', room: '' },
        { periodNumber: 4, startTime: '11:45', endTime: '12:35', subject: 'Software Engineering', className: 'IT-A', room: 'IT310' },
        { periodNumber: 5, startTime: '13:30', endTime: '14:20', subject: 'Machine Learning', className: 'IT-B', room: 'IT330' },
        { periodNumber: 6, startTime: '14:20', endTime: '15:10', subject: '', className: '', room: '' },
        { periodNumber: 7, startTime: '15:25', endTime: '16:15', subject: 'Operating Systems', className: 'IT-A', room: 'IT212' },
      ],
    },
  };

  for (const [facultyId, scheduleMap] of Object.entries(facultySchedules)) {
    const payload = createTimetableFor({ _id: facultyId, college: 'RMK Engineering College' }, scheduleMap);
    await Timetable.findOneAndUpdate({ facultyId }, payload, { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true });
  }
};

const seedWeeklyStates = async ({ faculty1, faculty2, faculty3 }) => {
  const weekStart = getWeekStart(new Date());

  const records = [
    { facultyId: faculty1._id, slots: [{ day: 'Monday', periodNumber: 5, status: 'Swappable' }, { day: 'Wednesday', periodNumber: 3, status: 'Emergency' }, { day: 'Friday', periodNumber: 4, status: 'Swappable' }] },
    { facultyId: faculty2._id, slots: [{ day: 'Thursday', periodNumber: 4, status: 'Swappable' }, { day: 'Friday', periodNumber: 3, status: 'Swappable' }] },
    { facultyId: faculty3._id, slots: [{ day: 'Monday', periodNumber: 3, status: 'Swappable' }, { day: 'Thursday', periodNumber: 6, status: 'Emergency' }] },
  ];

  for (const record of records) {
    await WeeklySlotState.findOneAndUpdate(
      { facultyId: record.facultyId, weekStart },
      { facultyId: record.facultyId, weekStart, slots: record.slots },
      { upsert: true, new: true, runValidators: true }
    );
  }
};

const seedAttendance = async ({ faculty1, faculty2, faculty3 }) => {
  const baseDates = [
    new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  ];

  const entries = [
    { facultyId: faculty1._id, date: baseDates[0], day: 'Monday', periodNumber: 1, subject: 'Data Structures', className: 'CSE-A', room: 'CS101', status: 'Present' },
    { facultyId: faculty1._id, date: baseDates[0], day: 'Monday', periodNumber: 2, subject: 'Database Management Systems', className: 'CSE-B', room: 'DB201', status: 'Present' },
    { facultyId: faculty1._id, date: baseDates[1], day: 'Wednesday', periodNumber: 3, subject: '', className: '', room: '', status: 'Free' },
    { facultyId: faculty1._id, date: baseDates[2], day: 'Thursday', periodNumber: 5, subject: 'Database Management Systems', className: 'CSE-C', room: 'DB201', status: 'Present' },
    { facultyId: faculty2._id, date: baseDates[0], day: 'Tuesday', periodNumber: 1, subject: 'Database Management Systems', className: 'CSE-B', room: 'DB201', status: 'Present' },
    { facultyId: faculty2._id, date: baseDates[1], day: 'Thursday', periodNumber: 4, subject: '', className: '', room: '', status: 'Free' },
    { facultyId: faculty2._id, date: baseDates[2], day: 'Friday', periodNumber: 3, subject: '', className: '', room: '', status: 'Free' },
    { facultyId: faculty3._id, date: baseDates[0], day: 'Monday', periodNumber: 1, subject: 'Computer Networks', className: 'IT-A', room: 'IT205', status: 'Present' },
    { facultyId: faculty3._id, date: baseDates[1], day: 'Wednesday', periodNumber: 4, subject: 'Cyber Security', className: 'IT-A', room: 'IT220', status: 'Absent' },
    { facultyId: faculty3._id, date: baseDates[3], day: 'Friday', periodNumber: 7, subject: 'Computer Networks', className: 'IT-B', room: 'IT205', status: 'Present' },
  ];

  for (const entry of entries) {
    await Attendance.findOneAndUpdate(
      { facultyId: entry.facultyId, date: entry.date, periodNumber: entry.periodNumber },
      {
        ...entry,
        completionTimestamp: new Date(entry.date.getTime() + 2 * 60 * 60 * 1000),
      },
      { upsert: true, new: true, runValidators: true }
    );
  }
};

const seedSwapRequests = async ({ faculty1, faculty2, faculty3 }) => {
  const currentDate = new Date();
  const accepted = {
    requesterId: faculty2._id,
    requesterName: 'Dr. Rahul Menon',
    responderId: faculty1._id,
    responderName: 'Dr. Priya Sharma',
    offeredSlot: {
      eventId: new mongoose.Types.ObjectId(),
      title: 'Artificial Intelligence',
      start: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
    },
    requestedSlot: {
      eventId: new mongoose.Types.ObjectId(),
      title: 'Object Oriented Programming',
      start: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
    },
    status: 'accepted',
    createdAt: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000),
  };

  const rejected = {
    requesterId: faculty3._id,
    requesterName: 'Dr. Sneha Iyer',
    responderId: faculty1._id,
    responderName: 'Dr. Priya Sharma',
    offeredSlot: {
      eventId: new mongoose.Types.ObjectId(),
      title: 'Web Technology',
      start: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
    },
    requestedSlot: {
      eventId: new mongoose.Types.ObjectId(),
      title: 'Data Structures',
      start: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
    },
    status: 'rejected',
    createdAt: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000),
  };

  const pending = {
    requesterId: faculty1._id,
    requesterName: 'Dr. Priya Sharma',
    responderId: faculty3._id,
    responderName: 'Dr. Sneha Iyer',
    offeredSlot: {
      eventId: new mongoose.Types.ObjectId(),
      title: 'Database Management Systems',
      start: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
    },
    requestedSlot: {
      eventId: new mongoose.Types.ObjectId(),
      title: 'Cyber Security',
      start: new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
    },
    status: 'pending',
    createdAt: new Date(currentDate.getTime() - 5 * 60 * 60 * 1000),
  };

  for (const row of [accepted, rejected, pending]) {
    await SwapRequest.findOneAndUpdate(
      { requesterId: row.requesterId, responderId: row.responderId, status: row.status },
      row,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

function getWeekStart(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

(async () => {
  if (!MONGO_URI) {
    console.error('MONGO_URI is missing in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for demo seed');

  const { admin, faculty1, faculty2, faculty3 } = await seedUsers();
  await seedMondayRotation({ admin });
  await seedTimetables({ faculty1, faculty2, faculty3 });
  await seedWeeklyStates({ faculty1, faculty2, faculty3 });
  await seedAttendance({ faculty1, faculty2, faculty3 });
  await seedEvents({ faculty1, faculty2, faculty3 });
  await seedSwapRequests({ faculty1, faculty2, faculty3 });

  console.log('Demo data seeded successfully.');
  console.log('Admin:', admin.email, '| password:', demoPassword);
  console.log('Teacher1:', faculty1.email, '| password:', demoPassword);
  console.log('Teacher2:', faculty2.email, '| password:', demoPassword);
  console.log('Teacher3:', faculty3.email, '| password:', demoPassword);

  await mongoose.disconnect();
  process.exit(0);
})().catch((error) => {
  console.error('Demo seed failed:', error);
  process.exit(1);
});
