import "server-only"
import { FULL_STACK_ASSESSMENT_TOTAL, getAssessmentOutcome } from "./assessment-rules"

type Question = { id: string; question: string; options: [string, string, string, string]; correctAnswer: number }
export type PublicAssessmentQuestion = Omit<Question, "correctAnswer">
const q = (id: string, question: string, options: [string, string, string, string], correctAnswer: number): Question => ({ id, question, options, correctAnswer })

export const FULL_STACK_QUESTION_BANK: readonly Question[] = [
  q("fs-01", "Qual elemento HTML representa o conteúdo principal único da página?", ["<main>", "<section>", "<div>", "<aside>"], 0),
  q("fs-02", "Qual atributo associa um <label> a um campo de formulário?", ["name", "for", "target", "role"], 1),
  q("fs-03", "Qual prática melhora a acessibilidade de uma imagem informativa?", ["Remover seu src", "Usar apenas o title", "Fornecer texto alt significativo", "Definir display:block"], 2),
  q("fs-04", "No box model padrão, o que fica entre o conteúdo e a borda?", ["margin", "outline", "gap", "padding"], 3),
  q("fs-05", "Qual recurso CSS é indicado para um layout bidimensional?", ["Grid", "Float", "Position fixed", "Inline"], 0),
  q("fs-06", "Qual media query aplica estilos a telas de até 640px?", ["@media (width: 640px+)", "@media (max-width: 640px)", "@media screen(640)", "@responsive 640px"], 1),
  q("fs-07", "Qual declaração cria uma variável que não pode ser reatribuída?", ["var", "let", "const", "static"], 2),
  q("fs-08", "Qual método cria um novo array transformando cada item?", ["find", "some", "filter", "map"], 3),
  q("fs-09", "O que uma função async sempre retorna?", ["Uma Promise", "Um callback", "Uma string", "Um generator"], 0),
  q("fs-10", "Qual método registra um ouvinte de evento no DOM?", ["listen", "addEventListener", "onEvent", "subscribeDOM"], 1),
  q("fs-11", "Qual arquivo registra as dependências npm e seus scripts?", ["npm.lock", "modules.json", "package.json", "manifest.ini"], 2),
  q("fs-12", "Qual comando instala dependências descritas em package.json?", ["npm add-all", "node install", "npm build", "npm install"], 3),
  q("fs-13", "Qual comando cria um novo commit no Git?", ["git commit", "git push", "git stage", "git merge"], 0),
  q("fs-14", "Qual comando cria e troca para uma nova branch nas versões atuais do Git?", ["git branch --move", "git switch -c", "git fork", "git clone -b-new"], 1),
  q("fs-15", "No GitHub, qual mecanismo propõe integrar alterações entre branches?", ["Issue label", "Release", "Pull request", "Gist"], 2),
  q("fs-16", "Qual classe Tailwind define display flex?", ["display-flex", "d-flex", "layout-flex", "flex"], 3),
  q("fs-17", "Em React, qual recurso guarda estado local de um componente funcional?", ["useState", "useMemo", "useContext", "useId"], 0),
  q("fs-18", "Qual propriedade especial ajuda o React a identificar itens de uma lista?", ["id", "key", "name", "index"], 1),
  q("fs-19", "Qual regra deve ser seguida ao atualizar estado React baseado no valor anterior?", ["Alterar o valor diretamente", "Recarregar a página", "Usar a forma funcional do setter", "Guardar em variável global"], 2),
  q("fs-20", "Qual característica descreve o Node.js?", ["Banco relacional", "Framework CSS", "Navegador headless", "Runtime JavaScript fora do navegador"], 3),
  q("fs-21", "Qual objeto Node expõe argumentos da linha de comando?", ["process.argv", "console.args", "node.params", "global.cli"], 0),
  q("fs-22", "Em uma API REST, qual método HTTP normalmente cria um recurso?", ["GET", "POST", "TRACE", "HEAD"], 1),
  q("fs-23", "Qual status HTTP indica que um recurso não foi encontrado?", ["201", "304", "404", "503"], 2),
  q("fs-24", "Qual propriedade REST significa que cada requisição contém o contexto necessário?", ["Cache obrigatório", "Interface gráfica", "Sessão no servidor", "Statelessness"], 3),
  q("fs-25", "Qual comando SQL consulta linhas de uma tabela?", ["SELECT", "UPDATE", "INSERT", "ALTER"], 0),
  q("fs-26", "Qual restrição identifica unicamente cada linha de uma tabela?", ["FOREIGN KEY", "PRIMARY KEY", "CHECK", "DEFAULT"], 1),
  q("fs-27", "Qual recurso do PostgreSQL garante que um conjunto de operações seja atômico?", ["View", "Index", "Transaction", "Trigger"], 2),
  q("fs-28", "Qual cláusula combina linhas relacionadas de duas tabelas?", ["GROUP", "ORDER", "LIMIT", "JOIN"], 3),
  q("fs-29", "Quais são as três partes de um JWT?", ["Header, payload e signature", "User, password e salt", "Method, path e body", "Key, value e TTL"], 0),
  q("fs-30", "Onde uma aplicação web deve validar a assinatura de um JWT?", ["Somente no CSS", "No servidor que autoriza a requisição", "Apenas no localStorage", "No componente visual"], 1),
  q("fs-31", "Qual uso é comum para Redis?", ["Compilar TypeScript", "Renderizar HTML", "Cache com baixa latência", "Versionar código"], 2),
  q("fs-32", "Qual comando Redis grava uma chave e um valor?", ["PUT", "WRITE", "STORE", "SET"], 3),
  q("fs-33", "Qual comando Linux lista arquivos de um diretório?", ["ls", "pwd", "cat", "cd"], 0),
  q("fs-34", "Qual permissão numérica Linux representa leitura e escrita para o dono?", ["4", "6", "5", "1"], 1),
  q("fs-35", "Qual comando mostra processos em execução de forma interativa?", ["mkdir", "grep", "top", "touch"], 2),
  q("fs-36", "Qual serviço AWS oferece máquinas virtuais?", ["SES", "S3", "Route 53", "EC2"], 3),
  q("fs-37", "Qual serviço AWS armazena objetos em buckets?", ["S3", "VPC", "EC2", "SES"], 0),
  q("fs-38", "Qual serviço AWS fornece uma rede virtual isolada?", ["Route 53", "VPC", "S3", "CloudFront"], 1),
  q("fs-39", "Qual serviço AWS é usado para DNS gerenciado?", ["SES", "EC2", "Route 53", "EBS"], 2),
  q("fs-40", "Qual serviço AWS é voltado ao envio de e-mails?", ["SQS", "SNS", "IAM", "SES"], 3),
  q("fs-41", "Qual é o papel principal do Monit?", ["Monitorar e reiniciar processos e serviços", "Criar componentes React", "Hospedar repositórios Git", "Modelar tabelas SQL"], 0),
  q("fs-42", "Onde workflows do GitHub Actions são definidos?", [".git/hooks", ".github/workflows", ".actions/root", "package/actions"], 1),
  q("fs-43", "Qual evento de GitHub Actions costuma executar um workflow ao enviar commits?", ["commit_now", "upload", "push", "sync"], 2),
  q("fs-44", "O que CI busca fazer continuamente?", ["Comprar infraestrutura", "Editar produção manualmente", "Ocultar falhas", "Integrar mudanças com validações automatizadas"], 3),
  q("fs-45", "Qual formato é normalmente usado em playbooks Ansible?", ["YAML", "CSV", "HTML", "SQL"], 0),
  q("fs-46", "Qual propriedade do Ansible reduz a necessidade de instalar agentes nos hosts?", ["Stateful", "Agentless", "Serverless", "Headless"], 1),
  q("fs-47", "Qual comando Terraform mostra as mudanças planejadas?", ["terraform diff", "terraform preview", "terraform plan", "terraform inspect"], 2),
  q("fs-48", "Qual arquivo guarda o estado conhecido da infraestrutura pelo Terraform?", ["terraform.lock", "infra.json", "provider.hcl", "terraform.tfstate"], 3),
  q("fs-49", "O que significa infraestrutura como código?", ["Definir infraestrutura em arquivos versionáveis", "Criar servidores apenas pela interface web", "Armazenar código em um servidor físico", "Evitar automação de mudanças"], 0),
  q("fs-50", "Antes de liberar uma aplicação full stack, qual prática reduz regressões?", ["Desabilitar logs", "Executar testes automatizados no pipeline", "Compartilhar segredos no repositório", "Ignorar falhas de build"], 1),
] as const

if (FULL_STACK_QUESTION_BANK.length !== FULL_STACK_ASSESSMENT_TOTAL) throw new Error("A avaliação Full Stack deve conter exatamente 50 questões.")

export function getPublicAssessmentQuestions(): PublicAssessmentQuestion[] {
  return FULL_STACK_QUESTION_BANK.map(({ id, question, options }) => ({ id, question, options: [...options] as [string, string, string, string] }))
}

export function gradeFullStackAssessment(answers: Record<string, number>) {
  const correctAnswers = FULL_STACK_QUESTION_BANK.reduce((total, question) => total + (answers[question.id] === question.correctAnswer ? 1 : 0), 0)
  return getAssessmentOutcome(correctAnswers)
}

export function areCompleteAssessmentAnswers(answers: Record<string, number>) {
  return Object.keys(answers).length === FULL_STACK_ASSESSMENT_TOTAL && FULL_STACK_QUESTION_BANK.every((question) => Number.isInteger(answers[question.id]) && answers[question.id] >= 0 && answers[question.id] <= 3)
}
