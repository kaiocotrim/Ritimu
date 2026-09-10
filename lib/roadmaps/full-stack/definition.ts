export type FullStackSection = "frontend" | "backend" | "devops"
export type FullStackNodeKind = "TOPIC" | "CHECKPOINT"
export type FullStackResourceKind = "Vídeo" | "Playlist" | "Documentação" | "Curso" | "Roadmap" | "Prática"

export type FullStackResource = { title: string; provider: string; kind: FullStackResourceKind; url: string }
export type FullStackNode = {
  key: string
  title: string
  description: string
  section: FullStackSection
  kind: FullStackNodeKind
  position: { x: number; y: number }
  resources: FullStackResource[]
}
export type FullStackEdge = { from: string; to: string; style: "solid" | "dashed" }

export const FULL_STACK_DEFINITION_VERSION = 2
const doc = (title: string, provider: string, url: string): FullStackResource => ({ title, provider, url, kind: "Documentação" })
const video = (title: string, url: string): FullStackResource => ({ title, provider: "YouTube", url, kind: "Vídeo" })
const topic = (key: string, title: string, description: string, section: FullStackSection, x: number, y: number, resources: FullStackResource[]): FullStackNode => ({ key, title, description, section, kind: "TOPIC", position: { x, y }, resources })
const checkpoint = (key: string, title: string, section: FullStackSection, x: number, y: number): FullStackNode => ({ key, title, description: "Checkpoint prático para consolidar os conhecimentos desta parte da trilha.", section, kind: "CHECKPOINT", position: { x, y }, resources: [] })

