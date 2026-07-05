'use client'
import { setFocus } from '@/app/store/dashboardSlice'
import { AppDispatch } from '@/app/store/store'
import { useDashboard } from '@/hooks/useDashboard'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const WeeklyFocus = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { dashboardData } = useDashboard()

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Weekly Focus</h2>
                <span className="text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                    This week
                </span>
            </div>
            <textarea
                placeholder="What is your main focus this week?"
                value={dashboardData.weekData.focus}
                onChange={(e) => dispatch(setFocus(e.target.value))}
                rows={3}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors"
            />
        </div>
    )
}

export default WeeklyFocus