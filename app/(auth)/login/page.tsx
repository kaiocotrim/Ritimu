"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Check,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"

function GoogleIcon() {
  return (
    <svg
      className="h-4 w-4 fill-current"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M21.35 12.18c0-.71-.06-1.4-.18-2.07H12v3.91h5.24a4.48 4.48 0 0 1-1.94 2.94v2.54h3.15c1.85-1.7 2.9-4.21 2.9-7.32Z" />
      <path d="M12 21.7c2.62 0 4.83-.87 6.44-2.2l-3.15-2.54c-.88.59-2 .94-3.29.94-2.54 0-4.68-1.71-5.45-4H3.3v2.6A9.72 9.72 0 0 0 12 21.7Z" />
      <path d="M6.55 13.9a5.84 5.84 0 0 1 0-3.72v-2.6H3.3a9.75 9.75 0 0 0 0 8.92l3.25-2.6Z" />
      <path d="M12 6.18c1.44 0 2.72.5 3.73 1.45l2.79-2.79A9.4 9.4 0 0 0 12 2.3a9.72 9.72 0 0 0-8.7 5.28l3.25 2.6c.77-2.3 2.91-4 5.45-4Z" />
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg
      className="h-4 w-4 fill-current"
      viewBox="0 0 23 23"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="10" height="10" />
      <rect x="12" y="1" width="10" height="10" />
      <rect x="1" y="12" width="10" height="10" />
      <rect x="12" y="12" width="10" height="10" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg
      className="h-5 w-5 fill-current"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49v-1.92c-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.92a9.3 9.3 0 0 1 2.5.35c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.95.68 1.92v2.8c0 .27.18.59.69.49A10.23 10.23 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
    </svg>
  )
}

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      })

      if (error) {
        setError("E-mail ou senha inválidos.")
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Não foi possível entrar. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black lg:grid lg:grid-cols-2">
      {/* Lado esquerdo */}
      <section className="relative hidden overflow-hidden bg-black lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 20% 15%, white 100%, transparent),
              radial-gradient(1px 1px at 60% 8%, white 100%, transparent),
              radial-gradient(1px 1px at 80% 25%, white 100%, transparent),
              radial-gradient(1.5px 1.5px at 40% 35%, white 100%, transparent),
              radial-gradient(1px 1px at 90% 60%, white 100%, transparent),
              radial-gradient(1px 1px at 15% 75%, white 100%, transparent),
              radial-gradient(1px 1px at 55% 85%, white 100%, transparent)
            `,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-white/5" />
      </section>

      {/* Formulário */}
      <section className="flex min-h-screen items-center justify-center bg-black p-6 lg:p-12">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-8 shadow-2xl lg:p-10">
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">
              Pronto para estudar?
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
              Faça login para encontrar seu ritmo.
            </p>
          </header>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-neutral-300"
              >
                E-mail
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  required
                  autoComplete="email"
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setError("")
                  }}
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#1A1A1A] pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white/60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-neutral-300"
              >
                Senha
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  required
                  autoComplete="current-password"
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setError("")
                  }}
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#1A1A1A] pl-11 pr-11 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-white/60"
                />

                <button
                  type="button"
                  onClick={() => setShowPass((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors hover:text-white"
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPass ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <button
                type="button"
                onClick={() => setRemember((value) => !value)}
                className="flex items-center gap-2 text-sm text-neutral-300"
                aria-pressed={remember}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                    remember
                      ? "border-white bg-white"
                      : "border-white/20 bg-transparent"
                  }`}
                >
                  {remember && (
                    <Check
                      className="h-3 w-3 text-black"
                      strokeWidth={3}
                    />
                  )}
                </span>

                Lembrar de mim
              </button>

              <Link
                href="/esqueci-senha"
                className="text-sm text-white transition-opacity hover:opacity-70"
              >
                Esqueci minha senha
              </Link>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />

                <p className="text-sm text-neutral-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-bold text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                "Entrando..."
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />

            <span className="text-xs text-neutral-500">
              ou continue com
            </span>

            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-[#1A1A1A] text-white transition-colors hover:bg-white hover:text-black"
              aria-label="Continuar com Google"
            >
              <GoogleIcon />
            </button>

            <button
              type="button"
              className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-[#1A1A1A] text-white transition-colors hover:bg-white hover:text-black"
              aria-label="Continuar com Microsoft"
            >
              <MicrosoftIcon />
            </button>

            <button
              type="button"
              className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-[#1A1A1A] text-white transition-colors hover:bg-white hover:text-black"
              aria-label="Continuar com GitHub"
            >
              <GitHubIcon />
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-neutral-400">
            Ainda não tem uma conta?{" "}
            <Link
              href="/cadastro"
              className="font-medium text-white transition-opacity hover:opacity-70"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}