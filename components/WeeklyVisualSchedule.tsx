
import React, { useMemo } from 'react';
import { ClassSection, SectionStatus } from '../types';
import { parseTimeMinutes } from '../utils/schedulerUtils';
import { Clock, MapPin, User, AlertCircle, Laptop } from 'lucide-react';

interface Props {
  schedule: ClassSection[];
}

const COLUMNS = [
  { id: 'M', label: 'Mon' },
  { id: 'T', label: 'Tue' },
  { id: 'W', label: 'Wed' },
  { id: 'R', label: 'Thu' },
  { id: 'F', label: 'Fri' },
  { id: 'S', label: 'Sat' },
  { id: 'ONLINE', label: 'Online / TBA' }
];

const START_HOUR = 7; // 7 AM
const END_HOUR = 22;  // 10 PM
const HOUR_HEIGHT = 60; // pixels per hour

// Helper to map single char codes to day indices
const mapDayCodeToIndex = (char: string): number | null => {
    const map: Record<string, number> = { 
        'M': 0, 'T': 1, 'W': 2, 'R': 3, 'F': 4, 'S': 5 
        // Sunday (U) is omitted in standard grid
    };
    return map[char] ?? null;
};

// Parse "MW", "TR", "MWF" into [0, 2], [1, 3], etc.
const getDayIndices = (dayString: string): number[] => {
    if (!dayString) return [];
    const indices: number[] = [];
    const normalized = dayString.toUpperCase(); 
    for (let i = 0; i < normalized.length; i++) {
        const idx = mapDayCodeToIndex(normalized[i]);
        if (idx !== null) indices.push(idx);
    }
    return indices;
};

const getStatusColorClass = (status: SectionStatus) => {
    switch (status) {
        case SectionStatus.KEEP: return 'bg-blue-100 border-blue-400 text-blue-900 hover:bg-blue-200';
        case SectionStatus.CHANGE: return 'bg-green-100 border-green-400 text-green-900 hover:bg-green-200';
        case SectionStatus.NEW: return 'bg-pink-100 border-pink-400 text-pink-900 hover:bg-pink-200';
        case SectionStatus.IMPORTED: return 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200';
        case SectionStatus.DELETE: return 'bg-red-50 border-red-200 text-red-800 opacity-50';
        default: return 'bg-white border-gray-200 text-gray-800';
    }
};

