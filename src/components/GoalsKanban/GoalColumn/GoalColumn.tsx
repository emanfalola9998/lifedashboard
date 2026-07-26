'use client'
import { setDeleteGoal } from '@/app/store/dashboardSlice'
import { AppDispatch } from '@/app/store/store'
import type { Goal, Status } from '@/app/types/dashboard'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useDispatch } from 'react-redux'

const STATUS_CFG: Record<Status, { dot: string; bg: string; color: string; border: string }> = {
  "Not Started": { dot: '#475569', bg: 'rgba(71,85,105,0.12)',  color: '#94a3b8', border: 'rgba(71,85,105,0.25)'  },
  "In Progress":  { dot: '#3b82f6', bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  "Done":         { dot: '#10b981', bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.25)' },
}

type TagStyle = { bg: string; color: string; border: string }

const CATEGORY_CFG: Record<string, TagStyle> = {
  "Work":                 { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', border: 'rgba(59,130,246,0.25)'  },
  "Personal":             { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: 'rgba(167,139,250,0.25)' },
  "Secondary Income":     { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.25)'  },
  "Quarterly Goals":      { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)'  },
  "Personal Development": { bg: 'rgba(45,212,191,0.12)',  color: '#2dd4bf', border: 'rgba(45,212,191,0.25)'  },
  "Career Development":   { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8', border: 'rgba(99,102,241,0.25)'  },
  "Health/Fitness":       { bg: 'rgba(244,114,182,0.12)', color: '#f472b6', border: 'rgba(244,114,182,0.25)' },
  "Life Skils":           { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c', border: 'rgba(251,146,60,0.25)'  },
  "Passion Projects":     { bg: 'rgba(192,132,252,0.12)', color: '#c084fc', border: 'rgba(192,132,252,0.25)' },
  "Milestones":           { bg: 'rgba(250,204,21,0.12)',  color: '#facc15', border: 'rgba(250,204,21,0.25)'  },
  "Finances":             { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: 'rgba(16,185,129,0.25)'  },
}

const fallbackTag: TagStyle = { bg: 'var(--elevated)', color: 'var(--text-2)', border: 'var(--border)' }

const GoalCard = ({ goal, onEdit }: { goal: Goal; onEdit: (g: Goal) => void }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { attributes, listeners, setNodeRef } = useDraggable({ id: goal.id })

  return (
    <div ref={setNodeRef} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3.5 mb-2.5">
      <div {...listeners} {...attributes} className="cursor-grab">
        <div className="text-[13px] font-medium text-[var(--text)] leading-[1.5] mb-2.5">{goal.text}</div>
        <div className="flex gap-1.5 flex-wrap">
          {goal.category && (() => {
            const s = CATEGORY_CFG[goal.category!] ?? fallbackTag
            return (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
              >
                {goal.category}
              </span>
            )
          })()}
        </div>
        {goal.dueDate && <div className="text-[11px] text-[var(--text-3)] mt-2">Due {goal.dueDate}</div>}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onEdit(goal)}
          className="flex-1 bg-transparent border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] rounded-lg py-1.5 text-xs text-[var(--text-3)] cursor-pointer transition-all duration-150"
        >Edit</button>
        <button
          onClick={() => dispatch(setDeleteGoal(goal.id))}
          className="flex-1 bg-transparent border border-[var(--border)] hover:border-[#f87171] hover:text-[#f87171] rounded-lg py-1.5 text-xs text-[var(--text-3)] cursor-pointer transition-all duration-150"
        >Delete</button>
      </div>
    </div>
  )
}

interface GoalColumnProps { status: Status; goals: Goal[]; onEdit: (g: Goal) => void }

const GoalColumn = ({ status, goals, onEdit }: GoalColumnProps) => {
  const { setNodeRef } = useDroppable({ id: status })
  const cfg = STATUS_CFG[status]

  return (
    <div ref={setNodeRef} className="flex-1 bg-[var(--raised)] border border-[var(--border)] rounded-[14px] p-4 min-h-[280px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }}
          />
          <span
            className="text-xs font-bold px-2.5 py-[3px] rounded-full"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >{status}</span>
        </div>
        <span className="text-[11px] font-bold w-[22px] h-[22px] rounded-full bg-[var(--elevated)] text-[var(--text-3)] flex items-center justify-center">{goals.length}</span>
      </div>
      {goals.map(g => <GoalCard key={g.id} goal={g} onEdit={onEdit} />)}
    </div>
  )
}

export default GoalColumn
