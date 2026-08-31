DROP TABLE "Duel";
DROP TYPE "DuelStatus";

CREATE TYPE "X1MatchStatus" AS ENUM ('WAITING', 'PREPARING', 'PLAYING', 'FINISHED', 'ABANDONED', 'CANCELED');

CREATE TABLE "X1Question" (
  "id" TEXT NOT NULL, "subject" TEXT NOT NULL, "question" TEXT NOT NULL,
  "options" JSONB NOT NULL, "correctAnswer" TEXT NOT NULL, "explanation" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "X1Question_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "X1Match" (
  "id" TEXT NOT NULL, "code" TEXT NOT NULL, "status" "X1MatchStatus" NOT NULL DEFAULT 'WAITING',
  "playerXId" TEXT NOT NULL, "playerOId" TEXT, "playerXSubject" TEXT, "playerOSubject" TEXT,
  "currentTurnUserId" TEXT, "currentQuestionId" TEXT, "currentCell" INTEGER, "winnerId" TEXT,
  "board" JSONB NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3), "finishedAt" TIMESTAMP(3), "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "X1Match_pkey" PRIMARY KEY ("id"), CONSTRAINT "X1Match_cell_check" CHECK ("currentCell" IS NULL OR "currentCell" BETWEEN 0 AND 8)
);
CREATE TABLE "X1Move" (
  "id" TEXT NOT NULL, "matchId" TEXT NOT NULL, "playerId" TEXT NOT NULL, "cell" INTEGER NOT NULL,
  "questionId" TEXT NOT NULL, "selectedAnswer" TEXT NOT NULL, "correct" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "X1Move_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "X1Match_code_key" ON "X1Match"("code");
CREATE INDEX "X1Question_subject_active_idx" ON "X1Question"("subject", "active");
CREATE INDEX "X1Match_playerXId_status_idx" ON "X1Match"("playerXId", "status");
CREATE INDEX "X1Match_playerOId_status_idx" ON "X1Match"("playerOId", "status");
CREATE INDEX "X1Move_matchId_createdAt_idx" ON "X1Move"("matchId", "createdAt");
CREATE INDEX "X1Move_playerId_idx" ON "X1Move"("playerId");
ALTER TABLE "X1Match" ADD CONSTRAINT "X1Match_playerXId_fkey" FOREIGN KEY ("playerXId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "X1Match" ADD CONSTRAINT "X1Match_playerOId_fkey" FOREIGN KEY ("playerOId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "X1Match" ADD CONSTRAINT "X1Match_currentQuestionId_fkey" FOREIGN KEY ("currentQuestionId") REFERENCES "X1Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "X1Match" ADD CONSTRAINT "X1Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "X1Move" ADD CONSTRAINT "X1Move_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "X1Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "X1Move" ADD CONSTRAINT "X1Move_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "X1Move" ADD CONSTRAINT "X1Move_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "X1Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "X1Question" ("id","subject","question","options","correctAnswer","explanation","updatedAt") VALUES
('mat01','Matemática','Quanto é 7 × 8?','["54","56","64","48"]','56','7 multiplicado por 8 é 56.',CURRENT_TIMESTAMP),
('mat02','Matemática','Qual é a raiz quadrada de 144?','["10","11","12","14"]','12','12 × 12 = 144.',CURRENT_TIMESTAMP),
('mat03','Matemática','Quanto é 15% de 200?','["15","20","30","40"]','30','0,15 × 200 = 30.',CURRENT_TIMESTAMP),
('mat04','Matemática','Qual fração equivale a 0,5?','["1/2","1/3","2/5","3/4"]','1/2','Um meio corresponde a 0,5.',CURRENT_TIMESTAMP),
('mat05','Matemática','Quanto é 3² + 4²?','["12","25","49","7"]','25','9 + 16 = 25.',CURRENT_TIMESTAMP),
('mat06','Matemática','Qual é o próximo primo depois de 11?','["12","13","15","17"]','13','13 só é divisível por 1 e por ele mesmo.',CURRENT_TIMESTAMP),
('mat07','Matemática','Um triângulo tem quantos graus internos?','["90°","180°","270°","360°"]','180°','A soma dos ângulos internos é 180°.',CURRENT_TIMESTAMP),
('mat08','Matemática','Quanto é 2⁵?','["10","16","25","32"]','32','2 × 2 × 2 × 2 × 2 = 32.',CURRENT_TIMESTAMP),
('mat09','Matemática','Resolva: 2x + 4 = 12.','["2","3","4","6"]','4','2x = 8, então x = 4.',CURRENT_TIMESTAMP),
('por01','Português','Qual palavra é um verbo?','["bonito","correr","cidade","rapidamente"]','correr','Correr expressa uma ação.',CURRENT_TIMESTAMP),
('por02','Português','Qual é o plural de cidadão?','["cidadões","cidadãos","cidadães","cidadans"]','cidadãos','O plural correto é cidadãos.',CURRENT_TIMESTAMP),
('por03','Português','Em “Ela chegou cedo”, qual é o advérbio?','["Ela","chegou","cedo","nenhum"]','cedo','Cedo modifica o verbo chegou.',CURRENT_TIMESTAMP),
('por04','Português','Qual palavra está escrita corretamente?','["exceção","excessão","eseção","excesssão"]','exceção','Exceção é grafada com xc e ç.',CURRENT_TIMESTAMP),
('por05','Português','Qual é o antônimo de “generoso”?','["bondoso","egoísta","gentil","alegre"]','egoísta','Egoísta tem sentido oposto a generoso.',CURRENT_TIMESTAMP),
('por06','Português','Que figura há em “o vento cantava”?','["Metáfora","Personificação","Ironia","Hipérbole"]','Personificação','Uma ação humana foi atribuída ao vento.',CURRENT_TIMESTAMP),
('por07','Português','Qual frase usa “por que” corretamente?','["Por que você veio?","Não sei por que.","O porque é simples.","Você veio por quê motivo?"]','Por que você veio?','Em pergunta direta separa-se por que.',CURRENT_TIMESTAMP),
('por08','Português','Qual é o sujeito em “Os alunos estudaram”?','["estudaram","Os alunos","alunos estudaram","oculto"]','Os alunos','Os alunos praticam a ação.',CURRENT_TIMESTAMP),
('por09','Português','“Felizmente” pertence a qual classe?','["Substantivo","Adjetivo","Advérbio","Verbo"]','Advérbio','O sufixo -mente forma advérbios.',CURRENT_TIMESTAMP),
('cie01','Ciências','Qual planeta é conhecido como planeta vermelho?','["Vênus","Marte","Júpiter","Mercúrio"]','Marte','O óxido de ferro dá a Marte sua cor.',CURRENT_TIMESTAMP),
('cie02','Ciências','Qual gás as plantas absorvem na fotossíntese?','["Oxigênio","Nitrogênio","Gás carbônico","Hidrogênio"]','Gás carbônico','As plantas absorvem CO₂.',CURRENT_TIMESTAMP),
('cie03','Ciências','Qual órgão bombeia o sangue?','["Pulmão","Fígado","Coração","Rim"]','Coração','O coração impulsiona o sangue.',CURRENT_TIMESTAMP),
('cie04','Ciências','A água ferve a quantos graus Celsius ao nível do mar?','["0°C","50°C","100°C","212°C"]','100°C','Ao nível do mar, ferve a 100°C.',CURRENT_TIMESTAMP),
('cie05','Ciências','Qual é a unidade básica da vida?','["Átomo","Célula","Tecido","Órgão"]','Célula','Todos os seres vivos são formados por células.',CURRENT_TIMESTAMP),
('cie06','Ciências','Qual força nos mantém no chão?','["Atrito","Magnetismo","Gravidade","Pressão"]','Gravidade','A gravidade atrai corpos para a Terra.',CURRENT_TIMESTAMP),
('cie07','Ciências','Qual estado da matéria tem volume definido, mas não forma?','["Sólido","Líquido","Gasoso","Plasma"]','Líquido','O líquido assume a forma do recipiente.',CURRENT_TIMESTAMP),
('cie08','Ciências','Qual vitamina é produzida com ajuda da luz solar?','["A","B12","C","D"]','D','A exposição solar auxilia a síntese de vitamina D.',CURRENT_TIMESTAMP),
('cie09','Ciências','Qual é o maior órgão do corpo humano?','["Fígado","Pele","Pulmão","Cérebro"]','Pele','A pele é o maior órgão humano.',CURRENT_TIMESTAMP),
('ger01','Conhecimentos Gerais','Qual é a capital do Brasil?','["Rio de Janeiro","São Paulo","Brasília","Salvador"]','Brasília','Brasília é a capital desde 1960.',CURRENT_TIMESTAMP),
('ger02','Conhecimentos Gerais','Em qual continente fica o Egito?','["Ásia","África","Europa","Oceania"]','África','A maior parte do Egito fica na África.',CURRENT_TIMESTAMP),
('ger03','Conhecimentos Gerais','Quantos oceanos são reconhecidos atualmente?','["3","4","5","6"]','5','São cinco oceanos.',CURRENT_TIMESTAMP),
('ger04','Conhecimentos Gerais','Quem pintou a Mona Lisa?','["Van Gogh","Picasso","Leonardo da Vinci","Michelangelo"]','Leonardo da Vinci','A obra é de Leonardo da Vinci.',CURRENT_TIMESTAMP),
('ger05','Conhecimentos Gerais','Qual é o maior país em área territorial?','["Canadá","China","Estados Unidos","Rússia"]','Rússia','A Rússia possui a maior área territorial.',CURRENT_TIMESTAMP),
('ger06','Conhecimentos Gerais','Qual idioma tem mais falantes nativos?','["Inglês","Espanhol","Mandarim","Hindi"]','Mandarim','O mandarim lidera em falantes nativos.',CURRENT_TIMESTAMP),
('ger07','Conhecimentos Gerais','Quantos anéis há no símbolo olímpico?','["4","5","6","7"]','5','O símbolo olímpico possui cinco anéis.',CURRENT_TIMESTAMP),
('ger08','Conhecimentos Gerais','Qual é o menor continente?','["Europa","Oceania","Antártida","América"]','Oceania','A Oceania é o menor continente em área.',CURRENT_TIMESTAMP),
('ger09','Conhecimentos Gerais','Qual moeda é usada no Japão?','["Won","Yuan","Iene","Dólar"]','Iene','A moeda japonesa é o iene.',CURRENT_TIMESTAMP);
