'use client'

const tabs = ['Week', 'Quarter', 'Year']

export default function Navbar({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
    return (
        <nav className="border-b border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex gap-1">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`px-4 py-3 text-sm font-medium transition-colors ${
                            activeTab === tab
                            ? 'border-b-2 border-indigo-500 text-indigo-500'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white -mb-px'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </nav>
    )
}
