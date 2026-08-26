export type StudyTask = {
  id: string
  title: string
  description?: string | null
  subjectId?: string | null
  subjectName: string
  dueAt?: Date | null
  difficulty: number
  importance: number
  estimatedMinutes: number
  completed: boolean
  externalUrl?: string | null
  kind?: "ASSIGNMENT" | "EXAM" | "CONTENT" | "REVIEW"
  studied?: boolean
}

export type AvailabilityWindow = { weekday: number; startTime: string; endTime: string }
export type PlannedSession = StudyTask & { priorityScore: number; priorityReason: string; scheduledStart: Date; scheduledEnd: Date }
export type StudyPeriod = { startDate: Date; endDate: Date }
export type StudyPlanPreview = { sessions: PlannedSession[]; unscheduled: StudyTask[]; totalMinutes: number; distribution: Record<string, number>; restDays: string[] }
