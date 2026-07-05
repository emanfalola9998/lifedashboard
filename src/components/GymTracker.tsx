'use client'
import { toggleGymDay } from '@/app/store/dashboardSlice'
import { AppDispatch } from '@/app/store/store'
import { useDashboard } from '@/hooks/useDashboard'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const GymTracker = () => {
    const dispatch = useDispatch<AppDispatch>()
    const gymDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const fullDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const { dashboardData } = useDashboard()
    const activeGymDays = dashboardData.weekData.gymDays


    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Gym Tracker</h2>
            
            <div className="flex gap-2">
                {fullDayNames.map((day, index) => {
                    const isActive = activeGymDays.includes(day)
                    return (
                        <button
                            key={day}
                            onClick={() => dispatch(toggleGymDay(day))}
                            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive 
                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            <div>{gymDays[index]}</div>
                            {isActive && <div className="text-xs mt-1">✓</div>}
                        </button>
                    )
                })}
            </div>

            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {activeGymDays.length} / 7 days this week
            </div>
        </div>
    )
}

export default GymTracker