import { CalendarClock, CloudSun, Sparkles } from 'lucide-react'

const notes = [
  {
    icon: CalendarClock,
    label: 'BOOKING',
    title: '先锁定跨城交通',
    copy: '斯塔万格、罗弗敦支线航班以及沿海邮轮座位应优先确认。',
  },
  {
    icon: CloudSun,
    label: 'FLEXIBLE',
    title: '把北境交给天气',
    copy: '观鲸、Senja、徒步和缆车根据临近天气灵活选择。',
  },
  {
    icon: Sparkles,
    label: 'AURORA',
    title: '给极光三个夜晚',
    copy: '查看云量与极光预报，避开城市光害并准备完整防风保暖层。',
  },
]

export function NotesSection() {
  return (
    <section className="notes-section" id="notes">
      <div className="section-title">
        <span>03 / BEFORE DEPARTURE</span>
        <h2>给意外的风景，<br />留一点空间</h2>
      </div>
      <div className="notes-grid">
        {notes.map(({ icon: Icon, label, title, copy }) => (
          <article key={label}>
            <Icon size={23} />
            <span>{label}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

