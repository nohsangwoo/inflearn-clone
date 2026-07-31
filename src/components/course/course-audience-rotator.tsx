"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import type { CourseAudienceSignal } from "@/lib/course-audience-signals"
import { cn } from "@/lib/utils"

const ROTATION_INTERVAL_MS = 6_000
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

export type CourseAudienceRotatorProps = {
  signals: readonly CourseAudienceSignal[]
  className?: string
}

function subscribeToDocumentVisibility(onStoreChange: () => void) {
  if (typeof document === "undefined") return () => undefined
  document.addEventListener("visibilitychange", onStoreChange)
  return () => document.removeEventListener("visibilitychange", onStoreChange)
}

function getDocumentVisibilitySnapshot() {
  return typeof document === "undefined" || document.visibilityState === "visible"
}

function subscribeToReducedMotion(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY)
  mediaQuery.addEventListener("change", onStoreChange)
  return () => mediaQuery.removeEventListener("change", onStoreChange)
}

function getReducedMotionSnapshot() {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches
}

export function CourseAudienceRotator({ signals, className }: CourseAudienceRotatorProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const isDocumentVisible = useSyncExternalStore(
    subscribeToDocumentVisibility,
    getDocumentVisibilitySnapshot,
    () => true,
  )
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  )

  useEffect(() => {
    if (signals.length < 2 || !isDocumentVisible || prefersReducedMotion) return

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % signals.length)
    }, ROTATION_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [isDocumentVisible, prefersReducedMotion, signals.length])

  if (signals.length === 0) return null

  const visibleIndex = activeIndex % signals.length
  const visibleSignal = signals[visibleIndex]

  return (
    <section
      aria-label="강의 추천 대상"
      className={cn(
        "relative overflow-hidden rounded-[14px] border bg-card px-4 py-3 md:px-5",
        className,
      )}
    >
      <div className="grid min-h-[132px] sm:min-h-[84px]" aria-hidden="true">
        {signals.map((signal, index) => {
          const isActive = index === visibleIndex

          return (
            <div
              key={signal.id}
              className={cn(
                "col-start-1 row-start-1 flex flex-col items-center justify-center gap-3 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none sm:flex-row",
                isActive
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-2 opacity-0",
              )}
            >
              <div className="flex shrink-0 items-center justify-center pl-3">
                {signal.organizations.map((organization) => (
                  <span
                    key={organization.key}
                    title={organization.name}
                    className="-ml-3 grid size-9 place-items-center rounded-full border-2 border-background text-[10px] font-black shadow-sm first:ml-0 md:size-10 md:text-[11px]"
                    style={{
                      backgroundColor: organization.backgroundColor,
                      color: organization.foregroundColor,
                    }}
                  >
                    {organization.mark}
                  </span>
                ))}
              </div>
              <p className="min-w-0 text-center text-sm font-semibold leading-6 text-muted-foreground md:text-[16px]">
                <span className="text-primary">{signal.lead}</span>
                <span className="text-foreground"> {signal.body}</span>
              </p>
            </div>
          )
        })}
      </div>
      <p
        className="sr-only"
        aria-atomic="true"
        aria-live={prefersReducedMotion ? "off" : "polite"}
      >
        {visibleSignal.lead} {visibleSignal.body}
      </p>
    </section>
  )
}

export default CourseAudienceRotator
