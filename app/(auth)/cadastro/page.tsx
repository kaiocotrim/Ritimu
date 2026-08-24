"use client"

import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

export default function Cadastro() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleCadastro(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const { data, error } = await authClient.signUp.email({
      name,
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
        <h1>Criar conta</h1>

        <form onSubmit={handleCadastro}>
          <Input
            type="text"
            placeholder="Digite seu nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

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
            Criar conta
          </Button>
        </form>

        <Link href="/login">
          Já tenho uma conta
        </Link>
      </Card>
    </main>
  )
}