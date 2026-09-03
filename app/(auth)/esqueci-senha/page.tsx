"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })
      if (result.error) throw new Error(result.error.message)
      setSubmitted(true)
    } catch {
      setError("Não foi possível enviar a solicitação. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f6f8fb] px-5 py-8 text-[#111827]">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#e7f3ff_0%,transparent_55%)]" />
      <section className="relative w-full max-w-md rounded-3xl border border-black/[.07] bg-white/90 p-6 shadow-[0_24px_65px_rgba(15,23,42,.10)] backdrop-blur-xl sm:p-8">
        <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#1887f2] transition hover:opacity-70">
          <ArrowLeft className="size-4" />
          Voltar para o login
        </Link>

        <div className="mb-7 text-center">
          <Image src="/logoDoIcone.png" alt="Ritimu" width={64} height={64} className="mx-auto mb-5 size-16 rounded-2xl object-cover shadow-lg" />
          {submitted ? (
            <>
              <CheckCircle2 className="mx-auto mb-3 size-9 text-[#22a05a]" />
              <h1 className="text-2xl font-semibold tracking-[-.025em]">Solicitação registrada</h1>
              <p className="mt-2 text-sm leading-relaxed text-black/50">
                Se o e-mail estiver cadastrado, um link será enviado para <strong className="font-semibold text-black/70">{email}</strong>.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-[-.025em]">Esqueci minha senha</h1>
              <p className="mt-2 text-sm leading-relaxed text-black/50">Digite seu e-mail para testar a recuperação da conta.</p>
            </>
          )}
        </div>

        {submitted ? (
          <div className="rounded-2xl bg-[#f1f8ff] px-4 py-4 text-center text-xs leading-relaxed text-[#24608d]">
            Verifique sua caixa de entrada e a pasta de spam. O link expira em 1 hora.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs font-semibold">
              E-mail
              <span className="relative mt-1.5 block">
                <Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/35" />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  className="h-12 w-full rounded-xl border border-black/[.08] bg-[#f5f5f7] pl-12 pr-4 outline-none transition placeholder:text-black/30 focus:border-[#1887f2]/45 focus:bg-white focus:ring-4 focus:ring-[#1887f2]/10"
                />
              </span>
            </label>
            {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
            <button disabled={loading} type="submit" className="flex h-11 w-full items-center justify-center gap-3 rounded-full bg-[#111827] text-sm font-semibold text-white shadow-lg transition hover:bg-black disabled:opacity-60">
              {loading ? "Enviando..." : "Continuar"}
              {!loading && <ArrowRight className="size-5" />}
            </button>
          </form>
        )}

        {submitted && (
          <Link href="/login" className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-[#111827] text-sm font-semibold text-white shadow-lg transition hover:bg-black">
            Voltar para o login
          </Link>
        )}
      </section>
    </main>
  )
}