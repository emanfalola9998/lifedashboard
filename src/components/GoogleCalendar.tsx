'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface CalendarEvent {
  id: string
  summary?: string
  start: { dateTime?: string; date?: string }
  end:   { dateTime?: string; date?: string }
  location?: string
}

interface GroupedEvents {
  label: string
  events: CalendarEvent[]
}

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9000'

function formatTime(dt: string): string {
  return new Date(dt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function getDayLabel(dateStr: string): string {
  const date  = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (sameDay(date, today))    return 'Today'
  if (sameDay(date, tomorrow)) return 'Tomorrow'
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
}

function groupByDay(events: CalendarEvent[]): GroupedEvents[] {
  const groups = new Map<string, { label: string; events: CalendarEvent[] }>()
  for (const ev of events) {
    const raw   = ev.start.dateTime ?? ev.start.date ?? ''
    const key   = raw.substring(0, 10)
    const label = getDayLabel(raw)
    if (!groups.has(key)) groups.set(key, { label, events: [] })
    groups.get(key)!.events.push(ev)
  }
  return Array.from(groups.values())
}

const GoogleCalendar = () => {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const [connected, setConnected]         = useState<boolean | null>(null)
  const [events, setEvents]               = useState<CalendarEvent[]>([])
  const [loading, setLoading]             = useState(true)
  const [eventsLoading, setEventsLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    if (window.location.search.includes('calendar=connected')) {
      window.history.replaceState({}, '', window.location.pathname)
    }
    checkStatus()
  }, [userId])

  const checkStatus = async () => {
    if (!userId) return
    try {
      const res  = await fetch(`${BACKEND}/calendar/status/${userId}`)
      const data = await res.json()
      setConnected(data.connected)
      if (data.connected) await loadEvents()
    } catch {
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const loadEvents = async () => {
    if (!userId) return
    setEventsLoading(true)
    try {
      const res  = await fetch(`${BACKEND}/calendar/events/${userId}`)
      const data = await res.json()
      setEvents(data.events ?? [])
    } finally {
      setEventsLoading(false)
    }
  }

  const connect = () => {
    window.location.href = `${BACKEND}/auth/google/redirect?userId=${userId}`
  }

  const disconnect = async () => {
    await fetch(`${BACKEND}/calendar/disconnect/${userId}`, { method: 'POST' })
    setConnected(false)
    setEvents([])
  }

  const grouped = groupByDay(events)

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-[26px] py-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-[var(--text)]">Google Calendar</span>
          {connected && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--green)', border: '1px solid rgba(52,211,153,0.2)' }}>
              Connected
            </span>
          )}
        </div>
        {connected && (
          <button
            onClick={disconnect}
            className="text-[11px] text-[var(--text-3)] hover:text-[var(--red)] bg-transparent border-none cursor-pointer transition-colors duration-150"
          >Disconnect</button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-[13px] text-[var(--text-3)]">Checking connection...</div>
      ) : !connected ? (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="text-[13px] text-[var(--text-3)] text-center">Connect your Google Calendar to see upcoming events alongside your schedule.</div>
          <button
            onClick={connect}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-150"
            style={{ background: 'rgba(91,110,248,0.1)', color: 'var(--accent)', border: '1px solid rgba(91,110,248,0.2)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"/>
            </svg>
            Connect Google Calendar
          </button>
        </div>
      ) : eventsLoading ? (
        <div className="text-center py-8 text-[13px] text-[var(--text-3)]">Loading events...</div>
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
                      {ev.start.dateTime
                        ? `${formatTime(ev.start.dateTime)} – ${formatTime(ev.end.dateTime!)}`
                        : 'All day'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[var(--text)] truncate">{ev.summary ?? '(No title)'}</div>
                      {ev.location && (
                        <div className="text-[11px] text-[var(--text-3)] truncate mt-0.5">{ev.location}</div>
                      )}
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

export default GoogleCalendar
