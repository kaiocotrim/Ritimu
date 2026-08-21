import Link from "next/link"
import { Button }  from "@/components/ui/button"

export function Login() {
    return (
        <main>
            <h1>Tela de login</h1>
            <Link href="/">
                <Button>Voltar para home</Button>
            </Link>
        </main>
    )
}

export default Login 