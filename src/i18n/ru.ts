// src/i18n/ru.ts — Русский перевод.

import type { Translations } from "./types";

const ru: Translations = {
  "home.eyebrow": "Сегодняшние испытания",
  "home.title": "{{count}} испытаний. Один день.",
  "home.subtitle":
    "Новый набор мини-игр по Формуле 1 каждый день в полночь. Без регистрации: прогресс сохраняется на этом устройстве.",
  "home.completed": "{{done}} из {{total}} завершено",
  "home.streak": "Серия {{count}} {{day}}",
  "home.day_singular": "день",
  "home.day_plural": "дней",
  "home.play_now": "Играть",
  "home.come_back": "Возвращайся завтра",
  "home.solved": "Решено",
  "home.played": "Сыграно",
  "home.unplayed": "Не сыграно",
  "home.num.3": "Три", "home.num.4": "Четыре", "home.num.5": "Пять",
  "home.num.6": "Шесть", "home.num.7": "Семь", "home.num.8": "Восемь",

  "game.pittexto.name": "Пит Текст",
  "game.pittexto.tagline": "Угадай секретного гонщика. Каждая попытка показывает, насколько ты близко.",
  "game.polewordle.name": "PoleWordle",
  "game.polewordle.tagline": "Угадай фамилию гонщика в стиле Wordle за 6 попыток.",
  "game.el-intruso.name": "Чужак",
  "game.el-intruso.tagline": "Девять из десяти гонщиков имеют что-то общее. Найди того, кто не подходит.",
  "game.parrilla-bingo.name": "Грид Бинго",
  "game.parrilla-bingo.tagline": "Поставь в каждую клетку гонщика, подходящего и команде, и условию.",

  "shell.daily_challenge": "Испытание дня",
  "shell.difficulty": "Сложность",
  "shell.time": "Время",
  "shell.time_limit": "Лимит времени: {{seconds}} секунд",
  "shell.no_time_limit": "Без ограничения по времени",
  "shell.start": "Начать",
  "shell.surrender": "Сдаться",
  "shell.no": "Нет",
  "shell.back": "Главная",
  "shell.back_label": "Вернуться на главную",

  "diff.facil": "Легко", "diff.medio": "Средне", "diff.dificil": "Сложно", "diff.leyenda": "Легенда",
  "diff.hint.facil": "Недавний состав (последние сезоны)",
  "diff.hint.medio": "Гибридная и V8 эра (с 2006)",
  "diff.hint.dificil": "Современная эра (с 1990)",
  "diff.hint.leyenda": "Вся история Ф1",

  "result.won_title": "Испытание пройдено",
  "result.lost_title": "Попытка завершена",
  "result.won_msg": "Отлично!",
  "result.lost_msg": "Не в этот раз.",
  "result.won_sub": "Ты добавил это испытание к своей серии.",
  "result.lost_sub": "Посмотри правильные ответы на доске.",
  "result.points": "очков",
  "result.not_ranked": "Сегодня другой игрок уже прошёл это испытание с твоего подключения, поэтому твой результат не учитывается в глобальном рейтинге. Он всё равно сохранён в истории.",
  "result.view_board": "Посмотреть доску",
  "result.view_ranking": "Рейтинг дня",
  "result.go_home": "На главную",
  "result.come_back": "Возвращайся завтра за новым испытанием",

  "leave.title": "Выйти и потерять испытание?",
  "leave.msg": "Если выйдешь сейчас, это испытание засчитается как проигрыш, и ты не сможешь сыграть до завтра. Серия прервётся.",
  "leave.confirm": "Да, выйти и проиграть",
  "leave.cancel": "Продолжить игру",

  "locked.won": "Ты уже прошёл сегодняшнее испытание.",
  "locked.lost": "Ты уже сыграл сегодняшнее испытание.",
  "locked.wait": "Возвращайся завтра за новым испытанием",

  "banner.won": "Испытание пройдено", "banner.lost": "Испытание провалено", "banner.summary": "Итоги",

  "header.home_label": "Box Daily Box - главная", "header.streak_title": "Серия {{count}} дней",
  "header.profile_label": "Редактировать профиль", "header.stats_label": "Статистика", "header.stats": "Стат.",

  "footer.line1": "Box Box Daily · Фан-проект, без официальной связи с Формулой 1.",
  "footer.line2": "Новое испытание каждый день в полночь.",

  "profile.title": "Твой профиль",
  "profile.subtitle": "Ты появишься в глобальном рейтинге с этим именем и страной.",
  "profile.name_label": "Имя (видно в рейтинге)", "profile.name_placeholder": "Твоё имя или никнейм",
  "profile.name_locked": "Ты сможешь изменить его снова в {{month}}. В этом месяце смена имени уже использована.",
  "profile.name_warn": "⚠️ Имя можно менять только раз в месяц. Выбирай внимательно перед сохранением.",
  "profile.country_label": "Страна", "profile.country_detecting": "(определяется...)",
  "profile.country_select": "Выбери страну", "profile.country_fixed": "(зафиксировано)",
  "profile.country_warn": "⚠️ После сохранения изменить нельзя.",
  "profile.save": "Сохранить", "profile.saving": "Сохранение...", "profile.cancel": "Отмена",
  "profile.save_error": "Не удалось сохранить. Попробуй ещё раз.",
  "profile.sync_label": "Синхронизация между устройствами",
  "profile.logged_as": "Вход выполнен как:", "profile.logout": "Выйти",
  "profile.google_login": "Войти через Google",
  "profile.logged_hint": "Твой прогресс синхронизирован на всех устройствах.",
  "profile.login_hint": "Необязательно. Вход позволяет играть на нескольких устройствах с одним аккаунтом.",

  "stats.title": "Статистика", "stats.no_name": "Без имени", "stats.edit_profile": "Редактировать профиль",
  "stats.tab_global": "Глобальный рейтинг", "stats.tab_personal": "Мой прогресс",
  "stats.won": "Побед", "stats.lost": "Поражений", "stats.win_rate": "% побед", "stats.streak": "Серия",
  "stats.best_streak": "Лучшая серия", "stats.days": "дней",
  "stats.no_persistent": "Постоянное хранилище недоступно в этом браузере. Прогресс сохранится только на время сессии.",
  "stats.reset_confirm": "Это удалит статистику и очки. Сыгранные сегодня испытания останутся заблокированы до завтра. Действие нельзя отменить.",
  "stats.reset_yes": "Да, удалить всё", "stats.reset_cancel": "Отмена", "stats.reset": "Сбросить прогресс",

  "ranking.title": "Глобальный рейтинг", "ranking.tab_today": "Сегодня",
  "ranking.all_countries": "Все страны", "ranking.loading": "Загрузка рейтинга...",
  "ranking.error": "Не удалось загрузить рейтинг", "ranking.retry": "Повторить",
  "ranking.empty_daily": "Сегодня ещё никто не играл. Будь первым!",
  "ranking.empty_monthly": "Нет результатов за этот месяц.",
  "ranking.anonymous": "Аноним", "ranking.you": "(ты)",
  "ranking.challenges_won": "{{count}} {{label}} выиграно",
  "ranking.challenge_singular": "испытание", "ranking.challenge_plural": "испытаний",
  "ranking.pts": "очк.",
  "ranking.monthly_note": "Месячный рейтинг обнуляется 1-го числа каждого месяца.",
  "ranking.daily_note": "Дневной рейтинг показывает результаты сегодня.",

  "monthly.title": "Рейтинг за {{month}}", "monthly.challenges_won": "{{count}} испытаний выиграно",
  "monthly.points_month": "очков за месяц",
  "monthly.no_wins": "В этом месяце ещё нет побед. Заработай первые очки!",
  "monthly.best_day": "Лучший день: {{day}} ({{points}} очк.)",
  "monthly.scoring_title": "Как начисляются очки?",
  "monthly.scoring_body": "Учитываются только выигранные испытания. Базовые очки по сложности: Легко {{easy}}, Средне {{medium}}, Сложно {{hard}}, Легенда {{legend}}. Чем быстрее финишируешь, тем больше бонус за скорость (до +120). Сдаться = поражение (0 очков).",
  "monthly.disclaimer": "Этот рейтинг персональный и локальный (сохранён на устройстве), включает все очки, в том числе те, что не попали в глобальный рейтинг. Глобальный рейтинг рассчитывается на сервере с независимой проверкой каждого ответа. Небольшие расхождения в очках — это нормально.",

  "rank.position": "Место #{{rank}}", "rank.your_position": "Твоя позиция сегодня",
  "rank.world_ranking": "Мировой рейтинг", "rank.of_players": "из {{count}}",
  "rank.badge_title": "Позиция в дневном рейтинге из {{count}} игроков",

  "auth.loading": "Вход...", "auth.linking": "Привязка аккаунта Google",
  "auth.error": "Ошибка", "auth.cancelled": "Аутентификация отменена",
  "auth.no_code": "Нет кода авторизации", "auth.failed": "Не удалось войти",
  "auth.redirecting": "Перенаправление...",

  "pittexto.placeholder": "Введи фамилию…", "pittexto.found": "Найден:", "pittexto.answer_was": "Это был:",
  "pittexto.eyebrow": "Угадай гонщика",
  "pittexto.hint": "Каждая попытка показывает сходство с секретным гонщиком. Горячее = ближе.",
  "pittexto.attempt": "Попытка {{current}} из {{max}}",

  "polewordle.not_in_list": "Нет в списке гонщиков",
  "polewordle.eyebrow": "Фамилия гонщика",
  "polewordle.hint": "Угадай фамилию за {{max}} попыток. Зелёный = верная буква и позиция; жёлтый = буква есть, но не там; серый = нет такой буквы.",
  "polewordle.grid_info": "{{len}} букв · {{max}} попыток",
  "polewordle.length_error": "Фамилия содержит {{len}} букв",
  "polewordle.was": "Это был", "polewordle.correct": "Верно!",
  "polewordle.input_label": "Введи фамилию", "polewordle.grid_label": "Открыть клавиатуру",

  "intruso.confirm": "Подтвердить чужака", "intruso.select": "Выбери гонщика",
  "intruso.eyebrow": "Чужак",
  "intruso.hint": "9 из 10 гонщиков имеют что-то общее. Найди того, кто не вписывается.",
  "intruso.rule_label": "Остальные 9",

  "bingo.pick_driver": "Выбрать гонщика", "bingo.drove_for": "выступал за {{team}}",
  "bingo.nationality": "национальность {{name}}", "bingo.world_champion": "чемпион мира",
  "bingo.eyebrow": "Грид Бинго",
  "bingo.hint": "Заполни каждую клетку гонщиком, подходящим и команде строки, и условию столбца. Без повторов.",
  "bingo.cells_count": "{{filled}} из 9 клеток",
  "bingo.reveal_hint": "Серые клетки показывают допустимый пример.",
  "bingo.search_placeholder": "Найти гонщика…", "bingo.no_match": "Нет подходящих гонщиков.",
  "bingo.already_used": "{{name}} уже в другой клетке.",
  "bingo.does_not_match": "{{name}} не подходит: {{rule}}.",
  "bingo.in_cell": "В клетке:", "bingo.remove": "Убрать",
  "bingo.empty_cell": "Пустая клетка", "bingo.example": "пр.", "bingo.champion_label": "Чемпион",

  "month.0": "январь", "month.1": "февраль", "month.2": "март", "month.3": "апрель",
  "month.4": "май", "month.5": "июнь", "month.6": "июль", "month.7": "август",
  "month.8": "сентябрь", "month.9": "октябрь", "month.10": "ноябрь", "month.11": "декабрь",

    "game.gp-resultado.name": "GP Результат",
  "game.gp-resultado.tagline": "Заполни топ-10 исторического Гран-при до истечения времени.",
  "gpresultado.eyebrow": "Гран-при",
  "gpresultado.search_placeholder": "Введи имя гонщика…",
  "gpresultado.found_count": "{{found}} из {{total}} найдено",
  "gpresultado.not_in_top": "{{name}} не финишировал в топ-10.",
  "gpresultado.time_up": "Время вышло. Недостающие позиции показаны выше.",

  "lang.label": "Язык",

  "profile.name_unique_hint": "Должно быть уникальным: ни у кого другого не может быть такого же имени пользователя.",
  "profile.name_taken": "Это имя пользователя уже занято. Попробуйте другое.",
  "profile.name_checking": "Проверка доступности...",
  "profile.name_available": "✓ Доступно",

  "game.top10-standings.name": "Top 10 Standings",
  "game.top10-standings.tagline":
    "Угадай суммарный топ-10 очков чемпионата пилотов за период от 1 до 4 лет.",
  "top10standings.eyebrow": "Чемпионат пилотов",
  "top10standings.subtitle": "Суммарный топ-10 очков за период",
  "top10standings.search_placeholder": "Введите имя гонщика…",
  "top10standings.found_count": "{{found}} из {{total}} найдено",
  "top10standings.not_in_top": "{{name}} не входит в суммарный топ-10.",
  "top10standings.points_label": "{{points}} очк.",
  "top10standings.time_up": "Время вышло. Недостающие позиции показаны выше.",

  "seo.home.title": "Box Daily Box — Ежедневные мини-игры Формулы 1 | 6 бесплатных головоломок",
  "seo.home.description":
    "Шесть ежедневных мини-игр Формулы 1: угадывай пилотов, заполняй топ-10, находи лишнего и многое другое. Бесплатный мировой рейтинг, без регистрации.",
  "seo.game.pittexto.title": "PitTexto — Угадай секретного пилота F1 | Box Daily Box",
  "seo.game.pittexto.description":
    "Угадай секретного пилота Формулы 1 сегодняшнего дня. Каждая попытка показывает, насколько ты близок. Новый вызов каждые 24 часа.",
  "seo.game.polewordle.title": "PoleWordle — Wordle Формулы 1 | Box Daily Box",
  "seo.game.polewordle.description":
    "Угадай фамилию пилота F1 сегодняшнего дня в стиле Wordle за 6 попыток. Новая бесплатная ежедневная головоломка.",
  "seo.game.el-intruso.title": "El Intruso — Найди лишнего пилота F1 | Box Daily Box",
  "seo.game.el-intruso.description":
    "Девять из десяти пилотов F1 объединяет что-то общее. Найди лишнего в этой ежедневной головоломке Формулы 1.",
  "seo.game.parrilla-bingo.title": "Parrilla Bingo — Бинго команд F1 | Box Daily Box",
  "seo.game.parrilla-bingo.description":
    "Заполни каждую ячейку пилотом, который соответствует и команде, и условию. Ежедневное бинго Формулы 1.",
  "seo.game.gp-resultado.title": "GP Resultado — Угадай топ-10 Гран-при | Box Daily Box",
  "seo.game.gp-resultado.description":
    "Заполни топ-10 исторического Гран-при F1 до истечения времени. Новая бесплатная ежедневная головоломка.",
  "seo.game.top10-standings.title": "Top 10 Standings — Головоломка чемпионата F1 | Box Daily Box",
  "seo.game.top10-standings.description":
    "Угадай суммарный топ-10 очков чемпионата пилотов F1 за период от 1 до 4 лет.",

  "gamepage.not_found_title": "Игра не найдена",
  "gamepage.not_found_body": "Испытание, которое вы ищете, не существует или было перемещено.",
  "gamepage.see_all": "Посмотреть все испытания",
};

export default ru;
