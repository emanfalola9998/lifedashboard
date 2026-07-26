export interface ReflectionEntry {
    id: string;
    text: string;
    createdAt: string;
}

export interface DashboardData {
    weekData: WeekData;
    goals: Goal[];
    habits: Habit[];
    readingList: ReadingItem[];
    countdown: Countdown[];
    weekSchedule: WeekSchedule;
    reflections: ReflectionEntry[];
    dailyIntention: string;
    reminders: Reminder[];
    appleCalendarUrl?: string;
}

export interface Task {
    id: string;
    text: string;
    completed: boolean;
}

export interface WeekData {
    tasks: Task[];
    gymDays: string[];
    focus: string;
    reflections: string;
}

export type Status = "Not Started" | "In Progress" | "Done"
export type Category = "Work" | "Personal" | "Secondary Income" | "Quarterly Goals" | "Personal Development" | "Career Development" | "Health/Fitness" | "Life Skils" | "Passion Projects"| "Milestones" | "Finances"
export type Timeframe = "Week" | "Month" | "Year"

export interface Goal {
    id: string;
    text: string;
    status: Status;
    dueDate: string;
    category?: Category;
}

export interface Habit {
    id: string;
    name: string;
    completedDays: string[];
    targetDays: number;
    weekOf?: string;
}

export type ReadingStatus = "Want to Read" | "Reading" | "Finished"

export interface ReadingItem {
    id: string;
    name: string;
    author: string;
    status: ReadingStatus;
    rating: number;
    review?: string;
}

export interface Countdown {
    id: string;
    name: string;
    date: string;
}

export type ReminderRecurrence = "once" | "weekly" | "monthly" | "yearly"

export interface Reminder {
    id: string;
    name: string;
    amount?: string;
    recurrence: ReminderRecurrence;
    nextDue: string;
}

export type WeekSchedule = {
    [day: string]: string[];
}
