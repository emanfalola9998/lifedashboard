'use client'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/app/store/store'
import { addReminder, deleteReminder, markReminderPaid } from '@/app/store/dashboardSlice'
import { useDashboard } from '@/hooks/useDashboard'
import { ReminderRecurrence } from '@/app/types/dashboard'

const inputCls = "w-full bg-[var(--raised)] border border-[var(--border)] rounded-[10px] px-3.5 py-[11px] text-[13px] text-[var(--text)] outline-none"
const selectCls = `${inputCls} cursor-pointer`

const RECURRENCE_LABELS: Record<ReminderRecurrence, string> = {
  once: "One-off",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
}

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

function urgencyColor(days: number) {
  if (days < 0)   return 'var(--text-3)'
  if (days <= 3)  return '#f87171'
  if (days <= 10) return '#fbbf24'
  return 'var(--green)'
}

const Reminders = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { dashboardData } = useDashboard()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName]           = useState("")
  const [amount, setAmount]       = useState("")
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>("monthly")
  const [nextDue, setNextDue]     = useState("")

  const add = () => {
    if (!name || !nextDue) return
    dispatch(addReminder({
      id: crypto.randomUUID(),
      name,
      amount: amount.trim() || undefined,
      recurrence,
      nextDue,
    }))
    setName(""); setAmount(""); setRecurrence("monthly"); setNextDue("")
    setIsOpen(false)
  }

  const sorted = [...dashboardData.reminders].sort((a, b) =>
    new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime()
  )

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-[26px] py-6">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-semibold text-[var(--text)]">Reminders</span>
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer"
          style={{ background: 'rgba(91,110,248,0.1)', color: 'var(--accent)', border: '1px solid rgba(91,110,248,0.2)' }}
        >+ Add</button>
      </div>

      <div className="flex flex-col gap-2.5">
        {sorted.map(r => {
          const days = daysUntil(r.nextDue)
          const color = urgencyColor(days)
          return (
            <div key={r.id} className="flex items-center justify-between bg-[var(--raised)] border border-[var(--border)] rounded-xl px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-[var(--text)] truncate">{r.name}</div>
                <div className="flex items-center gap-2 mt-[3px]">
                  {r.amount && (
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--green)' }}>{r.amount}</span>
                  )}
                  <span className="text-[10px] text-[var(--text-3)] uppercase tracking-[0.06em]">{RECURRENCE_LABELS[r.recurrence]}</span>
                  <span className="text-[10px] text-[var(--text-3)]">·</span>
                  <span className="text-[11px]" style={{ color }}>
                    {days < 0 ? 'Overdue' : days === 0 ? 'Due today' : `${days}d`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3 shrink-0">
                <button
                  onClick={() => dispatch(markReminderPaid(r.id))}
                  title={r.recurrence === 'once' ? 'Mark done' : 'Mark paid — advances to next period'}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer transition-all duration-150"
                  style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--green)', border: '1px solid rgba(52,211,153,0.2)' }}
                >✓</button>
                <button
                  onClick={() => dispatch(deleteReminder(r.id))}
                  className="bg-transparent border-none cursor-pointer text-[var(--text-3)] hover:text-[var(--red)] text-base leading-none p-1 transition-colors duration-150"
                >×</button>
              </div>
            </div>
          )
        })}

        {sorted.length === 0 && (
          <div className="text-center py-8 text-[13px] text-[var(--text-3)]">No reminders yet</div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-[6px] flex items-center justify-center z-[100]">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-7 w-full max-w-[420px]">
            <div className="text-[15px] font-semibold text-[var(--text)] mb-5">Add Reminder</div>
            <input
              placeholder="e.g. Emmanuel owes me..."
              value={name}
              onChange={e => setName(e.target.value)}
              className={`${inputCls} mb-3`}
            />
            <input
              placeholder="Amount (optional, e.g. £100)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={`${inputCls} mb-3`}
            />
            <select
              value={recurrence}
              onChange={e => setRecurrence(e.target.value as ReminderRecurrence)}
              className={`${selectCls} mb-3`}
            >
              <option value="once">One-off</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <div className="text-[11px] text-[var(--text-3)] mb-1.5 ml-0.5">Next due date</div>
            <input
              type="date"
              value={nextDue}
              onChange={e => setNextDue(e.target.value)}
              className={`${inputCls} mb-5`}
            />
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

export default Reminders
