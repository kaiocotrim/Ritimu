# X1 de Conhecimento: temas e perguntas

## Banco de dados

Em desenvolvimento ou produção, aplique as migrations sem apagar dados:

```bash
npx prisma migrate deploy
npx prisma generate
```

As migrations criam tópicos normalizados, metadados de dificuldade/origem/revisão, fingerprints e a reserva de perguntas por partida. As perguntas antigas são preservadas e associadas aos tópicos equivalentes.

## Geração automática

Configure no servidor:

```text
GEMINI_API_KEY=chave_da_api
GEMINI_QUESTION_MODEL=gemini-flash-lite-latest
```

`GEMINI_QUESTION_MODEL` é opcional. A chave nunca deve usar prefixo `NEXT_PUBLIC_` e só é lida pelo `GeminiService` no servidor.

Sem `GEMINI_API_KEY`, o X1 usa somente o banco. Quando não houver perguntas suficientes, a sala mostra uma mensagem amigável e permite trocar tema/dificuldade ou tentar novamente.

O PostgreSQL do Supabase funciona como cache: antes de chamar o Gemini, o backend consulta as perguntas aprovadas do tema, subtópico e dificuldade. A API gera somente a quantidade faltante, e as perguntas validadas são persistidas para as próximas partidas.

## Perguntas manuais

Use o Prisma Studio (`npx prisma studio`) ou um script administrativo para criar um `X1Question` com:

- `subject` e `topicId` correspondentes ao tema;
- `question`, quatro valores no JSON `options` e `correctAnswer` igual a uma das opções;
- `difficulty`, `subtopic` opcional, `source = MANUAL`, `reviewStatus = APPROVED` e `active = true`;
- `fingerprint` SHA-256 produzido por `questionFingerprint` em `lib/knowledge/validate-generated-questions.ts`.

## Teste manual

1. Abra `/x1` e pesquise `Treino de jiu`.
2. Escolha criar o tema.
3. Confirme `Treinamento de jiu-jítsu` ou mantenha o texto original.
4. Selecione um subtópico, dificuldade e tempo.
5. Crie a sala e acompanhe a preparação.
6. Com uma chave configurada, somente as perguntas que faltarem serão geradas e salvas para partidas futuras.