export const WeeklyVisualSchedule: React.FC<Props> = ({ schedule }) => {
    
    const { events, containerHeight } = useMemo(() => {
        const processedEvents: any[] = [];
        let onlineStackY = 0; // Vertical offset for the Online column
        const ONLINE_ITEM_HEIGHT = 65;
        const GAP = 5;

        // Sort schedule to make online column predictable
        const sortedSchedule = [...schedule].sort((a, b) => a.subject.localeCompare(b.subject));
        
        sortedSchedule.forEach(section => {
            if (section.status === SectionStatus.DELETE) return;

            // Determine if this is an "Online/TBA" section
            // Criteria: Explicit Room, Method, or missing Time/Days
            const isOnline = 
                section.room?.toUpperCase() === 'ONLINE' || 
                section.room?.toUpperCase() === 'TBA' || 
                section.method?.toUpperCase() === 'ONLINE' ||
                !section.beginTime || 
                !section.endTime || 
                !section.meetingDays;

            if (isOnline) {
                // Place in the last column (Index 6)
                processedEvents.push({
                    ...section,
                    dayIndex: 6,
                    top: onlineStackY + GAP, // Add slight top padding
                    height: ONLINE_ITEM_HEIGHT,
                    isOnlineEntry: true
                });
                onlineStackY += (ONLINE_ITEM_HEIGHT + GAP);
            } else {
                // Standard Time-Based Placement
                const startMin = parseTimeMinutes(section.beginTime);
                const endMin = parseTimeMinutes(section.endTime);
                const dayIndices = getDayIndices(section.meetingDays);

                if (startMin >= endMin) return; 

                const startOffset = startMin - (START_HOUR * 60);
                const duration = endMin - startMin;

                // Calculate Top (pixels) and Height (pixels)
                const top = (startOffset / 60) * HOUR_HEIGHT;
                const height = (duration / 60) * HOUR_HEIGHT;

                dayIndices.forEach(dayIndex => {
                    processedEvents.push({
                        ...section,
                        dayIndex,
                        top,
                        height: Math.max(height, 25), // Min visual height
                        isOnlineEntry: false
                    });
                });
            }
        });

        // Calculate total height needed. 
        // Either the fixed time grid height OR the height of the stacked online classes, whichever is larger.
        const timeGridHeight = (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT;
        const totalHeight = Math.max(timeGridHeight, onlineStackY + 50);

        return { events: processedEvents, containerHeight: totalHeight };
    }, [schedule]);

    // Generate Time Labels
    const timeLabels = useMemo(() => {
        const labels = [];
        for (let h = START_HOUR; h <= END_HOUR; h++) {
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h > 12 ? h - 12 : h;
            labels.push(`${h12} ${ampm}`);
        }
        return labels;
    }, []);

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col h-[800px]">
            {/* Header: Columns */}
            <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0 z-20">
                <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-white"></div> {/* Time Axis Header */}
                {COLUMNS.map((col, i) => (
                    <div key={col.id} className={`flex-1 text-center py-2 font-bold text-gray-700 uppercase text-xs border-r border-gray-200 last:border-r-0 ${col.id === 'ONLINE' ? 'bg-blue-50/50 text-blue-800' : ''}`}>
                        {col.label}
                    </div>
                ))}
            </div>

            {/* Grid Body */}
            <div className="flex-1 overflow-y-auto relative bg-white">
                <div className="flex relative" style={{ height: containerHeight }}>
                    
                    {/* Time Axis */}
                    <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-gray-50 text-right pr-2 text-xs text-gray-500 font-medium pt-2 select-none sticky left-0 z-10 h-full">
                        {timeLabels.map((label, i) => (
                            <div key={i} style={{ height: HOUR_HEIGHT, top: i * HOUR_HEIGHT }} className="absolute right-2 w-full text-right">
                                <span className="-mt-2.5 block">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Columns */}
                    {COLUMNS.map((col, dayIndex) => (
                        <div key={col.id} className={`flex-1 border-r border-gray-200 relative last:border-r-0 ${col.id === 'ONLINE' ? 'bg-blue-50/10' : 'hover:bg-gray-50/30'} transition-colors`}>
                            
                            {/* Horizontal Guides (Only for standard time columns) */}
                            {col.id !== 'ONLINE' && timeLabels.map((_, i) => (
                                <div 
                                    key={i} 
                                    className="border-t border-gray-200 w-full absolute left-0 pointer-events-none" 
                                    style={{ height: HOUR_HEIGHT, top: i * HOUR_HEIGHT }}
                                ></div>
                            ))}
                            
                            {/* Events */}
                            {events.filter(e => e.dayIndex === dayIndex).map((evt, idx) => (
                                <div
                                    key={`${evt.id}-${dayIndex}-${idx}`}
                                    className={`absolute mx-1 rounded border-l-4 shadow-sm p-1.5 text-[10px] overflow-hidden cursor-pointer transition-all hover:z-50 hover:shadow-md hover:scale-[1.02] group leading-tight flex flex-col justify-start ${getStatusColorClass(evt.status)}`}
                                    style={{
                                        top: evt.top,
                                        height: evt.height,
                                        left: 0,
                                        right: 0,
                                        zIndex: 10
                                    }}
                                    title={`${evt.subject} ${evt.courseNumber} - ${evt.title}\n${evt.isOnlineEntry ? 'Online/TBA' : `${evt.beginTime} - ${evt.endTime}`}\n${evt.room}\n${evt.faculty}`}
                                >
                                    <div className="font-bold truncate text-xs mb-0.5">{evt.subject} {evt.courseNumber} <span className="font-normal opacity-75">- {evt.section}</span></div>
                                    
                                    {evt.isOnlineEntry ? (
                                        // Online Card Layout
                                        <>
                                            <div className="truncate text-gray-600 mb-0.5" title={evt.title}>{evt.title}</div>
                                            <div className="mt-auto flex justify-between items-end">
                                                <div className="flex items-center text-gray-500 font-medium truncate max-w-[70%]">
                                                    <User className="w-3 h-3 mr-1 flex-shrink-0" /> {evt.faculty || 'Staff'}
                                                </div>
                                                {evt.method === 'ONLINE' && <Laptop className="w-3 h-3 text-blue-400" />}
                                            </div>
                                        </>
                                    ) : (
                                        // Standard Time Card Layout
                                        <>
                                            <div className="truncate flex items-center text-gray-600 mb-0.5"><MapPin className="w-3 h-3 mr-0.5 inline flex-shrink-0" /> {evt.room}</div>
                                            {evt.faculty !== 'Staff' && (
                                                <div className="truncate flex items-center font-medium mt-auto"><User className="w-3 h-3 mr-0.5 inline flex-shrink-0" /> {evt.faculty}</div>
                                            )}
                                        </>
                                    )}
                                    
                                    {/* Hover Detail Popover (CSS only) */}
                                    <div className="hidden group-hover:block absolute left-0 top-0 w-full h-full bg-white/95 p-2 border-l-4 border-blue-500 text-[10px] z-20 overflow-hidden">
                                        <div className="font-bold text-blue-800 text-xs mb-1">{evt.title}</div>
                                        <div>{evt.isOnlineEntry ? 'Online / TBA' : `${evt.beginTime} - ${evt.endTime}`}</div>
                                        <div className="mt-1 text-gray-600">{evt.faculty}</div>
                                        <div className="text-gray-500 italic">{evt.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-gray-50 p-2 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                <span>Displaying {START_HOUR}:00 AM to {END_HOUR}:00 PM</span>
                <div className="flex space-x-4">
                    <span className="flex items-center"><span className="w-3 h-3 bg-blue-100 border border-blue-400 mr-1 rounded-sm"></span> Keep</span>
                    <span className="flex items-center"><span className="w-3 h-3 bg-green-100 border border-green-400 mr-1 rounded-sm"></span> Change</span>
                    <span className="flex items-center"><span className="w-3 h-3 bg-pink-100 border border-pink-400 mr-1 rounded-sm"></span> New</span>
                </div>
            </div>
        </div>
    );
};
