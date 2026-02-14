
import { ClassSection, FacultyRequest, SectionStatus, CourseOption, Instructor, Department, PartitionedItem } from '../types';

export const DEPARTMENTS: Department[] = [
  { id: 'dept_bus', name: 'Business & Computing' },
  { id: 'dept_nurse', name: 'Nursing & Health' }
];

export const INITIAL_SCHEDULE: ClassSection[] = [
  // Business Dept
  {
    id: '1', departmentId: 'dept_bus', term: '2026MFA', subject: 'MCSI', courseNumber: '200', section: '2898', title: 'Tech Computer Literacy',
    endDate: '12/13/25', method: 'DINT, DLAB', meetingDays: '', beginTime: '', endTime: '', room: 'ONLINE', faculty: 'Cummerow, David', status: SectionStatus.KEEP
  },
  {
    id: '2', departmentId: 'dept_bus', term: '2026MFA', subject: 'MCSI', courseNumber: '204', section: '5170', title: 'Discrete Struct for Comp Scien',
    endDate: '12/13/25', method: 'LEC, DLAB', meetingDays: 'T', beginTime: '9:35 AM', endTime: '11:10 AM', room: 'CAT 231', faculty: 'Lal, Amit', status: SectionStatus.KEEP
  },
  {
    id: '3', departmentId: 'dept_bus', term: '2026MFA', subject: 'MCSI', courseNumber: '210', section: '0042', title: 'Intro UNIX/Linux Systems',
    endDate: '12/13/25', method: 'DINT, DLAB', meetingDays: '', beginTime: '', endTime: '', room: 'ONLINE', faculty: 'Phillips, Dale', status: SectionStatus.KEEP, notes: 'Change to Dale Phillips'
  },
  {
    id: '4', departmentId: 'dept_bus', term: '2026MFA', subject: 'MCSI', courseNumber: '220', section: '1159', title: 'Computer Information Systems',
    endDate: '12/13/25', method: 'LEC, DLAB', meetingDays: 'TR', beginTime: '2:20 PM', endTime: '3:35 PM', room: 'CAT 229', faculty: 'Lal, Amit', status: SectionStatus.CHANGE
  },
  {
    id: '5', departmentId: 'dept_bus', term: '2026MFA', subject: 'MCSI', courseNumber: '270', section: '5184', title: 'Introduction to Programming',
    endDate: '12/13/25', method: 'DINT, DLAB', meetingDays: '', beginTime: '', endTime: '', room: 'ONLINE', faculty: 'Staff', status: SectionStatus.KEEP
  },
  // Nursing Dept (Sample)
  {
    id: 'n1', departmentId: 'dept_nurse', term: '2026MFA', subject: 'NURS', courseNumber: '101', section: '1001', title: 'Intro to Nursing',
    endDate: '12/13/25', method: 'LEC', meetingDays: 'MW', beginTime: '8:00 AM', endTime: '9:30 AM', room: 'HS 101', faculty: 'Nightingale, Florence', status: SectionStatus.KEEP
  }
];

export const MOCK_REQUESTS: FacultyRequest[] = [
  {
    id: 'req1',
    departmentId: 'dept_bus',
    name: 'Lal, Amit',
    email: 'amit.lal@college.edu',
    contactNumber: '555-0192',
    loadDesired: 4,
    preferences: [
      { rank: 1, classTitle: 'MCSI 204 - Discrete Struct for Comp Scien', daysAvailable: ['Tue', 'Thu'], timesAvailable: ['9:35 AM - 11:10 AM'], campus: 'Main', modality: 'Live', sameAsLastYear: true, textbookCost: 'Regular Cost', notes: 'Prefer Room 231' },
      { rank: 2, classTitle: 'MCSI 220 - Computer Information Systems', daysAvailable: ['Tue', 'Thu'], timesAvailable: ['2:20 PM - 3:35 PM'], campus: 'Main', modality: 'Live', sameAsLastYear: false, textbookCost: 'No Cost', notes: '' }
    ],
    certifiedOnline: true,
    willingToTeach: { live: true, online: true, hybrid: true },
    specialInstructions: 'I prefer not to have back-to-back classes if possible.',
    submittedAt: '2025-10-15'
  },
  {
    id: 'req2',
    departmentId: 'dept_bus',
    name: 'Wedge, Brent',
    email: 'brent.wedge@college.edu',
    contactNumber: '555-0200',
    loadDesired: 2,
    preferences: [
      { rank: 1, classTitle: 'MCSI 200 - Tech Computer Literacy', daysAvailable: ['Mon', 'Wed'], timesAvailable: ['6:30 PM - 9:30 PM'], campus: 'Main', modality: 'Hybrid', sameAsLastYear: true, textbookCost: 'Low Cost', notes: '' },
    ],
    certifiedOnline: true,
    willingToTeach: { live: true, online: true, hybrid: false },
    specialInstructions: '',
    submittedAt: '2025-10-16'
  }
];

