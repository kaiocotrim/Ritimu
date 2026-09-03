"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, ChevronLeft, ChevronRight, Eye, EyeOff, LoaderCircle, Lock, Mail, UserRound, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { authClient } from "@/lib/auth-client"
import { LoginMascot } from "@/components/auth/login-mascot"
import { FaceID } from "@/components/animations/Face-id/page"

const gallery = [
  { src: "/bannerLogin/img%20(1).png", title: "Estude no seu ritmo. Evolua todos os dias." },
  { src: "/bannerLogin/img%20(2).png", title: "Transforme estudos em conquistas" },
  { src: "/bannerLogin/img%20(3).png", title: "Organize sua jornada de aprendizado" },
  { src: "/bannerLogin/img%20(4).png", title: "Cada passo leva você mais longe" },
]

const strengthStyles = {
  weak: { label: "Fraca", color: "#ef4444", bars: 1 },
  medium: { label: "Média", color: "#f59e0b", bars: 2 },
  strong: { label: "Forte", color: "#22c55e", bars: 3 },
} as const

export default function Login() {
  const router = useRouter(), reduceMotion = useReducedMotion()
  const successAudioRef = useRef<HTMLAudioElement>(null)
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [name, setName] = useState(""), [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState(""), [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true), [showPass, setShowPass] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [loading, setLoading] = useState(false), [error, setError] = useState("")
  const [checkingSession, setCheckingSession] = useState(true)
  const [loginSucceeded, setLoginSucceeded] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false), [slide, setSlide] = useState(0)

  useEffect(() => {
    let active = true
    const requestedMode = new URLSearchParams(window.location.search).get("mode")
    void authClient.getSession().then(({ data }) => {
      if (!active) return
      if (data?.session) {
        router.replace("/dashboard")
        return
      }
      if (requestedMode === "signup") setMode("signup")
      setCheckingSession(false)
    }).catch(() => {
      if (active) setCheckingSession(false)
    })
    return () => { active = false }
  }, [router])

  useEffect(() => {
    if (!galleryOpen) return
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setGalleryOpen(false) }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [galleryOpen])

  const previousSlide = () => setSlide(index => (index - 1 + gallery.length) % gallery.length)
  const nextSlide = () => setSlide(index => (index + 1) % gallery.length)

  function changeMode(nextMode: "login" | "signup") {
    setMode(nextMode)
    setError("")
    setPassword("")
    setConfirmPassword("")
    setShowPass(false)
    window.history.replaceState(null, "", nextMode === "signup" ? "/login?mode=signup" : "/login")
  }

  async function finishAuthentication() {
    setLoginSucceeded(true)
    window.requestAnimationFrame(() => {
      const audio = successAudioRef.current
      if (!audio) return
      audio.currentTime = 0
      audio.volume = 0.55
      void audio.play().catch(() => undefined)
    })
    await new Promise((resolve) => window.setTimeout(resolve, reduceMotion ? 500 : 2800))
    router.replace("/dashboard")
    router.refresh()
  }

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("")
    try {
      const result = await authClient.signIn.email({ email, password, rememberMe: remember })
      if (result.error) return setError("E-mail ou senha inválidos.")
      await finishAuthentication()
    }
    catch { setError("Não foi possível entrar. Tente novamente.") }
    finally { setLoading(false) }
  }

  async function signup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    if (name.trim().length < 2) return setError("Informe seu nome completo.")
    if (password.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.")
    if (password !== confirmPassword) return setError("As senhas não coincidem.")
    setLoading(true)
    try {
      const result = await authClient.signUp.email({ name: name.trim(), email, password })
      if (result.error) return setError("Não foi possível criar a conta. Verifique se o e-mail já está em uso.")
      await finishAuthentication()
    } catch {
      setError("Não foi possível criar sua conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) return <main className="grid min-h-screen place-items-center bg-white text-[#111827]" aria-live="polite"><div className="flex items-center gap-3 text-sm font-medium text-black/50"><LoaderCircle className="size-5 animate-spin text-[#1887f2]" />Verificando sua sessão...</div></main>

  return <main className="relative min-h-screen overflow-x-hidden bg-white text-[#111827]">
    <audio ref={successAudioRef} src="/sounds/login-success.mp3" preload="auto" />
    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_28%_44%,#f1f7ea_0%,#fafafa_38%,#ffffff_72%)]" />
    <LoginMascot passwordState={passwordFocused ? (password ? "typing" : "focused") : "idle"} />
    <div className={`relative mx-auto grid min-h-screen max-w-4xl items-center justify-center gap-10 px-5 py-8 sm:px-8 lg:gap-10 lg:px-8 ${loginSucceeded ? "lg:grid-cols-1" : "lg:grid-cols-[minmax(0,400px)_minmax(0,340px)]"}`}>
      <AnimatePresence initial={false} mode="popLayout">
      {!loginSucceeded && <motion.section
        key="login-showcase"
        className="relative hidden min-h-[530px] lg:flex lg:flex-col"
        exit={reduceMotion ? undefined : { opacity: 0, x: -56, scale: 0.97, filter: "blur(10px)" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href="/" className="inline-flex w-fit items-center gap-1 text-sm font-medium text-[#1887f2] transition hover:opacity-70"><ChevronLeft className="size-5"/>Voltar</Link>
        <div className="my-auto">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-black/35">Seu ritmo de estudos</p>
            <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold text-[#111827] xl:text-3xl">
              Estude. Foque. Evolua.
              <Image src="/rocket_1f680.png" alt="Foguete" width={32} height={32} className="size-8 shrink-0 object-contain xl:size-9" />
            </h2>
            <p className="mt-1 text-sm text-black/45">Gamifique seu aprendizado.</p>
          </div>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[32px] border border-black/[.06] bg-[#060a20] shadow-[0_28px_70px_rgba(15,23,42,.16)]">
            <Image src="/bannerLogin.png" alt="Cenário espacial do Ritimo" fill sizes="(min-width: 1024px) 55vw, 0px" className="object-cover object-center [image-rendering:pixelated]" preload />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/90 via-transparent to-transparent" />
            <div className="absolute bottom-24 left-6 right-6 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#b6f238]">Aprenda no seu ritmo</p>
              <h3 className="mt-1.5 text-xl font-semibold leading-tight xl:text-2xl">Transforme estudo em evolução</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/70">Organize sua rotina, cumpra missões e acompanhe seu progresso.</p>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex h-20 items-center justify-between border-t border-white/10 bg-[#07150f]/90 px-5 backdrop-blur-xl">
              <div className="flex min-w-0 items-center gap-3">
                <Image src="/logoDoIcone.png" alt="Logo Ritimo" width={48} height={48} className="size-12 shrink-0 rounded-xl object-cover shadow-lg" preload />
                <div className="min-w-0 text-white"><p className="truncate font-semibold">Ritimu</p><p className="truncate text-xs text-white/50">Estude, evolua e conquiste</p></div>
              </div>
              <button type="button" onClick={()=>setGalleryOpen(true)} className="ml-4 shrink-0 rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/30">Visualizar</button>
            </div>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-black/35">Uma experiência simples para transformar rotina em progresso.</p>
      </motion.section>}
      </AnimatePresence>
      <motion.div
        layout
        className={`relative w-full ${mode === "signup" ? "max-w-[360px]" : "max-w-[340px]"} ${loginSucceeded ? "justify-self-center" : "justify-self-end"}`}
        transition={{ layout: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }}
      >
        <motion.section initial={reduceMotion ? false : { opacity:0,y:22,scale:.98 }} animate={{ opacity:1,y:0,scale:1 }} transition={{ duration:.65,ease:[.22,1,.36,1] }} className={`relative z-10 w-full border border-black/[.07] bg-white/90 text-[#111827] shadow-[0_24px_65px_rgba(15,23,42,.10)] backdrop-blur-xl ${mode === "signup" ? "rounded-2xl p-4 sm:p-5" : "rounded-3xl p-6 sm:p-8"}`}>
        <AnimatePresence mode="wait" initial={false}>
          {loginSucceeded ? (
            <motion.div
              key="face-id"
              className="flex min-h-[470px] flex-col items-center justify-center text-center"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              aria-live="polite"
            >
              <FaceID className="size-32" loop={false} />
              <h1 className="mt-5 text-2xl font-semibold tracking-[-.025em]">{mode === "signup" ? "Conta criada" : "Login reconhecido"}</h1>
              <p className="mt-2 text-sm text-black/45">Preparando sua jornada…</p>
            </motion.div>
          ) : (
            <motion.div
              key={mode}
              initial={reduceMotion ? false : { opacity: 0, x: mode === "signup" ? 18 : -18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -14, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.32 }}
            >
              <header className={`${mode === "signup" ? "mb-3" : "mb-6"} text-center`}>
                <div className={`mx-auto lg:hidden ${mode === "signup" ? "mb-2" : "mb-6"}`}><Image src="/logoDoIcone.png" alt="Ritimo" width={72} height={72} className={`mx-auto object-cover shadow-lg ${mode === "signup" ? "size-11 rounded-xl" : "size-18 rounded-2xl"}`} /></div>
                <h1 className="text-xl font-semibold">{mode === "signup" ? "Crie sua conta" : "Bem-vindo de volta"}</h1>
                <p className={`${mode === "signup" ? "mt-0.5" : "mt-1"} text-xs text-black/45`}>{mode === "signup" ? "Comece agora sua jornada de estudos." : "Entre para continuar sua jornada."}</p>
              </header>
              <form onSubmit={mode === "signup" ? signup : login} className={mode === "signup" ? "space-y-2.5 [&_input]:h-10 [&_input]:rounded-lg [&>label]:text-[11px] [&>label>span]:mt-1" : "space-y-4 [&_input]:h-12 [&_input]:rounded-xl [&>label]:text-xs [&>label>span]:mt-1.5"}>
                {mode === "signup" && <Field label="Nome"><UserRound className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/35"/><input required type="text" autoComplete="name" minLength={2} value={name} onChange={e=>{setName(e.target.value);setError("")}} placeholder="Seu nome" className="h-16 w-full rounded-2xl border border-black/[.08] bg-[#f5f5f7] pl-12 pr-4 outline-none transition placeholder:text-black/30 focus:border-[#1887f2]/45 focus:bg-white focus:ring-4 focus:ring-[#1887f2]/10"/></Field>}
                <Field label="E-mail"><Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/35"/><input required type="email" autoComplete="email" value={email} onChange={e=>{setEmail(e.target.value);setError("")}} placeholder="seu@email.com" className="h-16 w-full rounded-2xl border border-black/[.08] bg-[#f5f5f7] pl-12 pr-4 outline-none transition placeholder:text-black/30 focus:border-[#1887f2]/45 focus:bg-white focus:ring-4 focus:ring-[#1887f2]/10"/></Field>
                <Field label="Senha"><Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/35"/><input required minLength={mode === "signup" ? 8 : undefined} type={showPass?"text":"password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onFocus={()=>setPasswordFocused(true)} onBlur={()=>setPasswordFocused(false)} onChange={e=>{setPassword(e.target.value);setError("")}} placeholder="••••••••" className="h-16 w-full rounded-2xl border border-black/[.08] bg-[#f5f5f7] px-12 outline-none transition placeholder:text-black/30 focus:border-[#1887f2]/45 focus:bg-white focus:ring-4 focus:ring-[#1887f2]/10"/><button type="button" onClick={()=>setShowPass(v=>!v)} aria-label={showPass ? "Ocultar senha" : "Mostrar senha"} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/35">{showPass?<EyeOff className="size-5"/>:<Eye className="size-5"/>}</button></Field>
                {mode === "signup" && <PasswordStrength password={password} />}
                {mode === "signup" && <Field label="Confirmar senha"><Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/35"/><input required minLength={8} type={showPass?"text":"password"} autoComplete="new-password" value={confirmPassword} onChange={e=>{setConfirmPassword(e.target.value);setError("")}} placeholder="••••••••" className="h-16 w-full rounded-2xl border border-black/[.08] bg-[#f5f5f7] pl-12 pr-4 outline-none transition placeholder:text-black/30 focus:border-[#1887f2]/45 focus:bg-white focus:ring-4 focus:ring-[#1887f2]/10"/></Field>}
                {mode === "login" && <div className="flex items-center justify-between gap-2 text-[11px]"><button type="button" onClick={()=>setRemember(v=>!v)} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-black/55"><span className={`grid size-4 place-items-center rounded ${remember?"bg-[#1887f2] text-white":"border border-black/20"}`}>{remember&&<Check className="size-2.5"/>}</span>Lembrar de mim</button><Link href="/esqueci-senha" className="shrink-0 whitespace-nowrap font-medium text-[#1887f2]">Esqueci minha senha</Link></div>}
                {error&&<motion.p role="alert" initial={{opacity:0}} animate={{opacity:1}} className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</motion.p>}
                <motion.button type="submit" whileHover={reduceMotion?undefined:{y:-2}} disabled={loading} className={`flex w-full items-center justify-center gap-3 rounded-full bg-[#111827] font-semibold text-white shadow-lg transition hover:bg-black disabled:opacity-60 ${mode === "signup" ? "h-10 text-xs" : "h-11 text-sm"}`}>{loading?<><LoaderCircle className="size-5 animate-spin"/>{mode === "signup" ? "Criando conta..." : "Entrando..."}</>:<>{mode === "signup" ? "Criar conta" : "Entrar"}<ArrowRight className="size-5"/></>}</motion.button>
              </form>
              <div className={`${mode === "signup" ? "my-3.5" : "my-5"} flex items-center gap-4`}><span className="h-px flex-1 bg-black/10"/><span className="text-[10px] text-black/35">ou continue com</span><span className="h-px flex-1 bg-black/10"/></div>
              <div className={`grid grid-cols-3 gap-2.5 ${mode === "signup" ? "[&_button]:h-10 [&_svg]:size-4" : "[&_button]:h-11 [&_svg]:size-4"}`}>
                <SocialButton label="Google"><GoogleIcon /></SocialButton>
                <SocialButton label="Microsoft"><MicrosoftIcon /></SocialButton>
                <SocialButton label="GitHub"><GitHubIcon /></SocialButton>
              </div>
              <p className={`${mode === "signup" ? "mt-3" : "mt-5"} text-center text-[11px] text-black/40`}>{mode === "signup" ? "Já tem uma conta? " : "Ainda não tem uma conta? "}<button type="button" onClick={() => changeMode(mode === "signup" ? "login" : "signup")} className="font-semibold text-[#1887f2] hover:underline">{mode === "signup" ? "Entrar" : "Criar conta"}</button></p>
            </motion.div>
          )}
        </AnimatePresence>
        </motion.section>
      </motion.div>
    </div>
    {galleryOpen&&<motion.div role="dialog" aria-modal="true" aria-label="Galeria do Ritimu" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={event=>{if(event.target===event.currentTarget)setGalleryOpen(false)}} className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-xl sm:p-8">
      <motion.div initial={{opacity:0,y:24,scale:.98}} animate={{opacity:1,y:0,scale:1}} className="w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 sm:px-7">
          <div><p className="font-semibold text-[#111827]">Conheça o Ritimu</p><p className="text-sm text-black/40">{gallery[slide].title}</p></div>
          <button type="button" onClick={()=>setGalleryOpen(false)} aria-label="Fechar galeria" className="grid size-10 place-items-center rounded-full bg-[#f2f2f7] text-black/55 transition hover:bg-[#e5e5ea]"><X className="size-5"/></button>
        </div>
        <div className="relative aspect-video bg-[#050816]">
          <Image key={gallery[slide].src} src={gallery[slide].src} alt={gallery[slide].title} fill sizes="(max-width: 1200px) 100vw, 1152px" className="object-contain" />
          <button type="button" onClick={previousSlide} aria-label="Imagem anterior" className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow-lg transition hover:scale-105"><ChevronLeft className="size-6"/></button>
          <button type="button" onClick={nextSlide} aria-label="Próxima imagem" className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow-lg transition hover:scale-105"><ChevronRight className="size-6"/></button>
        </div>
        <div className="flex items-center justify-center gap-2 px-5 py-5">
          {gallery.map((item,index)=><button key={item.src} type="button" onClick={()=>setSlide(index)} aria-label={`Abrir imagem ${index+1}`} aria-current={slide===index} className={`h-2 rounded-full transition-all ${slide===index?"w-7 bg-[#1887f2]":"w-2 bg-black/15 hover:bg-black/30"}`}/>) }
        </div>
      </motion.div>
    </motion.div>}
  </main>
}

function Field({label,children}:{label:string;children:ReactNode}) { return <label className="block text-sm font-semibold">{label}<span className="relative mt-2 block">{children}</span></label> }

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ caracteres", met: password.length >= 8 },
    { label: "Maiúscula e minúscula", met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Um número", met: /\d/.test(password) },
    { label: "Um símbolo", met: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter((check) => check.met).length
  const level = score >= 4 ? "strong" : score >= 2 ? "medium" : "weak"
  const strength = strengthStyles[level]

  return <AnimatePresence initial={false}>
    {password && <motion.div
      key="password-strength"
      initial={{ opacity: 0, height: 0, y: -6 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, y: -6 }}
      className="-mt-2 overflow-hidden"
      aria-live="polite"
    >
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span className="text-black/40">Força da senha</span>
        <motion.span key={level} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} style={{ color: strength.color }}>{strength.label}</motion.span>
      </div>
      <div className="mt-1 grid grid-cols-3 gap-1.5" aria-hidden="true">
        {[1, 2, 3].map((bar) => <motion.span
          key={bar}
          className="h-1 rounded-full bg-black/10"
          animate={{
            backgroundColor: bar <= strength.bars ? strength.color : "rgba(17, 24, 39, 0.10)",
            scaleY: bar <= strength.bars ? [1, 1.45, 1] : 1,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />)}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
        {checks.map((check) => <span key={check.label} className={`flex min-w-0 items-center gap-1 text-[10px] transition-colors ${check.met ? "text-[#168f3e]" : "text-black/35"}`}>
          <span className={`grid size-3 shrink-0 place-items-center rounded-full transition-colors ${check.met ? "bg-[#22c55e] text-white" : "border border-black/15"}`}>{check.met && <Check className="size-2" />}</span>
          {check.label}
        </span>)}
      </div>
    </motion.div>}
  </AnimatePresence>
}

function SocialButton({ label, children }: { label: string; children: ReactNode }) {
  return <button type="button" aria-label={`Continuar com ${label}`} title={label} className="group grid h-14 place-items-center rounded-2xl border border-black/[.08] bg-[#f5f5f7] text-[#111827] transition duration-200 hover:-translate-y-0.5 hover:border-black/[.12] hover:bg-white hover:shadow-[0_8px_24px_rgba(15,23,42,.10)] active:translate-y-0">{children}</button>
}

function GoogleIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z" />
    <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.59A10 10 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.39 13.9A6 6 0 0 1 6.08 12c0-.66.11-1.3.31-1.9V7.51H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.49l3.35-2.59Z" />
    <path fill="#EA4335" d="M12 5.97c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.51L6.39 10.1C7.18 7.73 9.39 5.97 12 5.97Z" />
  </svg>
}

function MicrosoftIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
    <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
    <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
    <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
    <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
  </svg>
}

function GitHubIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.58 9.58 0 0 1 12 6.82c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
  </svg>
}
