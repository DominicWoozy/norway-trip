import { ArrowUpRight } from 'lucide-react'
import { bookingLinks } from '../data/journey'

export function BookingSection() {
  return (
    <section className="booking-section" id="booking">
      <div className="booking-heading">
        <div>
          <span>02 / BOOK THE ROUTE</span>
          <h2>交通预订入口</h2>
        </div>
        <p>优先确认罗弗敦支线航班与沿海邮轮</p>
      </div>
      <div className="booking-grid">
        {bookingLinks.map((link) => (
          <a key={link.name} href={link.url} target="_blank" rel="noreferrer">
            <span>{link.type}</span>
            <div>
              <h3>{link.name}</h3>
              <p>{link.note}</p>
            </div>
            <ArrowUpRight size={16} />
          </a>
        ))}
      </div>
      <small className="section-note">班次与价格以官方查询结果为准</small>
    </section>
  )
}

