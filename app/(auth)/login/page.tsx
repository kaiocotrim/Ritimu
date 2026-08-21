import Link from "next/link"
import button from "@/components/ui/button"

export function Login() {
    return (
        <main>
            <h1>Tela de login</h1>
            <Link href="/">
                <button>Voltar para home</button>
            </Link>
        </main>
    )
}

export default Login