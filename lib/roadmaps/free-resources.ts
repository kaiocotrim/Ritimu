export type FreeResource = { title: string; url: string; provider: string; kind: "Documentação" | "Curso" | "Prática" | "Livro" }

const resources = {
  web: [
    { title: "Aprendendo desenvolvimento web", url: "https://developer.mozilla.org/pt-BR/docs/Learn_web_development", provider: "MDN", kind: "Curso" },
    { title: "Guias para a web moderna", url: "https://web.dev/learn/", provider: "web.dev", kind: "Curso" },
  ],
  javascript: [
    { title: "Guia de JavaScript", url: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide", provider: "MDN", kind: "Documentação" },
    { title: "The Modern JavaScript Tutorial", url: "https://javascript.info/", provider: "JavaScript.info", kind: "Curso" },
  ],
  react: [
    { title: "Aprenda React", url: "https://react.dev/learn", provider: "React", kind: "Curso" },
    { title: "Tutorial prático de React", url: "https://react.dev/learn/tutorial-tic-tac-toe", provider: "React", kind: "Prática" },
  ],
  node: [
    { title: "Introdução ao Node.js", url: "https://nodejs.org/en/learn", provider: "Node.js", kind: "Curso" },
    { title: "Documentação da API Node.js", url: "https://nodejs.org/api/", provider: "Node.js", kind: "Documentação" },
  ],
  git: [
    { title: "Livro Pro Git em português", url: "https://git-scm.com/book/pt-br/v2", provider: "Git", kind: "Livro" },
    { title: "GitHub Skills", url: "https://skills.github.com/", provider: "GitHub", kind: "Prática" },
  ],
  database: [
    { title: "Tutorial oficial do PostgreSQL", url: "https://www.postgresql.org/docs/current/tutorial.html", provider: "PostgreSQL", kind: "Curso" },
    { title: "SQLBolt — exercícios interativos", url: "https://sqlbolt.com/", provider: "SQLBolt", kind: "Prática" },
  ],
  typescript: [
    { title: "TypeScript para novos programadores", url: "https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html", provider: "TypeScript", kind: "Curso" },
    { title: "The TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", provider: "TypeScript", kind: "Documentação" },
  ],
  security: [
    { title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", provider: "OWASP", kind: "Documentação" },
    { title: "Web Security Academy", url: "https://portswigger.net/web-security", provider: "PortSwigger", kind: "Curso" },
  ],
} satisfies Record<string, FreeResource[]>

export function getFreeResources(moduleTitle: string, lessonTitle: string): FreeResource[] {
  const search = `${moduleTitle} ${lessonTitle}`.toLocaleLowerCase("pt-BR")
  if (/react|jsx|hook|state|props|context/.test(search)) return resources.react
  if (/node|servidor|api|backend|back-end|runtime|processo/.test(search)) return resources.node
  if (/git|github|commit|branch|merge|pull request/.test(search)) return resources.git
  if (/sql|banco|dados|postgres|orm|tabela|transa/.test(search)) return resources.database
  if (/typescript|tipo|interface|generic|narrowing/.test(search)) return resources.typescript
  if (/seguran|senha|jwt|cookie|cors|valida|owasp/.test(search)) return resources.security
  if (/javascript|array|objeto|funç|promise|async|dom|loop|variá/.test(search)) return resources.javascript
  return resources.web
}
