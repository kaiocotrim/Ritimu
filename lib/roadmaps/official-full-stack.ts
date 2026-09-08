import type { RoadmapLessonType } from "@/lib/generated/prisma/enums"

export type OfficialLesson = {
  title: string
  description: string
  type?: RoadmapLessonType
  minutes?: number
  xp?: number
}

export type OfficialModule = {
  title: string
  description: string
  lessons: OfficialLesson[]
}

const lesson = (title: string, description: string): OfficialLesson => ({ title, description })

export const FULL_STACK_ROADMAP = {
  title: "Full Stack Developer",
  slug: "full-stack-developer",
  description: "Uma jornada prática para entender a web de ponta a ponta e publicar aplicações completas.",
  category: "Desenvolvimento",
  estimatedHours: 96,
  modules: [
    { title: "Fundamentos da Web", description: "Entenda o caminho de uma requisição antes de construir interfaces.", lessons: [
      lesson("Como a Web funciona", "Conecte navegador, internet e servidor em um único modelo mental."),
      lesson("HTTP e HTTPS", "Conheça métodos, respostas, cabeçalhos e transporte seguro."),
      lesson("DNS", "Descubra como nomes de domínio encontram servidores."),
      lesson("Browser e servidor", "Separe as responsabilidades do cliente e do back-end."),
    ]},
    { title: "HTML", description: "Estruture páginas claras, semânticas e inclusivas.", lessons: [
      lesson("Estrutura HTML", "Organize documentos com elementos e atributos."),
      lesson("HTML semântico", "Escolha elementos que expressem o significado do conteúdo."),
      lesson("Formulários", "Colete e valide dados de pessoas usuárias."),
      lesson("Acessibilidade básica", "Crie uma base navegável por diferentes pessoas e tecnologias."),
    ]},
    { title: "CSS", description: "Transforme estrutura em interfaces adaptáveis.", lessons: [
      lesson("Seletores e cascata", "Controle quais regras vencem e onde são aplicadas."),
      lesson("Box Model", "Domine dimensões, espaçamento e bordas."),
      lesson("Flexbox", "Distribua elementos em uma dimensão."),
      lesson("Grid", "Monte layouts em linhas e colunas."),
      lesson("Responsividade", "Adapte a experiência a diferentes telas."),
    ]},
    { title: "JavaScript", description: "Adicione lógica, dados e interatividade ao navegador.", lessons: [
      lesson("Variáveis e tipos", "Modele valores e entenda suas operações."),
      lesson("Condições e loops", "Controle decisões e repetições."),
      lesson("Funções", "Encapsule comportamento reutilizável."),
      lesson("Arrays", "Transforme coleções com map, filter e find."),
      lesson("Objetos", "Represente entidades e acesse suas propriedades."),
      lesson("DOM", "Leia e altere a página com eventos."),
      lesson("Promises", "Modele resultados que chegam no futuro."),
      lesson("Async e Await", "Escreva fluxos assíncronos legíveis."),
    ]},
    { title: "Git e GitHub", description: "Versione trabalho e colabore com segurança.", lessons: [
      lesson("Git básico", "Crie um repositório e acompanhe mudanças."),
      lesson("Commits", "Registre unidades de trabalho compreensíveis."),
      lesson("Branches", "Isole linhas de desenvolvimento."),
      lesson("Merge", "Integre históricos e resolva conflitos."),
      lesson("Pull Request", "Revise e comunique mudanças em equipe."),
    ]},
    { title: "TypeScript", description: "Use tipos para tornar mudanças mais seguras.", lessons: [
      lesson("Tipos essenciais", "Tipifique valores, parâmetros e retornos."),
      lesson("Interfaces e aliases", "Modele contratos reutilizáveis."),
      lesson("Generics", "Crie abstrações que preservam informação de tipo."),
      lesson("Type narrowing", "Refine uniões com verificações seguras."),
    ]},
    { title: "Front-end moderno", description: "Construa interfaces por componentes com React.", lessons: [
      lesson("React e componentes", "Divida interfaces em unidades declarativas."),
      lesson("Props", "Passe dados entre componentes."),
      lesson("State", "Modele mudanças locais da interface."),
      lesson("Hooks", "Reutilize estado e efeitos com clareza."),
      lesson("Context", "Compartilhe dados em uma árvore de componentes."),
      lesson("Consumo de APIs", "Conecte a interface a dados remotos."),
    ]},
    { title: "Back-end", description: "Crie serviços HTTP organizados e protegidos.", lessons: [
      lesson("Node.js", "Execute JavaScript no servidor e entenda seu runtime."),
      lesson("API REST", "Modele recursos e operações HTTP."),
      lesson("Rotas e controllers", "Receba requisições e orquestre respostas."),
      lesson("Services", "Isole regras de negócio."),
      lesson("Middlewares", "Aplique comportamentos transversais."),
      lesson("Autenticação", "Reconheça e autorize usuários com segurança."),
    ]},
    { title: "Banco de Dados", description: "Persista informação com modelos consistentes.", lessons: [
      lesson("Modelagem", "Traduza o domínio em entidades e atributos."),
      lesson("SQL", "Consulte e modifique dados relacionais."),
      lesson("PostgreSQL", "Conheça um banco relacional pronto para produção."),
      lesson("Relacionamentos", "Conecte entidades preservando integridade."),
      lesson("ORM", "Integre dados e código com uma camada tipada."),
    ]},
    { title: "Segurança", description: "Reduza riscos comuns em aplicações web.", lessons: [
      lesson("Hash de senha", "Armazene credenciais sem guardar senhas em texto."),
      lesson("Tokens e cookies", "Compare estratégias de sessão e transporte."),
      lesson("CORS", "Controle origens que acessam recursos."),
      lesson("Validação", "Trate toda entrada como não confiável."),
      lesson("Defesa na Web", "Reconheça injeção, XSS, CSRF e princípios de mínimo privilégio."),
    ]},
    { title: "Deploy", description: "Leve a aplicação do computador para a internet.", lessons: [
      lesson("Variáveis de ambiente", "Separe configuração e segredos do código."),
      lesson("Build e deploy", "Gere e publique artefatos reproduzíveis."),
      lesson("Logs", "Observe erros e comportamento em produção."),
      lesson("Noções de Docker", "Empacote runtime e dependências em contêineres."),
    ]},
    { title: "Projeto Final", description: "Una toda a jornada em um produto utilizável.", lessons: [
      { title: "Aplicação Full Stack", description: "Planeje, construa, proteja e publique uma aplicação completa.", type: "PROJECT", minutes: 480, xp: 200 },
    ]},
  ] satisfies OfficialModule[],
} as const
