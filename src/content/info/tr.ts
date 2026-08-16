// src/content/info/tr.ts
import type { InfoContent } from "./types";

const content: InfoContent = {
  title: "Nasıl oynanır",
  subtitle:
    "Box Daily Box'ta altı günlük Formula 1 mini oyunu var. Her biri günde bir kez, gece yarısı yenilenen bir meydan okumayla oynanır. Burada her oyunun kurallarını, puanların nasıl hesaplandığını, sıralamanın nasıl çalıştığını ve platformun diğer özelliklerini anlatıyoruz.",
  dataAsOfNote: "Oyunlarda kullanılan pilot, takım ve sonuç verileri 2025 sezonuna kadar günceldir.",

  gamesHeading: "6 oyun",
  gamesIntro:
    "Tüm oyunlar gerçek Formula 1 verilerini kullanır: pilotlar, takımlar, uyruklar ve tarihi sonuçlar. Günün meydan okuması dünyadaki tüm oyuncular için aynıdır.",
  gameDetail: {
    pittexto:
      "Gizli bir Formula 1 pilotunu tahmin etmen gerekiyor. Her denemende sana kademeli ipuçları verilir: uyruk, takım, şampiyonluk sayısı ve daha fazlası. Kim olduğunu bulmak için en fazla 8 deneme hakkın var.",
    polewordle:
      "Klasik kelime tahmin oyununun Formula 1 versiyonu. 6 denemede bir pilotun soyadını bulman gerekiyor. Her harf, doğru yerde, başka bir yerde ya da soyadında hiç olmamasına göre yeşil, sarı veya gri renkte işaretlenir.",
    "el-intruso":
      "On Formula 1 pilotu gösterilir. Bunlardan dokuzunun ortak bir yanı vardır (gizli bir kural: takım, uyruk, bir on yıl gibi olabilir) ve biri uymaz. Görevin, davetsiz misafiri bulmaktır.",
    "parrilla-bingo":
      "Her hücrenin bir takımı bir koşulla kesiştirdiği 3x3'lük bir tablo (örneğin \"dünya şampiyonu\" veya \"90'larda yarıştı\"). Her hücreyi, her iki koşulu da aynı anda karşılayan gerçek bir pilotla doldurman gerekiyor, pilot tekrarlamadan.",
    "gp-resultado":
      "Sana tarihi bir Grand Prix gösterilir ve o yarışın ilk 10'unu tamamlaman gerekir: hangi pilotun hangi sırada bitirdiği. Pilotlar arasında daha hızlı arama yapmak için otomatik tamamlama vardır.",
    "top10-standings":
      "Öncekine benzer, ancak tek bir yarış yerine bir sezonun (1 ila 4 yıllık bir dönemden rastgele seçilen) birikimli pilot şampiyonasıyla ilgilidir. İpuçları, her pilotun uyruğu ve o yıl topladığı puanlardır.",
  },

  difficultyHeading: "Zorluk seviyeleri",
  difficultyIntro:
    "Her oyun 4 zorluk seviyesinde oynanabilir. Zorluk, pilotların hangi dönemden geldiğini belirler: ne kadar zor olursa, Formula 1 tarihinde o kadar geriye gitmek gerekir.",

  scoringHeading: "Puanlar nasıl hesaplanır",
  scoringIntro: "Kazanılan her meydan okuma için puan şöyle hesaplanır:",

  rankingHeading: "Sıralama",
  rankingBody: [
    "İki genel sıralama vardır: günlük (bugünün sonuçları) ve aylık (her ayın 1'inde sıfırlanır). İkisi de o gün veya o ay katılan tüm oyuncuları, puanlarına göre sıralanmış şekilde gösterir — tüm meydan okumalarını kaybedenler de dahil, onlar da listenin sonunda 0 puanla görünür.",
    "Sıralamanın adil olması için her deneme sunucuda doğrulanır (oyuncunun tarayıcısına asla güvenilmez) ve aynı internet bağlantısından bir oyunu oynayan yalnızca ilk hesap sıralamaya sayılır — bu, birinin ekstra puan biriktirmek için birden fazla hesap kullanmasını engeller.",
    "Hesap oluşturmadan (anonim olarak) oynayabilir ya da Google ile giriş yapabilirsin. Her iki durumda da sıralamada seçtiğin herkese açık isimle görünürsün.",
  ],

  badgesHeading: "Rozetler",
  badgesBody: [
    "Her ayın sonunda, aylık sıralamada ilk üç sıra kalıcı bir rozet kazanır: birincilik için altın, ikincilik için gümüş, üçüncülük için bronz. Bu rozetler tüm sıralamalarda adının yanında sonsuza dek kalır ve birden fazla ay kazanırsan birikir.",
    "Bir sırada eşitlik olursa, o sırada eşit olan herkes o sıranın rozetini alır.",
  ],

  streakHeading: "Seri",
  streakBody:
    "Seri, üst üste kaç gün en az bir meydan okuma kazandığını sayar. Sıralamada, üst üste 2 günden itibaren adının yanında bir alev simgesiyle gösterilir. Bir gün oynamazsan veya tüm meydan okumaları kaybedersen, seri ertesi gün sıfırlanır.",

  duelsHeading: "Arkadaşlar ve düellolar",
  duelsBody: [
    "6 karakterlik bir kodla (herkesin kendi kodu vardır) veya bir bağlantı yoluyla arkadaş ekleyebilirsin. Henüz arkadaş olmadan bile, doğrudan bir bağlantı göndererek birini düelloya davet edebilirsin.",
    "Düello, kendi meydan okumasına sahip başka bir kişiye karşı özel bir maçtır (günlük meydan okuma değildir, bu yüzden aynı gün birden fazla düello oynayabilirsin). Bir düellonun sonucu ne genel sıralamayı ne de serini etkiler — sadece istediğin kişiyle birebir yarışmak içindir.",
    "Düello \"kör\" oynanır: her iki oyuncu da bitirene kadar diğerinin sonucunu göremez.",
  ],

  faq: [
    {
      q: "Oynamak için hesap oluşturmam gerekiyor mu?",
      a: "Hayır. Tamamen anonim olarak oynayabilirsin; ilerlemen cihazında saklanır. Birden fazla cihazdan sıralamada görünmek veya ilerlemeni asla kaybetmemek istersen, istediğin zaman Google hesabınla giriş yapabilirsin.",
    },
    {
      q: "Her meydan okumayı günde kaç kez oynayabilirim?",
      a: "Oyun başına günde bir kez. Gece yarısı, 6 oyunun her biri için yeni bir meydan okuma oluşturulur. Arkadaşlarla düellolar istisnadır: günlük meydan okuma olmadıkları için istediğin kadar oynayabilirsin.",
    },
    {
      q: "Puan nasıl hesaplanır?",
      a: "Sadece meydan okumayı kazanırsan puan alırsın. Temel puan seçilen zorluğa bağlıdır, buna hızlı çözme bonusu eklenir. Bir meydan okumayı kaybetmek veya vazgeçmek her zaman 0 puan verir.",
    },
    {
      q: "Bir meydan okumayı kaybedersem ne olur?",
      a: "Yine de 0 puanla, o günün sıralamasında diğer oyuncularla birlikte görünürsün. Kaybetmek seni sıralamadan engellemez — sadece puan eklemez.",
    },
    {
      q: "Hile nasıl önlenir?",
      a: "Sunucu meydan okumayı oluşturur, süreyi ölçer ve her cevabı bağımsız olarak doğrular. Oyuncunun tarayıcısı asla kazanıp kazanmadığına veya kaç puan yaptığına karar vermez. Ayrıca, aynı bağlantıdan bir oyunu oynayan yalnızca ilk hesap sıralamaya sayılır.",
    },
    {
      q: "Box Daily Box, Formula 1 ile bağlantılı mı?",
      a: "Hayır. Formula One Group, FIA veya herhangi bir takım ya da pilotla resmi bir bağlantısı olmayan, hayranlar tarafından yapılmış bir projedir.",
    },
  ],
};

export default content;
