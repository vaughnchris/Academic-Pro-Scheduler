
// Enums mirroring the Excel status colors
export enum SectionStatus {
  KEEP = 'Keep',     // White/Green
  CHANGE = 'Change', // Light Green
  DELETE = 'Delete', // Yellow/Gold
  NEW = 'New'        // Peach/Orange
}

export interface Department {
  id: string;
  name: string;
}

export interface ClassSection {
  id: string;
  departmentId: string; // Partition Key
  term: string;
  subject: string;
  courseNumber: string;
  section: string;
  title: string;
  endDate: string;
  method: string; // e.g. DINT, LEC, LAB
  meetingDays: string;
  beginTime: string;
  endTime: string;
  room: string;
  faculty: string; // Assigned faculty name
  status: SectionStatus;
  notes?: string;
}

export interface PreferenceRow {
  rank: number;
  classTitle: string;
  daysAvailable: string[]; // Changed to array for multi-select
  timesAvailable: string[]; // Changed to array for multi-select
  campus: string;
  modality: string;
  notes?: string;
  sameAsLastYear?: boolean;
  textbookCost: string; // "No Cost" | "Low Cost" | "Regular Cost"
}

export interface FacultyRequest {
  id: string;
  departmentId: string; // Partition Key
  name: string;
  email: string;
  contactNumber: string;
  loadDesired: number; // Number of classes they want
  preferences: PreferenceRow[];
  certifiedOnline: boolean;
  willingToTeach: {
    live: boolean;
    online: boolean;
    hybrid: boolean;
  };
  specialInstructions: string;
  submittedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface CourseOption {
  id: string;
  departmentId: string; // Partition Key
  code: string; // e.g. MCSI 200
  title: string; // e.g. Tech Computer Literacy
}

export interface Instructor {
  id: string;
  departmentId: string; // Partition Key
  name: string;
  email: string;
  type: 'Full-Time' | 'Part-Time';
  seniority?: number; // 1 is highest seniority
  reminderCount?: number;
}

// Helper types for simple lists that now need partitioning
export interface PartitionedItem {
  id: string;
  departmentId: string;
  value: string;
}

export interface EmailSettings {
  individualSubject: string;
  individualBody: string;
  bulkSubject: string;
  bulkBody: string;
}
