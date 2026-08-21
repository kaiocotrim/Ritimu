import Link from "next/link";
import button from "@/components/ui/button";

export function Home() {
  return (
    <main>
      <h1>Bem-vindo ao RITIMU !</h1>
      <Link href="/login">
        <button>Entrar</button>
      </Link>
    </main>
  );
} 

export default Home;