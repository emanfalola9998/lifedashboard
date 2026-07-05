import { createSlice } from "@reduxjs/toolkit"
import { PayloadAction } from "@reduxjs/toolkit"
import { DashboardData, Goal, Habit, Task, ReadingItem, ReadingStatus } from "../types/dashboard"
import { Status, Category } from "../types/dashboard"

const initialState = {
    dashboardData: {
        weekData: {
            tasks: [] as Task[],
            gymDays: [] as string[],
            focus: "",
            reflections: ""
        },
        goals:[] as Goal[],
        habits: [] as Habit[],
        readingList: [] as ReadingItem[]
        
    },
}

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        toggleTask: (state, action: PayloadAction<string>) => {
            const task = state.dashboardData.weekData.tasks.find(t => t.id === action.payload)
            if (task) task.completed = !task.completed
        },

        setDashboardData: (state, action: PayloadAction<DashboardData>) => {
            state.dashboardData = action.payload
        },

        addTask: (state, action: PayloadAction<Task>) => {
            state.dashboardData.weekData.tasks.push(action.payload) 
            // Redux Toolkit uses a library called Immer under the hood which allows you to mutate state directly like push — it looks like mutation but is actually immutable under the hood. You'd never do this in regular Redux.
        },

        toggleGymDay: (state, action: PayloadAction<string>) => {
            const gymDayPresent = state.dashboardData.weekData.gymDays.includes(action.payload)  
            if (gymDayPresent) {
                state.dashboardData.weekData.gymDays = state.dashboardData.weekData.gymDays.filter(day => day !== action.payload)
            }
            else {
                state.dashboardData.weekData.gymDays.push(action.payload)
            }
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

        setUpdateGoalStatus: (state, action: PayloadAction<{id: string, status: Status}>) => {
            const status = action.payload.status
            const id = action.payload.id
            const currentGoal = state.dashboardData.goals.find(goal => goal.id == id)
            if (currentGoal) currentGoal.status = status
        },
        // instead of accessing the whole goal we will deconstruct and access the id and status fields

        setDeleteGoal: (state, action: PayloadAction<string>) => {
            state.dashboardData.goals = state.dashboardData.goals.filter(goal => goal.id !== action.payload)
        },

        setAddHabit: (state, action: PayloadAction<Habit>) => {
            state.dashboardData.habits.push(action.payload)
        },

        setDeleteHabit: (state, action: PayloadAction<string>) => {
            state.dashboardData.habits = state.dashboardData.habits.filter(goal => goal.id !== action.payload)
        },

        toggleHabitday: (state, action: PayloadAction<{id: string, day: string}>) => {
            const habit = state.dashboardData.habits.find(habit => habit.id === action.payload.id)
            if (!habit) return
            const completedDay = habit.completedDays.includes(action.payload.day)
            if (completedDay) {
                habit.completedDays = habit.completedDays.filter(completedDay => completedDay !== action.payload.day)
            }
            else {
                habit.completedDays.push(action.payload.day)
            }
        },

        setAddReadingItem: (state, action: PayloadAction<ReadingItem>) => {
            state.dashboardData.readingList.push(action.payload)
        },

        setDeleteReadingItem: (state, action: PayloadAction<string>) => {
            state.dashboardData.readingList = state.dashboardData.readingList.filter(readingItem => readingItem.id !== action.payload)
        },

        setUpdateReadingStatus: (state, action: PayloadAction<{id: string, readingStatus: ReadingStatus}>) => {
            const book = state.dashboardData.readingList.find(book => book.id === action.payload.id)
            if(!book) return
            book.status = action.payload.readingStatus
        }}
})


export const {
    toggleTask,
    setDashboardData,
    addTask,
    toggleGymDay,
    setFocus,
    setReflections,
    setCreateGoal,
    setUpdateGoalStatus,
    setDeleteGoal,
    setAddHabit,
    setDeleteHabit,
    toggleHabitday,
    setAddReadingItem,
    setDeleteReadingItem,
    setUpdateReadingStatus
} = dashboardSlice.actions

export default dashboardSlice.reducer