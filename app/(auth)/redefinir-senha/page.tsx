"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Check, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
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
          <label className="block text-xs font-semibold">Nova senha<span className="relative mt-1.5 block"><Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/35" /><input required minLength={8} type={showPassword ? "text" : "password"} value={password} onChange={(event) => { setPassword(event.target.value); setError("") }} className="h-12 w-full rounded-xl border border-black/[.08] bg-[#f5f5f7] px-12 outline-none transition focus:border-[#1887f2]/45 focus:bg-white focus:ring-4 focus:ring-[#1887f2]/10" /></span></label>
          <PasswordStrength password={password} />
          <label className="block text-xs font-semibold">Confirmar senha<span className="relative mt-1.5 block"><Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/35" /><input required minLength={8} type={showPassword ? "text" : "password"} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="h-12 w-full rounded-xl border border-black/[.08] bg-[#f5f5f7] px-12 outline-none transition focus:border-[#1887f2]/45 focus:bg-white focus:ring-4 focus:ring-[#1887f2]/10" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/35">{showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button></span></label>
          {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          <button disabled={loading || !token} type="submit" className="h-11 w-full rounded-full bg-[#111827] text-sm font-semibold text-white shadow-lg transition hover:bg-black disabled:opacity-60">{loading ? "Salvando..." : "Salvar nova senha"}</button>
        </form>}
      </section>
    </main>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ caracteres", met: password.length >= 8 },
    { label: "Maiúscula e minúscula", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Um número", met: /\d/.test(password) },
    { label: "Um símbolo", met: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter((check) => check.met).length
  const strength = score >= 4
    ? { label: "Forte", color: "#22c55e", bars: 3 }
    : score >= 2
      ? { label: "Média", color: "#f59e0b", bars: 2 }
      : { label: "Fraca", color: "#ef4444", bars: 1 }

  return <AnimatePresence initial={false}>
    {password && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="-mt-2 overflow-hidden" aria-live="polite">
      <div className="flex items-center justify-between text-[11px] font-semibold"><span className="text-black/40">Força da senha</span><span style={{ color: strength.color }}>{strength.label}</span></div>
      <div className="mt-1 grid grid-cols-3 gap-1.5" aria-hidden="true">{[1, 2, 3].map((bar) => <motion.span key={bar} className="h-1 rounded-full bg-black/10" animate={{ backgroundColor: bar <= strength.bars ? strength.color : "rgba(17, 24, 39, 0.10)" }} />)}</div>
      <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">{checks.map((check) => <span key={check.label} className={`flex min-w-0 items-center gap-1 text-[10px] ${check.met ? "text-[#168f3e]" : "text-black/35"}`}><span className={`grid size-3 shrink-0 place-items-center rounded-full ${check.met ? "bg-[#22c55e] text-white" : "border border-black/15"}`}>{check.met && <Check className="size-2" />}</span>{check.label}</span>)}</div>
    </motion.div>}
  </AnimatePresence>
}