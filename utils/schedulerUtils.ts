
import { ClassSection, SectionStatus } from '../types';

export const generateFacultyEmail = (name: string): string => {
  // Expected format: "Last, First" or "Last, First M."
  if (!name || name === 'Staff') return '';
  
  const parts = name.split(',');
  if (parts.length < 2) return '';

  // Remove spaces/special chars from Last Name
  const lastName = parts[0].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Get first initial of First Name
  const firstNamePart = parts[1].trim();
  const firstInitial = firstNamePart.charAt(0).toLowerCase();

  return `${lastName}${firstInitial}@yosemite.edu`;
};

export const parseTimeMinutes = (timeStr: string): number => {
  if (!timeStr) return 9999;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 9999;
  let [_, h, m, period] = match;
  let hour = parseInt(h);
  const minute = parseInt(m);
  if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
  return hour * 60 + minute;
};

export const getDaySortValue = (days: string): number => {
  if (!days) return 8;
  const order = "MTWRFSU";
  // Check for the earliest day in the string
  let minIdx = 8;
  for (let i = 0; i < order.length; i++) {
    if (days.includes(order[i])) {
      minIdx = i;
      break;
    }
  }
  return minIdx;
};

// Priority map for Status sorting
const statusPriority: Record<SectionStatus, number> = {
  [SectionStatus.NEW]: 0,
  [SectionStatus.CHANGE]: 1,
  [SectionStatus.DELETE]: 2,
  [SectionStatus.IMPORTED]: 3,
  [SectionStatus.KEEP]: 4,
};

export const sortSchedule = (schedule: ClassSection[], criterion: 'course' | 'time' | 'room' | 'faculty' | 'status'): ClassSection[] => {
  return [...schedule].sort((a, b) => {
    if (criterion === 'course') {
      // Sort by Subject
      if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
      
      // Sort by Course Number (Numeric awareness)
      const numA = parseFloat(a.courseNumber.replace(/\D/g, '')) || 0;
      const numB = parseFloat(b.courseNumber.replace(/\D/g, '')) || 0;
      if (numA !== numB) return numA - numB;
      
      // Fallback to string if numbers equal
      if (a.courseNumber !== b.courseNumber) return a.courseNumber.localeCompare(b.courseNumber);

      // Finally Section
      return a.section.localeCompare(b.section);
    } else if (criterion === 'time') {
      // Sort by Day -> Time -> Room
      
      // 1. Day
      const dayA = getDaySortValue(a.meetingDays);
      const dayB = getDaySortValue(b.meetingDays);
      if (dayA !== dayB) return dayA - dayB;

      // 2. Time
      const timeA = parseTimeMinutes(a.beginTime);
      const timeB = parseTimeMinutes(b.beginTime);
      if (timeA !== timeB) return timeA - timeB;

      // 3. Room
      return a.room.localeCompare(b.room);
    } else if (criterion === 'room') {
        // Sort by Room -> Day -> Time
        
        // 1. Room
        if (a.room !== b.room) return a.room.localeCompare(b.room);

        // 2. Day
        const dayA = getDaySortValue(a.meetingDays);
        const dayB = getDaySortValue(b.meetingDays);
        if (dayA !== dayB) return dayA - dayB;

        // 3. Time
        const timeA = parseTimeMinutes(a.beginTime);
        const timeB = parseTimeMinutes(b.beginTime);
        return timeA - timeB;
    } else if (criterion === 'faculty') {
        // Sort by Faculty -> Day -> Time
        
        // 1. Faculty (Empty strings/Staff last? Or alphabetical)
        const fA = a.faculty || 'zzzz';
        const fB = b.faculty || 'zzzz';
        if (fA !== fB) return fA.localeCompare(fB);

        // 2. Day
        const dayA = getDaySortValue(a.meetingDays);
        const dayB = getDaySortValue(b.meetingDays);
        if (dayA !== dayB) return dayA - dayB;

        // 3. Time
        const timeA = parseTimeMinutes(a.beginTime);
        const timeB = parseTimeMinutes(b.beginTime);
        return timeA - timeB;
    } else if (criterion === 'status') {
       // Sort by Status Priority -> Course
       const sA = statusPriority[a.status] ?? 99;
       const sB = statusPriority[b.status] ?? 99;
       
       if (sA !== sB) return sA - sB;

       // Fallback to Course
       if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
       const numA = parseFloat(a.courseNumber.replace(/\D/g, '')) || 0;
       const numB = parseFloat(b.courseNumber.replace(/\D/g, '')) || 0;
       return numA - numB;
    }
    return 0;
  });
};

