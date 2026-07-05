'use client'
import { useDispatch } from 'react-redux'
import { toggleTask, addTask } from '@/app/store/dashboardSlice'
import { useDashboard } from '@/hooks/useDashboard'
import { AppDispatch } from '@/app/store/store'
import { useEffect, useState } from 'react'

export default function TaskChecklist() {
    const [newTaskText, setNewTaskText] = useState<string>("")
    const dispatch = useDispatch<AppDispatch>()
    const { dashboardData } = useDashboard()
    

    
    const handleAddTask = () => {
        if (!newTaskText) return  
        dispatch(addTask({
            id: crypto.randomUUID(),
            text: newTaskText,
            completed: false,
        }))
        setNewTaskText("")
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Tasks</h2>

            <div className="space-y-1 mb-4">
                {dashboardData?.weekData?.tasks?.map(task => (
                    <div 
                        key={task.id} 
                        className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => dispatch(toggleTask(task.id))}
                            className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                        />
                        <span className={`text-sm flex-1 ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}`}>
                            {task.text}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 mt-4">
                <input 
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    placeholder="Add a task..."
                    className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                />
                <button 
                    onClick={handleAddTask}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    Add
                </button>
            </div>
        </div>
    )
}