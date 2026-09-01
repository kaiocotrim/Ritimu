export function canJoinThirdPlayer(currentUserIds: string[], userId: string) {
  return currentUserIds.includes(userId) || currentUserIds.length < 2
}

export function canStartWithReadyPlayers(participants: { ready: boolean }[]) {
  return participants.length === 2 && participants.every((participant) => participant.ready)
}
