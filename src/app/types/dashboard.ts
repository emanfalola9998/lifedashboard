
export interface DashboardData {
    weekData: WeekData;
    goals: Goal[];
    habits: Habit[];
    readingList: ReadingItem[];
}

// A single task
export interface Task {
    id: string;
    text: string;
    completed: boolean;
}

// The full week data
export interface WeekData {
    tasks: Task[];
    gymDays: string[];
    focus: string;
    reflections: string

}

export type Status = "Not Started" | "In Progress" | "Done"
export type Category = "Health" | "Work" | "Personal"
export type Timeframe = "Week" | "Month" | "Year"

export interface Goal {
    id: string;
    text: string;
    status: Status;
    timeframe: Timeframe;
    dueDate: string;
    category?: Category 
}

export interface Habit {
    id: string;
    name: string;
    completedDays: string[];
}

export type ReadingStatus = "Want to Read" | "Reading" | "Finished"

export interface ReadingItem {
    id: string;
    name: string;
    author: string;
    status: ReadingStatus
    rating: number,
    review?: string
}