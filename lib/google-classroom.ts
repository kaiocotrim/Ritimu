export const GOOGLE_CLASSROOM_SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
  "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
  "https://www.googleapis.com/auth/classroom.topics.readonly",
] as const

export const GOOGLE_CALENDAR_SCOPE =
  "https://www.googleapis.com/auth/calendar.events" as const

export const GOOGLE_RITIMU_SCOPES = [
  ...GOOGLE_CLASSROOM_SCOPES,
  GOOGLE_CALENDAR_SCOPE,
] as const

export type GoogleClassroomTopic = {
  courseId: string
  topicId: string
  name: string
  updateTime?: string
}

type GoogleClassroomDriveFile = {
  id?: string
  title?: string
  alternateLink?: string
  thumbnailUrl?: string
}

export type GoogleClassroomMaterial = {
  form?: {
    formUrl?: string
    responseUrl?: string
    title?: string
    thumbnailUrl?: string
  }
  link?: {
    url?: string
    title?: string
    thumbnailUrl?: string
  }
  driveFile?: {
    driveFile?: GoogleClassroomDriveFile
    shareMode?: string
  }
  youtubeVideo?: {
    id?: string
    title?: string
    alternateLink?: string
    thumbnailUrl?: string
  }
  gem?: {
    id?: string
    title?: string
    url?: string
  }
  notebook?: {
    id?: string
    title?: string
    url?: string
  }
}

export type GoogleClassroomCourseWork = {
  id: string
  courseId: string
  title: string
  description?: string
  state?: string
  alternateLink?: string
  topicId?: string
  maxPoints?: number
  workType?: string
  materials?: GoogleClassroomMaterial[]
  dueDate?: {
    year: number
    month: number
    day: number
  }
  dueTime?: {
    hours?: number
    minutes?: number
    seconds?: number
  }
}

export type GoogleClassroomCourseWorkMaterial = {
  id: string
  courseId: string
  title: string
  description?: string
  materials?: GoogleClassroomMaterial[]
  state?: string
  alternateLink?: string
  creationTime?: string
  updateTime?: string
  scheduledTime?: string
  topicId?: string
}

export type GoogleClassroomTopicsResponse = {
  topic?: GoogleClassroomTopic[]
  nextPageToken?: string
}

export type GoogleClassroomCourseWorkResponse = {
  courseWork?: GoogleClassroomCourseWork[]
  nextPageToken?: string
}

export type GoogleClassroomCourseWorkMaterialsResponse = {
  courseWorkMaterial?: GoogleClassroomCourseWorkMaterial[]
  nextPageToken?: string
}
