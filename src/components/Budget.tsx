'use client'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useDashboard } from '@/hooks/useDashboard'
import { setBudgetSalary, addBudgetItem, editBudgetItem, deleteBudgetItem } from '@/app/store/dashboardSlice'
import { BudgetCategory, BudgetItem } from '@/app/types/dashboard'
import { AppDispatch } from '@/app/store/store'

const CATEGORIES: BudgetCategory[] = ["Bills", "Investment", "Subscription", "Insurance", "Food", "Transport", "Other"]

const CATEGORY_CFG: Record<BudgetCategory, { bg: string; color: string; border: string }> = {
  Bills:        { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.25)' },
  Investment:   { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.25)'  },
  Subscription: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: 'rgba(167,139,250,0.25)' },
  Insurance:    { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)'  },
  Food:         { bg: 'rgba(45,212,191,0.12)',  color: '#2dd4bf', border: 'rgba(45,212,191,0.25)'  },
  Transport:    { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa', border: 'rgba(96,165,250,0.25)'  },
  Other:        { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: 'rgba(148,163,184,0.25)' },
}

type ModalState = { mode: 'add' } | { mode: 'edit'; item: BudgetItem }

const fmt = (n: number) =>
  n.toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 })

function remainingColor(pct: number) {
  if (pct >= 50) return 'var(--green)'
  if (pct >= 20) return '#fbbf24'
  return '#f87171'
}

