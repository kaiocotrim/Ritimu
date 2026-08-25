import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function Home() {
  return (
    <main>
      <Card>
        <h1>Bem-vindo ao RITIMU !</h1>
        <Link href="/login">
          <Button>Entrar</Button>
        </Link>
      </Card>

    </main>
  );
}

export default Home;  