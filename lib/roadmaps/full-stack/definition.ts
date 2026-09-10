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
  topic("html", "HTML", "A linguagem de marcação usada para estruturar páginas web.", "frontend", 80, 100, [video("HTML Full Course for Beginners", "https://www.youtube.com/watch?v=pQN-pnXPaVg"), doc("Aprenda HTML", "MDN", "https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Structuring_content")]),
  topic("css", "CSS", "A linguagem que define apresentação, layout e responsividade na web.", "frontend", 330, 100, [video("CSS Tutorial — Zero to Hero", "https://www.youtube.com/watch?v=1Rs2ND1ryYc"), doc("Aprenda CSS", "MDN", "https://developer.mozilla.org/pt-BR/docs/Learn_web_development/Core/Styling_basics")]),
  checkpoint("checkpoint-static-webpages", "Checkpoint — Static Webpages", "frontend", 205, 245),
  topic("javascript", "JavaScript", "A linguagem de programação que adiciona lógica e interatividade à web.", "frontend", 205, 380, [video("JavaScript Programming — Full Course", "https://www.youtube.com/watch?v=jS4aFq5-91M"), doc("Guia JavaScript", "MDN", "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide")]),
  checkpoint("checkpoint-interactivity", "Checkpoint — Interactivity", "frontend", 205, 515),
  topic("npm", "npm", "Gerenciador de pacotes e registro do ecossistema JavaScript.", "frontend", 80, 650, [doc("Introdução ao npm", "npm", "https://docs.npmjs.com/about-npm"), doc("Gerenciadores de pacotes", "Node.js", "https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager")]),
  checkpoint("checkpoint-external-packages", "Checkpoint — External Packages", "frontend", 80, 785),
  topic("git", "Git", "Sistema distribuído de controle de versão.", "frontend", 330, 650, [video("Git and GitHub for Beginners", "https://www.youtube.com/watch?v=RGOj5yH7evk"), { title: "Livro Pro Git", provider: "Git", kind: "Curso", url: "https://git-scm.com/book/pt-br/v2" }]),
  topic("github", "GitHub", "Plataforma para hospedar repositórios Git e colaborar em software.", "frontend", 520, 650, [doc("Introdução ao GitHub", "GitHub", "https://docs.github.com/pt/get-started/start-your-journey/hello-world"), { title: "GitHub Skills", provider: "GitHub", kind: "Prática", url: "https://skills.github.com/" }]),
  checkpoint("checkpoint-collaborative-work", "Checkpoint — Collaborative Work", "frontend", 425, 785),
  topic("tailwind-css", "Tailwind CSS", "Framework CSS utility-first para compor interfaces.", "frontend", 205, 920, [doc("Instalação e fundamentos", "Tailwind CSS", "https://tailwindcss.com/docs/installation"), { title: "Tailwind Play", provider: "Tailwind CSS", kind: "Prática", url: "https://play.tailwindcss.com/" }]),
  topic("react", "React", "Biblioteca para criar interfaces declarativas baseadas em componentes.", "frontend", 455, 920, [video("React Course — Beginner's Tutorial", "https://www.youtube.com/watch?v=bMknfKXIFA8"), { title: "Aprenda React", provider: "React", kind: "Curso", url: "https://react.dev/learn" }]),
  checkpoint("checkpoint-frontend-apps", "Checkpoint — Frontend Apps", "frontend", 330, 1060),

  topic("node-js", "Node.js", "Runtime JavaScript para aplicações de servidor e ferramentas CLI.", "backend", 820, 180, [video("Node.js and Express.js — Full Course", "https://www.youtube.com/watch?v=Oe421EPjeBE"), doc("Aprenda Node.js", "Node.js", "https://nodejs.org/en/learn")]),
  checkpoint("checkpoint-cli-apps", "Checkpoint — CLI Apps", "backend", 820, 315),
  topic("postgresql", "PostgreSQL", "Banco de dados relacional open source robusto e extensível.", "backend", 700, 450, [doc("Tutorial oficial", "PostgreSQL", "https://www.postgresql.org/docs/current/tutorial.html"), { title: "SQLBolt", provider: "SQLBolt", kind: "Prática", url: "https://sqlbolt.com/" }]),
  checkpoint("checkpoint-simple-crud", "Checkpoint — Simple CRUD Apps", "backend", 820, 585),
  topic("restful-apis", "RESTful APIs", "Estilo arquitetural para APIs orientadas a recursos sobre HTTP.", "backend", 650, 720, [doc("REST", "MDN", "https://developer.mozilla.org/en-US/docs/Glossary/REST"), { title: "API Design", provider: "roadmap.sh", kind: "Roadmap", url: "https://roadmap.sh/api-design" }]),
  topic("jwt-auth", "JWT Auth", "Autenticação baseada em tokens assinados com JSON Web Token.", "backend", 820, 720, [doc("Introdução ao JWT", "JWT.io", "https://jwt.io/introduction"), doc("JSON Web Token", "IETF", "https://datatracker.ietf.org/doc/html/rfc7519")]),
  topic("redis", "Redis", "Armazenamento em memória usado para cache, filas e dados efêmeros.", "backend", 990, 720, [doc("Comece com Redis", "Redis", "https://redis.io/docs/latest/get-started/"), { title: "Redis University", provider: "Redis", kind: "Curso", url: "https://university.redis.io/" }]),
  checkpoint("checkpoint-complete-app", "Checkpoint — Complete App", "backend", 820, 870),

  topic("linux-basics", "Linux Basics", "Fundamentos de terminal, arquivos, permissões, processos e rede no Linux.", "devops", 1300, 100, [{ title: "Introduction to Linux", provider: "Linux Foundation", kind: "Curso", url: "https://training.linuxfoundation.org/training/introduction-to-linux/" }, { title: "Linux", provider: "roadmap.sh", kind: "Roadmap", url: "https://roadmap.sh/linux" }]),
  topic("basic-aws-services", "Basic AWS Services", "Visão geral dos serviços essenciais da Amazon Web Services.", "devops", 1300, 240, [{ title: "AWS Cloud Practitioner Essentials", provider: "AWS Skill Builder", kind: "Curso", url: "https://explore.skillbuilder.aws/learn/course/134/aws-cloud-practitioner-essentials" }, doc("Conceitos básicos da AWS", "AWS", "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/introduction.html")]),
  topic("ec2", "EC2", "Computação virtual escalável na nuvem AWS.", "devops", 1110, 380, [doc("Conceitos do Amazon EC2", "AWS", "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html")]),
  topic("vpc", "VPC", "Redes virtuais isoladas na AWS.", "devops", 1240, 380, [doc("O que é Amazon VPC", "AWS", "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html")]),
  topic("s3", "S3", "Armazenamento de objetos durável e escalável.", "devops", 1370, 380, [doc("Comece a usar o Amazon S3", "AWS", "https://docs.aws.amazon.com/AmazonS3/latest/userguide/GetStartedWithS3.html")]),
  topic("route-53", "Route 53", "DNS gerenciado e roteamento de tráfego da AWS.", "devops", 1500, 380, [doc("O que é Route 53", "AWS", "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html")]),
  topic("ses", "SES", "Serviço da AWS para envio e recebimento de e-mails.", "devops", 1630, 380, [doc("O que é Amazon SES", "AWS", "https://docs.aws.amazon.com/ses/latest/dg/Welcome.html")]),
  checkpoint("checkpoint-deployment", "Checkpoint — Deployment", "devops", 1370, 520),
  topic("monit", "Monit", "Ferramenta para supervisionar processos, arquivos e serviços Unix.", "devops", 1130, 660, [doc("Manual do Monit", "Monit", "https://mmonit.com/monit/documentation/monit.html")]),
  checkpoint("checkpoint-monitoring", "Checkpoint — Monitoring", "devops", 1130, 800),
  topic("github-actions", "GitHub Actions", "Automação de integração, testes e entregas a partir do repositório.", "devops", 1370, 660, [doc("Entender o GitHub Actions", "GitHub", "https://docs.github.com/pt/actions/about-github-actions/understanding-github-actions"), { title: "Hello GitHub Actions", provider: "GitHub Skills", kind: "Prática", url: "https://github.com/skills/hello-github-actions" }]),
  checkpoint("checkpoint-cicd", "Checkpoint — CI/CD", "devops", 1370, 800),
  topic("ansible", "Ansible", "Automação agentless de configuração e provisionamento.", "devops", 1540, 660, [doc("Comece com Ansible", "Ansible", "https://docs.ansible.com/ansible/latest/getting_started/index.html"), { title: "Ansible Basics", provider: "Red Hat", kind: "Curso", url: "https://www.redhat.com/en/interactive-labs/ansible" }]),
  checkpoint("checkpoint-automation", "Checkpoint — Automation", "devops", 1540, 800),
  topic("terraform", "Terraform", "Infraestrutura como código declarativa e reproduzível.", "devops", 1370, 940, [video("Terraform Course — Automate your AWS cloud infrastructure", "https://www.youtube.com/watch?v=SLB_c_ayRMo"), { title: "Get Started — AWS", provider: "HashiCorp", kind: "Prática", url: "https://developer.hashicorp.com/terraform/tutorials/aws-get-started" }]),
  checkpoint("checkpoint-infrastructure", "Checkpoint — Infrastructure", "devops", 1370, 1080),
]