export const INITIAL_INSTRUCTORS: Instructor[] = [
  { id: 'i1', departmentId: 'dept_bus', name: 'Lal, Amit', email: 'amit.lal@college.edu', type: 'Full-Time', seniority: 1, reminderCount: 0 },
  { id: 'i2', departmentId: 'dept_bus', name: 'Wedge, Brent', email: 'brent.wedge@college.edu', type: 'Full-Time', seniority: 2, reminderCount: 0 },
  { id: 'i3', departmentId: 'dept_bus', name: 'Cummerow, David', email: 'david.cummerow@college.edu', type: 'Full-Time', seniority: 3, reminderCount: 0 },
  { id: 'i4', departmentId: 'dept_bus', name: 'Phillips, Dale', email: 'dale.phillips@college.edu', type: 'Full-Time', seniority: 4, reminderCount: 0 },
  { id: 'i5', departmentId: 'dept_bus', name: 'Walsh, Edward', email: 'edward.walsh@college.edu', type: 'Part-Time', seniority: 5, reminderCount: 0 },
  { id: 'i6', departmentId: 'dept_bus', name: 'Smith, John', email: 'john.smith@college.edu', type: 'Part-Time', seniority: 6, reminderCount: 0 },
  { id: 'i7', departmentId: 'dept_bus', name: 'Doe, Jane', email: 'jane.doe@college.edu', type: 'Part-Time', seniority: 7, reminderCount: 0 },
  // Nursing
  { id: 'i8', departmentId: 'dept_nurse', name: 'Nightingale, Florence', email: 'flo@college.edu', type: 'Full-Time', seniority: 1, reminderCount: 0 },
];

export const INITIAL_COURSES: CourseOption[] = [
  { id: 'c1', departmentId: 'dept_bus', code: 'MCSI 200', title: 'Tech Computer Literacy' },
  { id: 'c2', departmentId: 'dept_bus', code: 'MCSI 204', title: 'Discrete Struct for Comp Scien' },
  { id: 'c3', departmentId: 'dept_bus', code: 'MCSI 210', title: 'Intro UNIX/Linux Systems' },
  { id: 'c4', departmentId: 'dept_bus', code: 'MCSI 220', title: 'Computer Information Systems' },
  { id: 'c5', departmentId: 'dept_bus', code: 'MCSI 252', title: 'Script Programming for the Web' },
  { id: 'c6', departmentId: 'dept_bus', code: 'MCSI 270', title: 'Introduction to Programming' },
  { id: 'c7', departmentId: 'dept_bus', code: 'MCSI 350', title: 'Database Management' },
  { id: 'c8', departmentId: 'dept_bus', code: 'MCSI 410', title: 'Software Engineering' },
  // Nursing
  { id: 'c9', departmentId: 'dept_nurse', code: 'NURS 101', title: 'Intro to Nursing' },
];

export const INITIAL_MODALITIES: PartitionedItem[] = [
    { id: 'm1', departmentId: 'dept_bus', value: 'Traditional' },
    { id: 'm2', departmentId: 'dept_bus', value: 'Online' },
    { id: 'm3', departmentId: 'dept_bus', value: 'Hybrid' },
    { id: 'm4', departmentId: 'dept_nurse', value: 'Traditional' },
    { id: 'm5', departmentId: 'dept_nurse', value: 'Clinical' },
];

export const INITIAL_CAMPUSES: PartitionedItem[] = [
    { id: 'cp1', departmentId: 'dept_bus', value: 'East' },
    { id: 'cp2', departmentId: 'dept_bus', value: 'West' },
    { id: 'cp3', departmentId: 'dept_bus', value: 'None' },
    { id: 'cp4', departmentId: 'dept_nurse', value: 'Main Hospital' },
];

export const INITIAL_ROOMS: PartitionedItem[] = [
    { id: 'r1', departmentId: 'dept_bus', value: 'CAT 101' },
    { id: 'r2', departmentId: 'dept_bus', value: 'CAT 227' },
    { id: 'r3', departmentId: 'dept_bus', value: 'CAT 229' },
    { id: 'r4', departmentId: 'dept_bus', value: 'CAT 231' },
    { id: 'r5', departmentId: 'dept_bus', value: 'LAB A' },
    { id: 'r6', departmentId: 'dept_bus', value: 'LAB B' },
    { id: 'r7', departmentId: 'dept_bus', value: 'ONLINE' },
    // Nursing
    { id: 'r8', departmentId: 'dept_nurse', value: 'HS 101' },
    { id: 'r9', departmentId: 'dept_nurse', value: 'HS 102' },
];

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const TIME_BLOCKS: PartitionedItem[] = [
    { id: 'tb1', departmentId: 'dept_bus', value: '8:00 AM - 9:35 AM' },
    { id: 'tb2', departmentId: 'dept_bus', value: '9:50 AM - 11:25 AM' },
    { id: 'tb3', departmentId: 'dept_bus', value: '11:40 AM - 1:15 PM' },
    { id: 'tb4', departmentId: 'dept_bus', value: '1:30 PM - 3:05 PM' },
    { id: 'tb5', departmentId: 'dept_bus', value: '3:20 PM - 4:55 PM' },
    { id: 'tb6', departmentId: 'dept_bus', value: '6:30 PM - 9:30 PM' },
    // Nursing
    { id: 'tb7', departmentId: 'dept_nurse', value: '8:00 AM - 12:00 PM' },
    { id: 'tb8', departmentId: 'dept_nurse', value: '1:00 PM - 5:00 PM' },
];
