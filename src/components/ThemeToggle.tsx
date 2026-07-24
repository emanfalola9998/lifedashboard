'use client'
import { useEffect, useState } from 'react'

const DARK = {
  '--bg':        '#0e0f10',
  '--surface':   '#161718',
  '--raised':    '#1c1d1f',
  '--elevated':  '#232426',
  '--border':    '#2c2d30',
  '--border-hi': '#3c3d42',
  '--text':      '#e2e3e8',
  '--text-2':    '#68697a',
  '--text-3':    '#3a3c48',
  '--accent':    '#818cf8',
  '--green':     '#34d399',
  '--blue':      '#60a5fa',
  '--pink':      '#f472b6',
  '--amber':     '#fbbf24',
  '--red':       '#f87171',
  '--purple':    '#a78bfa',
  '--teal':      '#2dd4bf',
}

const LIGHT = {
  '--bg':        '#ede4d0',
  '--surface':   '#f5edd8',
  '--raised':    '#e8dfc8',
  '--elevated':  '#ddd4bc',
  '--border':    '#cdc3aa',
  '--border-hi': '#b8ad92',
  '--text':      '#1a1710',
  '--text-2':    '#6b6250',
  '--text-3':    '#a89880',
  '--accent':    '#6366f1',
  '--green':     '#059669',
  '--blue':      '#2563eb',
  '--pink':      '#db2777',
  '--amber':     '#d97706',
  '--red':       '#dc2626',
  '--purple':    '#7c3aed',
  '--teal':      '#0d9488',
}

function applyTheme(dark: boolean) {
  const vars = dark ? DARK : LIGHT
  const root = document.documentElement
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const dark = saved !== 'light'
    setIsDark(dark)
    applyTheme(dark)
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    applyTheme(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: '100%',
        background: 'var(--raised)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '7px 0', cursor: 'pointer',
        fontSize: 13, color: 'var(--text-2)', fontFamily: 'inherit',
        transition: 'all 0.15s', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 6,
      }}
    >
      {isDark ? '☀️' : '🌙'}
      <span style={{ fontSize: 11, fontWeight: 600 }}>{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  )
}