export const FULL_STACK_NODES: FullStackNode[] = [
  topic("html", "HTML", "A linguagem de marcação usada para estruturar páginas web.", "frontend", 120, 90, [video("HTML Full Course for Beginners", "https://www.youtube.com/watch?v=pQN-pnXPaVg"), doc("Aprenda HTML", "MDN", "https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Structuring_content")]),
  topic("css", "CSS", "A linguagem que define apresentação, layout e responsividade na web.", "frontend", 330, 90, [video("CSS Tutorial — Zero to Hero", "https://www.youtube.com/watch?v=1Rs2ND1ryYc"), doc("Aprenda CSS", "MDN", "https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Styling_basics")]),
  checkpoint("checkpoint-static-webpages", "Checkpoint — Estilo de Webpages", "frontend", 225, 180),
  topic("javascript", "JavaScript", "A linguagem de programação que adiciona lógica e interatividade à web.", "frontend", 240, 280, [video("JavaScript Programming — Full Course", "https://www.youtube.com/watch?v=jS4aFq5-91M"), doc("Guia JavaScript", "MDN", "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide")]),
  checkpoint("checkpoint-interactivity", "Checkpoint — Interatividade", "frontend", 225, 370),
  topic("npm", "npm", "Gerenciador de pacotes e registro do ecossistema JavaScript.", "frontend", 45, 470, [doc("Introdução ao npm", "npm", "https://docs.npmjs.com/about-npm"), doc("Gerenciadores de pacotes", "Node.js", "https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager")]),
  checkpoint("checkpoint-external-packages", "Checkpoint — External Packages", "frontend", 20, 565),
  topic("git", "Git", "Sistema distribuído de controle de versão.", "frontend", 250, 470, [video("Git and GitHub for Beginners", "https://www.youtube.com/watch?v=RGOj5yH7evk"), { title: "Livro Pro Git", provider: "Git", kind: "Curso", url: "https://git-scm.com/book/pt-br/v2" }]),
  topic("github", "GitHub", "Plataforma para hospedar repositórios Git e colaborar em software.", "frontend", 440, 470, [doc("Introdução ao GitHub", "GitHub", "https://docs.github.com/pt/get-started/start-your-journey/hello-world"), { title: "GitHub Skills", provider: "GitHub", kind: "Prática", url: "https://skills.github.com/" }]),
  checkpoint("checkpoint-collaborative-work", "Checkpoint — Colaborative Work", "frontend", 335, 565),
  topic("tailwind-css", "Tailwind CSS", "Framework CSS utility-first para compor interfaces.", "frontend", 80, 665, [doc("Instalação e fundamentos", "Tailwind CSS", "https://tailwindcss.com/docs/installation"), { title: "Tailwind Play", provider: "Tailwind CSS", kind: "Prática", url: "https://play.tailwindcss.com/" }]),
  topic("react", "React", "Biblioteca para criar interfaces declarativas baseadas em componentes.", "frontend", 365, 665, [video("React Course — Beginner's Tutorial", "https://www.youtube.com/watch?v=bMknfKXIFA8"), { title: "Aprenda React", provider: "React", kind: "Curso", url: "https://react.dev/learn" }]),
  checkpoint("checkpoint-frontend-apps", "Checkpoint — Frontend Apps", "frontend", 220, 765),

  topic("node-js", "Node.js", "Runtime JavaScript para aplicações de servidor e ferramentas CLI.", "backend", 800, 125, [video("Node.js and Express.js — Full Course", "https://www.youtube.com/watch?v=Oe421EPjeBE"), doc("Aprenda Node.js", "Node.js", "https://nodejs.org/en/learn")]),
  checkpoint("checkpoint-cli-apps", "Checkpoint — CLI Apps", "backend", 780, 220),
  topic("postgresql", "PostgreSQL", "Banco de dados relacional open source robusto e extensível.", "backend", 675, 325, [doc("Tutorial oficial", "PostgreSQL", "https://www.postgresql.org/docs/current/tutorial.html"), { title: "SQLBolt", provider: "SQLBolt", kind: "Prática", url: "https://sqlbolt.com/" }]),
  checkpoint("checkpoint-simple-crud", "Checkpoint — Simple CRUD Apps", "backend", 760, 420),
  topic("restful-apis", "RESTful APIs", "Estilo arquitetural para APIs orientadas a recursos sobre HTTP.", "backend", 610, 525, [doc("REST", "MDN", "https://developer.mozilla.org/en-US/docs/Glossary/REST"), { title: "API Design", provider: "roadmap.sh", kind: "Roadmap", url: "https://roadmap.sh/api-design" }]),
  topic("jwt-auth", "JWT Auth", "Autenticação baseada em tokens assinados com JSON Web Token.", "backend", 790, 525, [doc("Introdução ao JWT", "JWT.io", "https://jwt.io/introduction"), doc("JSON Web Token", "IETF", "https://datatracker.ietf.org/doc/html/rfc7519")]),
  topic("redis", "Redis", "Armazenamento em memória usado para cache, filas e dados efêmeros.", "backend", 1150, 525, [doc("Comece com Redis", "Redis", "https://redis.io/docs/latest/get-started/"), { title: "Redis University", provider: "Redis", kind: "Curso", url: "https://university.redis.io/" }]),
  checkpoint("checkpoint-complete-app", "Checkpoint — Complete App", "backend", 865, 660),
  topic("orm-prisma", "ORM (Prisma)", "ORM moderno e tipado para acessar bancos de dados em aplicações Node.js.", "backend", 970, 525, [doc("Prisma ORM", "Prisma", "https://www.prisma.io/docs/orm")]),

  topic("linux-basics", "Linux Basics", "Fundamentos de terminal, arquivos, permissões, processos e rede no Linux.", "devops", 1410, 90, [{ title: "Introduction to Linux", provider: "Linux Foundation", kind: "Curso", url: "https://training.linuxfoundation.org/training/introduction-to-linux/" }, { title: "Linux", provider: "roadmap.sh", kind: "Roadmap", url: "https://roadmap.sh/linux" }]),
  topic("basic-aws-services", "Docker & Containerization", "Empacotamento e execução consistente de aplicações em contêineres.", "devops", 1400, 180, [doc("Comece com Docker", "Docker", "https://docs.docker.com/get-started/")]),
  topic("ec2", "CI/CD", "Integração e entrega contínuas para automatizar o ciclo de software.", "devops", 1180, 280, [doc("CI/CD com GitHub Actions", "GitHub", "https://docs.github.com/pt/actions/about-github-actions/about-continuous-integration-with-github-actions")]),
  topic("vpc", "VPS", "Servidor virtual privado para hospedar aplicações e serviços.", "devops", 1350, 280, [doc("Configuração inicial de servidor", "DigitalOcean", "https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu")]),
  topic("s3", "Nginx", "Servidor web e proxy reverso de alto desempenho.", "devops", 1520, 280, [doc("Guia para iniciantes", "Nginx", "https://nginx.org/en/docs/beginners_guide.html")]),
  topic("route-53", "Route 53", "DNS gerenciado e roteamento de tráfego da AWS.", "devops", 1690, 280, [doc("O que é Route 53", "AWS", "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html")]),
  topic("ses", "SSL", "Criptografia e identidade para conexões seguras via HTTPS.", "devops", 1860, 280, [doc("Transport Layer Security", "MDN", "https://developer.mozilla.org/pt-BR/docs/Web/Security/Transport_Layer_Security")]),
  checkpoint("checkpoint-deployment", "Checkpoint — Deployments", "devops", 1515, 380),
  topic("monit", "Monitoring", "Observabilidade de processos, infraestrutura e saúde das aplicações.", "devops", 1260, 485, [doc("Monitoring Distributed Systems", "Google SRE", "https://sre.google/sre-book/monitoring-distributed-systems/")]),
  checkpoint("checkpoint-monitoring", "Checkpoint — Monitoring", "devops", 1235, 585),
  topic("github-actions", "GitHub Actions", "Automação de integração, testes e entregas a partir do repositório.", "devops", 1515, 485, [doc("Entender o GitHub Actions", "GitHub", "https://docs.github.com/pt/actions/about-github-actions/understanding-github-actions"), { title: "Hello GitHub Actions", provider: "GitHub Skills", kind: "Prática", url: "https://github.com/skills/hello-github-actions" }]),
  checkpoint("checkpoint-cicd", "Checkpoint — CI/CD", "devops", 1495, 585),
  topic("ansible", "Scalability", "Práticas para ampliar capacidade, disponibilidade e desempenho de sistemas.", "devops", 1770, 485, [doc("Arquiteturas escaláveis", "AWS", "https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/scalable-architecture.html")]),
  checkpoint("checkpoint-automation", "Checkpoint — Automation", "devops", 1750, 585),
  topic("terraform", "Terraform", "Infraestrutura como código declarativa e reproduzível.", "devops", 1515, 685, [video("Terraform Course — Automate your AWS cloud infrastructure", "https://www.youtube.com/watch?v=SLB_c_ayRMo"), { title: "Get Started — AWS", provider: "HashiCorp", kind: "Prática", url: "https://developer.hashicorp.com/terraform/tutorials/aws-get-started" }]),
  checkpoint("checkpoint-infrastructure", "Checkpoint — Infrastructure", "devops", 1495, 785),
]

