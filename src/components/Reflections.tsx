'use client'
import { addReflection, deleteReflection } from '@/app/store/dashboardSlice'
import { AppDispatch } from '@/app/store/store'
import { useDashboard } from '@/hooks/useDashboard'
import { useState } from 'react'
import { useDispatch } from 'react-redux'

const Reflections = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { dashboardData } = useDashboard()
  const [text, setText] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleSave = () => {
    if (!text.trim()) return
    dispatch(addReflection({
      id: crypto.randomUUID(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
    }))
    setText("")
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-[22px] py-5">
      <div className="flex items-center gap-2 mb-3.5">
        <span className="text-[13px] font-semibold text-[var(--text)]">Reflections</span>
        <span
          className="text-[10px] font-bold tracking-[0.06em] uppercase px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(167,139,250,0.12)', color: 'var(--purple)', border: '1px solid rgba(167,139,250,0.2)' }}
        >Journal</span>
      </div>

      <textarea
        placeholder="How are you feeling? What went well? What could be better?"
        value={text}
        onChange={e => setText(e.target.value)}
        rows={5}
        className="w-full bg-[var(--raised)] border border-[var(--border)] rounded-[10px] px-3.5 py-3 text-[13px] text-[var(--text)] leading-[1.6] resize-none outline-none focus:border-[var(--border-hi)]"
      />

      <div
        className="flex justify-end mt-2.5"
        style={{ marginBottom: dashboardData.reflections.length > 0 ? 20 : 0 }}
      >
        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className="border-none rounded-lg px-5 py-2 text-xs font-semibold transition-all duration-150"
          style={{
            background: text.trim() ? 'var(--accent)' : 'var(--elevated)',
            color: text.trim() ? '#fff' : 'var(--text-3)',
            cursor: text.trim() ? 'pointer' : 'default',
          }}
        >Save note</button>
      </div>

      {dashboardData.reflections.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {dashboardData.reflections.map(entry => (
            <button
              key={entry.id}
              className="cursor-pointer text-left w-full bg-transparent border-none p-0"
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
            >
              <div className="bg-[var(--raised)] border border-[var(--border)] rounded-[10px] px-3.5 py-3">
                <div className="flex justify-between items-start gap-3">
                  <p className="text-[13px] text-[var(--text)] leading-[1.6] m-0 whitespace-pre-wrap">
                    {expandedId === entry.id ? entry.text : entry.text.substring(0, 20)}
                  </p>
                  <button
                    onClick={e => { e.stopPropagation(); dispatch(deleteReflection(entry.id)) }}
                    className="bg-transparent border-none cursor-pointer text-[var(--text-3)] hover:text-[var(--red)] text-[15px] leading-none shrink-0 px-1 py-0.5"
                  >×</button>
                </div>
                <div className="text-[10px] text-[var(--text-3)] mt-2">{formatDate(entry.createdAt)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reflections
