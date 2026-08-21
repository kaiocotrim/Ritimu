import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Home() {
  return (
    <main>
      <h1>Bem-vindo ao RITIMU !</h1>
      <Link href="/login">
        <Button>Entrar</Button>
      </Link>
    </main>
  );
} 

export default Home;