import { useState } from "react"

const themes = [
  "light","dark","cupcake","bumblebee","emerald","corporate","synthwave",
  "retro","cyberpunk","valentine","halloween","garden","forest","aqua",
  "lofi","pastel","fantasy","wireframe","black","luxury","dracula",
  "cmyk","autumn","business","acid","lemonade","night","coffee",
  "winter","dim","sunset","nord"
]

export default function ThemeDemo() {
  const [theme, setTheme] = useState("light")

  return (
    <div data-theme={theme} className="min-h-screen bg-base-100 text-base-content p-6">
      <h1 className="text-2xl font-bold mb-4">DaisyUI Theme Demo</h1>

      <select
        className="select select-bordered mb-6"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        {themes.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <div className="flex gap-3 mb-6">
        <button className="btn btn-primary">Primary</button>
        <button className="btn btn-secondary">Secondary</button>
        <button className="btn btn-accent">Accent</button>
        <button className="btn btn-ghost">Ghost</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-200 shadow">
          <div className="card-body">
            <h2 className="card-title">Base-200</h2>
            <p>Background token demo</p>
          </div>
        </div>

        <div className="card bg-base-300 shadow">
          <div className="card-body">
            <h2 className="card-title">Base-300</h2>
            <p>Contrast layer</p>
          </div>
        </div>

        <div className="card bg-neutral text-neutral-content shadow">
          <div className="card-body">
            <h2 className="card-title">Neutral</h2>
            <p>Neutral surface</p>
          </div>
        </div>
      </div>
    </div>
  )
}