const Budget = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { dashboardData } = useDashboard()
  const { salary, items } = dashboardData.budget

  const [editingSalary, setEditingSalary] = useState(false)
  const [salaryDraft, setSalaryDraft]     = useState("")
  const [modal, setModal]                 = useState<ModalState | null>(null)
  const [name, setName]                   = useState("")
  const [amount, setAmount]               = useState("")
  const [category, setCategory]           = useState<BudgetCategory>("Bills")

  const totalOut  = items.reduce((s, i) => s + i.amount, 0)
  const remaining = salary - totalOut
  const pctUsed   = salary > 0 ? Math.round((totalOut / salary) * 100) : 0
  const pctLeft   = 100 - pctUsed

  const openAdd = () => {
    setName(""); setAmount(""); setCategory("Bills")
    setModal({ mode: 'add' })
  }

  const openEdit = (item: BudgetItem) => {
    setName(item.name); setAmount(String(item.amount)); setCategory(item.category)
    setModal({ mode: 'edit', item })
  }

  const close = () => setModal(null)

  const saveItem = () => {
    const amt = parseFloat(amount)
    if (!name.trim() || isNaN(amt) || amt <= 0) return
    const payload = { id: modal?.mode === 'edit' ? modal.item.id : crypto.randomUUID(), name: name.trim(), amount: amt, category }
    if (modal?.mode === 'add') dispatch(addBudgetItem(payload))
    else if (modal?.mode === 'edit') dispatch(editBudgetItem(payload))
    close()
  }

  const saveSalary = () => {
    const val = parseFloat(salaryDraft.replace(/[^0-9.]/g, ''))
    if (!isNaN(val) && val >= 0) dispatch(setBudgetSalary(val))
    setEditingSalary(false)
  }

  // Group items by category for the breakdown
  const byCategory = CATEGORIES.map(cat => ({
    cat,
    total: items.filter(i => i.category === cat).reduce((s, i) => s + i.amount, 0),
  })).filter(g => g.total > 0)

  const inputCls = "w-full bg-[var(--raised)] border border-[var(--border)] rounded-[10px] px-3.5 py-[11px] text-[13px] text-[var(--text)] outline-none"

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-[26px] py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-semibold text-[var(--text)]">Budget</span>
        <button
          onClick={openAdd}
          className="text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer"
          style={{ background: 'rgba(91,110,248,0.1)', color: 'var(--accent)', border: '1px solid rgba(91,110,248,0.2)' }}
        >+ Add deductible</button>
      </div>

      {/* Salary row */}
      <div className="bg-[var(--raised)] border border-[var(--border)] rounded-xl px-4 py-3.5 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--text-3)]">Monthly salary</span>
          {editingSalary ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={salaryDraft}
                onChange={e => setSalaryDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveSalary(); if (e.key === 'Escape') setEditingSalary(false) }}
                placeholder="0.00"
                className="w-32 bg-[var(--elevated)] border border-[var(--border-hi)] rounded-lg px-2.5 py-1 text-[13px] text-[var(--text)] outline-none text-right"
              />
              <button onClick={saveSalary} className="text-[11px] text-[var(--accent)] bg-transparent border-none cursor-pointer font-semibold">Save</button>
            </div>
          ) : (
            <button
              onClick={() => { setSalaryDraft(salary > 0 ? String(salary) : ""); setEditingSalary(true) }}
              className="text-[20px] font-bold text-[var(--text)] bg-transparent border-none cursor-pointer hover:text-[var(--accent)] transition-colors duration-150 tabular-nums"
            >
              {salary > 0 ? fmt(salary) : <span className="text-[13px] text-[var(--text-3)] font-medium">Click to set salary</span>}
            </button>
          )}
        </div>
      </div>

      {/* Summary bar */}
      {salary > 0 && (
        <div className="mb-5">
          <div className="flex justify-between text-[11px] text-[var(--text-3)] mb-1.5">
            <span>{pctUsed}% allocated</span>
            <span style={{ color: remainingColor(pctLeft) }}>{fmt(remaining)} remaining</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-[var(--elevated)]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(pctUsed, 100)}%`, background: pctLeft >= 50 ? '#34d399' : pctLeft >= 20 ? '#fbbf24' : '#f87171' }}
            />
          </div>
        </div>
      )}

      {/* Deductibles list */}
      {items.length > 0 && (
        <div className="flex flex-col gap-2 mb-5">
          {items.map(item => {
            const cfg = CATEGORY_CFG[item.category]
            const pct = salary > 0 ? Math.round((item.amount / salary) * 100) : 0
            return (
              <div key={item.id} className="flex items-center justify-between bg-[var(--raised)] border border-[var(--border)] rounded-xl px-4 py-3 group">
                <button onClick={() => openEdit(item)} className="flex items-center gap-3 bg-transparent border-none cursor-pointer text-left flex-1 min-w-0 p-0">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                  >{item.category}</span>
                  <span className="text-[13px] font-medium text-[var(--text)] truncate group-hover:text-[var(--accent)] transition-colors duration-150">{item.name}</span>
                </button>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right">
                    <div className="text-[13px] font-semibold text-[var(--text)] tabular-nums">{fmt(item.amount)}</div>
                    {salary > 0 && <div className="text-[10px] text-[var(--text-3)]">{pct}% of salary</div>}
                  </div>
                  <button
                    onClick={() => dispatch(deleteBudgetItem(item.id))}
                    className="bg-transparent border-none cursor-pointer text-[var(--text-3)] hover:text-[var(--red)] text-base leading-none p-1 transition-colors opacity-0 group-hover:opacity-100"
                  >×</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Category breakdown */}
      {byCategory.length > 0 && salary > 0 && (
        <div className="border-t border-[var(--border)] pt-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--text-3)] mb-3">Breakdown by category</div>
          <div className="flex flex-col gap-1.5">
            {byCategory.map(({ cat, total }) => {
              const cfg = CATEGORY_CFG[cat]
              const pct = Math.round((total / salary) * 100)
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold w-24 shrink-0" style={{ color: cfg.color }}>{cat}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--elevated)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: cfg.color }} />
                  </div>
                  <span className="text-[11px] text-[var(--text-3)] w-20 text-right tabular-nums shrink-0">{fmt(total)} · {pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-6 text-[13px] text-[var(--text-3)]">No deductibles yet — add bills, investments, subscriptions…</div>
      )}

      {/* Add / Edit modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-[6px] flex items-center justify-center z-[100]">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-7 w-full max-w-[420px]">
            <div className="text-[15px] font-semibold text-[var(--text)] mb-5">
              {modal.mode === 'add' ? 'Add deductible' : 'Edit deductible'}
            </div>
            <input
              placeholder="e.g. Rent, Netflix, Gym..."
              value={name}
              onChange={e => setName(e.target.value)}
              className={`${inputCls} mb-3`}
            />
            <input
              placeholder="Amount (£)"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={`${inputCls} mb-3`}
            />
            <select
              value={category}
              onChange={e => setCategory(e.target.value as BudgetCategory)}
              className={`${inputCls} mb-5 cursor-pointer`}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-2.5">
              <button onClick={saveItem} className="flex-1 bg-[var(--accent)] text-white border-none rounded-[10px] py-[11px] text-[13px] font-semibold cursor-pointer">Save</button>
              <button onClick={close} className="flex-1 bg-[var(--raised)] text-[var(--text-2)] border border-[var(--border)] rounded-[10px] py-[11px] text-[13px] font-semibold cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Budget
