// src/i18n/tr.ts — Turkish translations.

import type { Translations } from "./types";

const tr: Translations = {
  // ─── Home ───────────────────────────────────────────────────────────
  "home.eyebrow": "Bugünün meydan okumaları",
  "home.title": "{{count}} meydan okuma. Bir gün.",
  "home.subtitle":
    "Her gün gece yarısı yeni Formula 1 mini oyunları. Kayıt gerekmez: ilerlemeniz bu cihazda kaydedilir.",
  "home.completed": "{{total}} üzerinden {{done}} tamamlandı",
  "home.streak": "{{count}} günlük seri",
  "home.day_singular": "gün",
  "home.day_plural": "gün",
  "home.play_now": "Şimdi oyna",
  "home.come_back": "Yarın tekrar gel",
  "home.solved": "Çözüldü",
  "home.played": "Oynandı",
  "home.unplayed": "Oynanmadı",
  "home.num.3": "Üç",
  "home.num.4": "Dört",
  "home.num.5": "Beş",
  "home.num.6": "Altı",
  "home.num.7": "Yedi",
  "home.num.8": "Sekiz",

  // ─── Games: names and taglines ──────────────────────────────────────
  "game.pittexto.name": "Pit Metin",
  "game.pittexto.tagline":
    "Gizli pilotu tahmin et. Her deneme ne kadar yakın olduğunu gösterir.",
  "game.polewordle.name": "PoleWordle",
  "game.polewordle.tagline":
    "Pilotun soyadını Wordle tarzında 6 denemede tahmin et.",
  "game.el-intruso.name": "Davetsiz Misafir",
  "game.el-intruso.tagline":
    "On pilottan dokuzu bir şeyi paylaşıyor. Ait olmayana dokun.",
  "game.parrilla-bingo.name": "Grid Bingo",
  "game.parrilla-bingo.tagline":
    "Her hücreye takım ve koşula uyan bir pilot yerleştir.",

  // ─── GameShell ──────────────────────────────────────────────────────
  "shell.daily_challenge": "Günlük meydan okuma",
  "shell.difficulty": "Zorluk",
  "shell.time": "Süre",
  "shell.time_limit": "Süre sınırı: {{seconds}} saniye",
  "shell.no_time_limit": "Süre sınırı yok",
  "shell.start": "Başla",
  "shell.surrender": "Pes et",
  "shell.no": "Hayır",
  "shell.back": "Ana sayfa",
  "shell.back_label": "Ana sayfaya dön",

  "diff.facil": "Kolay",
  "diff.medio": "Orta",
  "diff.dificil": "Zor",
  "diff.leyenda": "Efsane",
  "diff.hint.facil": "Son sezonların gridi",
  "diff.hint.medio": "Hibrit ve V8 dönemi (2006'dan beri)",
  "diff.hint.dificil": "Modern dönem (1990'dan beri)",
  "diff.hint.leyenda": "F1'in tüm tarihi",

  "result.won_title": "Meydan okuma tamamlandı",
  "result.lost_title": "Deneme sonu",
  "result.won_msg": "Harika iş!",
  "result.lost_msg": "Bu sefer olmadı.",
  "result.won_sub": "Bu meydan okumayı serine ekledin.",
  "result.lost_sub": "Doğru cevapları panoda incele.",
  "result.points": "puan",
  "result.not_ranked":
    "Bugün bağlantınızdan başka bir oyuncu bu meydan okumayı zaten oynadı, bu yüzden sonucunuz genel sıralamaya dahil edilmiyor. Yine de geçmişinizde kaydedildi.",
  "result.view_board": "Panoyu gör",
  "result.view_ranking": "Bugünün sıralamasını gör",
  "result.go_home": "Ana sayfaya dön",
  "result.come_back": "Yeni bir meydan okuma için yarın tekrar gel",

  "leave.title": "Ayrıl ve meydan okumayı kaybet?",
  "leave.msg":
    "Şimdi ayrılırsan, bu meydan okuma kayıp sayılır ve yarına kadar tekrar oynayamazsın. Serin bozulur.",
  "leave.confirm": "Evet, ayrıl ve kaybet",
  "leave.cancel": "Oynamaya devam et",

  "locked.won": "Bugünün meydan okumasını zaten çözdün.",
  "locked.lost": "Bugünün meydan okumasını zaten oynadın.",
  "locked.wait": "Yeni bir meydan okuma için yarın tekrar gel",

  "banner.won": "Meydan okuma tamamlandı",
  "banner.lost": "Meydan okuma başarısız",
  "banner.summary": "Özeti gör",

  // ─── Header ─────────────────────────────────────────────────────────
  "header.home_label": "Box Daily Box - ana sayfa",
  "header.streak_title": "{{count}} günlük seri",
  "header.profile_label": "Profili düzenle",
  "header.stats_label": "İstatistikleri gör",
  "header.stats": "İstatistikler",

  // ─── Footer ─────────────────────────────────────────────────────────
  "footer.line1":
    "Box Box Daily · Taraftar projesi, Formula 1 ile resmi bağlantısı yoktur.",
  "footer.line2": "Her gün gece yarısı yeni bir meydan okuma.",

  // ─── Profile (IdentityModal) ────────────────────────────────────────
  "profile.title": "Profilin",
  "profile.subtitle":
    "Genel sıralamada bu isim ve ülkeyle görüneceksin.",
  "profile.name_label": "İsim (sıralamada görünür)",
  "profile.name_placeholder": "Adın veya takma adın",
  "profile.name_locked":
    "{{month}} ayında tekrar değiştirebilirsin. Bu ay isim değişikliğini zaten kullandın.",
  "profile.name_warn":
    "⚠️ İsmini ayda yalnızca bir kez değiştirebilirsin. Kaydetmeden önce iyi düşün.",
  "profile.country_label": "Ülke",
  "profile.country_detecting": "(algılanıyor...)",
  "profile.country_select": "Ülkeni seç",
  "profile.country_fixed": "(sabit)",
  "profile.country_warn": "⚠️ Kaydettikten sonra değiştiremezsin.",
  "profile.save": "Kaydet",
  "profile.saving": "Kaydediliyor...",
  "profile.cancel": "İptal",
  "profile.save_error": "Kaydedilemedi. Lütfen tekrar dene.",
  "profile.sync_label": "Cihazlar arası senkronize et",
  "profile.logged_as": "Giriş yapılan hesap:",
  "profile.logout": "Çıkış yap",
  "profile.google_login": "Google ile giriş yap",
  "profile.logged_hint": "İlerlemen tüm cihazlarında senkronize edilir.",
  "profile.login_hint":
    "İsteğe bağlı. Giriş yapmak birden fazla cihazda aynı hesapla oynamanı sağlar.",

  // ─── Stats (StatsModal) ─────────────────────────────────────────────
  "stats.title": "İstatistikler",
  "stats.no_name": "İsimsiz",
  "stats.edit_profile": "Profili düzenle",
  "stats.tab_global": "Genel Sıralama",
  "stats.tab_personal": "İlerlememem",
  "stats.won": "Kazanılan",
  "stats.lost": "Kaybedilen",
  "stats.win_rate": "Kazanma %",
  "stats.streak": "Seri",
  "stats.best_streak": "En iyi seri",
  "stats.days": "gün",
  "stats.no_persistent":
    "Bu tarayıcıda kalıcı depolama mevcut değil. İlerlemeniz yalnızca bu oturum süresince kaydedilecektir.",
  "stats.reset_confirm":
    "Bu işlem istatistiklerini ve puanlarını siler. Bugün zaten oynadığın meydan okumalar yarına kadar kilitli kalır. Bu işlem geri alınamaz.",
  "stats.reset_yes": "Evet, her şeyi sil",
  "stats.reset_cancel": "İptal",
  "stats.reset": "İlerlemeyi sıfırla",

  // ─── Global Ranking ─────────────────────────────────────────────────
  "ranking.title": "Genel Sıralama",
  "ranking.tab_today": "Bugün",
  "ranking.all_countries": "Tüm ülkeler",
  "ranking.loading": "Sıralama yükleniyor...",
  "ranking.error": "Sıralama yüklenemedi",
  "ranking.retry": "Tekrar dene",
  "ranking.empty_daily": "Bugün henüz kimse oynamadı. İlk sen ol!",
  "ranking.empty_monthly": "Bu ay sonuç yok.",
  "ranking.anonymous": "Anonim",
  "ranking.you": "(sen)",
  "ranking.challenges_won": "{{count}} {{label}} kazanıldı",
  "ranking.challenge_singular": "meydan okuma",
  "ranking.challenge_plural": "meydan okuma",
  "ranking.pts": "puan",
  "ranking.monthly_note": "Aylık sıralama her ayın 1'inde sıfırlanır.",
  "ranking.daily_note": "Günlük sıralama bugünün sonuçlarını gösterir.",

  // ─── Monthly Ranking (personal) ─────────────────────────────────────
  "monthly.title": "{{month}} sıralaması",
  "monthly.challenges_won": "{{count}} meydan okuma kazanıldı",
  "monthly.points_month": "bu ay puan",
  "monthly.no_wins": "Bu ay henüz meydan okuma kazanmadın. İlk puanlarını kazan!",
  "monthly.best_day": "En iyi gün: {{day}} ({{points}} puan)",
  "monthly.scoring_title": "Puanlama nasıl hesaplanır?",
  "monthly.scoring_body":
    "Yalnızca kazanılan meydan okumalar sayılır. Zorluğa göre temel puanlar: Kolay {{easy}}, Orta {{medium}}, Zor {{hard}}, Efsane {{legend}}. Ne kadar hızlı bitirirsen, o kadar çok hız bonusu alırsın (+120'ye kadar). Pes etmek kayıp sayılır (0 puan).",
  "monthly.disclaimer":
    "Bu sıralama kişisel ve yereldir (cihazında kaydedilir) ve genel sıralamaya dahil edilmeyenler dahil tüm puanlarını içerir (örneğin, bağlantınızdan başka bir hesap bu meydan okumayı önce oynadığında). Genel sıralama sunucuda hesaplanır ve her cevabı bağımsız olarak doğrular. Genel sıralama ile küçük puan farkları normaldir (farklı süre ölçümü).",

  // ─── RankBadge ──────────────────────────────────────────────────────
  "rank.position": "Sıra #{{rank}}",
  "rank.your_position": "Bugünkü sıran",
  "rank.world_ranking": "Dünya sıralaması",
  "rank.of_players": "/ {{count}}",
  "rank.badge_title": "{{count}} oyuncunun günlük sıralamasındaki konum",

  // ─── Auth Callback ──────────────────────────────────────────────────
  "auth.loading": "Giriş yapılıyor...",
  "auth.linking": "Google hesabın bağlanıyor",
  "auth.error": "Hata",
  "auth.cancelled": "Kimlik doğrulama iptal edildi",
  "auth.no_code": "Yetkilendirme kodu yok",
  "auth.failed": "Giriş yapılamadı",
  "auth.redirecting": "Yönlendiriliyor...",

  // ─── Individual games ───────────────────────────────────────────────
  "pittexto.placeholder": "Bir soyad yaz…",
  "pittexto.found": "Buldun:",
  "pittexto.answer_was": "Pilot şuydu:",

  "polewordle.not_in_list": "Pilot listesinde yok",

  "intruso.confirm": "Davetsiz misafiri onayla",
  "intruso.select": "Bir pilot seç",

  "bingo.pick_driver": "Bir pilot seç",
  "bingo.drove_for": "{{team}} için sürdü",
  "bingo.nationality": "uyruk {{name}}",
  "bingo.world_champion": "dünya şampiyonu",

  // ─── Months ─────────────────────────────────────────────────────────
  "month.0": "Ocak",
  "month.1": "Şubat",
  "month.2": "Mart",
  "month.3": "Nisan",
  "month.4": "Mayıs",
  "month.5": "Haziran",
  "month.6": "Temmuz",
  "month.7": "Ağustos",
  "month.8": "Eylül",
  "month.9": "Ekim",
  "month.10": "Kasım",
  "month.11": "Aralık",

  // ─── PitTexto extra ──────────────────────────────────────────────────
  "pittexto.eyebrow": "Pilotu tahmin et",
  "pittexto.hint":
    "Her deneme pilotun gizli olana ne kadar benzediğini gösterir. Sıcak = yakın.",
  "pittexto.attempt": "Deneme {{current}} / {{max}}",
  "pittexto.factor.nationality": "Uyruk",
  "pittexto.factor.team": "Takım",
  "pittexto.factor.debut": "Debüt",
  "pittexto.factor.titles": "Şampiyonluk",
  "pittexto.factor.mates": "Takım arkadaşları",
  "pittexto.no_team_match": "Eşleşme yok",
  "common.yes": "Evet",
  "common.no": "Hayır",

  // ─── PoleWordle extra ─────────────────────────────────────────────────
  "polewordle.eyebrow": "Pilotun soyadı",
  "polewordle.hint":
    "Soyadını {{max}} denemede tahmin et. Yeşil = doğru harf ve konum; sarı = harf var ama başka yerde; gri = yok.",
  "polewordle.grid_info": "{{len}} harf · {{max}} deneme",
  "polewordle.length_error": "Soyadı {{len}} harf",
  "polewordle.was": "Cevap",
  "polewordle.correct": "Doğru!",
  "polewordle.input_label": "Soyadını yaz",
  "polewordle.grid_label": "Yazmak için klavyeyi aç",

  // ─── ElIntruso extra ──────────────────────────────────────────────────
  "intruso.eyebrow": "Davetsiz Misafir",
  "intruso.hint":
    "Bu 10 pilottan 9'u ortak bir şeyi paylaşıyor. Ait olmayanı bul.",
  "intruso.rule_label": "Diğer 9",
  "intruso.rule.team": "{{team}} için yarıştılar",
  "intruso.rule.champ": "Dünya şampiyonu oldular",
  "intruso.rule.non_champ": "Hiç dünya şampiyonu olmadılar",
  "intruso.rule.nationality": "Aynı uyruğa sahipler ({{nat}})",
  "intruso.rule.none": "Kural yok",

  // ─── ParrillaBingo extra ──────────────────────────────────────────────
  "bingo.eyebrow": "Grid Bingo",
  "bingo.hint":
    "Her hücreyi satırındaki takıma ve sütunundaki koşula uyan bir pilotla doldur. Pilot tekrarı yok.",
  "bingo.cells_count": "9 hücreden {{filled}} tanesi",
  "bingo.reveal_hint": "Gri hücreler geçerli bir örnek gösterir.",
  "bingo.search_placeholder": "Pilot ara…",
  "bingo.no_match": "Eşleşen pilot yok.",
  "bingo.already_used": "{{name}} zaten başka bir hücrede.",
  "bingo.does_not_match": "{{name}} uymuyor: {{rule}}.",
  "bingo.in_cell": "Hücrede:",
  "bingo.remove": "Kaldır",
  "bingo.empty_cell": "Boş hücre",
  "bingo.example": "örn.",
  "bingo.champion_label": "Şampiyon",
  "bingo.stat.winner": "Bir GP kazandı",
  "bingo.stat.podium": "Podyuma çıktı",
  "bingo.stat.pole": "Pol pozisyonu aldı",

  // ─── GP Resultado ───────────────────────────────────────────────────
  "game.gp-resultado.name": "GP Sonucu",
  "game.gp-resultado.tagline": "Süre bitmeden tarihi bir Grand Prix'in ilk 10'unu tamamla.",
  "gpresultado.eyebrow": "Grand Prix",
  "gpresultado.search_placeholder": "Pilot adı yaz…",
  "gpresultado.found_count": "{{total}} üzerinden {{found}} bulundu",
  "gpresultado.not_in_top": "{{name}} ilk 10'da bitirmedi.",
  "gpresultado.time_up": "Süre doldu. Eksik sıralar yukarıda gösteriliyor.",

  // ─── Language ───────────────────────────────────────────────────────
  "lang.label": "Dil",

  "profile.name_unique_hint": "Benzersiz olmalı: başka kimse aynı kullanıcı adına sahip olamaz.",
  "profile.name_taken": "Bu kullanıcı adı zaten kullanılıyor. Başka bir tane deneyin.",
  "profile.name_checking": "Uygunluk kontrol ediliyor...",
  "profile.name_available": "✓ Uygun",

  "game.top10-standings.name": "Top 10 Standings",
  "game.top10-standings.tagline":
    "1-4 yıllık bir dönemde pilotlar şampiyonasının birikmiş top 10 puanını tahmin edin.",
  "top10standings.eyebrow": "Pilotlar Şampiyonası",
  "top10standings.subtitle": "Dönemin birikmiş top 10 puanı",
  "top10standings.search_placeholder": "Bir pilot adı yazın…",
  "top10standings.found_count": "{{total}} üzerinden {{found}} bulundu",
  "top10standings.not_in_top": "{{name}} birikmiş top 10'da değil.",
  "top10standings.points_label": "{{points}} puan",
  "top10standings.time_up": "Süre doldu. Eksik pozisyonlar yukarıda gösteriliyor.",

  "seo.home.title": "Box Daily Box — Günlük Formula 1 Mini Oyunları | 6 Ücretsiz Bulmaca",
  "seo.home.description":
    "Altı günlük Formula 1 mini oyunu: pilotları tahmin edin, top 10'u tamamlayın, arayı bulan kişiyi bulun ve daha fazlası. Ücretsiz küresel sıralama, kayıt gerekmez.",
  "seo.game.pittexto.title": "PitTexto — Gizli F1 pilotunu tahmin edin | Box Daily Box",
  "seo.game.pittexto.description":
    "Günün gizli Formula 1 pilotunu tahmin edin. Her tahmin ne kadar yakın olduğunuzu gösterir. Her 24 saatte yeni bir meydan okuma.",
  "seo.game.polewordle.title": "PoleWordle — Formula 1'in Wordle'ı | Box Daily Box",
  "seo.game.polewordle.description":
    "Günün F1 pilotunun soyadını, Wordle tarzında, 6 denemede tahmin edin. Yeni ücretsiz günlük bulmaca.",
  "seo.game.el-intruso.title": "El Intruso — Uymayan F1 pilotunu bulun | Box Daily Box",
  "seo.game.el-intruso.description":
    "On F1 pilotundan dokuzu ortak bir şey paylaşıyor. Bu günlük Formula 1 bulmacasında araya karışanı bulun.",
  "seo.game.parrilla-bingo.title": "Parrilla Bingo — F1 takım bingosu | Box Daily Box",
  "seo.game.parrilla-bingo.description":
    "Her hücreyi hem takıma hem de koşula uyan bir pilotla doldurun. Günlük Formula 1 bingosu.",
  "seo.game.gp-resultado.title": "GP Resultado — Bir Grand Prix'nin top 10'unu tahmin edin | Box Daily Box",
  "seo.game.gp-resultado.description":
    "Süre dolmadan önce tarihi bir F1 Grand Prix'sinin top 10'unu tamamlayın. Yeni ücretsiz günlük bulmaca.",
  "seo.game.top10-standings.title": "Top 10 Standings — F1 şampiyona bulmacası | Box Daily Box",
  "seo.game.top10-standings.description":
    "1-4 yıllık bir dönemde F1 pilotlar şampiyonasının birikmiş top 10 puanını tahmin edin.",

  "gamepage.not_found_title": "Oyun bulunamadı",
  "gamepage.not_found_body": "Aradığınız meydan okuma mevcut değil veya taşındı.",
  "gamepage.see_all": "Tüm meydan okumaları gör",

  // ─── Country names (driver nationality flags) ─────────────────────────
  "country.ARG": "Arjantin",
  "country.AUS": "Avustralya",
  "country.AUT": "Avusturya",
  "country.BEL": "Belçika",
  "country.BRA": "Brezilya",
  "country.CAN": "Kanada",
  "country.CHE": "İsviçre",
  "country.CHL": "Şili",
  "country.CHN": "Çin",
  "country.COL": "Kolombiya",
  "country.CZE": "Çekya",
  "country.DEU": "Almanya",
  "country.DNK": "Danimarka",
  "country.ESP": "İspanya",
  "country.FIN": "Finlandiya",
  "country.FRA": "Fransa",
  "country.GBR": "Birleşik Krallık",
  "country.HUN": "Macaristan",
  "country.IDN": "Endonezya",
  "country.IND": "Hindistan",
  "country.IRL": "İrlanda",
  "country.ITA": "İtalya",
  "country.JPN": "Japonya",
  "country.LIE": "Lihtenştayn",
  "country.MAR": "Fas",
  "country.MCO": "Monako",
  "country.MEX": "Meksika",
  "country.MYS": "Malezya",
  "country.NLD": "Hollanda",
  "country.NZL": "Yeni Zelanda",
  "country.POL": "Polonya",
  "country.PRT": "Portekiz",
  "country.RUS": "Rusya",
  "country.SWE": "İsveç",
  "country.THA": "Tayland",
  "country.URY": "Uruguay",
  "country.USA": "Amerika Birleşik Devletleri",
  "country.VEN": "Venezuela",
  "country.ZAF": "Güney Afrika",
  "country.ZWE": "Zimbabve",
};

export default tr;
