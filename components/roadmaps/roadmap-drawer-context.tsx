"use client"

import { createContext, useContext } from "react"

export type RoadmapDrawerContextType = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const RoadmapDrawerContext = createContext<RoadmapDrawerContextType | null>(null)

export function useRoadmapDrawer() {
  const context = useContext(RoadmapDrawerContext)
  if (!context) {
    throw new Error("useRoadmapDrawer must be used within a RoadmapDrawerProvider")
  }
  return context
}
