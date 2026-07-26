"use client"
import { useDashboard } from '@/hooks/useDashboard'

const DashboardOverview = () => {
  const { dashboardData } = useDashboard()

  const goalsCompleted = dashboardData.goals.filter(g => g.status === "Done").length
  const totalGoals     = dashboardData.goals.length

  const nearest = dashboardData.countdown
    .filter(c => new Date(c.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
  const daysRemaining = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)

  const totalCompleted = dashboardData.habits.reduce((s, h) => s + Math.min(h.completedDays.length, h.targetDays ?? 7), 0)
  const totalPossible  = dashboardData.habits.reduce((s, h) => s + (h.targetDays ?? 7), 0)
  const habitPct       = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0

  const booksRead  = dashboardData.readingList.filter(b => b.status === "Finished").length
  const totalBooks = dashboardData.readingList.length

  const stats = [
    { label: 'Goals Done',     value: totalGoals > 0 ? `${goalsCompleted}/${totalGoals}` : '—', sub: totalGoals > 0 ? `${Math.round((goalsCompleted/totalGoals)*100)}% complete` : 'No goals yet',              color: 'var(--accent-hi)' },
    { label: 'Next Countdown', value: nearest ? `${daysRemaining(nearest.date)}d` : '—',        sub: nearest?.name ?? 'No events set',                                                                            color: 'var(--blue)'      },
    { label: 'Habit Score',    value: totalPossible > 0 ? `${habitPct}%` : '—',                 sub: totalPossible > 0 ? `${totalCompleted}/${totalPossible} days` : 'No habits yet',                             color: 'var(--pink)'      },
    { label: 'Books Read',     value: totalBooks > 0 ? `${booksRead}/${totalBooks}` : '—',       sub: totalBooks > 0 ? `${totalBooks - booksRead} remaining` : 'No books yet',                                    color: 'var(--green)'     },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-5 py-[18px]">
          <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-[var(--text-2)] mb-2.5">{s.label}</div>
          <div className="text-[28px] font-bold leading-none mb-1" style={{ color: s.color }}>{s.value}</div>
          <div className="text-[11px] text-[var(--text-3)]">{s.sub}</div>
        </div>
      ))}
    </div>
  )
}

export default DashboardOverview