const edge = (from: string, to: string, style: "solid" | "dashed" = "solid"): FullStackEdge => ({ from, to, style })
export const FULL_STACK_EDGES: FullStackEdge[] = [
  edge("html", "checkpoint-static-webpages"), edge("css", "checkpoint-static-webpages"), edge("checkpoint-static-webpages", "javascript"), edge("javascript", "checkpoint-interactivity"),
  edge("checkpoint-interactivity", "npm"), edge("npm", "checkpoint-external-packages"), edge("checkpoint-interactivity", "git"), edge("git", "github"), edge("github", "checkpoint-collaborative-work"),
  edge("checkpoint-external-packages", "tailwind-css"), edge("checkpoint-collaborative-work", "react"), edge("tailwind-css", "checkpoint-frontend-apps"), edge("react", "checkpoint-frontend-apps"),
  edge("checkpoint-frontend-apps", "node-js", "dashed"), edge("node-js", "checkpoint-cli-apps"), edge("checkpoint-cli-apps", "postgresql"), edge("postgresql", "checkpoint-simple-crud"),
  edge("checkpoint-simple-crud", "restful-apis"), edge("checkpoint-simple-crud", "jwt-auth"), edge("checkpoint-simple-crud", "orm-prisma"), edge("checkpoint-simple-crud", "redis"), edge("restful-apis", "checkpoint-complete-app"), edge("jwt-auth", "checkpoint-complete-app"), edge("orm-prisma", "checkpoint-complete-app"), edge("redis", "checkpoint-complete-app"),
  edge("checkpoint-complete-app", "linux-basics", "dashed"), edge("linux-basics", "basic-aws-services"), edge("basic-aws-services", "ec2"), edge("basic-aws-services", "vpc"), edge("basic-aws-services", "s3"), edge("basic-aws-services", "route-53"), edge("basic-aws-services", "ses"),
  edge("ec2", "checkpoint-deployment"), edge("vpc", "checkpoint-deployment"), edge("s3", "checkpoint-deployment"), edge("route-53", "checkpoint-deployment"), edge("ses", "checkpoint-deployment"),
  edge("checkpoint-deployment", "monit"), edge("monit", "checkpoint-monitoring"), edge("checkpoint-deployment", "github-actions"), edge("github-actions", "checkpoint-cicd"), edge("checkpoint-deployment", "ansible"), edge("ansible", "checkpoint-automation"),
  edge("checkpoint-monitoring", "terraform", "dashed"), edge("checkpoint-cicd", "terraform"), edge("checkpoint-automation", "terraform"), edge("terraform", "checkpoint-infrastructure"),
]

export const FULL_STACK_ROADMAP_DEFINITION = {
  version: FULL_STACK_DEFINITION_VERSION,
  slug: "full-stack-developer",
  assessmentRequired: true,
  width: 2600,
  height: 880,
  nodes: FULL_STACK_NODES,
  edges: FULL_STACK_EDGES,
} as const

export type FullStackNodeMetadata = { nodeKey: string; definitionVersion: number; nodeKind: FullStackNodeKind; countsForProgress: true }
export function readFullStackNodeMetadata(value: unknown): FullStackNodeMetadata | null {
  if (!value || typeof value !== "object") return null
  const metadata = value as Partial<FullStackNodeMetadata>
  return typeof metadata.nodeKey === "string" && metadata.definitionVersion === FULL_STACK_DEFINITION_VERSION && (metadata.nodeKind === "TOPIC" || metadata.nodeKind === "CHECKPOINT")
    ? { nodeKey: metadata.nodeKey, definitionVersion: metadata.definitionVersion, nodeKind: metadata.nodeKind, countsForProgress: true }
    : null
}
