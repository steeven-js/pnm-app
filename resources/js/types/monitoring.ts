export type EventStatus = 'pending' | 'verified' | 'issue' | 'skipped';

export type MonitoringEvent = {
    id: number;
    event_type: string;
    event_date: string;
    status: EventStatus;
    notes: string | null;
    checked_items: string[] | null;
    verified_at: string | null;
};

export type HolidayDetail = {
    department: string;
    code: string;
    name: string;
};

export type MonitoringData = {
    events: MonitoringEvent[];
    isHoliday: boolean;
    holidayDetails: HolidayDetail[];
};

export type EventCategory = 'bascule' | 'vacation' | 'incident' | 'reporting' | 'supervision';

export type EmailSubject = {
    subject: string;
    origin: 'internal' | 'external';
};

export type CheckType = 'email' | 'server';

export type PnmEventConfig = {
    key: string;
    label: string;
    description: string;
    scheduledTime: string;
    icon: string;
    checklist: string[];
    category: EventCategory;
    checkType: CheckType;
    emailSubjects?: EmailSubject[];
};

export type EnrichedPnmEvent = PnmEventConfig & {
    isPast: boolean;
    isCurrent: boolean;
    isFuture: boolean;
    status: EventStatus;
    dbEvent: MonitoringEvent | null;
};
