import { ArrowDown, Compass, Plane } from 'lucide-react'
import type { CSSProperties } from 'react'
import { assetUrl } from '../assets'
import { TripCountdown } from './TripCountdown'

export function Hero() {
  return (
    <section
      className="hero-section"
      id="top"
      style={{ '--hero-image': `url("${assetUrl('lofoten.jpg')}")` } as CSSProperties}
    >
      <div className="hero-topline">
        <span><Compass size={15} /> 59°N — 70°N</span>
        <span>SEPTEMBER — OCTOBER 2026</span>
      </div>
      <div className="hero-content">
        <p>NORWAY / AN ELEVEN-DAY JOURNEY</p>
        <h1>向北，直到<br /><em>世界尽头</em></h1>
        <div className="hero-intro">
          <span>北京</span><i /><Plane size={18} /><i /><span>北极圈</span>
          <p>滚动页面，跟随汽车、飞机与沿海邮轮完成整段旅程。</p>
        </div>
      </div>
      <div className="hero-footer">
        <TripCountdown />
        <a href="#journey" className="hero-scroll">
          <span>开始旅程</span>
          <ArrowDown size={18} />
        </a>
      </div>
      <div className="hero-orbit" aria-hidden="true" />
    </section>
  )
}

