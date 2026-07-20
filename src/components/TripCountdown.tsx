import { useEffect, useState } from 'react'
import { PlaneTakeoff, RotateCcw } from 'lucide-react'

const departureTime = new Date('2026-09-25T02:50:00+08:00').getTime()

const getRemaining = () => {
  const difference = Math.max(departureTime - Date.now(), 0)
  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
    started: difference === 0,
  }
}

export function TripCountdown() {
  const [remaining, setRemaining] = useState(getRemaining)

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemaining()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const units = [
    { label: '天', value: remaining.days },
    { label: '时', value: remaining.hours },
    { label: '分', value: remaining.minutes },
    { label: '秒', value: remaining.seconds },
  ]

  return (
    <div className="trip-countdown">
      <div className="countdown-routes">
        <div>
          <PlaneTakeoff size={15} />
          <span><b>去程</b> 09.25 · 北京首都 T3 02:50 → 奥斯陆 14:10</span>
        </div>
        <div>
          <RotateCcw size={14} />
          <span><b>返程</b> 10.05 · 奥斯陆 11:45 → 北京首都 T3 · 10.06 11:45 抵达</span>
        </div>
      </div>

      <div className="countdown-clock" aria-live="polite">
        <small>{remaining.started ? 'JOURNEY STARTED' : '距离出发'}</small>
        <div>
          {units.map((unit) => (
            <span key={unit.label}>
              <strong>{String(unit.value).padStart(2, '0')}</strong>
              <i>{unit.label}</i>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
