import { useState } from 'react'
import { Compass, Menu, X } from 'lucide-react'
import { Hero } from './components/Hero'
import { JourneyNarrative } from './components/JourneyNarrative'
import { BookingSection } from './components/BookingSection'
import { NotesSection } from './components/NotesSection'
import './App.css'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Nord 66 首页">
          <span><Compass size={17} /></span>
          NORD <b>66°</b>
        </a>
        <nav className={menuOpen ? 'open' : ''}>
          <a href="#journey" onClick={() => setMenuOpen(false)}>滚动旅程</a>
          <a href="#overview" onClick={() => setMenuOpen(false)}>整体地图</a>
          <a href="#booking" onClick={() => setMenuOpen(false)}>交通购票</a>
          <a href="#notes" onClick={() => setMenuOpen(false)}>行前提醒</a>
        </nav>
        <div className="header-meta">11 DAYS · 2026 AUTUMN</div>
        <button onClick={() => setMenuOpen((open) => !open)} aria-label="切换导航菜单">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <Hero />
      <JourneyNarrative />
      <BookingSection />
      <NotesSection />

      <footer>
        <div className="brand">
          <span><Compass size={17} /></span>
          NORD <b>66°</b>
        </div>
        <p>北京 → 斯塔万格 → 罗弗敦 → 特罗姆瑟 → 奥斯陆 → 北京</p>
        <small>
          SEPTEMBER — OCTOBER 2026
          <span>
            3D: <a href="https://poly.pizza/m/unqqkULtRU" target="_blank" rel="noreferrer">Car by Quaternius</a>
            {' · '}<a href="https://github.com/CesiumGS/cesium/tree/main/Apps/SampleData/models/CesiumAir" target="_blank" rel="noreferrer">CesiumAir</a>
            {' · '}<a href="https://poly.pizza/m/yq9EKmEmfC" target="_blank" rel="noreferrer">Cruise Ship</a>
          </span>
        </small>
      </footer>
    </main>
  )
}

export default App
