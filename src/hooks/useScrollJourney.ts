import { useEffect, useMemo, useState, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export type ScrollJourneyState = {
  activeChapter: number
  chapterProgress: number
  overviewActive: boolean
  totalProgress: number
}

export const useScrollJourney = (
  containerRef: RefObject<HTMLElement | null>,
  chapterCount: number,
): ScrollJourneyState => {
  const [totalProgress, setTotalProgress] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let frame = 0
    let lastUpdate = 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 720px)').matches
    const stepCount = chapterCount + 1
    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: reducedMotion ? false : mobile ? 0.22 : 0.45,
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          const now = performance.now()
          if (mobile && !reducedMotion && now - lastUpdate < 32) return
          lastUpdate = now
          cancelAnimationFrame(frame)
          frame = requestAnimationFrame(() => {
            const next = reducedMotion
              ? Math.min(Math.round(progress * stepCount) / stepCount, 1)
              : progress
            setTotalProgress(next)
          })
        },
      })
    }, container)

    const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh())
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      context.revert()
    }
  }, [chapterCount, containerRef])

  return useMemo(() => {
    const stepCount = chapterCount + 1
    const scaled = Math.min(totalProgress * stepCount, stepCount - 0.00001)
    const step = Math.floor(scaled)
    return {
      activeChapter: Math.min(step, chapterCount - 1),
      chapterProgress: step >= chapterCount ? 1 : scaled - step,
      overviewActive: step >= chapterCount,
      totalProgress,
    }
  }, [chapterCount, totalProgress])
}

