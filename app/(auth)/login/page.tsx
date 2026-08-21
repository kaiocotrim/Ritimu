import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Login() {
  return (
    <main>
      <Card className="p-6">
        <h1>Tela de login</h1>

        <Input
          type="text"
          placeholder="Digite seu usuário"
        />

        <Input
          type="password"
          placeholder="Digite sua senha"
        />

        <Link href="/">
          <Button>Voltar para home</Button>
        </Link>
      </Card>
    </main>
  )
}