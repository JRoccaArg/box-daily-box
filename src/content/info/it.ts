// src/content/info/it.ts
import type { InfoContent } from "./types";

const content: InfoContent = {
  title: "Come si gioca",
  subtitle:
    "Box Daily Box ha sei minigiochi giornalieri di Formula 1. Ognuno si gioca una volta al giorno, con una nuova sfida a mezzanotte. Qui trovi le regole di ogni gioco, come si calcola il punteggio, come funziona la classifica e le altre funzioni della piattaforma.",
  dataAsOfNote: "I dati di piloti, scuderie e risultati usati nei giochi arrivano fino alla stagione 2025.",

  gamesHeading: "I 6 giochi",
  gamesIntro:
    "Tutti i giochi usano dati reali della Formula 1: piloti, scuderie, nazionalità e risultati storici. La sfida del giorno è la stessa per tutti i giocatori del mondo.",
  gameDetail: {
    pittexto:
      "Devi indovinare un pilota segreto di Formula 1. Ogni tentativo ti dà indizi progressivi: nazionalità, scuderia, numero di titoli mondiali e altro. Hai fino a 8 tentativi per scoprire chi è.",
    polewordle:
      "È la versione Formula 1 del classico gioco di indovinare parole. Devi scoprire il cognome di un pilota in 6 tentativi. Ogni lettera viene segnata in verde, giallo o grigio a seconda che sia nella posizione giusta, in un'altra posizione, o non presente nel cognome.",
    "el-intruso":
      "Vengono mostrati dieci piloti di Formula 1. Nove di loro hanno qualcosa in comune (una regola nascosta: può essere la scuderia, la nazionalità, un decennio, ecc.) e uno non c'entra. Il tuo compito è trovare l'intruso.",
    "parrilla-bingo":
      "Una griglia 3x3 dove ogni cella incrocia una scuderia con una condizione (ad esempio, \"campione del mondo\" o \"ha corso negli anni '90\"). Devi completare ogni cella con un pilota reale che soddisfi entrambe le condizioni insieme, senza ripetere piloti.",
    "gp-resultado":
      "Ti viene mostrato un Gran Premio storico e devi completare la top 10 di quella gara: quale pilota ha concluso in ogni posizione. Ha l'autocompletamento per cercare più velocemente tra i piloti.",
    "top10-standings":
      "Simile al precedente, ma con la classifica piloti accumulata di una stagione (scelta a caso in un periodo da 1 a 4 anni), non di una singola gara. Gli indizi sono la nazionalità di ogni pilota e i punti totalizzati quell'anno.",
  },

  difficultyHeading: "Livelli di difficoltà",
  difficultyIntro:
    "Ogni gioco si può giocare con 4 livelli di difficoltà. La difficoltà definisce da quale epoca provengono i piloti: più è difficile, più indietro nella storia della Formula 1 bisogna conoscere.",

  scoringHeading: "Come si calcola il punteggio",
  scoringIntro: "Il punteggio di ogni sfida vinta si calcola così:",

  rankingHeading: "La classifica",
  rankingBody: [
    "Ci sono due classifiche pubbliche: una giornaliera (i risultati di oggi) e una mensile (si azzera il 1° di ogni mese). Entrambe mostrano tutti i giocatori che hanno partecipato quel giorno o quel mese, ordinati per punti — inclusi quelli che hanno perso tutte le sfide, che appaiono in fondo con 0 punti.",
    "Per rendere la classifica equa, ogni tentativo viene verificato sul server (non ci si fida mai di ciò che dice il browser del giocatore), e solo il primo account che gioca un gioco dalla stessa connessione internet conta per la classifica — questo evita che qualcuno usi più account per accumulare più punti.",
    "Puoi giocare senza creare un account (in modo anonimo) o accedere con Google. In entrambi i casi appari in classifica con il nome pubblico che scegli.",
  ],

  badgesHeading: "Badge",
  badgesBody: [
    "Alla fine di ogni mese, i primi tre posti della classifica mensile ricevono un badge permanente: oro per il primo posto, argento per il secondo, bronzo per il terzo. Questi badge restano per sempre accanto al tuo nome in tutte le classifiche, e si accumulano se vinci più mesi.",
    "In caso di parità in una posizione, tutti quelli in parità ricevono il badge di quella posizione.",
  ],

  streakHeading: "Striscia",
  streakBody:
    "La striscia conta quanti giorni consecutivi hai vinto almeno una sfida. Viene mostrata con un'icona a forma di fiamma accanto al tuo nome in classifica a partire da 2 giorni consecutivi. Se salti un giorno o perdi tutte le sfide, la striscia si azzera il giorno dopo.",

  duelsHeading: "Amici e sfide dirette",
  duelsBody: [
    "Puoi aggiungere amici con un codice di 6 caratteri (ognuno ha il proprio) o tramite link. Puoi anche sfidare qualcuno a una sfida diretta prima ancora di essere amici, inviandogli un link diretto.",
    "Una sfida diretta è una partita speciale contro un'altra persona, con una sua sfida propria (non è la sfida giornaliera, quindi puoi giocarne diverse lo stesso giorno). Il risultato di una sfida diretta non influisce sulla classifica globale né sulla tua striscia: serve solo per competere faccia a faccia con chi vuoi.",
    "La sfida diretta è \"alla cieca\": nessuno dei due vede il risultato dell'altro finché entrambi non hanno finito di giocare.",
  ],

  faq: [
    {
      q: "Devo creare un account per giocare?",
      a: "No. Puoi giocare in modo completamente anonimo; i tuoi progressi vengono salvati sul tuo dispositivo. Se vuoi apparire in classifica da più dispositivi o non perdere mai i tuoi progressi, puoi accedere con il tuo account Google in qualsiasi momento.",
    },
    {
      q: "Quante volte al giorno posso giocare ogni sfida?",
      a: "Una volta al giorno per gioco. A mezzanotte viene generata una nuova sfida per ciascuno dei 6 giochi. Le sfide dirette con gli amici sono un'eccezione: puoi giocarle quante volte vuoi, dato che non sono la sfida giornaliera.",
    },
    {
      q: "Come si calcola il punteggio?",
      a: "Guadagni punti solo se vinci la sfida. Il punteggio base dipende dalla difficoltà scelta, con un bonus per la velocità di risoluzione. Perdere o abbandonare una sfida dà sempre 0 punti.",
    },
    {
      q: "Cosa succede se perdo una sfida?",
      a: "Appari comunque nella classifica del giorno, con 0 punti, insieme agli altri giocatori. Perdere non ti esclude dalla classifica: semplicemente non aggiunge punti.",
    },
    {
      q: "Come si evitano i trucchi?",
      a: "Il server genera la sfida, misura il tempo e verifica ogni risposta in modo indipendente. Il browser del giocatore non decide mai se ha vinto né quanti punti ha fatto. Inoltre, solo il primo account che gioca un gioco dalla stessa connessione conta per la classifica.",
    },
    {
      q: "Box Daily Box è affiliato alla Formula 1?",
      a: "No. È un progetto realizzato da fan, senza affiliazione ufficiale con il Formula One Group, la FIA, o qualsiasi scuderia o pilota.",
    },
  ],
};

export default content;
