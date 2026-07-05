'use client'
import { setReflections } from '@/app/store/dashboardSlice'
import { AppDispatch } from '@/app/store/store'
import { useDashboard } from '@/hooks/useDashboard'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const Reflections = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { dashboardData } = useDashboard()


    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reflections</h2>
                <span className="text-xs bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium">
                    Journal
                </span>
            </div>

            <textarea
                placeholder="How are you feeling? What went well? What could be better?"
                value={dashboardData.weekData.reflections}
                onChange={(e) => dispatch(setReflections(e.target.value))}
                rows={5}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-colors"
            />

            <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-right">
                {dashboardData.weekData.reflections?.length ?? 0} characters
            </div>
        </div>
    )
}

export default Reflections