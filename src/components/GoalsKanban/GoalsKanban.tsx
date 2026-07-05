"use client"

import React, { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useDispatch } from 'react-redux'
import GoalColumn from './GoalColumn/GoalColumn'
import { Category, Goal } from '@/app/types/dashboard'
import { setCreateGoal, setUpdateGoalStatus } from '@/app/store/dashboardSlice'
import type { Timeframe, Status } from '@/app/types/dashboard'
import { DndContext } from '@dnd-kit/core'

const GoalsKanban = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [text, setText] = useState<string>("")
  const [timeframe, setTimeframe] = useState<Timeframe>("Week")
  const [category, setCategory] = useState<Category>("Personal")
  const [dueDate, setDueDate] = useState<string>('')

  const dispatch = useDispatch()
  const { dashboardData } = useDashboard()

  const notStarted = dashboardData.goals.filter(goal => goal.status === "Not Started")
  const inProgress = dashboardData.goals.filter(goal => goal.status === "In Progress")
  const done = dashboardData.goals.filter(goal => goal.status === "Done")

  const handleAddGoal = () => {
    if (text === "") return

    dispatch(setCreateGoal({
      id: crypto.randomUUID(),
      text,
      status: "Not Started",
      timeframe,
      dueDate,
      category
    }))

    setIsOpen(false)
    setText("")
    setTimeframe("Week")
    setCategory("Personal")
    setDueDate("")
  }

  const handleDragEnd = (event) => { 
    if (!event.over) return 
    dispatch(setUpdateGoalStatus({id: event.active.id as string, status: event.over.id as Status}))
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Goals</h2>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Goal
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <DndContext onDragEnd={handleDragEnd}>
          <GoalColumn status="Not Started" goals={notStarted} />
          <GoalColumn status="In Progress" goals={inProgress} />
          <GoalColumn status="Done" goals={done} />
        </DndContext>
      </div>

      {isOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700'>
            <h2 className="text-lg font-semibold text-white mb-4">Add Goal</h2>

            <input
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder='Please enter goal here...'
            />

            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value as Timeframe)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Week">Week</option>
              <option value="Month">Month</option>
              <option value="Year">Year</option>
            </select>

            <select
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Personal">Personal</option>
              <option value="Health">Health</option>
              <option value="Work">Work</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className='flex gap-2 mt-4'>
              <button
                onClick={handleAddGoal}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default GoalsKanban
