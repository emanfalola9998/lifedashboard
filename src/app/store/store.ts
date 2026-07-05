import { configureStore } from '@reduxjs/toolkit'
import dashboardSlice from './dashboardSlice'

export const store = configureStore({
  reducer: {
    dashboardSlice
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

