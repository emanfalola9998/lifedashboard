"use client"
import React, { useState, useEffect, useRef } from 'react'

const MODES = {
  work:  { label: 'Focus',       mins: 25, color: 'var(--accent)' },
  short: { label: 'Short Break', mins: 5,  color: 'var(--green)'  },
  long:  { label: 'Long Break',  mins: 15, color: 'var(--blue)'   },
}

type Mode = keyof typeof MODES

const PomodoroTimer = () => {
  const [mode, setMode]         = useState<Mode>('work')
  const [seconds, setSeconds]   = useState(MODES.work.mins * 60)
  const [running, setRunning]   = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef             = useRef<ReturnType<typeof setInterval> | null>(null)

  const total  = MODES[mode].mins * 60
  const pct    = (seconds / total) * 100
  const radius = 44
  const circ   = 2 * Math.PI * radius
  const dash   = (pct / 100) * circ

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setRunning(false)
            if (mode === 'work') setSessions(n => n + 1)
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, mode])

  const switchMode = (m: Mode) => {
    setRunning(false)
    setMode(m)
    setSeconds(MODES[m].mins * 60)
  }

  const reset = () => {
    setRunning(false)
    setSeconds(MODES[mode].mins * 60)
  }

  const mm  = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss  = String(seconds % 60).padStart(2, '0')
  const col = MODES[mode].color

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-[22px] py-5 flex flex-col items-center">
      <div className="text-[13px] font-semibold text-[var(--text)] mb-4 self-start">Pomodoro</div>

      {/* Mode tabs */}
      <div className="flex gap-1.5 mb-6 bg-[var(--raised)] rounded-lg p-1">
        {(Object.keys(MODES) as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className="px-2.5 py-[5px] rounded-md border-none cursor-pointer text-[11px] font-semibold transition-all duration-150"
            style={{
              background: mode === m ? MODES[m].color : 'transparent',
              color: mode === m ? '#fff' : 'var(--text-2)',
            }}
          >{MODES[m].label}</button>
        ))}
      </div>

      {/* Ring */}
      <div className="relative w-[130px] h-[130px] mb-5">
        <svg width="130" height="130" className="-rotate-90">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="var(--elevated)" strokeWidth="8" />
          <circle
            cx="65" cy="65" r={radius} fill="none"
            stroke={col} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px] font-bold text-[var(--text)] tabular-nums tracking-[-1px] leading-none">{mm}:{ss}</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em] mt-0.5" style={{ color: col }}>{MODES[mode].label}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2.5 mb-4">
        <button
          onClick={() => setRunning(r => !r)}
          className="py-[9px] px-7 rounded-lg border-none cursor-pointer text-[13px] font-bold text-white min-w-[90px]"
          style={{ background: col }}
        >{running ? 'Pause' : 'Start'}</button>
        <button
          onClick={reset}
          className="py-[9px] px-3.5 rounded-lg border border-[var(--border)] bg-[var(--raised)] text-[var(--text-2)] cursor-pointer text-[13px]"
        >Reset</button>
      </div>

      {/* Session dots */}
      <div className="flex gap-1.5 items-center">
        {[1, 2, 3, 4].map(n => (
          <div
            key={n}
            className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{ background: n <= (sessions % 4 || (sessions > 0 && sessions % 4 === 0 ? 4 : 0)) ? col : 'var(--elevated)' }}
          />
        ))}
        <span className="text-[11px] text-[var(--text-3)] ml-1">{sessions} session{sessions !== 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}

export default PomodoroTimer
