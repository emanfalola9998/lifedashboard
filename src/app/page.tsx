'use client'
import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Sidebar from '../components/Sidebar'
import Reflections from '../components/Reflections'
import GoalsKanban from '@/components/GoalsKanban/GoalsKanban'
import HabitTracker from '@/components/HabitTracker'
import ReadingList from '@/components/ReadingList'
import CountdownTimer from '@/components/CountdownTimer'
import DashboardOverview from '@/components/DashboardOverview'
import WeeklySchedule from '@/components/WeeklySchedule'
import PomodoroTimer from '@/components/PomodoroTimer'
import DailyIntention from '@/components/DailyIntention'
import GoogleCalendar from '@/components/GoogleCalendar'

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function Section({ label, emoji, children }: { label: string; emoji: string; children: React.ReactNode }) {
  return (
    <div className="mb-9">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
        <span className="text-[15px]">{emoji}</span>
        <span className="text-[13px] font-bold text-[var(--text)] tracking-[-0.1px]">{label}</span>
      </div>
      {children}
    </div>
  )
}

function SignInPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-10 py-12 w-full max-w-sm text-center">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)' }}
        >L</div>
        <div className="text-[18px] font-bold text-[var(--text)] mb-1">Life Dashboard</div>
        <div className="text-[13px] text-[var(--text-3)] mb-8">Your personal productivity hub</div>
        <button
          onClick={() => signIn('google')}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-[13px] font-semibold cursor-pointer transition-all duration-150"
          style={{ background: 'rgba(91,110,248,0.1)', color: 'var(--accent)', border: '1px solid rgba(91,110,248,0.2)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const { data: session, status } = useSession()
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-[13px] text-[var(--text-3)]">Loading...</div>
      </div>
    )
  }

  if (!session) return <SignInPage />

  const firstName = session.user.name?.split(' ')[0] ?? 'there'

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />

      <main className="ml-40 flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--border)] px-8 h-[52px] flex items-center justify-between">
          <span className="text-[13px] font-semibold text-[var(--text)]">
            {getGreeting()}, {firstName} 👋
          </span>
          <span className="text-[11px] text-[var(--text-3)]">{dateStr}</span>
        </div>

        {/* All content — single scroll */}
        <div className="px-8 pt-7 pb-[100px]">

          <div className="mb-9">
            <DashboardOverview />
          </div>

          <DailyIntention />

          <Section label="Weekly Schedule" emoji="📅">
            <div className="grid grid-cols-[1fr_270px] gap-3 items-start">
              <WeeklySchedule />
              <PomodoroTimer />
            </div>
          </Section>

          <Section label="Reflection & Countdowns" emoji="✍️">
            <div className="grid grid-cols-2 gap-3">
              <Reflections />
              <CountdownTimer />
            </div>
          </Section>

          <Section label="Calendar" emoji="📆">
            <GoogleCalendar />
          </Section>

          <Section label="Goals" emoji="🎯">
            <GoalsKanban />
          </Section>

          <Section label="Habits & Reading" emoji="📚">
            <div className="grid grid-cols-2 gap-3">
              <HabitTracker />
              <ReadingList />
            </div>
          </Section>

        </div>
      </main>
    </div>
  )
}
