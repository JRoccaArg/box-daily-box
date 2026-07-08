// src/i18n/pt.ts — Traduções em português.

import type { Translations } from "./types";

const pt: Translations = {
  "home.eyebrow": "Desafios de hoje",
  "home.title": "{{count}} desafios. Um dia.",
  "home.subtitle":
    "Um novo conjunto de minijogos de Fórmula 1 todos os dias à meia-noite. Sem cadastro: seu progresso é salvo neste dispositivo.",
  "home.completed": "{{done}} de {{total}} completos",
  "home.streak": "Sequência de {{count}} {{day}}",
  "home.day_singular": "dia",
  "home.day_plural": "dias",
  "home.play_now": "Jogar agora",
  "home.come_back": "Volte amanhã",
  "home.solved": "Resolvido",
  "home.played": "Jogado",
  "home.unplayed": "Não jogado",
  "home.num.3": "Três",
  "home.num.4": "Quatro",
  "home.num.5": "Cinco",
  "home.num.6": "Seis",
  "home.num.7": "Sete",
  "home.num.8": "Oito",

  "game.pittexto.name": "Pit Texto",
  "game.pittexto.tagline":
    "Adivinhe o piloto secreto. Cada tentativa mostra o quão perto você está.",
  "game.polewordle.name": "PoleWordle",
  "game.polewordle.tagline":
    "Adivinhe o sobrenome do piloto do dia, estilo Wordle, em 6 tentativas.",
  "game.el-intruso.name": "O Intruso",
  "game.el-intruso.tagline":
    "Nove de dez pilotos têm algo em comum. Toque no que não pertence.",
  "game.parrilla-bingo.name": "Bingo de Grid",
  "game.parrilla-bingo.tagline":
    "Coloque em cada célula um piloto que corresponda à equipe e à condição.",

  "shell.daily_challenge": "Desafio do dia",
  "shell.difficulty": "Dificuldade",
  "shell.time": "Tempo",
  "shell.time_limit": "Limite de tempo: {{seconds}} segundos",
  "shell.no_time_limit": "Sem limite de tempo",
  "shell.start": "Começar",
  "shell.surrender": "Desistir",
  "shell.no": "Não",
  "shell.back": "Início",
  "shell.back_label": "Voltar ao início",

  "diff.facil": "Fácil",
  "diff.medio": "Médio",
  "diff.dificil": "Difícil",
  "diff.leyenda": "Lenda",
  "diff.hint.facil": "Grid recente (últimas temporadas)",
  "diff.hint.medio": "Era híbrida e V8 (desde 2006)",
  "diff.hint.dificil": "Era moderna (desde 1990)",
  "diff.hint.leyenda": "Toda a história da F1",

  "result.won_title": "Desafio superado",
  "result.lost_title": "Fim da tentativa",
  "result.won_msg": "Bom trabalho!",
  "result.lost_msg": "Não foi dessa vez.",
  "result.won_sub": "Você adicionou este desafio à sua sequência.",
  "result.lost_sub": "Revise as respostas corretas no tabuleiro.",
  "result.points": "pontos",
  "result.not_ranked":
    "Outro jogador já jogou este desafio da sua conexão hoje, então seu resultado não conta para o ranking global. Mesmo assim, ficou salvo no seu histórico.",
  "result.view_board": "Ver o tabuleiro",
  "result.view_ranking": "Ver ranking do dia",
  "result.go_home": "Voltar ao início",
  "result.come_back": "Volte amanhã para um novo desafio",

  "leave.title": "Sair e perder o desafio?",
  "leave.msg":
    "Se você sair agora, este desafio conta como perdido e você não poderá jogá-lo até amanhã. A sequência será interrompida.",
  "leave.confirm": "Sim, sair e perder",
  "leave.cancel": "Continuar jogando",

  "locked.won": "Você já resolveu o desafio de hoje.",
  "locked.lost": "Você já jogou o desafio de hoje.",
  "locked.wait": "Volte amanhã para um novo desafio",

  "banner.won": "Desafio superado",
  "banner.lost": "Desafio falhou",
  "banner.summary": "Ver resumo",

  "header.home_label": "Box Daily Box - início",
  "header.streak_title": "Sequência de {{count}} dias",
  "header.profile_label": "Editar perfil",
  "header.stats_label": "Ver estatísticas",
  "header.stats": "Stats",

  "footer.line1":
    "Box Box Daily · Projeto de fãs, sem afiliação oficial com a Fórmula 1.",
  "footer.line2": "Um novo desafio todos os dias à meia-noite.",

  "profile.title": "Seu perfil",
  "profile.subtitle":
    "Você aparecerá no ranking global com este nome e país.",
  "profile.name_label": "Nome (visível no ranking)",
  "profile.name_placeholder": "Seu nome ou apelido",
  "profile.name_locked":
    "Você poderá alterá-lo novamente em {{month}}. Neste mês você já usou sua troca de nome.",
  "profile.name_warn":
    "⚠️ Você só pode mudar seu nome 1 vez por mês. Escolha bem antes de salvar.",
  "profile.country_label": "País",
  "profile.country_detecting": "(detectando...)",
  "profile.country_select": "Selecione seu país",
  "profile.country_fixed": "(fixo)",
  "profile.country_warn": "⚠️ Uma vez salvo, você não pode alterá-lo.",
  "profile.save": "Salvar",
  "profile.saving": "Salvando...",
  "profile.cancel": "Cancelar",
  "profile.save_error": "Não foi possível salvar. Tente novamente.",
  "profile.sync_label": "Sincronizar entre dispositivos",
  "profile.logged_as": "Conectado como:",
  "profile.logout": "Sair",
  "profile.google_login": "Entrar com Google",
  "profile.logged_hint":
    "Seu progresso é sincronizado em todos os seus dispositivos.",
  "profile.login_hint":
    "Opcional. Entrar permite jogar em vários dispositivos com a mesma conta.",

  "stats.title": "Estatísticas",
  "stats.no_name": "Sem nome",
  "stats.edit_profile": "Editar perfil",
  "stats.tab_global": "Ranking Global",
  "stats.tab_personal": "Meu Progresso",
  "stats.won": "Vitórias",
  "stats.lost": "Derrotas",
  "stats.win_rate": "% Vitórias",
  "stats.streak": "Sequência",
  "stats.best_streak": "Melhor sequência",
  "stats.days": "dias",
  "stats.no_persistent":
    "O armazenamento persistente não está disponível neste navegador. Seu progresso será salvo apenas durante esta sessão.",
  "stats.reset_confirm":
    "Isso apagará suas estatísticas e pontos. Os desafios que você já jogou hoje continuarão bloqueados até amanhã. Esta ação não pode ser desfeita.",
  "stats.reset_yes": "Sim, apagar tudo",
  "stats.reset_cancel": "Cancelar",
  "stats.reset": "Reiniciar progresso",

  "ranking.title": "Ranking Global",
  "ranking.tab_today": "Hoje",
  "ranking.all_countries": "Todos os países",
  "ranking.loading": "Carregando ranking...",
  "ranking.error": "Não foi possível carregar o ranking",
  "ranking.retry": "Tentar novamente",
  "ranking.empty_daily": "Ninguém jogou hoje ainda. Seja o primeiro!",
  "ranking.empty_monthly": "Sem resultados neste mês.",
  "ranking.anonymous": "Anônimo",
  "ranking.you": "(você)",
  "ranking.challenges_won": "{{count}} {{label}} ganhos",
  "ranking.challenge_singular": "desafio",
  "ranking.challenge_plural": "desafios",
  "ranking.pts": "pts",
  "ranking.monthly_note":
    "O ranking mensal é reiniciado no dia 1 de cada mês.",
  "ranking.daily_note": "O ranking diário mostra os resultados de hoje.",

  "monthly.title": "Ranking de {{month}}",
  "monthly.challenges_won": "{{count}} desafios ganhos",
  "monthly.points_month": "pontos neste mês",
  "monthly.no_wins":
    "Você ainda não ganhou desafios neste mês. Marque seus primeiros pontos!",
  "monthly.best_day": "Melhor dia: {{day}} ({{points}} pts)",
  "monthly.scoring_title": "Como a pontuação funciona?",
  "monthly.scoring_body":
    "Apenas desafios ganhos contam. Pontos base por dificuldade: Fácil {{easy}}, Médio {{medium}}, Difícil {{hard}}, Lenda {{legend}}. Quanto mais rápido, mais bônus de velocidade (até +120). Desistir conta como derrota (0 pontos).",
  "monthly.disclaimer":
    "Este ranking é pessoal e local (salvo no seu dispositivo) e soma todos os seus pontos, incluindo os que não entraram no ranking global (por exemplo, quando outra conta da sua conexão jogou aquele desafio primeiro). O ranking global é calculado no servidor, que verifica cada resposta de forma independente. Pequenas diferenças de pontos com o global são normais (medição de tempo diferente).",

  "rank.position": "Posição #{{rank}}",
  "rank.your_position": "Sua posição hoje",
  "rank.world_ranking": "Ranking mundial",
  "rank.of_players": "de {{count}}",
  "rank.badge_title":
    "Posição no ranking diário de {{count}} jogadores",

  "auth.loading": "Entrando...",
  "auth.linking": "Vinculando sua conta Google",
  "auth.error": "Erro",
  "auth.cancelled": "Autenticação cancelada",
  "auth.no_code": "Sem código de autorização",
  "auth.failed": "Não foi possível entrar",
  "auth.redirecting": "Redirecionando...",

  "pittexto.placeholder": "Digite um sobrenome…",
  "pittexto.found": "Você encontrou:",
  "pittexto.answer_was": "O piloto era:",

  "polewordle.not_in_list": "Não está na lista de pilotos",

  "intruso.confirm": "Confirmar intruso",
  "intruso.select": "Selecione um piloto",

  "bingo.pick_driver": "Escolher piloto",
  "bingo.drove_for": "correu na {{team}}",
  "bingo.nationality": "nacionalidade {{name}}",
  "bingo.world_champion": "campeão mundial",

  "month.0": "janeiro",
  "month.1": "fevereiro",
  "month.2": "março",
  "month.3": "abril",
  "month.4": "maio",
  "month.5": "junho",
  "month.6": "julho",
  "month.7": "agosto",
  "month.8": "setembro",
  "month.9": "outubro",
  "month.10": "novembro",
  "month.11": "dezembro",

  "pittexto.eyebrow": "Adivinhe o piloto",
  "pittexto.hint":
    "Cada tentativa mostra o quão similar o piloto é ao secreto. Mais quente = mais perto.",
  "pittexto.attempt": "Tentativa {{current}} de {{max}}",
  "pittexto.factor.nationality": "Nacionalidade",
  "pittexto.factor.team": "Equipe",
  "pittexto.factor.debut": "Estreia",
  "pittexto.factor.titles": "Títulos",
  "pittexto.factor.mates": "Companheiros de equipe",
  "pittexto.no_team_match": "Sem correspondência",
  "common.yes": "Sim",
  "common.no": "Não",

  "polewordle.eyebrow": "Sobrenome do piloto",
  "polewordle.hint":
    "Adivinhe o sobrenome em {{max}} tentativas. Verde = letra e posição corretas; amarelo = a letra está mas em outro lugar; cinza = não está.",
  "polewordle.grid_info": "{{len}} letras · {{max}} tentativas",
  "polewordle.length_error": "O sobrenome tem {{len}} letras",
  "polewordle.was": "Era",
  "polewordle.correct": "Correto!",
  "polewordle.input_label": "Digite o sobrenome",
  "polewordle.grid_label": "Abrir teclado para digitar",

  "intruso.eyebrow": "O Intruso",
  "intruso.hint":
    "9 destes 10 pilotos têm algo em comum. Encontre o que não pertence.",
  "intruso.rule_label": "Os outros 9",
  "intruso.rule.team": "Correram pela {{team}}",
  "intruso.rule.champ": "Foram campeões mundiais",
  "intruso.rule.non_champ": "Nunca foram campeões mundiais",
  "intruso.rule.nationality": "São da mesma nacionalidade ({{nat}})",
  "intruso.rule.none": "Nenhuma regra disponível",

  "bingo.eyebrow": "Bingo de Grid",
  "bingo.hint":
    "Preencha cada célula com um piloto que corresponda à equipe da linha e à condição da coluna. Sem repetir pilotos.",
  "bingo.cells_count": "{{filled}} de 9 células",
  "bingo.reveal_hint": "As células cinzas mostram um exemplo válido.",
  "bingo.search_placeholder": "Busque um piloto…",
  "bingo.no_match": "Nenhum piloto encontrado.",
  "bingo.already_used": "{{name}} já está em outra célula.",
  "bingo.does_not_match": "{{name}} não cumpre: {{rule}}.",
  "bingo.in_cell": "Na célula:",
  "bingo.remove": "Remover",
  "bingo.empty_cell": "Célula vazia",
  "bingo.example": "ex.",
  "bingo.champion_label": "Campeão",
  "bingo.stat.winner": "Venceu um GP",
  "bingo.stat.podium": "Subiu ao pódio",
  "bingo.stat.pole": "Fez uma pole",

    "game.gp-resultado.name": "GP Resultado",
  "game.gp-resultado.tagline": "Complete o top 10 de um Grande Prêmio histórico antes que o tempo acabe.",
  "gpresultado.eyebrow": "Grande Prêmio",
  "gpresultado.search_placeholder": "Digite um piloto…",
  "gpresultado.found_count": "{{found}} de {{total}} encontrados",
  "gpresultado.not_in_top": "{{name}} não terminou no top 10.",
  "gpresultado.time_up": "Tempo esgotado. As posições faltantes são mostradas acima.",

  "lang.label": "Idioma",

  "profile.name_unique_hint": "Deve ser único: ninguém mais pode ter o mesmo nome de usuário.",
  "profile.name_taken": "Esse nome de usuário já está em uso. Tente outro.",
  "profile.name_checking": "Verificando disponibilidade...",
  "profile.name_available": "✓ Disponível",

  "game.top10-standings.name": "Top 10 Standings",
  "game.top10-standings.tagline":
    "Adivinhe o top 10 acumulado de pontos do campeonato de pilotos em um período de 1 a 4 anos.",
  "top10standings.eyebrow": "Campeonato de Pilotos",
  "top10standings.subtitle": "Top 10 acumulado de pontos do período",
  "top10standings.search_placeholder": "Digite um piloto…",
  "top10standings.found_count": "{{found}} de {{total}} encontrados",
  "top10standings.not_in_top": "{{name}} não está no top 10 acumulado.",
  "top10standings.points_label": "{{points}} pts",
  "top10standings.time_up": "Tempo esgotado. As posições faltantes são mostradas acima.",

  "seo.home.title": "Box Daily Box — Minijogos diários de Fórmula 1 | 6 puzzles grátis",
  "seo.home.description":
    "Seis minijogos diários de Fórmula 1: adivinhe pilotos, complete o top 10, encontre o intruso e mais. Ranking global grátis, sem cadastro.",
  "seo.game.pittexto.title": "PitTexto — Adivinhe o piloto secreto de F1 | Box Daily Box",
  "seo.game.pittexto.description":
    "Adivinhe o piloto de Fórmula 1 secreto do dia. Cada tentativa mostra o quão perto você está. Novo desafio a cada 24 horas.",
  "seo.game.polewordle.title": "PoleWordle — O Wordle da Fórmula 1 | Box Daily Box",
  "seo.game.polewordle.description":
    "Adivinhe o sobrenome do piloto de F1 do dia, estilo Wordle, em 6 tentativas. Puzzle diário grátis.",
  "seo.game.el-intruso.title": "El Intruso — Encontre o piloto que não combina | Box Daily Box",
  "seo.game.el-intruso.description":
    "Nove de dez pilotos de F1 compartilham algo em comum. Encontre o intruso neste puzzle diário de Fórmula 1.",
  "seo.game.parrilla-bingo.title": "Parrilla Bingo — Bingo de equipes de F1 | Box Daily Box",
  "seo.game.parrilla-bingo.description":
    "Complete cada célula com um piloto que cumpra sua equipe e sua condição. O bingo diário de Fórmula 1.",
  "seo.game.gp-resultado.title": "GP Resultado — Adivinhe o top 10 de um Grande Prêmio | Box Daily Box",
  "seo.game.gp-resultado.description":
    "Complete o top 10 de um Grande Prêmio histórico de F1 antes que o tempo acabe. Puzzle diário grátis.",
  "seo.game.top10-standings.title": "Top 10 Standings — Campeonato acumulado de F1 | Box Daily Box",
  "seo.game.top10-standings.description":
    "Adivinhe o top 10 acumulado de pontos do campeonato de pilotos de F1 em um período de 1 a 4 anos.",

  "gamepage.not_found_title": "Jogo não encontrado",
  "gamepage.not_found_body": "O desafio que você procura não existe ou mudou de endereço.",
  "gamepage.see_all": "Ver todos os desafios",
};

export default pt;
