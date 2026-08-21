import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function Login() {
    return (
        <main>
            <Card>
                <h1>Tela de login</h1>
                <Link href="/">
                    <Button>Voltar para home</Button>
                </Link>
            </Card>
        </main>
    )
}

export default Login 