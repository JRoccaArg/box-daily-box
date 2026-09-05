// src/content/legal/en.ts
//
// ENGLISH version of the legal documents. Offered for convenience; the binding
// version is the Spanish one (the operator is based in Argentina and the
// documents are governed by Argentine law). See the "Language" clause.

import type { LegalContent } from "./types";

const LAST_UPDATED = "2026-08-15";
// Privacy Policy has its own date: bumped when analytics (Vercel + Google
// Analytics) and the consent banner were introduced, without touching the
// Terms date, which did not change.
const PRIVACY_UPDATED = "2026-09-04";
const CONTACT_EMAIL = "boxdailybox@gmail.com";
const OPERATOR = "Juan Cruz Rocca";

const content: LegalContent = {
  terms: {
    title: "Terms and Conditions",
    lastUpdated: LAST_UPDATED,
    intro: [
      `Box Daily Box ("the Service", "the site") is a personal project operated by ${OPERATOR}, based in Argentina. By accessing or using the Service, you agree to these Terms and Conditions. If you do not agree, please do not use the site.`,
    ],
    sections: [
      {
        heading: "1. What Box Daily Box is",
        blocks: [
          {
            p: "Box Daily Box is a free platform of daily Formula 1 minigames. A new challenge is published each day for each game. The Service is a fan-made project intended for entertainment.",
          },
          {
            p: "The Service is NOT affiliated with, associated with, authorized by, or endorsed in any way by the Formula One Group, the FIA, or any official Formula 1 team, driver, or organization. All trademarks mentioned belong to their respective owners.",
          },
        ],
      },
      {
        heading: "2. Minimum age",
        blocks: [
          {
            p: "You must be at least 13 years old to use the Service. If your local law requires a higher age to consent to the processing of personal data without authorization from a responsible adult, you must have such authorization. The Service is not directed to children under 13.",
          },
        ],
      },
      {
        heading: "3. Your identity and account",
        blocks: [
          {
            p: "You may play anonymously (without creating an account) or sign in with your Google account. In either case, you are responsible for your use of the Service under your identity and for the public name you choose.",
          },
          {
            p: "The name you choose is visible to other users in the public rankings. You must not use names that are offensive, unlawful, that impersonate others, or that infringe the rights of others.",
          },
        ],
      },
      {
        heading: "4. Acceptable use",
        blocks: [
          { p: "When using the Service, you agree NOT to:" },
          {
            list: [
              "Cheat, manipulate results, or attempt to inflate your score or ranking by means not intended by the game.",
              "Use bots, scripts, automation, or reverse engineering to interact with the Service or its API.",
              "Create multiple accounts to circumvent ranking limits or the anti-cheat system.",
              "Interfere with the operation of the Service, overload it, or attempt to access other users' data.",
              "Use offensive, discriminatory, or unlawful names or content.",
            ],
          },
          {
            p: "The operator may exclude attempts from the ranking, restrict or suspend access, or delete accounts that violate these Terms, without prior notice where necessary to protect the integrity of the Service.",
          },
        ],
      },
      {
        heading: "5. Intellectual property",
        blocks: [
          {
            p: "The code, design, original text, and visual identity of the Service belong to its operator. The names, trademarks, and logos of Formula 1, the FIA, teams, and drivers belong to their respective owners and are used solely for informational and reference purposes in a fan context.",
          },
          {
            p: "The sporting data used (historical results, driver names, teams, nationalities) are facts in the public domain.",
          },
        ],
      },
      {
        heading: "6. AI-generated or AI-assisted content",
        blocks: [
          {
            p: "Parts of the code, interface text, and some visual elements of the Service were generated or assisted by artificial intelligence tools, and reviewed by the operator before publication.",
          },
          {
            p: "The historical Formula 1 data used (results, teams, drivers, nationalities) comes from public sources and open datasets. We try to keep it accurate, but it may contain errors, inaccuracies, or omissions.",
          },
        ],
      },
      {
        heading: "7. Voluntary support",
        blocks: [
          {
            p: "The Service is and will remain free in its current form (see also Section 10, \"Changes to the Service and these Terms\"). If you want, you can support its development with a voluntary contribution through third-party platforms: Cafecito (for Argentina) and Ko-fi (international).",
          },
          {
            p: "That contribution is a donation, not a purchase: it does not create a consumer relationship regarding the Service, does not grant access to exclusive content, gameplay advantages, preferential ranking, or any other benefit within the Service, and is not refundable by the operator.",
          },
          {
            p: "The charge is processed entirely by the platform you choose (Cafecito or Ko-fi), under its own terms and privacy policy. The operator does not receive, store, or process any payment data: clicking the support button takes you off the Service to that platform's site.",
          },
        ],
      },
      {
        heading: "8. Service \"as is\"",
        blocks: [
          {
            p: "The Service is provided \"as is\" and \"as available\", without warranties of any kind. We do not guarantee that the Service will be error-free, continuously available, or that the sporting data is accurate. We may modify, suspend, or discontinue the Service (in whole or in part) at any time.",
          },
        ],
      },
      {
        heading: "9. Limitation of liability",
        blocks: [
          {
            p: "To the maximum extent permitted by applicable law, the operator shall not be liable for indirect, incidental, or consequential damages arising from the use of, or inability to use, the Service. Nothing in these Terms limits rights that the law grants you as a consumer on a non-waivable basis.",
          },
        ],
      },
      {
        heading: "10. Changes to the Service and these Terms",
        blocks: [
          {
            p: "We may update these Terms to reflect changes in the Service or in the law. The current version will always be available on this page, with its last-updated date.",
          },
          {
            p: "The current free mode of the Service — one attempt per game per day, with no need to sign up or pay — will keep being available at no cost and without needing to watch any ad to play.",
          },
          {
            p: "In the future we might introduce advertising (for example, side banners that don't interrupt gameplay and don't require closing them or waiting to keep playing) and/or an optional paid membership with extra benefits (for example, extra attempts). None of those eventual additions will replace or condition the free mode described in the paragraph above.",
          },
          {
            p: "If advertising, paid features, or another form of monetization is introduced, these Terms and the Privacy Policy will be updated accordingly, and you will be informed and asked for your consent where the law so requires.",
          },
        ],
      },
      {
        heading: "11. Governing law and jurisdiction",
        blocks: [
          {
            p: "These Terms are governed by the laws of Argentina. Any dispute shall be submitted to the competent courts of Argentina, without prejudice to the rights granted to you by the mandatory consumer protection rules of your country of residence, including the possibility of bringing proceedings before the courts of your domicile where the law so allows.",
          },
        ],
      },
      {
        heading: "12. Contact",
        blocks: [
          { p: "For questions about these Terms, you can write to:" },
          { email: CONTACT_EMAIL },
        ],
      },
      {
        heading: "13. Language",
        blocks: [
          {
            p: "The Spanish version of this document is the binding version. Translations into other languages are provided for convenience only and, in case of any discrepancy, the Spanish version prevails.",
          },
        ],
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    lastUpdated: PRIVACY_UPDATED,
    intro: [
      `This Privacy Policy explains what personal data Box Daily Box processes, for what purpose, and on what legal basis. The data controller is ${OPERATOR}, based in Argentina. You can contact him at ${CONTACT_EMAIL}.`,
    ],
    sections: [
      {
        heading: "1. What data we collect",
        blocks: [
          { p: "If you play anonymously (without signing in), we process:" },
          {
            list: [
              "A random identifier generated by your device to recognize you across sessions (stored in the browser's local storage, a technical cookie, and session storage).",
              "Your game results: what you played, whether you won or lost, score, time, and difficulty.",
              "The country you choose to display (optional) and the public name you choose.",
              "Your IP address, used to prevent the use of multiple accounts from the same source (ranking anti-cheat).",
            ],
          },
          { p: "If you sign in with Google, we additionally process:" },
          {
            list: [
              "Your name, email address, profile picture, and Google identifier, provided by Google when you authenticate.",
            ],
          },
          {
            p: "If you use the friends and duels features, we store the relationships you create yourself (who you add as a friend or challenge). If you have friends added, we also store the last time you had the Service open, so we can show you and your friends who is online at that moment. That information is shown only as \"online\" or \"offline\": the exact time and a connection history are never shown.",
          },
          {
            p: "To understand how the site is used and improve it, we use web analytics tools (see section 3). Through them we process: the pages you visit, game events (which game you start, complete, or abandon, at what difficulty and with what result), your device and browser type, and an approximate geographic location derived from your IP address: country or region in the case of Vercel Web Analytics, and down to city level in the case of Google Analytics. In no case is this your exact location or GPS data. Vercel Web Analytics works in aggregate and without cookies, without identifying you as an individual. Google Analytics uses cookies and is only activated if you have given your consent.",
          },
          {
            p: "We neither request nor store your password: authentication is performed by Google. We also do not process special categories of sensitive data.",
          },
        ],
      },
      {
        heading: "2. How we use the data and legal basis",
        blocks: [
          {
            list: [
              "To make the game work and preserve your progress across sessions and devices (performance of the service you request).",
              "To calculate and display rankings and to prevent cheating and abusive use of multiple accounts (legitimate interest in maintaining a fair ranking; the IP is used solely for this purpose).",
              "To link your progress to your account if you sign in with Google (based on your consent when choosing to sign in).",
              "To show you and your friends who has the Service open right now (performance of the friends feature you activate).",
              "To analyze in aggregate how the site is used and improve it. Vercel's cookieless analytics relies on our legitimate interest in maintaining and improving the Service, without identifying you. Google Analytics, which does use cookies, relies solely on your consent and is not activated until you grant it.",
            ],
          },
          {
            p: "We do not use your data for advertising or to make automated decisions with legal effects on you.",
          },
        ],
      },
      {
        heading: "3. Cookies and local storage",
        blocks: [
          {
            p: "The Service uses technical and necessary storage in your browser to remember your identity, your language, and your progress. We use two technical cookies: bdb_uid (your player identifier) and bdb_tok (the signed credential proving that identity is yours, so nobody else can play or change data on your behalf), plus the browser's local and session storage. This storage is essential for the game to work and for its security, so it does not require your consent.",
          },
          {
            p: "In addition, we use two web analytics tools to understand how the site is used:",
          },
          {
            list: [
              "Vercel Web Analytics: measures in aggregate and anonymously (visits, country, device). It does not use cookies or identify you as an individual, so it runs at all times, without requiring your consent.",
              "Google Analytics: measures usage in more detail and DOES use cookies. That is why it is only activated if you accept cookies in the banner shown the first time you visit. If you reject or ignore it, Google Analytics is neither loaded nor stores any cookie.",
            ],
          },
          {
            p: "You can change your choice at any time from the \"Manage cookies\" link in the footer. We do NOT use advertising cookies. If advertising is introduced in the future, your consent will be requested where the law requires it.",
          },
        ],
      },
      {
        heading: "4. Who we share data with",
        blocks: [
          {
            p: "We do not sell your personal data. We share data only with infrastructure providers that process it on our behalf to operate the Service:",
          },
          {
            list: [
              "Google (authentication via Google OAuth), if you choose to sign in.",
              "Google (Google Analytics, to analyze site usage), only if you accept the analytics cookies.",
              "Railway (server and database hosting).",
              "Vercel (website hosting and its cookieless web analytics).",
            ],
          },
          {
            p: "Some of these providers may process data on servers located outside Argentina or the European Economic Area. In such cases, the transfer relies on the safeguards and legal mechanisms offered by those providers.",
          },
          {
            p: "If you click the voluntary support button, you leave the Service for Cafecito or Ko-fi, whichever you choose. They are independent controllers of the data they process on their own site; the operator does not send them any of your data — it is simply a link to their page.",
          },
        ],
      },
      {
        heading: "5. How long we keep the data",
        blocks: [
          {
            p: "We keep your data for as long as your identity or account remains active and it is necessary to provide the Service (match history, scores, achievements and streak, which are the basis of the game and the rankings).",
          },
          {
            p: "Your IP address is kept alongside each attempt for a maximum of 12 months, after which it is deleted or anonymised. It is used solely to prevent abusive use of multiple accounts.",
          },
          {
            p: "You can delete your account and all your data yourself, at any time, from \"Your profile\" in the app. Deletion is immediate and permanent: your match history, achievements, badges, friendships and duels are removed. You may also ask us by email if you prefer.",
          },
        ],
      },
      {
        heading: "6. Your rights",
        blocks: [
          {
            p: "Under applicable law (Argentina's Personal Data Protection Act No. 25.326 and, if you are located in the European Union, the General Data Protection Regulation), you have the right to:",
          },
          {
            list: [
              "Access the personal data we process about you.",
              "Rectify inaccurate or incomplete data.",
              "Request the erasure (deletion) of your data.",
              "Request the portability of your data.",
              "Object to or restrict certain processing.",
            ],
          },
          {
            p: "You can exercise the right to erasure yourself, without waiting for anyone: go to \"Your profile\" in the app and use \"Delete my account\". For the other rights, or if you would rather we handled it, write to us at:",
          },
          { email: CONTACT_EMAIL },
          {
            p: "You may also lodge a complaint with the competent supervisory authority. In Argentina, the Agency for Access to Public Information (AAIP). In the European Union, the data protection authority of your country.",
          },
        ],
      },
      {
        heading: "7. Children",
        blocks: [
          {
            p: "The Service is not directed to children under 13 and we do not knowingly collect data from children under that age. If you believe a child under 13 has provided us with personal data, contact us so we can delete it.",
          },
        ],
      },
      {
        heading: "8. Security",
        blocks: [
          {
            p: "We apply reasonable technical measures to protect data, including server-side verification and cryptographic signing of game sessions. No system is completely secure, but we work to protect your information.",
          },
        ],
      },
      {
        heading: "9. Changes to this Policy",
        blocks: [
          {
            p: "We may update this Policy to reflect changes in the Service or in the law. In particular, if advertising or paid features are introduced in the future, this Policy will be updated to describe that processing, and your consent will be requested where applicable. The current version will always be on this page, with its last-updated date.",
          },
        ],
      },
      {
        heading: "10. Language",
        blocks: [
          {
            p: "The Spanish version of this document is the binding version. Translations into other languages are provided for convenience only and, in case of any discrepancy, the Spanish version prevails.",
          },
        ],
      },
    ],
  },
};

export default content;
