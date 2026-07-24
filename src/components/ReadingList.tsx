'use client'
import { setAddReadingItem, setDeleteReadingItem, setUpdateReadingItem } from '@/app/store/dashboardSlice'
import { AppDispatch } from '@/app/store/store'
import { ReadingItem, ReadingStatus } from '@/app/types/dashboard'
import { useDashboard } from '@/hooks/useDashboard'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

const STATUS_STYLE: Record<ReadingStatus, { bg: string; color: string; border: string }> = {
  "Want to Read": { bg: 'rgba(71,85,105,0.2)',  color: '#94a3b8', border: 'rgba(71,85,105,0.3)'  },
  "Reading":      { bg: 'rgba(37,99,235,0.15)', color: '#60a5fa', border: 'rgba(37,99,235,0.25)' },
  "Finished":     { bg: 'rgba(4,120,87,0.15)',  color: '#34d399', border: 'rgba(4,120,87,0.25)'  },
}

const inputCls = "w-full bg-[var(--raised)] border border-[var(--border)] rounded-[10px] px-3.5 py-[11px] text-[13px] text-[var(--text)] outline-none mb-3"

const Stars = ({ val, onChange }: { val: number; onChange: (n: number) => void }) => (
  <div className="flex gap-1 mb-4">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)} className="bg-transparent border-none cursor-pointer text-xl p-0 leading-none" style={{ color: n <= val ? '#fbbf24' : 'var(--elevated)' }}>★</button>
    ))}
  </div>
)

const StatusSelect = ({ val, onChange }: { val: ReadingStatus; onChange: (s: ReadingStatus) => void }) => (
  <select value={val} onChange={e => onChange(e.target.value as ReadingStatus)} className={`${inputCls} cursor-pointer`}>
    <option value="Want to Read">Want to Read</option>
    <option value="Reading">Reading</option>
    <option value="Finished">Finished</option>
  </select>
)

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/65 backdrop-blur-[6px] flex items-center justify-center z-[100]">
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-7 w-full max-w-[420px]">
      <div className="text-[15px] font-semibold text-[var(--text)] mb-5">{title}</div>
      {children}
    </div>
  </div>
)

const BtnRow = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
  <div className="flex gap-2.5">
    <button onClick={onSave} className="flex-1 bg-[var(--accent)] text-white border-none rounded-[10px] py-[11px] text-[13px] font-semibold cursor-pointer">Save</button>
    <button onClick={onCancel} className="flex-1 bg-[var(--raised)] text-[var(--text-2)] border border-[var(--border)] rounded-[10px] py-[11px] text-[13px] font-semibold cursor-pointer">Cancel</button>
  </div>
)

const ReadingList = () => {
  const [name, setName]       = useState("")
  const [author, setAuthor]   = useState("")
  const [rating, setRating]   = useState(0)
  const [status, setStatus]   = useState<ReadingStatus>("Want to Read")
  const [review, setReview]   = useState<string | undefined>("")
  const [isOpen, setIsOpen]   = useState(false)
  const [editing, setEditing] = useState<ReadingItem | null>(null)

  const { dashboardData } = useDashboard()
  const dispatch = useDispatch<AppDispatch>()

  const handleAdd = () => {
    if (!name || !author) return
    dispatch(setAddReadingItem({ id: crypto.randomUUID(), name, author, status, rating, review }))
    setName(""); setAuthor(""); setRating(0); setStatus("Want to Read"); setReview(""); setIsOpen(false)
  }

  const handleUpdate = (book: ReadingItem) => {
    dispatch(setUpdateReadingItem({ id: book.id, name: book.name, author: book.author, readingStatus: book.status, rating: book.rating, review: book.review ?? "" }))
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-[26px] py-6">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-semibold text-[var(--text)]">Reading List</span>
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs font-semibold px-3.5 py-1.5 rounded-lg cursor-pointer"
          style={{ background: 'rgba(91,110,248,0.1)', color: 'var(--accent)', border: '1px solid rgba(91,110,248,0.2)' }}
        >+ Add</button>
      </div>

      <div className="flex flex-col gap-2.5">
        {dashboardData.readingList.map(book => {
          const ss = STATUS_STYLE[book.status]
          return (
            <div key={book.id} className="bg-[var(--raised)] border border-[var(--border)] rounded-xl px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[var(--text)] overflow-hidden text-ellipsis whitespace-nowrap">{book.name}</div>
                  <div className="text-xs text-[var(--text-3)] mt-0.5">{book.author}</div>
                  {book.review && (
                    <div className="text-xs text-[var(--text-3)] mt-1.5 italic overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>"{book.review}"</div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>{book.status}</span>
                    <span className="text-[13px] tracking-[-1px]" style={{ color: '#fbbf24' }}>{'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  <select
                    value={book.status}
                    onChange={e => handleUpdate({ ...book, status: e.target.value as ReadingStatus })}
                    className="bg-[var(--elevated)] border border-[var(--border)] rounded-lg px-2 py-1 text-[11px] text-[var(--text)] outline-none cursor-pointer"
                  >
                    <option value="Want to Read">Want to Read</option>
                    <option value="Reading">Reading</option>
                    <option value="Finished">Finished</option>
                  </select>
                  <button onClick={() => setEditing(book)} className="bg-transparent border-none text-[11px] text-[var(--accent)] cursor-pointer px-0 py-0.5">Edit</button>
                  <button
                    onClick={() => dispatch(setDeleteReadingItem(book.id))}
                    className="bg-transparent border-none text-[11px] text-[var(--text-3)] hover:text-[var(--red)] cursor-pointer px-0 py-0.5"
                  >Delete</button>
                </div>
              </div>
            </div>
          )
        })}

        {dashboardData.readingList.length === 0 && (
          <div className="text-center py-6 text-[13px] text-[var(--text-3)]">No books yet</div>
        )}
      </div>

      {editing && (
        <Modal title="Edit Book" onClose={() => setEditing(null)}>
          <input type="text" value={editing.name} placeholder="Title" onChange={e => setEditing({ ...editing, name: e.target.value })} className={inputCls} />
          <input type="text" value={editing.author} placeholder="Author" onChange={e => setEditing({ ...editing, author: e.target.value })} className={inputCls} />
          <StatusSelect val={editing.status} onChange={s => setEditing({ ...editing, status: s })} />
          <textarea value={editing.review} placeholder="Your review (optional)..." rows={3} onChange={e => setEditing({ ...editing, review: e.target.value })} className={`${inputCls} resize-none`} />
          <Stars val={editing.rating} onChange={n => setEditing({ ...editing, rating: n })} />
          <BtnRow onSave={() => { handleUpdate(editing); setEditing(null) }} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {isOpen && (
        <Modal title="Add Book" onClose={() => setIsOpen(false)}>
          <input type="text" value={name} placeholder="Book title..." onChange={e => setName(e.target.value)} className={inputCls} />
          <input type="text" value={author} placeholder="Author..." onChange={e => setAuthor(e.target.value)} className={inputCls} />
          <StatusSelect val={status} onChange={setStatus} />
          <textarea value={review} placeholder="Your review (optional)..." rows={3} onChange={e => setReview(e.target.value)} className={`${inputCls} resize-none`} />
          <Stars val={rating} onChange={setRating} />
          <BtnRow onSave={handleAdd} onCancel={() => setIsOpen(false)} />
        </Modal>
      )}
    </div>
  )
}

export default ReadingList
