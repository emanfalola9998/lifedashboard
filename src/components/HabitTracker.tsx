"use client"

import { setAddHabit, setDeleteHabit, toggleHabitday } from '@/app/store/dashboardSlice'
import { useDashboard } from '@/hooks/useDashboard'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

const HabitTracker = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [newText, setNewText] = useState<string>("")

    const dispatch = useDispatch()
    const { dashboardData } = useDashboard()
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    const handleAddHabit = () => {
        dispatch(setAddHabit({
            id: crypto.randomUUID(),
            name: newText,
            completedDays: []
        }))
        setNewText("")
    }

    const handleDeleteHabit = (id: string) => {
        dispatch(setDeleteHabit(id))
    }


    return (
        <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Habit Tracker</h2>

            <div className="space-y-4">
                {dashboardData.habits.map(habit => (
                    <div key={habit.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-white">{habit.name}</span>
                            <button
                                onClick={() => handleDeleteHabit(habit.id)}
                                className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                        <div className="flex gap-2">
                            {days.map(day => {
                                const completed = habit.completedDays.includes(day)
                                return (
                                    <button
                                        key={day}
                                        onClick={() => dispatch(toggleHabitday({ id: habit.id, day }))}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                            completed
                                                ? "bg-indigo-500 text-white"
                                                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                                        }`}
                                    >
                                        {day}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex gap-2">
                <input
                    value={newText}
                    placeholder="Add a new habit..."
                    onChange={e => setNewText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddHabit()}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
                />
                <button
                    onClick={handleAddHabit}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    + Add
                </button>
            </div>
        </div>
    )
}

export default HabitTracker
