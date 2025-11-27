'use client'

import { useEffect, useState } from 'react'
// Ícones removidos para evitar erro de SSR em ambientes restritos

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const hasDarkClass = document.documentElement.classList.contains('dark')
    setIsDark(hasDarkClass)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    const root = document.documentElement
    if (next) {
      root.classList.add('dark')
      try { localStorage.setItem('theme', 'dark') } catch {}
    } else {
      root.classList.remove('dark')
      try { localStorage.setItem('theme', 'light') } catch {}
    }
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    >
      <span className="h-4 w-4 mr-2">{isDark ? '☀' : '🌙'}</span>
      {isDark ? 'Claro' : 'Escuro'}
    </button>
  )
}
