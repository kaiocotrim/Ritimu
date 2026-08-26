import { describe, expect, it } from "vitest"
import { calculatePriority } from "./calculate-priority"
import { scheduleSessions } from "./schedule-sessions"
import { generateStudyPlanPreview } from "./generate-preview"
import type { StudyTask } from "./types"

const now = new Date("2026-08-24T12:00:00-03:00")
const base: StudyTask = { id: "1", title: "Atividade", subjectId: "a", subjectName: "Matemática", difficulty: 3, importance: 3, estimatedMinutes: 40, completed: false }
const task = (values: Partial<StudyTask>): StudyTask => ({ ...base, ...values })

describe("prioridade do plano", () => {
  it("dá maior prioridade a atividade atrasada", () => expect(calculatePriority(task({ dueAt: new Date("2026-08-20") }), now).score).toBeGreaterThan(calculatePriority(task({ dueAt: new Date("2026-08-30") }), now).score))
  it("prioriza prazo próximo sobre distante", () => expect(calculatePriority(task({ dueAt: new Date("2026-08-25") }), now).score).toBeGreaterThan(calculatePriority(task({ dueAt: new Date("2026-09-10") }), now).score))
  it("adiciona pontos para matéria difícil", () => expect(calculatePriority(task({ difficulty: 5 }), now).score).toBeGreaterThan(calculatePriority(task({ difficulty: 1 }), now).score))
  it("exclui atividade concluída", () => expect(calculatePriority(task({ completed: true }), now).score).toBe(-1))
  it("prioriza prova próxima", () => expect(calculatePriority(task({ kind: "EXAM", dueAt: new Date("2026-08-27") }), now).score).toBeGreaterThan(calculatePriority(task({ kind: "ASSIGNMENT", dueAt: new Date("2026-08-27") }), now).score))
  it("adiciona prioridade para conteúdo ainda não estudado", () => expect(calculatePriority(task({ kind: "CONTENT", studied: false }), now).score).toBeGreaterThan(calculatePriority(task({ kind: "CONTENT", studied: true }), now).score))
})

describe("agendamento", () => {
  const availability = [{ weekday: 1, startTime: "19:00", endTime: "21:00" }]
  it("respeita disponibilidade e pausas", () => { const result = scheduleSessions({ tasks: [task({ id: "1" }), task({ id: "2", subjectId: "b" })], availability, startDate: now, sessionMinutes: 40, breakMinutes: 10, maxDailyMinutes: 120 }); expect(result[0].scheduledStart.getHours()).toBe(19); expect(result[1].scheduledStart.getTime() - result[0].scheduledEnd.getTime()).toBe(10 * 60_000) })
  it("não ultrapassa limite diário", () => { const result = scheduleSessions({ tasks: [task({ id: "1", estimatedMinutes: 200 })], availability, startDate: now, days: 1, sessionMinutes: 40, breakMinutes: 10, maxDailyMinutes: 80 }); expect(result).toHaveLength(2) })
  it("não ultrapassa o fim da janela", () => { const result = scheduleSessions({ tasks: [task({ estimatedMinutes: 200 })], availability: [{ weekday: 1, startTime: "19:00", endTime: "20:00" }], startDate: now, days: 1, sessionMinutes: 40, breakMinutes: 10, maxDailyMinutes: 200 }); expect(result).toHaveLength(1) })
  it("coloca atividade sem prazo depois das atividades com prazo", () => { const result = scheduleSessions({ tasks: [task({ id: "sem", dueAt: null, difficulty: 5 }), task({ id: "com", dueAt: new Date("2026-10-01"), difficulty: 1 })], availability, startDate: now, days: 1, sessionMinutes: 40, breakMinutes: 10, maxDailyMinutes: 80 }); expect(result[0].id).toBe("com") })
  it("não cria sessões no passado", () => { const result = generateStudyPlanPreview({ tasks: [task({})], availability, startDate: new Date("2026-08-24T00:00:00-03:00"), endDate: new Date("2026-08-24T23:59:00-03:00"), now: new Date("2026-08-24T19:30:00-03:00"), sessionMinutes: 40, breakMinutes: 10, maxDailyMinutes: 120 }); expect(result.sessions.every((item) => item.scheduledStart > new Date("2026-08-24T19:30:00-03:00"))).toBe(true) })
  it("gera revisão antes de prova", () => { const result = generateStudyPlanPreview({ tasks: [task({ kind: "EXAM", dueAt: new Date("2026-08-28"), estimatedMinutes: 40 })], availability, startDate: now, endDate: new Date("2026-08-31"), now, sessionMinutes: 40, breakMinutes: 10, maxDailyMinutes: 120 }); expect(result.sessions.some((item) => item.kind === "REVIEW")).toBe(true) })
})
