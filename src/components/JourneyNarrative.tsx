import { useRef, useState } from 'react'
import { JourneyGlobe } from '../map/JourneyGlobe'
import { journeyChapters, type JourneyPoi } from '../data/journey'
import { useScrollJourney } from '../hooks/useScrollJourney'
import { ScrollChapter } from './ScrollChapter'
import { JourneyOverview } from './JourneyOverview'

export function JourneyNarrative() {
  const containerRef = useRef<HTMLElement>(null)
  const { activeChapter, chapterProgress, overviewActive, totalProgress } = useScrollJourney(
    containerRef,
    journeyChapters.length,
  )
  const [overviewDay, setOverviewDay] = useState(0)
  const [selectedPoi, setSelectedPoi] = useState<JourneyPoi | null>(null)

  const selectOverviewDay = (index: number) => {
    setOverviewDay(index)
    setSelectedPoi(null)
  }

  const selectPoi = (poi: JourneyPoi) => {
    setSelectedPoi({ ...poi })
  }

  return (
    <section
      ref={containerRef}
      className={`journey-narrative ${overviewActive ? 'overview-active' : ''}`}
      id="journey"
    >
      <div className="journey-stage">
        <JourneyGlobe
          activeChapter={activeChapter}
          chapterProgress={chapterProgress}
          overviewActive={overviewActive}
          overviewDay={overviewDay}
          selectedPoi={selectedPoi}
          onSelectDay={selectOverviewDay}
          onSelectPoi={selectPoi}
        />
        <div className="story-progress" aria-hidden="true">
          <span style={{ height: `${Math.min(totalProgress * 100, 100)}%` }} />
        </div>
      </div>

      <div className="journey-flow">
        {journeyChapters.map((chapter, index) => (
          <ScrollChapter
            key={chapter.id}
            chapter={chapter}
            index={index}
            active={!overviewActive && activeChapter === index}
            progress={activeChapter === index ? chapterProgress : activeChapter > index ? 1 : 0}
          />
        ))}

        <section className="overview-step" id="overview">
          <JourneyOverview
            selectedDay={overviewDay}
            onSelectDay={selectOverviewDay}
            onSelectPoi={selectPoi}
          />
        </section>
      </div>
    </section>
  )
}

