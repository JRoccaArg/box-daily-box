// src/content/info/sl.ts
import type { InfoContent } from "./types";

const content: InfoContent = {
  title: "Kako igrati",
  subtitle:
    "Box Daily Box ponuja šest dnevnih mini iger o Formuli 1. Vsaka se igra enkrat na dan, z novim izzivom ob polnoči. Tu razložimo pravila vsake igre, kako se izračuna rezultat, kako deluje lestvica in druge funkcije platforme.",

  gamesHeading: "6 iger",
  gamesIntro:
    "Vse igre uporabljajo resnične podatke Formule 1: dirkače, ekipe, narodnosti in zgodovinske rezultate. Dnevni izziv je enak za vse igralce po svetu.",
  gameDetail: {
    pittexto:
      "Uganiti moraš skrivnega dirkača Formule 1. Vsak poskus ti ponudi postopne namige: narodnost, ekipo, število naslovov in več. Na voljo imaš do 8 poskusov, da ugotoviš, kdo je.",
    polewordle:
      "To je različica Formule 1 klasične igre ugibanja besed. V 6 poskusih moraš uganiti priimek dirkača. Vsaka črka je označena zeleno, rumeno ali sivo, glede na to, ali je na pravem mestu, na drugem mestu ali je sploh ni v priimku.",
    "el-intruso":
      "Prikazanih je deset dirkačev Formule 1. Devet od njih ima nekaj skupnega (skrito pravilo: lahko je ekipa, narodnost, desetletje itd.), eden pa ne ustreza. Tvoja naloga je najti vsiljivca.",
    "parrilla-bingo":
      "Mreža 3x3, kjer vsaka celica združuje ekipo s pogojem (na primer \"svetovni prvak\" ali \"dirkal v 90. letih\"). Vsako celico moraš zapolniti z resničnim dirkačem, ki izpolnjuje oba pogoja hkrati, brez ponavljanja dirkačev.",
    "gp-resultado":
      "Prikazana ti je zgodovinska Velika nagrada in dopolniti moraš prvih 10 te dirke: kateri dirkač je končal na kateri poziciji. Na voljo je samodejno dopolnjevanje za hitrejše iskanje med dirkači.",
    "top10-standings":
      "Podobno kot prejšnja igra, vendar s seštevkom dirkaške razpredelnice sezone (naključno izbrane iz obdobja 1 do 4 let), ne posamezne dirke. Namigi so narodnost vsakega dirkača in točke, ki jih je zbral tisto leto.",
  },

  difficultyHeading: "Stopnje težavnosti",
  difficultyIntro:
    "Vsako igro lahko igraš na 4 stopnjah težavnosti. Težavnost določa, iz katere dobe prihajajo dirkači: težje kot je, dlje nazaj v zgodovino Formule 1 moraš poznati.",

  scoringHeading: "Kako se izračuna rezultat",
  scoringIntro: "Rezultat za vsak zmagani izziv se izračuna takole:",

  rankingHeading: "Lestvica",
  rankingBody: [
    "Obstajata dve javni lestvici: dnevna (današnji rezultati) in mesečna (ponastavi se 1. dan vsakega meseca). Obe prikazujeta vse igralce, ki so sodelovali tisti dan ali mesec, razvrščene po točkah — vključno s tistimi, ki so izgubili vse izzive in se pojavijo na dnu z 0 točkami.",
    "Da je lestvica poštena, se vsak poskus preveri na strežniku (brskalniku igralca se nikoli ne zaupa), in za lestvico šteje samo prvi račun, ki igro igra z iste internetne povezave — to prepreči, da bi kdo uporabljal več računov za zbiranje dodatnih točk.",
    "Lahko igraš brez ustvarjanja računa (anonimno) ali se prijaviš z Googlom. V obeh primerih se na lestvici pojaviš z javnim imenom, ki ga izbereš.",
  ],

  badgesHeading: "Značke",
  badgesBody: [
    "Ob koncu vsakega meseca prva tri mesta mesečne lestvice prejmejo trajno značko: zlato za prvo mesto, srebro za drugo, bron za tretje. Te značke ostanejo za vedno ob tvojem imenu na vseh lestvicah in se kopičijo, če zmagaš v več mesecih.",
    "Če pride do izenačenja na katerem koli mestu, vsi izenačeni prejmejo značko tega mesta.",
  ],

  streakHeading: "Niz",
  streakBody:
    "Niz šteje, koliko zaporednih dni si zmagal vsaj en izziv. Prikazan je z ikono plamena ob tvojem imenu na lestvici od 2 zaporednih dni naprej. Če en dan ne igraš ali izgubiš vse izzive, se niz naslednji dan ponastavi.",

  duelsHeading: "Prijatelji in dvoboji",
  duelsBody: [
    "Prijatelje lahko dodaš s 6-mestno kodo (vsak ima svojo) ali prek povezave. Nekoga lahko izzoveš na dvoboj tudi, preden sta sploh prijatelja, tako da mu pošlješ neposredno povezavo.",
    "Dvoboj je posebna partija proti drugi osebi, s svojim lastnim izzivom (ni dnevni izziv, zato lahko isti dan igraš več dvobojev). Rezultat dvoboja ne vpliva na globalno lestvico ali tvoj niz — služi le za neposredno tekmovanje s komerkoli želiš.",
    "Dvoboj poteka \"na slepo\": nihče od igralcev ne vidi rezultata drugega, dokler oba ne končata igre.",
  ],

  faq: [
    {
      q: "Ali moram ustvariti račun, da lahko igram?",
      a: "Ne. Igraš lahko popolnoma anonimno; tvoj napredek se shrani na tvoji napravi. Če želiš biti na lestvici z več naprav ali nikoli ne izgubiti napredka, se lahko kadarkoli prijaviš z računom Google.",
    },
    {
      q: "Kolikokrat na dan lahko igram vsak izziv?",
      a: "Enkrat na dan na igro. Ob polnoči se za vsako od 6 iger ustvari nov izziv. Dvoboji s prijatelji so izjema: igraš jih lahko kolikorkrat želiš, saj niso dnevni izziv.",
    },
    {
      q: "Kako se izračuna rezultat?",
      a: "Točke dobiš samo, če izziv zmagaš. Osnovni rezultat je odvisen od izbrane težavnosti, poleg tega dobiš bonus za hitro reševanje. Izguba ali opustitev izziva vedno prinese 0 točk.",
    },
    {
      q: "Kaj se zgodi, če izgubim izziv?",
      a: "Kljub temu se pojaviš na dnevni lestvici, z 0 točkami, skupaj z drugimi igralci. Izguba te ne izključi z lestvice — le ne doda točk.",
    },
    {
      q: "Kako se preprečuje goljufanje?",
      a: "Strežnik ustvari izziv, meri čas in neodvisno preveri vsak odgovor. Brskalnik igralca nikoli ne odloča, ali je zmagal ali koliko točk je dosegel. Poleg tega za lestvico šteje samo prvi račun, ki igro igra z iste povezave.",
    },
    {
      q: "Ali je Box Daily Box povezan s Formulo 1?",
      a: "Ne. Gre za projekt, ki so ga ustvarili oboževalci, brez uradne povezave s Formula One Group, FIA ali katero koli ekipo ali dirkačem.",
    },
  ],
};

export default content;
