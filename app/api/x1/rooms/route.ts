import { after } from "next/server"
import { requireX1UserId } from "@/lib/x1/auth"
import { createRoom, x1ErrorResponse } from "@/lib/x1/service"
import { prepareRoomQuestions } from "@/lib/knowledge/prepare-room"

export const maxDuration = 30

export async function POST(request: Request) {
  const userId = await requireX1UserId()
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  try {
    const body: unknown = await request.json()
    const turnTimeSeconds = body && typeof body === "object" && "turnTimeSeconds" in body && (typeof body.turnTimeSeconds === "number" || body.turnTimeSeconds === null) ? body.turnTimeSeconds : 30
    const allowCapture = Boolean(body && typeof body === "object" && "allowCapture" in body && body.allowCapture === true)
    const vsBot = Boolean(body && typeof body === "object" && "vsBot" in body && body.vsBot === true)
    const botDifficulty = body && typeof body === "object" && "botDifficulty" in body && (body.botDifficulty === "EASY" || body.botDifficulty === "MEDIUM" || body.botDifficulty === "HARD") ? body.botDifficulty : "MEDIUM"
    const topicId = body && typeof body === "object" && "topicId" in body && typeof body.topicId === "string" ? body.topicId : ""
    const subtopic = body && typeof body === "object" && "subtopic" in body && typeof body.subtopic === "string" && body.subtopic !== "ALL" ? body.subtopic : null
    const difficulty = body && typeof body === "object" && "difficulty" in body && (body.difficulty === "EASY" || body.difficulty === "MEDIUM" || body.difficulty === "HARD") ? body.difficulty : "MEDIUM"
    const room = await createRoom(userId, { turnTimeSeconds, allowCapture, vsBot, botDifficulty, topicId, subtopic, difficulty })
    after(() => prepareRoomQuestions(room.id))
    return Response.json({ code: room.code }, { status: 201 })
  } catch (error) { return x1ErrorResponse(error) }
}
