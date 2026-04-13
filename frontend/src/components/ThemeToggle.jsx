import { useEffect, useState } from 'react'

const THEMES = ['light', 'dark', 'cupcake', 'dracula', 'corporate', 'nord', 'cyberpunk', 'valentine']

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <select
      className="select select-sm bg-transparent border-neutral-content/30 text-neutral-content focus:outline-none"
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
    >
      {THEMES.map((t) => (
        <option key={t} value={t} className="text-base-content bg-base-100">
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </option>
      ))}
    </select>
  )
}