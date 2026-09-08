import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  session: vi.fn(), course: vi.fn(), item: vi.fn(), list: vi.fn(), upsert: vi.fn(), remove: vi.fn(),
}))
vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: mocks.session } } }))
vi.mock("@/lib/activity-summary", () => import("./activity-summary"))
vi.mock("@/lib/prisma", () => ({ prisma: {
  classroomCourse: { findFirst: mocks.course },
  classroomItemCompletion: { findFirst: mocks.item },
  activitySummary: { findMany: mocks.list, upsert: mocks.upsert, deleteMany: mocks.remove },
} }))

import { DELETE, GET, PUT } from "../app/api/classroom/courses/[courseId]/summaries/route"

const params = { params: Promise.resolve({ courseId: "course-1" }) }
const scope = { userId: "session-user", courseId: "course-1" }
const itemScope = { ...scope, itemKey: "material:123" }
function request(method = "PUT", body: unknown = { itemKey: "material:123", summaryUrl: " https://notion.so/notes " }) {
  return new Request("http://localhost/api/classroom/courses/course-1/summaries", {
    method, body: JSON.stringify(body), headers: { "Content-Type": "application/json" },
  })
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.session.mockResolvedValue({ user: { id: scope.userId } })
  mocks.course.mockResolvedValue({ id: scope.courseId })
  mocks.item.mockResolvedValue({ id: "known-item" })
  mocks.list.mockResolvedValue([])
  mocks.upsert.mockResolvedValue({ itemKey: "material:123", summaryUrl: "https://notion.so/notes" })
  mocks.remove.mockResolvedValue({ count: 1 })
})

describe("summary authorization and persistence", () => {
  it("requires authentication for every operation", async () => {
    mocks.session.mockResolvedValue(null)
    for (const handler of [GET, PUT, DELETE]) expect((await handler(request(), params)).status).toBe(401)
    expect(mocks.course).not.toHaveBeenCalled()
    expect(mocks.upsert).not.toHaveBeenCalled()
    expect(mocks.remove).not.toHaveBeenCalled()
  })

  it("blocks another user's course for every operation", async () => {
    mocks.course.mockResolvedValue(null)
    for (const handler of [GET, PUT, DELETE]) expect((await handler(request(), params)).status).toBe(404)
    expect(mocks.course).toHaveBeenCalledWith({ where: { id: scope.courseId, userId: scope.userId }, select: { id: true } })
    expect(mocks.list).not.toHaveBeenCalled()
    expect(mocks.upsert).not.toHaveBeenCalled()
    expect(mocks.remove).not.toHaveBeenCalled()
  })

  it("blocks items not registered for this user and course", async () => {
    mocks.item.mockResolvedValue(null)
    for (const handler of [PUT, DELETE]) expect((await handler(request(), params)).status).toBe(404)
    expect(mocks.item).toHaveBeenCalledWith({ where: itemScope, select: { id: true } })
    expect(mocks.upsert).not.toHaveBeenCalled()
    expect(mocks.remove).not.toHaveBeenCalled()
  })

  it("ignores a forged userId and upserts by the authenticated composite key", async () => {
    const response = await PUT(request("PUT", { ...itemScope, userId: "victim", summaryUrl: " https://notion.so/notes " }), params)
    expect(response.status).toBe(200)
    expect(mocks.upsert).toHaveBeenCalledWith({
      where: { userId_courseId_itemKey: itemScope },
      create: { ...itemScope, summaryUrl: "https://notion.so/notes", notebookLmUrl: null },
      update: { summaryUrl: "https://notion.so/notes", notebookLmUrl: null }, select: { itemKey: true, summaryUrl: true, notebookLmUrl: true },
    })
  })

  it("loads summaries in a single scoped query", async () => {
    expect((await GET(request(), params)).status).toBe(200)
    expect(mocks.list).toHaveBeenCalledExactlyOnceWith({ where: scope, select: { itemKey: true, summaryUrl: true, notebookLmUrl: true } })
  })

  it("saves a NotebookLM link independently", async () => {
    const response = await PUT(request("PUT", { itemKey: "material:123", summaryUrl: "", notebookLmUrl: " https://notebook.google.com/notebook/123 " }), params)
    expect(response.status).toBe(200)
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: { ...itemScope, summaryUrl: "", notebookLmUrl: "https://notebook.google.com/notebook/123" },
      update: { summaryUrl: "", notebookLmUrl: "https://notebook.google.com/notebook/123" },
    }))
  })

  it("only deletes the authenticated user's summary", async () => {
    expect((await DELETE(request("DELETE", { ...itemScope, userId: "victim" }), params)).status).toBe(200)
    expect(mocks.remove).toHaveBeenCalledWith({ where: itemScope })
  })

  it("rejects malformed JSON and unsafe URLs without writing", async () => {
    expect((await PUT(new Request("http://localhost", { method: "PUT", body: "{" }), params)).status).toBe(400)
    expect((await PUT(request("PUT", { itemKey: "material:123", summaryUrl: "javascript:alert(1)" }), params)).status).toBe(400)
    expect(mocks.upsert).not.toHaveBeenCalled()
  })

  it("returns friendly failures for database errors", async () => {
    mocks.upsert.mockRejectedValue(new Error("private database detail"))
    const response = await PUT(request(), params)
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: "Não foi possível salvar o resumo." })
  })
})
