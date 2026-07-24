"use client"
import { setAddHabit, setDeleteHabit, toggleHabitday } from "@/app/store/dashboardSlice"
import { useDashboard } from "@/hooks/useDashboard"
import React, { useState } from "react"
import { useDispatch } from "react-redux"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const HabitTracker = () => {
  const [newText, setNewText] = useState("")
  const dispatch = useDispatch()
  const { dashboardData } = useDashboard()

  const add = () => {
    if (!newText.trim()) return
    dispatch(setAddHabit({ id: crypto.randomUUID(), name: newText.trim(), completedDays: [] }))
    setNewText("")
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-[26px] py-6">
      <div className="text-sm font-semibold text-[var(--text)] mb-5">Habit Tracker</div>

      <div className="flex flex-col gap-3">
        {dashboardData.habits.map(habit => {
          const done = habit.completedDays.length
          return (
            <div key={habit.id} className="bg-[var(--raised)] border border-[var(--border)] rounded-xl px-4 py-3.5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[var(--text)]">{habit.name}</span>
                  <span
                    className="text-[10px] font-bold px-[7px] py-0.5 rounded-full"
                    style={{ background: 'rgba(91,110,248,0.12)', color: 'var(--accent)', border: '1px solid rgba(91,110,248,0.15)' }}
                  >{done}/7</span>
                </div>
                <button
                  onClick={() => dispatch(setDeleteHabit(habit.id))}
                  className="bg-transparent border-none cursor-pointer text-[15px] text-[var(--text-3)] hover:text-[var(--red)] p-0.5 leading-none"
                >×</button>
              </div>
              <div className="flex gap-1.5">
                {DAYS.map(day => {
                  const completed = habit.completedDays.includes(day)
                  return (
                    <button
                      key={day}
                      onClick={() => dispatch(toggleHabitday({ id: habit.id, day }))}
                      className="flex-1 py-2 rounded-lg border-none cursor-pointer text-[11px] font-bold transition-all duration-150"
                      style={{
                        background: completed ? 'var(--accent)' : 'var(--elevated)',
                        color: completed ? '#fff' : 'var(--text-3)',
                        boxShadow: completed ? '0 2px 8px rgba(91,110,248,0.3)' : 'none',
                      }}
                    >{day}</button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {dashboardData.habits.length === 0 && (
          <div className="text-center py-6 text-[13px] text-[var(--text-3)]">No habits yet</div>
        )}
      </div>

      <div className="flex gap-2.5 mt-4">
        <input
          value={newText}
          placeholder="Add a habit..."
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          className="flex-1 bg-[var(--raised)] border border-[var(--border)] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[var(--text)] outline-none"
        />
        <button
          onClick={add}
          className="bg-[var(--accent)] text-white border-none rounded-[10px] px-[18px] py-2.5 text-[13px] font-semibold cursor-pointer"
        >Add</button>
      </div>
    </div>
  )
}

export default HabitTracker
