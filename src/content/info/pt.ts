// src/content/info/pt.ts
import type { InfoContent } from "./types";

const content: InfoContent = {
  title: "Como jogar",
  subtitle:
    "O Box Daily Box tem seis minijogos diários de Fórmula 1. Cada um se joga uma vez por dia, com um novo desafio à meia-noite. Aqui explicamos as regras de cada jogo, como a pontuação é calculada, como funciona o ranking e os outros recursos da plataforma.",

  gamesHeading: "Os 6 jogos",
  gamesIntro:
    "Todos os jogos usam dados reais da Fórmula 1: pilotos, equipes, nacionalidades e resultados históricos. O desafio do dia é o mesmo para todos os jogadores do mundo.",
  gameDetail: {
    pittexto:
      "Você precisa adivinhar um piloto secreto de Fórmula 1. Cada tentativa te dá pistas progressivas: nacionalidade, equipe, número de campeonatos e mais. Você tem até 8 tentativas para descobrir quem é.",
    polewordle:
      "É a versão Fórmula 1 do clássico jogo de adivinhar palavras. Você precisa descobrir o sobrenome de um piloto em 6 tentativas. Cada letra é marcada em verde, amarelo ou cinza, dependendo se está na posição certa, em outra posição, ou não está no sobrenome.",
    "el-intruso":
      "São mostrados dez pilotos de Fórmula 1. Nove deles têm algo em comum (uma regra oculta: pode ser a equipe, a nacionalidade, uma década etc.) e um não se encaixa. Sua tarefa é encontrar o intruso.",
    "parrilla-bingo":
      "Uma grade 3x3 onde cada célula cruza uma equipe com uma condição (por exemplo, \"campeão mundial\" ou \"correu nos anos 90\"). Você precisa preencher cada célula com um piloto real que cumpra as duas condições ao mesmo tempo, sem repetir pilotos.",
    "gp-resultado":
      "É mostrado um Grande Prêmio histórico e você precisa completar o top 10 dessa corrida: qual piloto terminou em cada posição. Tem autocompletar para buscar mais rápido entre os pilotos.",
    "top10-standings":
      "Parecido com o anterior, mas com o campeonato acumulado de pilotos de uma temporada (escolhida aleatoriamente em um período de 1 a 4 anos), não de uma única corrida. As pistas são a nacionalidade de cada piloto e os pontos que ele somou naquele ano.",
  },

  difficultyHeading: "Dificuldades",
  difficultyIntro:
    "Cada jogo pode ser jogado em 4 níveis de dificuldade. A dificuldade define de qual época vêm os pilotos: quanto mais difícil, mais para trás na história da Fórmula 1 é preciso conhecer.",

  scoringHeading: "Como a pontuação é calculada",
  scoringIntro: "A pontuação de cada desafio vencido é calculada assim:",

  rankingHeading: "O ranking",
  rankingBody: [
    "Existem dois rankings públicos: um diário (resultados de hoje) e um mensal (reinicia no dia 1 de cada mês). Ambos mostram todos os jogadores que participaram naquele dia ou mês, ordenados por pontos — incluindo os que perderam todos os desafios, que aparecem no final com 0 pontos.",
    "Para que o ranking seja justo, cada tentativa é verificada no servidor (nunca se confia no que o navegador do jogador informa), e apenas a primeira conta que joga um jogo a partir de uma mesma conexão de internet conta para o ranking — isso evita que alguém use várias contas para acumular mais pontos.",
    "Você pode jogar sem criar uma conta (anonimamente) ou entrar com o Google. Em ambos os casos, você aparece no ranking com o nome público que escolher.",
  ],

  badgesHeading: "Selos (badges)",
  badgesBody: [
    "Ao final de cada mês, os três primeiros colocados no ranking mensal recebem um selo permanente: ouro para o primeiro lugar, prata para o segundo, bronze para o terceiro. Esses selos ficam para sempre junto ao seu nome em todos os rankings, e se acumulam se você vencer vários meses.",
    "Se houver empate em alguma colocação, todos os empatados recebem o selo daquela colocação.",
  ],

  streakHeading: "Sequência",
  streakBody:
    "A sequência conta quantos dias seguidos você venceu pelo menos um desafio. Ela aparece com um ícone de chama junto ao seu nome no ranking a partir de 2 dias seguidos. Se você não jogar em um dia ou perder todos os desafios, a sequência reinicia no dia seguinte.",

  duelsHeading: "Amigos e duelos",
  duelsBody: [
    "Você pode adicionar amigos com um código de 6 caracteres (cada usuário tem o seu) ou por link. Também pode desafiar alguém para um duelo antes mesmo de serem amigos, enviando um link direto.",
    "Um duelo é uma partida especial contra outra pessoa, com seu próprio desafio (não é o desafio diário, então você pode jogar vários duelos no mesmo dia). O resultado de um duelo não afeta o ranking global nem sua sequência: é só para competir cara a cara com quem você quiser.",
    "O duelo é \"às cegas\": nenhum dos dois vê o resultado do outro até que ambos tenham terminado de jogar.",
  ],

  faq: [
    {
      q: "Preciso criar uma conta para jogar?",
      a: "Não. Você pode jogar de forma totalmente anônima; seu progresso é salvo no seu dispositivo. Se quiser aparecer no ranking em vários dispositivos ou nunca perder seu progresso, pode entrar com sua conta do Google a qualquer momento.",
    },
    {
      q: "Quantas vezes por dia posso jogar cada desafio?",
      a: "Uma vez por dia, por jogo. À meia-noite é gerado um novo desafio para cada um dos 6 jogos. Os duelos com amigos são a exceção: você pode jogá-los quantas vezes quiser, já que não são o desafio diário.",
    },
    {
      q: "Como a pontuação é calculada?",
      a: "Você só ganha pontos se vencer o desafio. A pontuação base depende da dificuldade escolhida, e há um bônus por resolver rápido. Perder ou desistir de um desafio sempre dá 0 pontos.",
    },
    {
      q: "O que acontece se eu perder um desafio?",
      a: "Você ainda aparece no ranking do dia, com 0 pontos, junto com os outros jogadores. Perder não te bloqueia do ranking: só não soma pontos.",
    },
    {
      q: "Como se evita trapaça?",
      a: "O servidor gera o desafio, mede o tempo e verifica cada resposta de forma independente. O navegador do jogador nunca decide se ele venceu nem quantos pontos fez. Além disso, apenas a primeira conta que joga um jogo a partir de uma mesma conexão conta para o ranking.",
    },
    {
      q: "O Box Daily Box é afiliado à Fórmula 1?",
      a: "Não. É um projeto feito por fãs, sem afiliação oficial com o Formula One Group, a FIA, ou qualquer equipe ou piloto.",
    },
  ],
};

export default content;
