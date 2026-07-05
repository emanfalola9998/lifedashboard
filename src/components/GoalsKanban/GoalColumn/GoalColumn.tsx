'use client'

import { setDeleteGoal } from '@/app/store/dashboardSlice'
import { AppDispatch } from '@/app/store/store'
import type { Goal, Status } from '@/app/types/dashboard'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useDispatch } from 'react-redux'

const GoalCard = ({ goal }: { goal: Goal }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { attributes, listeners, setNodeRef } = useDraggable({ id: goal.id })

  const handleDelete = () => {
    dispatch(setDeleteGoal(goal.id))
  }

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-800 rounded-lg p-3 mb-2 border border-gray-700 hover:border-indigo-500 transition-colors"
    >
      <div {...listeners} {...attributes} className="cursor-grab">
        <h1 className='text-sm font-medium text-white'>{goal.text}</h1>
        <div className='flex gap-2 mt-1'>
          <span className='text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full'>{goal.category}</span>
          <span className='text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full'>{goal.timeframe}</span>
        </div>
        <p className='text-xs text-gray-500 mt-2 text-right'>Due: {goal.dueDate}</p>
      </div>
      <button
        onClick={handleDelete}
        className="mt-3 w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 py-1 rounded-lg transition-colors"
      >
        Delete
      </button>
    </div>
  )
}

interface GoalColumnProps {
  status: Status
  goals: Goal[]
}

const GoalColumn = ({ status, goals }: GoalColumnProps) => {
  const { setNodeRef } = useDroppable({id: status})

  const getStatusColor = () => {
    if (status === "Not Started") return "bg-gray-700 text-gray-300"
    if (status === "In Progress") return "bg-blue-500/20 text-blue-400"
    return "bg-green-500/20 text-green-400"
  }




  return (
    <div className="bg-gray-900 rounded-xl p-4 min-h-64 flex-1" ref={setNodeRef}>
      <div className="flex items-center justify-between mb-4">
        <span className={`text-sm font-medium px-2 py-1 rounded-lg ${getStatusColor()}`}>
          {status}
        </span>
        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
          {goals.length}
        </span>
      </div>

      {goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
    </div>
  )
}

export default GoalColumn
