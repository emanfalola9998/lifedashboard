"use client"
import { addScheduleItem, removeScheduleItem } from '@/app/store/dashboardSlice'
import { useDashboard } from '@/hooks/useDashboard'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

const DAYS: { key: string; tint: string; border: string; label: string }[] = [
  { key: 'Mon', label: 'Monday',    tint: 'rgba(96,165,250,0.07)',  border: 'rgba(96,165,250,0.18)'  },
  { key: 'Tue', label: 'Tuesday',   tint: 'rgba(52,211,153,0.07)',  border: 'rgba(52,211,153,0.18)'  },
  { key: 'Wed', label: 'Wednesday', tint: 'rgba(251,191,36,0.07)',  border: 'rgba(251,191,36,0.18)'  },
  { key: 'Thu', label: 'Thursday',  tint: 'rgba(167,139,250,0.07)', border: 'rgba(167,139,250,0.18)' },
  { key: 'Fri', label: 'Friday',    tint: 'rgba(244,114,182,0.07)', border: 'rgba(244,114,182,0.18)' },
  { key: 'Sat', label: 'Saturday',  tint: 'rgba(45,212,191,0.07)',  border: 'rgba(45,212,191,0.18)'  },
  { key: 'Sun', label: 'Sunday',    tint: 'rgba(248,113,113,0.07)', border: 'rgba(248,113,113,0.18)' },
]

const WeeklySchedule = () => {
  const dispatch = useDispatch()
  const { dashboardData } = useDashboard()
  const [inputs, setInputs] = useState<Record<string, string>>(
    DAYS.reduce((acc, d) => ({ ...acc, [d.key]: '' }), {})
  )
  const schedule = dashboardData.weekSchedule ?? {}

  const handleAdd = (day: string) => {
    const text = inputs[day].trim()
    if (!text) return
    dispatch(addScheduleItem({ day, text }))
    setInputs(prev => ({ ...prev, [day]: '' }))
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-[22px] py-5">
      <div className="text-[13px] font-semibold text-[var(--text)] mb-4">Weekly Schedule</div>

      <div className="grid grid-cols-7 gap-2">
        {DAYS.map(({ key, tint, border }) => {
          const items = schedule[key] ?? []
          return (
            <div
              key={key}
              style={{ background: tint, border: `1px solid ${border}` }}
              className="rounded-[10px] px-2.5 pt-2.5 pb-2 min-h-[150px] flex flex-col"
            >
              <div className="text-[10px] font-bold tracking-[0.06em] uppercase text-[var(--text-2)] mb-2.5">{key}</div>

              <div className="flex-1 flex flex-col gap-[5px]">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <div className="flex-1 text-[11px] text-[var(--text)] leading-[1.4] bg-black/25 rounded-md px-[7px] py-1 break-words">
                      {item}
                    </div>
                    <button
                      onClick={() => dispatch(removeScheduleItem({ day: key, index: i }))}
                      className="bg-transparent border-none cursor-pointer text-[var(--text-3)] hover:text-[var(--red)] text-sm leading-none px-0.5 py-[3px] shrink-0"
                    >×</button>
                  </div>
                ))}
              </div>

              <input
                value={inputs[key]}
                onChange={e => setInputs(prev => ({ ...prev, [key]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAdd(key)}
                placeholder="+ add"
                style={{ borderTop: `1px solid ${border}` }}
                className="w-full bg-transparent border-none pt-[7px] mt-1.5 text-[11px] text-[var(--text-2)] outline-none"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WeeklySchedule
