"use client"
import { setAddCountdown, setDeleteCountdown } from '@/app/store/dashboardSlice'
import { AppDispatch } from '@/app/store/store'
import { useDashboard } from '@/hooks/useDashboard'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

const inputCls = "w-full bg-[var(--raised)] border border-[var(--border)] rounded-[10px] px-3.5 py-[11px] text-[13px] text-[var(--text)] outline-none"

const daysColor = (days: number) => {
  if (days < 0)   return '#475569'
  if (days <= 7)  return '#f87171'
  if (days <= 30) return '#fbbf24'
  return '#60a5fa'
}

const CountdownTimer = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { dashboardData } = useDashboard()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName]     = useState("")
  const [date, setDate]     = useState("")

  const add = () => {
    if (!name || !date) return
    dispatch(setAddCountdown({ id: crypto.randomUUID(), name, date }))
    setName(""); setDate(""); setIsOpen(false)
  }

  const days = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-[26px] py-6">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-semibold text-[var(--text)]">Countdowns</span>
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer"
          style={{ background: 'rgba(91,110,248,0.1)', color: 'var(--accent)', border: '1px solid rgba(91,110,248,0.2)' }}
        >+ Add</button>
      </div>

      <div className="flex flex-col gap-2.5">
        {dashboardData.countdown.map(c => {
          const d = days(c.date)
          return (
            <div
              key={c.id}
              className="flex items-center justify-between bg-[var(--raised)] border border-[var(--border)] rounded-xl px-4 py-3.5"
            >
              <div>
                <div className="text-[13px] font-semibold text-[var(--text)]">{c.name}</div>
                <div className="text-[11px] text-[var(--text-3)] mt-[3px]">
                  {new Date(c.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[26px] font-bold leading-none tabular-nums" style={{ color: daysColor(d) }}>
                    {d < 0 ? 0 : d}
                  </div>
                  <div className="text-[10px] font-semibold tracking-[0.06em] uppercase text-[var(--text-3)] mt-0.5">
                    {d < 0 ? 'passed' : 'days'}
                  </div>
                </div>
                <button
                  onClick={() => dispatch(setDeleteCountdown(c.id))}
                  className="bg-transparent border-none cursor-pointer text-[var(--text-3)] hover:text-[var(--red)] text-base leading-none p-1 transition-colors duration-150"
                >×</button>
              </div>
            </div>
          )
        })}

        {dashboardData.countdown.length === 0 && (
          <div className="text-center py-8 text-[13px] text-[var(--text-3)]">No countdowns yet</div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-[6px] flex items-center justify-center z-[100]">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-7 w-full max-w-[420px]">
            <div className="text-[15px] font-semibold text-[var(--text)] mb-5">Add Countdown</div>
            <input placeholder="Event name..." value={name} onChange={e => setName(e.target.value)} className={`${inputCls} mb-3`} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`${inputCls} mb-5`} />
            <div className="flex gap-2.5">
              <button onClick={add} className="flex-1 bg-[var(--accent)] text-white border-none rounded-[10px] py-[11px] text-[13px] font-semibold cursor-pointer">Save</button>
              <button onClick={() => setIsOpen(false)} className="flex-1 bg-[var(--raised)] text-[var(--text-2)] border border-[var(--border)] rounded-[10px] py-[11px] text-[13px] font-semibold cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CountdownTimer
