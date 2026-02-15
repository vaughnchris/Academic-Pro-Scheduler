
import { ClassSection, FacultyRequest, SectionStatus, CourseOption, Instructor, Department, PartitionedItem, GlobalOption, ArchivedSchedule } from '../types';

export const DEPARTMENTS: Department[] = [
  { id: 'dept_1', name: 'Department of Business & Computing' },
  { id: 'dept_2', name: 'Department of Arts & Humanities' },
  { id: 'dept_3', name: 'Department of Science & Math' }
];

// Initial schedule left minimal as user will likely import
export const INITIAL_SCHEDULE: ClassSection[] = [];

export const INITIAL_INSTRUCTORS: Instructor[] = [
  { id: 'inst_1', departmentId: 'dept_1', name: 'Smith, John', email: 'smith.j@yosemite.edu', type: 'Full-Time', seniority: 1, approvalStatus: 'Pending', isScheduler: true },
  { id: 'inst_2', departmentId: 'dept_1', name: 'Doe, Jane', email: 'doe.j@yosemite.edu', type: 'Full-Time', seniority: 2, approvalStatus: 'Pending' },
  { id: 'inst_3', departmentId: 'dept_1', name: 'Brown, Charlie', email: 'brown.c@yosemite.edu', type: 'Part-Time', seniority: 99, approvalStatus: 'Pending' },
  { id: 'inst_4', departmentId: 'dept_2', name: 'Picasso, Pablo', email: 'picasso.p@yosemite.edu', type: 'Full-Time', seniority: 1, approvalStatus: 'Pending', isScheduler: true }
];

export const MOCK_REQUESTS: FacultyRequest[] = [];

export const INITIAL_COURSES: CourseOption[] = [
  { id: 'c1', departmentId: 'dept_1', code: 'MCSI 200', title: 'Tech Computer Literacy' },
  { id: 'c2', departmentId: 'dept_1', code: 'MCSI 250', title: 'Intro to Programming' },
  { id: 'c3', departmentId: 'dept_1', code: 'BUS 101', title: 'Intro to Business' },
  { id: 'c4', departmentId: 'dept_2', code: 'ART 101', title: 'Art History' }
];

export const INITIAL_MODALITIES: GlobalOption[] = [
  { id: 'm1', value: 'Live' },
  { id: 'm2', value: 'Online' },
  { id: 'm3', value: 'Hybrid' }
];

export const INITIAL_CAMPUSES: GlobalOption[] = [
  { id: 'cam1', value: 'Main Campus' },
  { id: 'cam2', value: 'North Campus' },
  { id: 'cam3', value: 'Online' }
];

export const INITIAL_TEXTBOOK_COSTS: GlobalOption[] = [
  { id: 'tc1', value: 'No Cost' },
  { id: 'tc2', value: 'Low Cost' },
  { id: 'tc3', value: 'Regular Cost' }
];

export const INITIAL_ROOMS: PartitionedItem[] = [
  { id: 'r1', departmentId: 'dept_1', value: 'CAT 201' },
  { id: 'r2', departmentId: 'dept_1', value: 'CAT 202' },
  { id: 'r3', departmentId: 'dept_1', value: 'ONLINE' },
  { id: 'r4', departmentId: 'dept_2', value: 'ART 100' }
];

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const TIME_BLOCKS: PartitionedItem[] = [
  { id: 'tb1', departmentId: 'dept_1', value: '8:00 AM - 9:15 AM' },
  { id: 'tb2', departmentId: 'dept_1', value: '9:30 AM - 10:45 AM' },
  { id: 'tb3', departmentId: 'dept_1', value: '11:00 AM - 12:15 PM' },
  { id: 'tb4', departmentId: 'dept_1', value: '1:00 PM - 2:15 PM' }
];

// Mock Archived Schedules
export const MOCK_ARCHIVED_SCHEDULES: ArchivedSchedule[] = [
  {
    id: 'arch_1',
    departmentId: 'dept_1',
    termTitle: 'Spring 2025 (Final)',
    archivedDate: '2025-05-20',
    sections: [
      { id: 's1', departmentId: 'dept_1', term: '2025MSP', subject: 'MCSI', courseNumber: '200', section: '01', title: 'Tech Computer Literacy', method: 'LEC', meetingDays: 'MW', beginTime: '9:30 AM', endTime: '10:45 AM', room: 'CAT 201', faculty: 'Smith, John', status: SectionStatus.KEEP, endDate: '' },
      { id: 's2', departmentId: 'dept_1', term: '2025MSP', subject: 'MCSI', courseNumber: '250', section: '01', title: 'Intro to Programming', method: 'LEC', meetingDays: 'TR', beginTime: '11:00 AM', endTime: '12:15 PM', room: 'CAT 202', faculty: 'Doe, Jane', status: SectionStatus.KEEP, endDate: '' },
      { id: 's3', departmentId: 'dept_1', term: '2025MSP', subject: 'BUS', courseNumber: '101', section: '02', title: 'Intro to Business', method: 'ONLINE', meetingDays: '', beginTime: '', endTime: '', room: 'ONLINE', faculty: 'Brown, Charlie', status: SectionStatus.KEEP, endDate: '' }
    ]
  },
  {
    id: 'arch_2',
    departmentId: 'dept_1',
    termTitle: 'Fall 2024 (Final)',
    archivedDate: '2024-12-15',
    sections: [
      { id: 's4', departmentId: 'dept_1', term: '2024MFA', subject: 'MCSI', courseNumber: '200', section: '01', title: 'Tech Computer Literacy', method: 'LEC', meetingDays: 'TR', beginTime: '8:00 AM', endTime: '9:15 AM', room: 'CAT 201', faculty: 'Smith, John', status: SectionStatus.KEEP, endDate: '' }
    ]
  }
];