export const parseScheduleCSV = (csvText: string, departmentId: string): ClassSection[] => {
  const lines = csvText.split(/\r?\n/);
  const sections: ClassSection[] = [];
  
  // Headers provided in standard export:
  // Term, Subject, Course Number, Section Number, Title, Important Notes, End Dates, Instructional Method, Meeting Days, Begin Time, End Time, Room, Faculty, SEC_COURSE TYPE_ZTC, Comments
  
  // Simple CSV parser handling quoted fields with commas
  const parseLine = (text: string) => {
    const result = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  // Find the header line index
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Look for "Term" in the first few characters to identify header
    // The CSV might have empty lines or commas before the real header
    if (line.toLowerCase().startsWith('term') || line.toLowerCase().includes('term,subject')) {
      headerIndex = i;
      break;
    }
  }

  // Start parsing from the line AFTER the header
  const startIndex = headerIndex !== -1 ? headerIndex + 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    if (line.replace(/,/g, '').trim() === '') continue; // Skip lines with only commas

    const cols = parseLine(line);
    
    // Map columns based on the provided format
    // 0: Term, 1: Subject, 2: Course Number, 3: Section Number, 4: Title, 5: Notes, 6: End Dates
    // 7: Method, 8: Days, 9: Start, 10: End, 11: Room, 12: Faculty
    
    if (cols.length < 5) continue; // Basic validation

    const section: ClassSection = {
      id: crypto.randomUUID(),
      departmentId,
      term: cols[0] || '2026MFA',
      subject: cols[1] || '',
      courseNumber: cols[2] || '',
      section: cols[3] || '',
      title: cols[4] || '',
      notes: cols[5] || '', // Important Notes
      endDate: cols[6] || '',
      method: cols[7] || '',
      meetingDays: cols[8] || '',
      beginTime: cols[9] || '',
      endTime: cols[10] || '',
      room: cols[11] || '',
      faculty: cols[12] || 'Staff',
      status: SectionStatus.IMPORTED // Start as gray/imported
    };

    sections.push(section);
  }

  return sections;
};

export const exportScheduleToExcel = (schedule: ClassSection[], title: string) => {
  // Styles
  // Mapping status to colors
  // IMPORTED: bg-gray-100 (#F3F4F6), Text gray-500 (#6B7280)
  // KEEP: bg-blue-100 (#DBEAFE), Text #1E3A8A
  // CHANGE: bg-green-100 (#DCFCE7), Text #14532D
  // DELETE: bg-orange-200 (#FED7AA), Text #78350F (Brownish)
  // NEW: bg-pink-100 (#FCE7F3), Text #831843
  // IMPORTED (Assigned): bg-gray-100 (#F3F4F6), Text #000 Bold

  const getStyle = (s: ClassSection) => {
    const isAssigned = s.faculty && s.faculty !== 'Staff';
    if (s.status === 'Imported') {
        if (isAssigned) return 'background-color: #F3F4F6; color: #000000; font-weight: bold;';
        return 'background-color: #F3F4F6; color: #6B7280; font-style: italic;';
    }
    if (s.status === 'Keep') return 'background-color: #DBEAFE; color: #1E3A8A; font-weight: bold;'; // Light Blue
    if (s.status === 'Change') return 'background-color: #DCFCE7; color: #14532D; font-weight: bold;'; // Green
    if (s.status === 'Delete') return 'background-color: #FED7AA; color: #78350F;'; // Brown/Tan
    if (s.status === 'New') return 'background-color: #FCE7F3; color: #831843; font-weight: bold;'; // Light Pink
    return '';
  };

  const tableRows = schedule.map(s => `
    <tr>
      <td style="${getStyle(s)}">${s.term}</td>
      <td style="${getStyle(s)}">${s.subject}</td>
      <td style="${getStyle(s)}">${s.courseNumber}</td>
      <td style="${getStyle(s)}">${s.section}</td>
      <td style="${getStyle(s)}">${s.title}</td>
      <td style="${getStyle(s)}">${s.method}</td>
      <td style="${getStyle(s)}">${s.meetingDays}</td>
      <td style="${getStyle(s)}">${s.beginTime} - ${s.endTime}</td>
      <td style="${getStyle(s)}">${s.room}</td>
      <td style="${getStyle(s)}">${s.faculty}</td>
      <td style="${getStyle(s)}">${s.status}</td>
      <td style="${getStyle(s)}">${s.notes || ''}</td>
    </tr>
  `).join('');

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Schedule</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <style>
        th { font-weight: bold; border: 1px solid #000; background-color: #e5e7eb; padding: 5px; }
        td { border: 1px solid #d1d5db; vertical-align: top; padding: 5px; }
        .legend-table td { border: none; padding: 4px 8px; }
        .color-box { width: 20px; height: 20px; border: 1px solid #999; display: inline-block; margin-right: 5px; }
      </style>
    </head>
    <body>
      <h2>${title}</h2>
      
      <!-- Legend -->
      <h3>Legend</h3>
      <table class="legend-table">
        <tr>
          <td><span class="color-box" style="background-color: #F3F4F6;"></span></td>
          <td style="color: #6B7280; font-style: italic;">Imported Template (Unassigned)</td>
        </tr>
         <tr>
          <td><span class="color-box" style="background-color: #F3F4F6; border: 2px solid #3B82F6;"></span></td>
          <td style="font-weight: bold;">Imported (Assigned)</td>
        </tr>
        <tr>
          <td><span class="color-box" style="background-color: #DBEAFE;"></span></td>
          <td>Confirmed (Keep)</td>
        </tr>
        <tr>
          <td><span class="color-box" style="background-color: #DCFCE7;"></span></td>
          <td>Changed / Updated</td>
        </tr>
        <tr>
          <td><span class="color-box" style="background-color: #FCE7F3;"></span></td>
          <td>New Section</td>
        </tr>
        <tr>
          <td><span class="color-box" style="background-color: #FED7AA;"></span></td>
          <td>Marked for Deletion</td>
        </tr>
      </table>
      <br/>

      <table>
        <thead>
          <tr>
            <th>Term</th>
            <th>Subject</th>
            <th>Course No</th>
            <th>Section</th>
            <th>Title</th>
            <th>Method</th>
            <th>Days</th>
            <th>Time</th>
            <th>Room</th>
            <th>Faculty</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Schedule_Export_${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
