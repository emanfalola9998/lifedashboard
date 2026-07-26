import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { DashboardData, Goal, Habit, Task, ReadingItem, ReadingStatus, Status, Category, Countdown, WeekSchedule, ReflectionEntry, Reminder, ReminderRecurrence } from "../types/dashboard"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const initialState = {
    dashboardData: {
        weekData: {
            tasks: [] as Task[],
            gymDays: [] as string[],
            focus: "",
            reflections: "",
        },
        goals: [] as Goal[],
        habits: [] as Habit[],
        readingList: [] as ReadingItem[],
        countdown: [] as Countdown[],
        weekSchedule: DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {}) as WeekSchedule,
        reflections: [] as ReflectionEntry[],
        dailyIntention: "",
        reminders: [] as Reminder[],
        appleCalendarUrl: "",
    },
}

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        setDashboardData: (state, action: PayloadAction<DashboardData>) => {
            state.dashboardData = {
                ...action.payload,
                weekSchedule: action.payload.weekSchedule ?? DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {}),
                reflections: action.payload.reflections ?? [],
                dailyIntention: action.payload.dailyIntention ?? "",
                reminders: action.payload.reminders ?? [],
                habits: (action.payload.habits ?? []).map(h => ({ ...h, targetDays: h.targetDays ?? 7 })),
                appleCalendarUrl: action.payload.appleCalendarUrl ?? "",
            }
        },

        setDailyIntention: (state, action: PayloadAction<string>) => {
            state.dashboardData.dailyIntention = action.payload
        },

        toggleTask: (state, action: PayloadAction<string>) => {
            const task = state.dashboardData.weekData.tasks.find(t => t.id === action.payload)
            if (task) task.completed = !task.completed
        },

        addTask: (state, action: PayloadAction<Task>) => {
            state.dashboardData.weekData.tasks.push(action.payload)
        },

        toggleGymDay: (state, action: PayloadAction<string>) => {
            const present = state.dashboardData.weekData.gymDays.includes(action.payload)
            if (present) state.dashboardData.weekData.gymDays = state.dashboardData.weekData.gymDays.filter(d => d !== action.payload)
            else state.dashboardData.weekData.gymDays.push(action.payload)
        },

        setFocus: (state, action: PayloadAction<string>) => {
            state.dashboardData.weekData.focus = action.payload
        },

        setReflections: (state, action: PayloadAction<string>) => {
            state.dashboardData.weekData.reflections = action.payload
        },

        setCreateGoal: (state, action: PayloadAction<Goal>) => {
            state.dashboardData.goals.push(action.payload)
        },

        setUpdateGoalStatus: (state, action: PayloadAction<{ id: string; status: Status }>) => {
            const goal = state.dashboardData.goals.find(g => g.id === action.payload.id)
            if (goal) goal.status = action.payload.status
        },

        setDeleteGoal: (state, action: PayloadAction<string>) => {
            state.dashboardData.goals = state.dashboardData.goals.filter(g => g.id !== action.payload)
        },

        setEditGoal: (state, action: PayloadAction<Goal>) => {
            const g = state.dashboardData.goals.find(g => g.id === action.payload.id)
            if (g) { g.text = action.payload.text; g.dueDate = action.payload.dueDate; g.category = action.payload.category }
        },

        setAddHabit: (state, action: PayloadAction<Habit>) => {
            state.dashboardData.habits.push(action.payload)
        },

        setDeleteHabit: (state, action: PayloadAction<string>) => {
            state.dashboardData.habits = state.dashboardData.habits.filter(h => h.id !== action.payload)
        },

        toggleHabitday: (state, action: PayloadAction<{ id: string; day: string }>) => {
            const habit = state.dashboardData.habits.find(h => h.id === action.payload.id)
            if (!habit) return
            const has = habit.completedDays.includes(action.payload.day)
            if (has) habit.completedDays = habit.completedDays.filter(d => d !== action.payload.day)
            else habit.completedDays.push(action.payload.day)
        },

        setAddReadingItem: (state, action: PayloadAction<ReadingItem>) => {
            state.dashboardData.readingList.push(action.payload)
        },

        setDeleteReadingItem: (state, action: PayloadAction<string>) => {
            state.dashboardData.readingList = state.dashboardData.readingList.filter(r => r.id !== action.payload)
        },

        setUpdateReadingItem: (state, action: PayloadAction<{ id: string; review: string; rating: number; readingStatus: ReadingStatus; name: string; author: string }>) => {
            const book = state.dashboardData.readingList.find(b => b.id === action.payload.id)
            if (!book) return
            book.status = action.payload.readingStatus
            book.rating = action.payload.rating
            book.review = action.payload.review
            book.author = action.payload.author
            book.name   = action.payload.name
        },

        setAddCountdown: (state, action: PayloadAction<Countdown>) => {
            state.dashboardData.countdown.push(action.payload)
        },

        setDeleteCountdown: (state, action: PayloadAction<string>) => {
            state.dashboardData.countdown = state.dashboardData.countdown.filter(c => c.id !== action.payload)
        },

        setEditCountdown: (state, action: PayloadAction<Countdown>) => {
            const c = state.dashboardData.countdown.find(c => c.id === action.payload.id)
            if (c) { c.name = action.payload.name; c.date = action.payload.date }
        },

        addReminder: (state, action: PayloadAction<Reminder>) => {
            state.dashboardData.reminders.push(action.payload)
        },

        deleteReminder: (state, action: PayloadAction<string>) => {
            state.dashboardData.reminders = state.dashboardData.reminders.filter(r => r.id !== action.payload)
        },

        editReminder: (state, action: PayloadAction<Reminder>) => {
            const r = state.dashboardData.reminders.find(r => r.id === action.payload.id)
            if (r) { r.name = action.payload.name; r.amount = action.payload.amount; r.recurrence = action.payload.recurrence; r.nextDue = action.payload.nextDue }
        },

        markReminderPaid: (state, action: PayloadAction<string>) => {
            const r = state.dashboardData.reminders.find(r => r.id === action.payload)
            if (!r) return
            if (r.recurrence === "once") {
                state.dashboardData.reminders = state.dashboardData.reminders.filter(x => x.id !== action.payload)
                return
            }
            const d = new Date(r.nextDue)
            if (r.recurrence === "weekly")  d.setDate(d.getDate() + 7)
            if (r.recurrence === "monthly") d.setMonth(d.getMonth() + 1)
            if (r.recurrence === "yearly")  d.setFullYear(d.getFullYear() + 1)
            r.nextDue = d.toISOString().substring(0, 10)
        },

        addReflection: (state, action: PayloadAction<ReflectionEntry>) => {
            state.dashboardData.reflections.unshift(action.payload)
        },

        deleteReflection: (state, action: PayloadAction<string>) => {
            state.dashboardData.reflections = state.dashboardData.reflections.filter(r => r.id !== action.payload)
        },

        setAppleCalendarUrl: (state, action: PayloadAction<string>) => {
            state.dashboardData.appleCalendarUrl = action.payload
        },

        addScheduleItem: (state, action: PayloadAction<{ day: string; text: string }>) => {
            const { day, text } = action.payload
            if (!state.dashboardData.weekSchedule[day]) state.dashboardData.weekSchedule[day] = []
            state.dashboardData.weekSchedule[day].push(text)
        },

        removeScheduleItem: (state, action: PayloadAction<{ day: string; index: number }>) => {
            const { day, index } = action.payload
            state.dashboardData.weekSchedule[day].splice(index, 1)
        },
    },
})

export const {
    setDashboardData,
    setDailyIntention,
    toggleTask, addTask,
    toggleGymDay,
    setFocus, setReflections,
    setCreateGoal, setUpdateGoalStatus, setDeleteGoal, setEditGoal,
    setAddHabit, setDeleteHabit, toggleHabitday,
    setAddReadingItem, setDeleteReadingItem, setUpdateReadingItem,
    setAddCountdown, setDeleteCountdown, setEditCountdown,
    addScheduleItem, removeScheduleItem,
    addReflection, deleteReflection,
    addReminder, deleteReminder, markReminderPaid, editReminder,
    setAppleCalendarUrl,
} = dashboardSlice.actions

export default dashboardSlice.reducer
