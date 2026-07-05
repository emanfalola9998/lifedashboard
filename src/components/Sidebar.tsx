'use client'
import ThemeToggle from './ThemeToggle'

const navItems = [
    { label: 'Week', icon: '📅' },
    { label: 'Quarter', icon: '📊' },
    { label: 'Year', icon: '🗓' },
]

    export default function Sidebar({ activeTab, onTabChange }: {
    activeTab: string
    onTabChange: (tab: string) => void
    }) {
    return (
        <aside className="fixed left-0 top-0 h-screen w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
        
        {/* Logo area */}
        <div className="p-6 border-b border-gray-800">
            <h1 className="text-lg font-bold text-white">Life Dashboard</h1>
            <p className="text-xs text-gray-500 mt-0.5">Your command center</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => (
            <button
                key={item.label}
                onClick={() => onTabChange(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === item.label
                    ? 'bg-indigo-500/20 text-indigo-400 font-medium'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
                <span>{item.icon}</span>
                <span>{item.label}</span>
            </button>
            ))}
        </nav>

        {/* Bottom — user + theme toggle */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between">
            <div>
            <p className="text-sm font-medium text-white">Emmanuel</p>
            <p className="text-xs text-gray-500">Personal</p>
            </div>
            <ThemeToggle />
        </div>
        </aside>
    )
}