import { useEffect, useState, type RefObject } from 'react'
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
  const [journeyState, setJourneyState] = useState<ScrollJourneyState>({
    activeChapter: 0,
    chapterProgress: 0,
    overviewActive: false,
    totalProgress: 0,
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let frame = 0
    let lastUpdate = 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 720px)').matches
    const chapterElements = Array.from(container.querySelectorAll<HTMLElement>('.scroll-chapter'))
    const overviewElement = container.querySelector<HTMLElement>('.overview-step')

    const updateChapter = (index: number, progress: number, force = false) => {
      const now = performance.now()
      if (!force && mobile && !reducedMotion && now - lastUpdate < 32) return
      lastUpdate = now
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        setJourneyState((current) => ({
          ...current,
          activeChapter: index,
          chapterProgress: reducedMotion ? (progress < 0.5 ? 0 : 1) : progress,
          overviewActive: false,
        }))
      })
    }

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          setJourneyState((current) => ({ ...current, totalProgress: progress }))
        },
      })

      chapterElements.forEach((element, index) => {
        ScrollTrigger.create({
          trigger: element,
          start: 'top top',
          end: 'bottom top',
          invalidateOnRefresh: true,
          onEnter: () => updateChapter(index, 0, true),
          onEnterBack: () => updateChapter(index, 1, true),
          onUpdate: ({ isActive, progress }) => {
            if (isActive) updateChapter(index, progress)
          },
        })
      })

      if (overviewElement) {
        ScrollTrigger.create({
          trigger: overviewElement,
          start: 'top top',
          end: 'bottom top',
          invalidateOnRefresh: true,
          onEnter: () => setJourneyState((current) => ({
            ...current,
            chapterProgress: 1,
            overviewActive: true,
          })),
          onEnterBack: () => setJourneyState((current) => ({ ...current, overviewActive: true })),
          onLeaveBack: () => setJourneyState((current) => ({ ...current, overviewActive: false })),
        })
      }
    }, container)

    const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh())
    resizeObserver.observe(container)
    ScrollTrigger.refresh()

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      context.revert()
    }
  }, [chapterCount, containerRef])

  return journeyState
}

