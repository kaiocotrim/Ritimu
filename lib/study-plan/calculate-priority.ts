import type { StudyTask } from "./types"

export function calculatePriority(task: StudyTask, now: Date) {
  if (task.completed) return { score: -1, reason: "Atividade concluída" }
  let deadlineScore = task.dueAt ? 10 : 0
  let reason = task.dueAt ? "Prazo futuro" : "Sem prazo definido"
  if (task.dueAt) {
    const days = Math.ceil((task.dueAt.getTime() - now.getTime()) / 86_400_000)
    if (days < 0) { deadlineScore = 100; reason = "Atividade atrasada" }
    else if (days <= 2) { deadlineScore = 70; reason = days === 0 ? "Entrega hoje" : `Entrega em ${days} dia${days === 1 ? "" : "s"}` }
    else if (days <= 7) { deadlineScore = 45; reason = `Entrega em ${days} dias` }
    else { deadlineScore = 20; reason = `Entrega em ${days} dias` }
  }
  const examScore = task.kind === "EXAM" ? 35 : 0
  const pendingContentScore = task.kind === "CONTENT" && !task.studied ? 15 : 0
  if (task.kind === "EXAM" && task.dueAt) reason = `Prova — ${reason.toLowerCase()}`
  return { score: deadlineScore + examScore + task.difficulty * 5 + task.importance * 6 + pendingContentScore, reason }
}
