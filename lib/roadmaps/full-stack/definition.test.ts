import { describe, expect, it } from "vitest"
import { FULL_STACK_EDGES, FULL_STACK_NODES } from "./definition"

describe("Full Stack roadmap definition", () => {
  it("uses unique stable keys", () => {
    expect(new Set(FULL_STACK_NODES.map((node) => node.key)).size).toBe(FULL_STACK_NODES.length)
  })

  it("only connects existing nodes", () => {
    const keys = new Set(FULL_STACK_NODES.map((node) => node.key))
    for (const edge of FULL_STACK_EDGES) {
      expect(keys.has(edge.from)).toBe(true)
      expect(keys.has(edge.to)).toBe(true)
    }
  })

  it("curates direct resources for every topic", () => {
    const topics = FULL_STACK_NODES.filter((node) => node.kind === "TOPIC")
    expect(topics.every((node) => node.resources.length > 0)).toBe(true)
    expect(topics.flatMap((node) => node.resources).some((resource) => resource.url.includes("youtube.com/results?search_query="))).toBe(false)
  })
})
