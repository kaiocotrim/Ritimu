"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, LoaderCircle, LockKeyhole, Pencil, X } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export function AccountSettings({ initialName, initialNotifications }: { initialName: string; initialNotifications: boolean }) {
  const router = useRouter()
  const [panel, setPanel] = useState<"name" | "password" | null>(null)
  const [name, setName] = useState(initialName)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [notifications, setNotifications] = useState(initialNotifications)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function saveName() {
    if (name.trim().length < 2) return setError("Informe um nome válido.")
    setBusy(true); setError(""); setMessage("")
    const result = await authClient.updateUser({ name: name.trim() })
    if (result.error) setError(result.error.message ?? "Não foi possível atualizar o nome.")
    else { setMessage("Perfil atualizado."); setPanel(null); router.refresh() }
    setBusy(false)
  }

  async function savePassword() {
    if (newPassword.length < 8) return setError("A nova senha precisa ter pelo menos 8 caracteres.")
    setBusy(true); setError(""); setMessage("")
    const result = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })
    if (result.error) setError(result.error.message ?? "Não foi possível alterar a senha.")
    else { setMessage("Senha alterada com segurança."); setPanel(null); setCurrentPassword(""); setNewPassword("") }
    setBusy(false)
  }

  async function toggleNotifications() {
    const next = !notifications
    setBusy(true); setError(""); setMessage("")
    const response = await fetch("/api/study-plan/preferences", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationsEnabled: next }) })
    if (response.ok) { setNotifications(next); setMessage(next ? "Notificações ativadas." : "Notificações desativadas.") }
    else setError("Não foi possível alterar as notificações.")
    setBusy(false)
  }

  return <>
    <button onClick={() => { setPanel("name"); setError(""); setMessage("") }} className="flex w-full items-center gap-4 py-4 text-left" type="button"><Pencil className="size-5 text-black/45" /><span className="flex-1 font-medium">Editar perfil</span><span className="text-sm text-black/40">{name}</span></button>
    <button onClick={() => void toggleNotifications()} disabled={busy} className="flex w-full items-center gap-4 py-4 text-left" type="button"><Bell className="size-5 text-black/45" /><span className="flex-1 font-medium">Notificações</span><span className="text-sm text-[#45B950]">{notifications ? "Ativadas" : "Desativadas"}</span></button>
    <button onClick={() => { setPanel("password"); setError(""); setMessage("") }} className="flex w-full items-center gap-4 py-4 text-left" type="button"><LockKeyhole className="size-5 text-black/45" /><span className="flex-1 font-medium">Alterar senha</span></button>
    {message && <p role="status" className="py-2 text-sm font-medium text-green-700">{message}</p>}
    {error && <p role="alert" className="py-2 text-sm font-medium text-red-600">{error}</p>}
    {panel && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true"><section className="theme-modal w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">{panel === "name" ? "Editar perfil" : "Alterar senha"}</h2><button type="button" aria-label="Fechar" onClick={() => setPanel(null)} className="rounded-full p-2 hover:bg-black/5"><X className="size-5" /></button></div>{panel === "name" ? <div className="mt-5"><label className="text-sm font-medium" htmlFor="profile-name">Nome</label><input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#50D05C]" /><button type="button" disabled={busy} onClick={() => void saveName()} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#50D05C] font-bold text-black">{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}Salvar nome</button></div> : <div className="mt-5 space-y-3"><input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Senha atual" className="h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#50D05C]" /><input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Nova senha (mínimo 8 caracteres)" className="h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#50D05C]" /><button type="button" disabled={busy || !currentPassword || !newPassword} onClick={() => void savePassword()} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#50D05C] font-bold text-black disabled:opacity-50">{busy ? <LoaderCircle className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}Alterar senha</button></div>}</section></div>}
  </>
}
