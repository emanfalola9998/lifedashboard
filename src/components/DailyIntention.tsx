'use client'
import { setDailyIntention } from '@/app/store/dashboardSlice'
import { AppDispatch } from '@/app/store/store'
import { useDashboard } from '@/hooks/useDashboard'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

const DailyIntention = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { dashboardData } = useDashboard()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")

  useEffect(() => {
    setDraft(dashboardData.dailyIntention)
  }, [dashboardData.dailyIntention])

  const save = () => {
    dispatch(setDailyIntention(draft.trim()))
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') { setDraft(dashboardData.dailyIntention); setEditing(false) }
  }

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-5 py-4 flex items-center gap-4 mb-9">
      <div className="shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-3)] mb-0.5">Daily Intention</div>
        <div className="text-[10px] text-[var(--text-3)]">{today}</div>
      </div>

      <div className="w-px h-8 bg-[var(--border)]" />

      <div className="flex-1">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={save}
            placeholder="What's your intention for today?"
            className="w-full bg-transparent border-none outline-none text-[13px] text-[var(--text)] placeholder:text-[var(--text-3)]"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-full text-left bg-transparent border-none cursor-text p-0"
          >
            {dashboardData.dailyIntention ? (
              <span className="text-[13px] text-[var(--text)]">{dashboardData.dailyIntention}</span>
            ) : (
              <span className="text-[13px] text-[var(--text-3)] italic">What's your intention for today? Click to set one...</span>
            )}
          </button>
        )}
      </div>

      {dashboardData.dailyIntention && !editing && (
        <button
          onClick={() => { dispatch(setDailyIntention("")); setDraft("") }}
          className="shrink-0 bg-transparent border-none cursor-pointer text-[var(--text-3)] hover:text-[var(--red)] text-sm leading-none px-1"
        >×</button>
      )}
    </div>
  )
}

export default DailyIntention
