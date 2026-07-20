import { ArrowRight, BedDouble, Compass, MapPin, Plane, UtensilsCrossed } from 'lucide-react'
import { getQuickGuide, journeyChapters, journeyPois, type JourneyPoi } from '../data/journey'

type JourneyOverviewProps = {
  selectedDay: number
  onSelectDay: (index: number) => void
  onSelectPoi: (poi: JourneyPoi) => void
}

const guideCityForDay = (dayId: number) => {
  if (dayId <= 2) return '斯塔万格'
  if (dayId <= 6) return '罗弗敦'
  if (dayId <= 9) return '特罗姆瑟'
  return '奥斯陆'
}

export function JourneyOverview({ selectedDay, onSelectDay, onSelectPoi }: JourneyOverviewProps) {
  const chapter = journeyChapters[selectedDay]
  const guide = getQuickGuide(chapter.day.id)
  const guideCity = guideCityForDay(chapter.day.id)
  const pois = journeyPois.filter((poi) => poi.city === guideCity)

  const findPoi = (name: string) => {
    const lowered = name.toLocaleLowerCase()
    return pois.find((poi) =>
      poi.name.toLocaleLowerCase().includes(lowered) ||
      lowered.includes(poi.name.toLocaleLowerCase().split(' ')[0]),
    )
  }

  const renderGuideButton = (name: string, kind: 'sight' | 'food') => {
    const poi = findPoi(name)
    return (
      <button type="button" key={name} onClick={() => poi && onSelectPoi(poi)} disabled={!poi}>
        <span>{name}</span>
        {poi && <MapPin size={11} />}
        {!poi && <small>{kind === 'food' ? '当地风味' : '推荐地点'}</small>}
      </button>
    )
  }

  return (
    <div className="overview-panel">
      <div className="overview-heading">
        <div>
          <span>THE COMPLETE ROUTE</span>
          <h2>整段旅程，<br />现在交给你探索</h2>
        </div>
        <strong>{String(selectedDay + 1).padStart(2, '0')} / {journeyChapters.length}</strong>
      </div>

      <div className="overview-days" aria-label="选择行程日期">
        {journeyChapters.map(({ day }, index) => (
          <button
            type="button"
            key={day.id}
            className={selectedDay === index ? 'active' : ''}
            onClick={() => onSelectDay(index)}
          >
            <span>{day.date}</span>
            <small>{day.place}</small>
          </button>
        ))}
      </div>

      <div className="overview-detail" key={chapter.id}>
        <div className="overview-day-meta">
          <span>DAY {String(chapter.day.id).padStart(2, '0')}</span>
          <span>{chapter.day.weekday}</span>
        </div>
        <h3>{chapter.day.title}</h3>
        <p>{chapter.day.subtitle}</p>
        <div className="overview-transport">
          <Plane size={16} />
          <span>{chapter.day.transport[0]}</span>
        </div>
        {chapter.day.stay && (
          <div className="overview-stay"><BedDouble size={16} /><span>{chapter.day.stay}</span></div>
        )}
      </div>

      <div className="overview-guide">
        <div>
          <h4><Compass size={14} /> 好玩</h4>
          {guide.sights.map((name) => renderGuideButton(name, 'sight'))}
        </div>
        <div>
          <h4><UtensilsCrossed size={14} /> 好吃</h4>
          {guide.foods.map((name) => renderGuideButton(name, 'food'))}
        </div>
      </div>

      <div className="overview-hint">
        点击日期、景点或地图标记继续探索 <ArrowRight size={14} />
      </div>
    </div>
  )
}

