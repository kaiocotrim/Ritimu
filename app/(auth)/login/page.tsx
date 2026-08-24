"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError("")

    const { error } = await authClient.signIn.email({
      email,
      password,
    })

    if (error) {
      setError("E-mail ou senha inválidos")
      return
    }

    router.push("/dashboard")
  }

  return (
    <main>
      <Card className="p-6">
        <h1>Tela de login</h1>

        <form onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Input
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && <p>{error}</p>}

          <Button type="submit">
            Entrar
          </Button>
        </form>

        <Link href="/cadastro">
          Criar conta
        </Link>

        <Link href="/">
          Voltar para home
        </Link>
      </Card>
    </main>
  )
}