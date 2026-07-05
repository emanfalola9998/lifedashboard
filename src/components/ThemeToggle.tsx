'use client'
import { useEffect, useState } from 'react'

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState<boolean>(true)

    useEffect(() => {
        document.documentElement.classList.add('dark')
    }, [])

    useEffect(() => {
        document.documentElement.classList.toggle('dark')
    }, [isDark])

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-lg"
            aria-label="Toggle theme"
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    )
}

export default ThemeToggle
