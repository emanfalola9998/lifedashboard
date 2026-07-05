'use client'
import { useState, useEffect } from 'react'

// Deterministic star positions — static so server and client always agree
const STARS = Array.from({ length: 40 }, (_, i) => ({
  top: ((i * 73 + 17) % 97) / 97 * 100,
  left: ((i * 53 + 29) % 89) / 89 * 100,
}))
import Sidebar from '../components/Sidebar'
import TaskChecklist from '../components/TaskCheckList'
import GymTracker from '../components/GymTracker'
import WeeklyFocus from '../components/WeeklyFocus'
import Reflections from '../components/Reflections'
import GoalsKanban from '@/components/GoalsKanban/GoalsKanban'
import HabitTracker from '@/components/HabitTracker'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('Week')
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main content */}
      <main className="ml-56 flex-1 min-h-screen">

        {/* Banner */}
        <div className="relative h-48 bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 overflow-hidden">
          {/* Star dots */}
          <div className="absolute inset-0">
            {STARS.map((pos, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-60"
                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
              />
            ))}
          </div>
          
          {/* Greeting */}
          <div className="relative z-10 h-full flex flex-col justify-center px-10">
            <h2 className="text-3xl font-bold text-white">
              {getGreeting()}, Emmanuel ✦
            </h2>
            <p className="text-indigo-300 mt-2 text-sm">{dateStr}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'Week' && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-3">
                <TaskChecklist />
              </div>
              <div className="col-span-3">
                <GymTracker />
              </div>
              <div className="col-span-2">
                <WeeklyFocus />
              </div>
              <div className="col-span-1">
                <Reflections />
              </div>
              <div>
                <GoalsKanban />
              </div>
              <div>
                <HabitTracker />
              </div>
            </div>
          )}

          {activeTab === 'Quarter' && (
            <div className="text-gray-400">Quarter view coming soon</div>
          )}

          {activeTab === 'Year' && (
            <div className="text-gray-400">Year view coming soon</div>
          )}
        </div>
      </main>
    </div>
  )
}