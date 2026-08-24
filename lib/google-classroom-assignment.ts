import type {
  GoogleClassroomCourseWork,
  GoogleClassroomCourseWorkMaterial,
  GoogleClassroomMaterial,
} from "@/lib/google-classroom"

function getSafeExternalUrl(value: string | undefined) {
  if (!value) return undefined

  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : undefined
  } catch {
    return undefined
  }
}

function findMaterialUrl(
  materials: GoogleClassroomMaterial[],
  selectUrl: (material: GoogleClassroomMaterial) => string | undefined
) {
  for (const material of materials) {
    const url = getSafeExternalUrl(selectUrl(material))
    if (url) return url
  }
}

type GoogleClassroomOpenableItem = Pick<
  GoogleClassroomCourseWork | GoogleClassroomCourseWorkMaterial,
  "materials" | "alternateLink"
>

export function getClassroomItemUrl(item: GoogleClassroomOpenableItem) {
  const materials = item.materials ?? []

  return (
    findMaterialUrl(materials, (material) => material.form?.formUrl) ??
    findMaterialUrl(materials, (material) => material.link?.url) ??
    findMaterialUrl(
      materials,
      (material) => material.driveFile?.driveFile?.alternateLink
    ) ??
    findMaterialUrl(
      materials,
      (material) =>
        material.youtubeVideo?.alternateLink ??
        material.gem?.url ??
        material.notebook?.url
    ) ??
    getSafeExternalUrl(item.alternateLink)
  )
}

export const getAssignmentUrl = getClassroomItemUrl
export const getCourseWorkMaterialUrl = getClassroomItemUrl
