"use client"

import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const { data, error } = await authClient.signIn.email({
      email,
      password,
    })

    if (error) {
      console.log(error)
      return
    }

    console.log(data)
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

          <Button type="submit">
            Entrar
          </Button>
        </form>

        <Link href="/">
          <Button variant="outline">
            Voltar para home
          </Button>
        </Link>

        <Link href="/cadastro">
          <Button variant="outline">
            Criar conta
          </Button>
        </Link>
      </Card>
    </main>
  )
}