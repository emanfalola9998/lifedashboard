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
    <div
      ref={setNodeRef}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-2.5 py-2 mb-1.5 group"
    >
      {/* drag handle area */}
      <div {...listeners} {...attributes} className="cursor-grab">
        <div className="flex items-start justify-between gap-1.5">
          <div className="text-[12px] font-medium text-[var(--text)] leading-[1.4] flex-1 min-w-0">{goal.text}</div>
          {/* action buttons — visible on hover */}
          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150" onClick={e => e.stopPropagation()}>
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => onEdit(goal)}
              className="text-[10px] px-1.5 py-0.5 rounded cursor-pointer text-[var(--text-3)] hover:text-[var(--accent)] bg-transparent border-none transition-colors duration-150"
              title="Edit"
            >✎</button>
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => dispatch(setDeleteGoal(goal.id))}
              className="text-[10px] px-1.5 py-0.5 rounded cursor-pointer text-[var(--text-3)] hover:text-[#f87171] bg-transparent border-none transition-colors duration-150"
              title="Delete"
            >×</button>
          </div>
        </div>

        {/* category + due date row */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {goal.category && (() => {
            const s = CATEGORY_CFG[goal.category!] ?? fallbackTag
            return (
              <span
                className="text-[9px] font-bold px-1.5 py-px rounded-full leading-none"
                style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
              >{goal.category}</span>
            )
          })()}
          {goal.dueDate && (
            <span className="text-[10px] text-[var(--text-3)]">· {goal.dueDate}</span>
          )}
        </div>
      </div>
    </div>
  )
}

interface GoalColumnProps { status: Status; goals: Goal[]; onEdit: (g: Goal) => void }

const GoalColumn = ({ status, goals, onEdit }: GoalColumnProps) => {
  const { setNodeRef } = useDroppable({ id: status })
  const cfg = STATUS_CFG[status]

  return (
    <div className="flex-1 flex flex-col bg-[var(--raised)] border border-[var(--border)] rounded-[14px] p-3 min-w-0">
      {/* column header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
            style={{ background: cfg.dot, boxShadow: `0 0 5px ${cfg.dot}` }}
          />
          <span
            className="text-[10px] font-bold px-2 py-[2px] rounded-full"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >{status}</span>
        </div>
        <span className="text-[10px] font-bold w-[18px] h-[18px] rounded-full bg-[var(--elevated)] text-[var(--text-3)] flex items-center justify-center">{goals.length}</span>
      </div>

      {/* scrollable card list */}
      <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-[200px] max-h-[480px] pr-0.5">
        {goals.map(g => <GoalCard key={g.id} goal={g} onEdit={onEdit} />)}
        {goals.length === 0 && (
          <div className="text-center pt-8 text-[11px] text-[var(--text-3)]">No goals</div>
        )}
      </div>
    </div>
  )
}

export default GoalColumn
