import type { OfficialModule } from "@/lib/roadmaps/official-full-stack"

type CatalogRoadmap = {
  title: string
  slug: string
  description: string
  category: string
  estimatedHours: number
  modules: OfficialModule[]
}

const topics = (title: string, description: string, lessonTitles: string[]): OfficialModule => ({
  title,
  description,
  lessons: lessonTitles.map((lessonTitle) => ({ title: lessonTitle, description: `Aprenda os fundamentos de ${lessonTitle} e pratique em um exemplo guiado.` })),
})

export const OFFICIAL_ROADMAP_CATALOG: CatalogRoadmap[] = [
  {
    title: "Front-end Developer", slug: "frontend-developer", category: "Desenvolvimento Web", estimatedHours: 72,
    description: "Crie interfaces acessíveis, responsivas e conectadas a APIs modernas.",
    modules: [topics("Base da Web", "A fundação de toda interface.", ["HTML semântico", "CSS moderno", "JavaScript no navegador"]), topics("Interfaces responsivas", "Layouts que funcionam em qualquer tela.", ["Flexbox e Grid", "Design responsivo", "Acessibilidade"]), topics("React", "Interfaces orientadas a componentes.", ["Componentes e props", "Estado e hooks", "Roteamento e dados"]), topics("Qualidade e entrega", "Prepare interfaces para produção.", ["Testes de interface", "Performance", "Deploy do front-end"])],
  },
  {
    title: "Back-end Developer", slug: "backend-developer", category: "Desenvolvimento Web", estimatedHours: 78,
    description: "Construa APIs, regras de negócio e serviços seguros preparados para produção.",
    modules: [topics("Fundamentos de servidor", "Entenda o ambiente onde o back-end vive.", ["Runtime e processos", "HTTP", "Arquitetura de APIs"]), topics("Aplicações Node.js", "Organize serviços manuteníveis.", ["Rotas e controllers", "Services", "Tratamento de erros"]), topics("Dados e identidade", "Persista e proteja informações.", ["Banco relacional", "ORM", "Autenticação e autorização"]), topics("Produção", "Opere serviços reais.", ["Testes de API", "Logs e observabilidade", "Deploy e escalabilidade"])],
  },
  {
    title: "React", slug: "react", category: "Frameworks", estimatedHours: 42,
    description: "Domine React do primeiro componente até aplicações completas.",
    modules: [topics("Mentalidade React", "Aprenda o modelo declarativo.", ["JSX", "Componentes", "Props"]), topics("Estado", "Modele interfaces interativas.", ["useState", "Eventos", "Estado derivado"]), topics("Efeitos e dados", "Sincronize a interface com o mundo externo.", ["useEffect", "Requisições", "Estados de loading e erro"]), topics("Arquitetura", "Escale aplicações React.", ["Hooks próprios", "Context", "Testes de componentes"])],
  },
  {
    title: "Node.js", slug: "nodejs", category: "Plataformas", estimatedHours: 46,
    description: "Use JavaScript no servidor para criar ferramentas e APIs eficientes.",
    modules: [topics("Runtime Node", "Conheça a plataforma.", ["Event loop", "Módulos", "NPM"]), topics("Sistema e processos", "Interaja com o ambiente.", ["Arquivos", "Streams", "Variáveis de ambiente"]), topics("Serviços web", "Exponha funcionalidades via HTTP.", ["Servidor HTTP", "API REST", "Validação"]), topics("Aplicações robustas", "Prepare o serviço para crescer.", ["Testes", "Segurança", "Observabilidade"])],
  },
  {
    title: "Banco de Dados", slug: "banco-de-dados", category: "Dados", estimatedHours: 48,
    description: "Modele, consulte e mantenha dados consistentes para aplicações reais.",
    modules: [topics("Fundamentos", "Entenda como os dados são organizados.", ["Entidades e atributos", "Relacionamentos", "Normalização"]), topics("Bancos relacionais", "Trabalhe com estruturas consistentes.", ["Tabelas e chaves", "Restrições", "Transações"]), topics("Projeto de dados", "Tome decisões de arquitetura.", ["Índices", "Migrações", "Modelagem para aplicações"]), topics("Operação", "Cuide dos dados em produção.", ["Backups", "Performance", "Segurança de acesso"])],
  },
  {
    title: "SQL", slug: "sql", category: "Dados", estimatedHours: 32,
    description: "Consulte e transforme dados relacionais com segurança e clareza.",
    modules: [topics("Primeiras consultas", "Leia dados de tabelas.", ["SELECT", "Filtros", "Ordenação"]), topics("Combinando dados", "Relacione diferentes conjuntos.", ["JOINs", "Agregações", "Subconsultas"]), topics("Alterando dados", "Escreva com segurança.", ["INSERT", "UPDATE e DELETE", "Transações"]), topics("SQL avançado", "Resolva análises mais ricas.", ["CTEs", "Window functions", "Otimização de consultas"])],
  },
  {
    title: "Git e GitHub", slug: "git-github", category: "Ferramentas", estimatedHours: 22,
    description: "Versione projetos e colabore em equipe sem medo de perder trabalho.",
    modules: [topics("Controle de versão", "Comece um histórico confiável.", ["Repositórios", "Stage e commits", "Histórico"]), topics("Trabalho paralelo", "Organize mudanças independentes.", ["Branches", "Merge", "Resolução de conflitos"]), topics("Colaboração", "Compartilhe código com uma equipe.", ["Remotes", "Pull Requests", "Code review"]), topics("Fluxos profissionais", "Automatize e proteja projetos.", ["Gitflow e trunk-based", "Tags e releases", "GitHub Actions"])],
  },
]
