"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, Lock, Mail } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { authClient } from "@/lib/auth-client"
import { LoginRocket } from "@/components/auth/login-rocket"

export default function Login() {
  const router = useRouter(), reduceMotion = useReducedMotion()
  const [email, setEmail] = useState(""), [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true), [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false), [error, setError] = useState("")

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("")
    try { const result = await authClient.signIn.email({ email, password }); if (result.error) return setError("E-mail ou senha inválidos."); router.push("/dashboard") }
    catch { setError("Não foi possível entrar. Tente novamente.") }
    finally { setLoading(false) }
  }

  return <main className="pixel-login relative min-h-screen overflow-hidden bg-white text-[#202128]">
    <LoginRocket />
    <div className="relative mx-auto flex min-h-screen max-w-[1500px] items-center justify-center px-5 py-10 lg:px-12">
      <motion.div initial={reduceMotion ? false : { opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .65, delay: .15 }} className="relative z-10 -mr-8 hidden h-[590px] w-[230px] shrink-0 self-center lg:block">
        <Image src="/kaio.png" alt="Astronauta em pixel art" fill sizes="230px" className="object-contain object-right [image-rendering:pixelated]" priority />
      </motion.div>
      <motion.section initial={reduceMotion ? false : { opacity:0,y:22,scale:.98 }} animate={{ opacity:1,y:0,scale:1 }} transition={{ duration:.65,ease:[.22,1,.36,1] }} className="pixel-login-card mx-auto w-full max-w-xl border-2 border-[#202128] bg-white p-6 sm:p-10 lg:p-12">
        <header className="mb-8 text-center"><h1 className="text-3xl font-bold">Pronto para estudar?</h1><p className="mt-2 text-black/45">Faça login para encontrar seu ritmo.</p></header>
        <form onSubmit={login} className="space-y-5">
          <Field label="E-mail"><Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/35"/><input required type="email" autoComplete="email" value={email} onChange={e=>{setEmail(e.target.value);setError("")}} placeholder="seu@email.com" className="login-input pl-12"/></Field>
          <Field label="Senha"><Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-black/35"/><input required type={showPass?"text":"password"} autoComplete="current-password" value={password} onChange={e=>{setPassword(e.target.value);setError("")}} placeholder="••••••••" className="login-input px-12"/><button type="button" onClick={()=>setShowPass(v=>!v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/35">{showPass?<EyeOff className="size-5"/>:<Eye className="size-5"/>}</button></Field>
          <div className="flex justify-between gap-4"><button type="button" onClick={()=>setRemember(v=>!v)} className="flex items-center gap-2 text-sm text-black/65"><span className={`grid size-4 place-items-center rounded ${remember?"bg-[#5FC536] text-white":"border border-black/20"}`}>{remember&&<Check className="size-3"/>}</span>Lembrar de mim</button><Link href="/esqueci-senha" className="text-sm font-medium text-[#4DAE2B]">Esqueci minha senha</Link></div>
          {error&&<motion.p initial={{opacity:0}} animate={{opacity:1}} className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</motion.p>}
          <motion.button type="submit" whileHover={reduceMotion?undefined:{y:-2}} disabled={loading} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#55BE2D] to-[#65CC35] font-bold text-white shadow-[0_14px_30px_rgba(80,190,45,.22)] disabled:opacity-60">{loading?<><LoaderCircle className="size-5 animate-spin"/>Entrando...</>:<>Entrar<ArrowRight className="size-5"/></>}</motion.button>
        </form>
        <div className="my-7 flex items-center gap-4"><span className="h-px flex-1 bg-black/10"/><span className="text-xs text-black/40">ou continue com</span><span className="h-px flex-1 bg-black/10"/></div>
        <div className="grid grid-cols-3 gap-3">{["G","▦","●"].map((icon,index)=><button key={icon} type="button" aria-label={["Google","Microsoft","GitHub"][index]} className="grid h-14 place-items-center rounded-2xl border border-black/10 bg-white text-xl font-bold transition hover:-translate-y-0.5 hover:border-[#65C735]/40 hover:shadow-md">{icon}</button>)}</div>
        <p className="mt-8 text-center text-sm text-black/45">Ainda não tem uma conta? <Link href="/cadastro" className="font-semibold text-[#4DAE2B]">Criar conta</Link></p>
      </motion.section>
    </div>
  </main>
}

function Field({label,children}:{label:string;children:ReactNode}) { return <label className="block text-sm font-semibold">{label}<span className="relative mt-2 block">{children}</span></label> }
