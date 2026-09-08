import { describe, expect, it } from "vitest"
import { getSummaryProvider, isClassroomItemKey, normalizeSummaryUrl } from "./activity-summary"

describe("personal summary URLs", () => {
  it.each([
    ["  https://www.notion.so/my-summary  ", "https://www.notion.so/my-summary"],
    ["https://docs.google.com/document/d/example", "https://docs.google.com/document/d/example"],
    ["http://example.com/notes", "http://example.com/notes"],
    ["https://publish.obsidian.md/notes", "https://publish.obsidian.md/notes"],
  ])("normalizes %s without restricting providers", (input, expected) => {
    expect(normalizeSummaryUrl(input)).toBe(expected)
  })

  it.each([null, 123, "", "   ", "hello", "notion.so/page", "javascript:alert(1)", "data:text/html,test", "ftp://example.com", "https://", "https:///", "https://exa mple.com", "https://example.com/\npage", "https://user:password@example.com"])("rejects unsafe or invalid input %s", (input) => {
    expect(normalizeSummaryUrl(input)).toBeNull()
  })

  it("keeps material and coursework identities separate", () => {
    expect(isClassroomItemKey("material:123")).toBe(true)
    expect(isClassroomItemKey("coursework:123")).toBe(true)
    expect(isClassroomItemKey("123")).toBe(false)
    expect(isClassroomItemKey("material:")).toBe(false)
  })

  it("identifies Notion and NotebookLM links", () => {
    expect(getSummaryProvider("https://app.notion.com/p/example")).toBe("notion")
    expect(getSummaryProvider("https://notebook.google.com/notebook/example")).toBe("notebooklm")
    expect(getSummaryProvider("https://notebooklm.google.com/notebook/example")).toBe("notebooklm")
  })
})