const edge = (from: string, to: string, style: "solid" | "dashed" = "solid"): FullStackEdge => ({ from, to, style })
export const FULL_STACK_EDGES: FullStackEdge[] = [
  edge("html", "checkpoint-static-webpages"), edge("css", "checkpoint-static-webpages"), edge("checkpoint-static-webpages", "javascript"), edge("javascript", "checkpoint-interactivity"),
  edge("checkpoint-interactivity", "npm"), edge("npm", "checkpoint-external-packages"), edge("checkpoint-interactivity", "git"), edge("git", "github"), edge("github", "checkpoint-collaborative-work"),
  edge("checkpoint-external-packages", "tailwind-css"), edge("checkpoint-collaborative-work", "react"), edge("tailwind-css", "checkpoint-frontend-apps"), edge("react", "checkpoint-frontend-apps"),
  edge("checkpoint-frontend-apps", "node-js", "dashed"), edge("node-js", "checkpoint-cli-apps"), edge("checkpoint-cli-apps", "postgresql"), edge("postgresql", "checkpoint-simple-crud"),
  edge("checkpoint-simple-crud", "restful-apis"), edge("checkpoint-simple-crud", "jwt-auth"), edge("checkpoint-simple-crud", "redis"), edge("restful-apis", "checkpoint-complete-app"), edge("jwt-auth", "checkpoint-complete-app"), edge("redis", "checkpoint-complete-app"),
  edge("checkpoint-complete-app", "linux-basics", "dashed"), edge("linux-basics", "basic-aws-services"), edge("basic-aws-services", "ec2"), edge("basic-aws-services", "vpc"), edge("basic-aws-services", "s3"), edge("basic-aws-services", "route-53"), edge("basic-aws-services", "ses"),
  edge("ec2", "checkpoint-deployment"), edge("vpc", "checkpoint-deployment"), edge("s3", "checkpoint-deployment"), edge("route-53", "checkpoint-deployment"), edge("ses", "checkpoint-deployment"),
  edge("checkpoint-deployment", "monit"), edge("monit", "checkpoint-monitoring"), edge("checkpoint-deployment", "github-actions"), edge("github-actions", "checkpoint-cicd"), edge("checkpoint-deployment", "ansible"), edge("ansible", "checkpoint-automation"),
  edge("checkpoint-monitoring", "terraform", "dashed"), edge("checkpoint-cicd", "terraform"), edge("checkpoint-automation", "terraform"), edge("terraform", "checkpoint-infrastructure"),
]

export const FULL_STACK_ROADMAP_DEFINITION = {
  version: FULL_STACK_DEFINITION_VERSION,
  slug: "full-stack-developer",
  assessmentRequired: true,
  width: 1810,
  height: 1210,
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
