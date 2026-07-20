import { BedDouble, CalendarDays, Car, MapPin, Plane, Ship } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { JourneyChapter, TransportMode } from '../data/journey'

const ModeIcon = ({ mode }: { mode: TransportMode }) => {
  if (mode === 'car') return <Car size={16} />
  if (mode === 'ship') return <Ship size={16} />
  if (mode === 'plane') return <Plane size={16} />
  return <MapPin size={16} />
}

type ScrollChapterProps = {
  chapter: JourneyChapter
  index: number
  active: boolean
  progress: number
}

export function ScrollChapter({ chapter, index, active, progress }: ScrollChapterProps) {
  const { day } = chapter

  return (
    <article
      className={`scroll-chapter ${active ? 'active' : ''}`}
      data-chapter={index}
      style={{ '--chapter-progress': progress } as CSSProperties}
    >
      <div className="chapter-card">
        <div className="chapter-image">
          <img src={chapter.image} alt={day.place} loading={index > 1 ? 'lazy' : 'eager'} />
          <span>{chapter.eyebrow}</span>
        </div>
        <div className="chapter-body">
          <div className="chapter-meta">
            <span>DAY {String(day.id).padStart(2, '0')}</span>
            <span><CalendarDays size={12} /> {day.date} · {day.weekday}</span>
          </div>
          <div className="chapter-place"><MapPin size={14} /> {day.place}</div>
          <h2>{day.title}</h2>
          <p className="chapter-summary">{chapter.summary}</p>

          <div className="chapter-legs">
            {chapter.segments.map((segment) => (
              <div key={segment.id}>
                <ModeIcon mode={segment.mode} />
                <span>{segment.label}</span>
              </div>
            ))}
          </div>

          <ul className="chapter-plan">
            {day.activities.slice(0, 4).map((activity) => <li key={activity}>{activity}</li>)}
          </ul>

          {day.stay && (
            <div className="chapter-stay">
              <BedDouble size={15} />
              <span>{day.stay}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

