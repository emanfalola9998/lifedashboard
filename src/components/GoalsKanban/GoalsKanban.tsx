"use client"
import React, { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useDispatch } from 'react-redux'
import GoalColumn from './GoalColumn/GoalColumn'
import { Category } from '@/app/types/dashboard'
import { setCreateGoal, setUpdateGoalStatus } from '@/app/store/dashboardSlice'
import type { Status } from '@/app/types/dashboard'
import { DndContext } from '@dnd-kit/core'

const inputCls = "w-full bg-[var(--raised)] border border-[var(--border)] rounded-[10px] px-3.5 py-[11px] text-[13px] text-[var(--text)] outline-none mb-3"

const GoalsKanban = () => {
  const [isOpen, setIsOpen]     = useState(false)
  const [text, setText]         = useState("")
  const [category, setCategory] = useState<Category>("Personal")
  const [dueDate, setDueDate]   = useState("")

  const dispatch = useDispatch()
  const { dashboardData } = useDashboard()

  const notStarted = dashboardData.goals.filter(g => g.status === "Not Started")
  const inProgress = dashboardData.goals.filter(g => g.status === "In Progress")
  const done       = dashboardData.goals.filter(g => g.status === "Done")

  const handleAdd = () => {
    if (!text.trim()) return
    dispatch(setCreateGoal({ id: crypto.randomUUID(), text: text.trim(), status: "Not Started", dueDate, category }))
    setIsOpen(false); setText(""); setCategory("Personal"); setDueDate("")
  }

  const handleDragEnd = (event: any) => {
    if (!event.over) return
    dispatch(setUpdateGoalStatus({ id: event.active.id as string, status: event.over.id as Status }))
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs font-semibold px-4 py-[7px] rounded-lg cursor-pointer"
          style={{ background: 'rgba(91,110,248,0.1)', color: 'var(--accent)', border: '1px solid rgba(91,110,248,0.2)' }}
        >+ Add Goal</button>
      </div>

      <div className="flex gap-4">
        <DndContext onDragEnd={handleDragEnd}>
          <GoalColumn status="Not Started" goals={notStarted} />
          <GoalColumn status="In Progress" goals={inProgress} />
          <GoalColumn status="Done" goals={done} />
        </DndContext>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-[6px] flex items-center justify-center z-[100]">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-7 w-full max-w-[420px]">
            <div className="text-[15px] font-semibold text-[var(--text)] mb-5">Add Goal</div>
            <input value={text} onChange={e => setText(e.target.value)} className={inputCls} placeholder="What do you want to achieve?" />
            <select value={category} onChange={e => setCategory(e.target.value as Category)} className={`${inputCls} cursor-pointer`}>
              <option value="Secondary Income">Secondary Income</option>
              <option value="Quarterly Goals">Quarterly Goals</option>
              <option value="Personal Development">Personal Development</option>
              <option value="Career Development">Career Development</option>
              <option value="Finances">Finances</option>
              <option value="Life Skills">Life Skills</option>
              <option value="Passion Projects">Passion Projects</option>
              <option value="Milestones">Milestones</option>
              <option value="Health & Fitness">Health & Fitness</option>
              <option value="Work">Work</option>
            </select>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={`${inputCls} mb-5`} />
            <div className="flex gap-2.5">
              <button onClick={handleAdd} className="flex-1 bg-[var(--accent)] text-white border-none rounded-[10px] py-[11px] text-[13px] font-semibold cursor-pointer">Save</button>
              <button onClick={() => setIsOpen(false)} className="flex-1 bg-[var(--raised)] text-[var(--text-2)] border border-[var(--border)] rounded-[10px] py-[11px] text-[13px] font-semibold cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoalsKanban
