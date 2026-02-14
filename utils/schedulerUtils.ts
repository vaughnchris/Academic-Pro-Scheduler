
import { ClassSection } from '../types';

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

export const sortSchedule = (schedule: ClassSection[], criterion: 'course' | 'time' | 'room' | 'faculty'): ClassSection[] => {
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
        // Let's do alphabetical, but Staff/Empty at bottom could be nice. For now standard alpha.
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
    }
    return 0;
  });
};
