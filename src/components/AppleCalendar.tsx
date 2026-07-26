'use client'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useDashboard } from '@/hooks/useDashboard'
import { setAppleCalendarUrl } from '@/app/store/dashboardSlice'

interface CalEvent {
  id: string
  summary?: string
  start: { dateTime?: string; date?: string }
  end:   { dateTime?: string; date?: string }
  location?: string
}

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9000'

function formatTime(dt: string) {
  return new Date(dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getDayLabel(raw: string) {
  const date     = new Date(raw)
  const today    = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const same     = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  if (same(date, today))    return 'Today'
  if (same(date, tomorrow)) return 'Tomorrow'
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
}

function groupByDay(events: CalEvent[]) {
  const groups = new Map<string, { label: string; events: CalEvent[] }>()
  for (const ev of events) {
    const raw = ev.start.dateTime ?? ev.start.date ?? ''
    const key = raw.substring(0, 10)
    if (!groups.has(key)) groups.set(key, { label: getDayLabel(raw), events: [] })
    groups.get(key)!.events.push(ev)
  }
  return Array.from(groups.values())
}

const AppleCalendar = () => {
  const dispatch = useDispatch()
  const { dashboardData } = useDashboard()
  const savedUrl = dashboardData.appleCalendarUrl ?? ""

  const [draft, setDraft]     = useState(savedUrl)
  const [editing, setEditing] = useState(!savedUrl)
  const [events, setEvents]   = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  useEffect(() => {
    if (savedUrl) loadEvents(savedUrl)
  }, [savedUrl])

  const loadEvents = async (url: string) => {
    setLoading(true); setError("")
    try {
      const res  = await fetch(`${BACKEND}/calendar/apple?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to load")
      setEvents(data.events ?? [])
    } catch (e: any) {
      setError(e.message ?? "Could not load calendar")
    } finally {
      setLoading(false)
    }
  }

  const save = () => {
    const url = draft.trim()
    if (!url) return
    dispatch(setAppleCalendarUrl(url))
    setEditing(false)
  }

  const remove = () => {
    dispatch(setAppleCalendarUrl(""))
    setDraft(""); setEvents([]); setEditing(true)
  }

  const grouped = groupByDay(events)

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-[26px] py-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          {/* Apple logo mark */}
          <svg width="13" height="16" viewBox="0 0 814 1000" fill="var(--text)" opacity="0.7">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 437.2 45 349.9 80.7 299.5c24.4-34.9 58.9-55.5 95.7-55.5 39.3 0 69.3 26.1 100.8 26.1 30.3 0 55.4-26.3 103.9-26.3 21.9 0 92.5 1.9 136.3 59.4zm-156.9-94.4c18.9-22.4 32.1-53.2 32.1-84 0-4.2-.3-8.5-1-12.5-30.7 1.2-67.4 20.7-89.5 46.1-16.9 19.2-32.7 50.3-32.7 81.5 0 4.7.6 9.4 1 11 1.9.3 5 .5 8 .5 27.7 0 62.2-18.2 82.1-42.6z"/>
          </svg>
          <span className="text-sm font-semibold text-[var(--text)]">Apple Calendar</span>
          {savedUrl && !editing && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--green)', border: '1px solid rgba(52,211,153,0.2)' }}>
              Connected
            </span>
          )}
        </div>
        {savedUrl && !editing && (
          <div className="flex gap-3">
            <button onClick={() => { setDraft(savedUrl); setEditing(true) }} className="text-[11px] text-[var(--text-3)] hover:text-[var(--text)] bg-transparent border-none cursor-pointer transition-colors">Edit URL</button>
            <button onClick={remove} className="text-[11px] text-[var(--text-3)] hover:text-[var(--red)] bg-transparent border-none cursor-pointer transition-colors">Disconnect</button>
          </div>
        )}
      </div>

      {editing ? (
        <div>
          <p className="text-[12px] text-[var(--text-3)] mb-3 leading-relaxed">
            In Apple Calendar, right-click a calendar → <strong className="text-[var(--text-2)]">Share Calendar</strong> → enable <strong className="text-[var(--text-2)]">Public Calendar</strong> → copy the link.
          </p>
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
              placeholder="webcal:// or https://..."
              className="flex-1 bg-[var(--raised)] border border-[var(--border)] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[var(--text)] outline-none"
            />
            <button
              onClick={save}
              className="bg-[var(--accent)] text-white border-none rounded-[10px] px-5 py-2.5 text-[13px] font-semibold cursor-pointer"
            >Connect</button>
            {savedUrl && (
              <button onClick={() => setEditing(false)} className="bg-[var(--raised)] border border-[var(--border)] text-[var(--text-2)] rounded-[10px] px-4 py-2.5 text-[13px] cursor-pointer">Cancel</button>
            )}
          </div>
        </div>
      ) : loading ? (
        <div className="text-center py-8 text-[13px] text-[var(--text-3)]">Loading events…</div>
      ) : error ? (
        <div className="text-center py-6">
          <div className="text-[13px] text-[var(--red)] mb-2">{error}</div>
          <button onClick={() => loadEvents(savedUrl)} className="text-[12px] text-[var(--accent)] bg-transparent border-none cursor-pointer">Retry</button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 text-[13px] text-[var(--text-3)]">No upcoming events in the next 2 weeks</div>
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(group => (
            <div key={group.label}>
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-3)] mb-2">{group.label}</div>
              <div className="flex flex-col gap-1.5">
                {group.events.map(ev => (
                  <div key={ev.id} className="flex items-start gap-3 bg-[var(--raised)] border border-[var(--border)] rounded-lg px-3 py-2.5">
                    <div className="text-[11px] text-[var(--text-3)] shrink-0 mt-px w-[72px]">
                      {ev.start.dateTime ? `${formatTime(ev.start.dateTime)} – ${formatTime(ev.end.dateTime!)}` : 'All day'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[var(--text)] truncate">{ev.summary ?? '(No title)'}</div>
                      {ev.location && <div className="text-[11px] text-[var(--text-3)] truncate mt-0.5">{ev.location}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AppleCalendar
