'use client'
import { useSession, signOut } from 'next-auth/react'
import ThemeToggle from './ThemeToggle'

export default function Sidebar() {
  const { data: session } = useSession()
  const name  = session?.user?.name ?? 'User'
  const image = session?.user?.image
  const initial = name.charAt(0).toUpperCase()

  return (
    <aside className="fixed left-0 top-0 h-screen w-40 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col z-50">
      {/* Logo */}
      <div className="px-4 pt-5 pb-[18px] border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[13px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)' }}
          >L</div>
          <div>
            <div className="text-xs font-bold text-[var(--text)] tracking-[-0.2px]">Life Dashboard</div>
            <div className="text-[10px] text-[var(--text-3)] mt-px">Personal HQ</div>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* User + theme toggle */}
      <div className="px-4 py-3.5 border-t border-[var(--border)]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            {image ? (
              <img src={image} alt={name} className="w-[26px] h-[26px] rounded-full shrink-0 object-cover" />
            ) : (
              <div
                className="w-[26px] h-[26px] rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)' }}
              >{initial}</div>
            )}
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-[var(--text)] truncate">{name.split(' ')[0]}</div>
              <button
                onClick={() => signOut()}
                className="text-[10px] text-[var(--text-3)] hover:text-[var(--red)] bg-transparent border-none p-0 cursor-pointer transition-colors duration-150 text-left"
              >Sign out</button>
            </div>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  )
}
