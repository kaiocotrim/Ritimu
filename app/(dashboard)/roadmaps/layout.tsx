import type { ReactNode } from "react"
import { RoadmapLayoutClient } from "@/components/roadmaps/roadmap-layout-client"

export default function RoadmapsLayout({ children }: { children: ReactNode }) {
  return <RoadmapLayoutClient>{children}</RoadmapLayoutClient>
}
