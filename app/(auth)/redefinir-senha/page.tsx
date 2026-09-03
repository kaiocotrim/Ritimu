"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(token ? "" : "Este link de redefinição é inválido.")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.")
    if (password !== confirmation) return setError("As senhas não coincidem.")
    setLoading(true)
    setError("")
    try {
      const result = await authClient.resetPassword({ newPassword: password, token })
      if (result.error) throw new Error(result.error.message)
      setSuccess(true)
      window.setTimeout(() => router.replace("/login"), 1800)
    } catch {
      setError("Não foi possível redefinir a senha. Solicite um novo link.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f6f8fb] px-5 py-8 text-[#111827]">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#e7f3ff_0%,transparent_55%)]" />
      <section className="relative w-full max-w-md rounded-3xl border border-black/[.07] bg-white/90 p-6 shadow-[0_24px_65px_rgba(15,23,42,.10)] backdrop-blur-xl sm:p-8">
        <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#1887f2] transition hover:opacity-70"><ArrowLeft className="size-4" />Voltar para o login</Link>
        <div className="mb-7 text-center">
          <Image src="/logoDoIcone.png" alt="Ritimu" width={64} height={64} className="mx-auto mb-5 size-16 rounded-2xl object-cover shadow-lg" />
          {success ? <><CheckCircle2 className="mx-auto mb-3 size-9 text-[#22a05a]" /><h1 className="text-2xl font-semibold">Senha alterada</h1><p className="mt-2 text-sm text-black/50">Redirecionando para o login...</p></> : <><h1 className="text-2xl font-semibold">Criar nova senha</h1><p className="mt-2 text-sm text-black/50">Escolha uma senha com pelo menos 8 caracteres.</p></>}
        </div>
        {!success && <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-semibold">Nova senha<span className="relative mt-1.5 block"><Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/35" /><input required minLength={8} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-black/[.08] bg-[#f5f5f7] px-12 outline-none transition focus:border-[#1887f2]/45 focus:bg-white focus:ring-4 focus:ring-[#1887f2]/10" /></span></label>
          <label className="block text-xs font-semibold">Confirmar senha<span className="relative mt-1.5 block"><Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/35" /><input required minLength={8} type={showPassword ? "text" : "password"} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="h-12 w-full rounded-xl border border-black/[.08] bg-[#f5f5f7] px-12 outline-none transition focus:border-[#1887f2]/45 focus:bg-white focus:ring-4 focus:ring-[#1887f2]/10" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/35">{showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button></span></label>
          {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <button disabled={loading || !token} type="submit" className="h-11 w-full rounded-full bg-[#111827] text-sm font-semibold text-white shadow-lg transition hover:bg-black disabled:opacity-60">{loading ? "Salvando..." : "Salvar nova senha"}</button>
        </form>}
      </section>
    </main>
  )
}