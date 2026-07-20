import { ArrowUpRight } from 'lucide-react'
import { bookingLinks } from '../data/journey'

export function BookingSection() {
  return (
    <section className="booking-section" id="booking">
      <div className="section-title">
        <span>02 / BOOK THE ROUTE</span>
        <h2>航班与沿海邮轮</h2>
        <p>建议优先锁定罗弗敦支线航班与斯沃尔维尔至特罗姆瑟的沿海邮轮。</p>
      </div>
      <div className="booking-grid">
        {bookingLinks.map((link) => (
          <a key={link.name} href={link.url} target="_blank" rel="noreferrer">
            <span>{link.type}</span>
            <ArrowUpRight size={18} />
            <h3>{link.name}</h3>
            <p>{link.note}</p>
          </a>
        ))}
      </div>
      <small className="section-note">时刻及承运航司可能调整，请以 2026 年出行日的官方查询结果为准。</small>
    </section>
  )
}

