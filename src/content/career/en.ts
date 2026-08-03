// src/content/career/en.ts
//
// Career Mode narrative content in ENGLISH. Also the fallback for the 12
// languages that are not translated yet (see ./index.ts), same approach as
// the legal pages.
//
// Odds are NEVER shown to the player: the hints live in the prose.

import type { CareerContent } from "./types";

const content: CareerContent = {
  events: {
    // ─── On track and with your team mate ─────────────────────────
    "team-order-hold": {
      title: "Team orders",
      story:
        "You are running second, right behind your team mate, and you have the pace to pass. The pit wall comes on the radio, flat and final: hold position. The team will not risk a one-two over an internal fight.",
      options: {
        obey: "Obey and stay behind",
        ignore: "Ignore the call and attack",
      },
      outcomes: {
        respect:
          "You cross the line second, biting your tongue. The garage greets you with an embrace: teams remember the drivers who swallow an ugly order.",
        bitter:
          "You finish second and greet nobody. That night you lie awake replaying the lap you never got to do, and the resentment lingers for races.",
        win: "You go around the outside at the last chicane. The pit wall goes silent, the grandstand stands up. You won, and everyone saw how.",
        punished:
          "You go for it, you touch, and you both lose places. The team boss does not shout, which is worse. You know you will pay for this.",
      },
    },
    "teammate-clash": {
      title: "Contact with your team mate",
      story:
        "Turn 3, you both go in side by side and neither of you lifts. Race over for the pair of you. Nobody looks at anybody in the garage, and the press is already outside waiting for whoever talks first.",
      options: {
        apologise: "Front up and apologise",
        blame: "Blame him publicly",
      },
      outcomes: {
        peace:
          "You take the first step and lower the temperature. Nobody really wins, but the garage breathes again and the team notes who chose the greater good.",
        weak: "You apologise and get nothing back. You look like the one who blinked, and they make sure you feel it.",
        backed:
          "You get to the microphones first with your version. The data backs you up and for a while you are the one who said the uncomfortable truth.",
        isolated:
          "You say it with anger and it sounds like an excuse. The telemetry later says otherwise. The garage cools, and some doors quietly close.",
      },
    },
    "last-lap-gamble": {
      title: "Last lap",
      story:
        "Final lap, less than a second behind the car ahead. There is one real chance and it is at the hardest braking zone on the circuit. If it works, it is a podium. If not, you are the one in the gravel.",
      options: {
        attack: "Throw it up the inside",
        settle: "Settle for the position",
      },
      outcomes: {
        hero: "You brake later than common sense allows and it sticks. The move is on every screen in the world that night.",
        crash:
          "You lock the inside front and run wide. From nothing, zero points. Sunday night's replay is painful.",
        safe: "You bring it home where you were. Nothing memorable, but it scores, and scoring is a craft too.",
        regret:
          "You back out and in the moment it feels wise. Later, watching it back, you can see the gap that was there and you did not take.",
      },
    },
    "defend-hard": {
      title: "Defending the indefensible",
      story:
        "Your car has nothing left but you are holding on to a point the team badly needs. Behind you is a car half a second a lap quicker, with every intention of settling this quickly.",
      options: {
        defend: "Defend on the limit",
        yield: "Let him by and save the car",
      },
      outcomes: {
        held: "Lap after lap you shut the door at exactly the right moment. You take the flag without conceding, and the garage erupts over a single point.",
        contact:
          "You close the door once too often, you touch, and the stewards take a look. Out of the points, and a reputation for racing dirty.",
        clean:
          "You leave him room and save the car. No glory, but you reach the end in one piece and the team has something to work with.",
      },
    },
    "teammate-data": {
      title: "The telemetry",
      story:
        "Your team mate has found something in your fastest lap and wants to see your data. In a team, everything is shared. In practice, everyone guards their edge.",
      options: {
        share: "Share everything",
        refuse: "Keep your own work",
      },
      outcomes: {
        mutual:
          "You open your data and he opens his. Both of you find tenths where you were not even looking: the whole team takes a step forward.",
        used: "You share and he improves. You get nothing back, and you are left feeling you gave away your only advantage.",
        edge: "You keep your secret and stay the quicker of the two. The other side of the garage no longer talks to you the same way.",
        frozen:
          "The team hears you are not collaborating and answers in kind: the information flowing to your side starts arriving late.",
      },
    },
    "backmarker-traffic": {
      title: "Backmarker traffic",
      story:
        "Three laps to go and you have to lap two cars busy fighting each other who have not seen you. The car behind is a second back and coming faster.",
      options: {
        dive: "Split the pair of them",
        wait: "Wait for a safe stretch",
      },
      outcomes: {
        clear:
          "You take a gap that lasted a blink and come out clean. The margin behind holds and you make it home.",
        tangle:
          "One of them closes without seeing you. Contact, broken wing, and a race thrown away chasing two seconds.",
        "lost-time":
          "You wait for the long straight and clear them without risk. A handful of tenths gone, but you reach the flag without drama.",
      },
    },

    // ─── Technical and development ────────────────────────────────
    "dev-direction": {
      title: "Where the development goes",
      story:
        "Technical meeting: there is budget for one development path only. You can push for parts now, or argue that everything goes into next year's car.",
      options: {
        now: "Upgrades for this season",
        "next-year": "Bet everything on next year's car",
      },
      outcomes: {
        gain: "The parts arrive mid-season and the car wakes up. Not a revolution, but you feel it every lap.",
        flat: "The upgrades arrive and the stopwatch barely moves. At least nothing got worse.",
        payoff:
          "You suffer the rest of the year in a car that has aged, but over the winter the factory produces something serious. The wait was worth it.",
        wasted:
          "You sacrifice the season for a project that then does not work. The worst of both worlds.",
      },
    },
    "risky-upgrade": {
      title: "The risky upgrade",
      story:
        "Aero have produced a new package that flies in the tunnel but has barely run on track. The chief engineer is enthusiastic; yours quietly warns the car could become unpredictable.",
      options: {
        "take-it": "Fit it now",
        stay: "Stick with what you know",
      },
      outcomes: {
        breakthrough:
          "It works even better than the numbers promised. Suddenly you are racing where you could not reach a month ago.",
        unstable:
          "On track the car becomes a lottery: quick through one corner, terrifying in the next. It takes races to unwind.",
        steady:
          "You keep the old package. Nothing new, but you know exactly what is underneath you every Sunday.",
      },
    },
    "setup-gamble": {
      title: "Setup on the edge",
      story:
        "Rain is possible this weekend. You can build the car around an extreme setup aimed at one perfect qualifying lap, or leave it in a stable window that copes with anything.",
      options: {
        extreme: "Extreme setup",
        safe: "Conservative setup",
      },
      outcomes: {
        flying:
          "In qualifying the car flies and you surprise yourself. You found a window nobody else saw.",
        undrivable:
          "The car will not be driven. You fight the wheel all weekend and never find the rhythm.",
        predictable:
          "Nothing spectacular, but the car does the same thing lap after lap. You can work with that.",
      },
    },
    "engine-mode": {
      title: "Engine mode",
      story:
        "Fifteen laps to go with a rival on your tail. There is a more aggressive engine map available. Your engineer reminds you the unit already has plenty of mileage.",
      options: {
        push: "Turn it up and hold him off",
        save: "Look after the unit",
      },
      outcomes: {
        "held-on":
          "You turn it up, absorb the attack, and the engine makes it. You finish with a dry mouth and the position in your pocket.",
        "blew-up":
          "Four laps from the end there is smoke in your mirrors. Retirement, and one unit fewer for the rest of the year.",
        conserved:
          "You back off and protect the engine. You lose the place, but the team keeps a healthy unit for the races to come.",
      },
    },
    "wind-tunnel": {
      title: "Tunnel hours",
      story:
        "The regulations cap how many wind tunnel hours the team can use. Someone has to decide whether they go into understanding today's car or into next year's concept.",
      options: {
        "long-term": "Invest them in the future car",
        "short-term": "Use them to fix what you have",
      },
      outcomes: {
        strong:
          "The new concept looks solid from the first day of testing. The sacrifice made sense.",
        slow: "The new car is slightly better, and that is all. You expected more from all that waiting.",
        "quick-fix":
          "They find the problem you have been dragging around and fix it. The car is immediately easier to drive.",
        "dead-end":
          "The hours are spent chasing a ghost. They neither fix today nor improve tomorrow.",
      },
    },
    "single-part": {
      title: "One new part",
      story:
        "The new wing has arrived, but only one of them. Enough for a single car. Your team mate has been scoring better and the team is hesitating over who gets it.",
      options: {
        demand: "Demand it for yourself",
        concede: "Let him have it",
      },
      outcomes: {
        granted:
          "You argue your case and win. The part is yours and the stopwatch shows it, even if the other side of the garage is still smouldering.",
        denied:
          "You push and they say no in front of everyone. Not only no part, but you are now the one who breaks the harmony.",
        goodwill:
          "You step aside without making noise. The team boss makes a note: gestures like that get repaid when it matters.",
        overlooked:
          "You step aside and nobody registers it. Next time there is one part, they already know you will not fight for it.",
      },
    },

    // ─── Contracts and the driver market ──────────────────────────
    "renew-early": {
      title: "Renew now",
      story:
        "The team puts a contract in front of you early. The offer is fair, not generous. Your manager reckons that if you wait until mid-season you could be worth considerably more.",
      options: {
        sign: "Sign now and settle it",
        wait: "Wait for the market to move",
      },
      outcomes: {
        secure:
          "You sign and the question is gone. You can concentrate on driving while the rest of the paddock fights over seats.",
        better:
          "You wait, you deliver, and the market moves your way. Now you are the one holding the cards.",
        exposed:
          "You wait too long. The team gets tired, looks elsewhere, and suddenly you are the one who needs to close something fast.",
      },
    },
    "release-clause": {
      title: "The clause",
      story:
        "Your manager wants a release clause in the contract: if a top team comes calling, you can leave without paying. The team will not enjoy the idea being raised at all.",
      options: {
        push: "Insist on the clause",
        drop: "Let it go",
      },
      outcomes: {
        granted:
          "After three tense meetings, they agree. You now have an exit door very few drivers have. When it opens is another matter.",
        refused:
          "They refuse flatly, and are left with the impression you are already thinking about leaving.",
        loyal:
          "You sign without conditions. The team reads it as commitment and repays you in a thousand small ways.",
      },
    },
    "clause-triggered": {
      title: "The door opens",
      story:
        "That hard-won clause stops being theoretical: a top team has formally asked about you. You have little time to answer and the whole paddock is watching.",
      options: {
        "use-it": "Trigger it and take the jump",
        "stay-put": "Stay where you are",
      },
      outcomes: {
        "big-move":
          "You sign with the big team. The first time you sit in that car you understand what everyone has been talking about all these years.",
        trap: "You take the jump and find a project in crisis nobody mentioned. The car is worse than it looked from outside.",
        rewarded:
          "You choose to stay and the team responds: more resources, more say in decisions, and the feeling of being the genuine number one.",
        stagnant:
          "You stay out of loyalty and the project does not grow. Months later you are still wondering what the other side would have been like.",
      },
    },
    "agent-change": {
      title: "Changing manager",
      story:
        "Your manager has been with you since karting, but he has not moved anything in two markets. A big agency has appeared, with contacts in every garage and a reputation for having no scruples.",
      options: {
        switch: "Move to the big agency",
        keep: "Stay with the one you know",
      },
      outcomes: {
        shark:
          "The new man picks up the phone and suddenly your name is being discussed in three garages. He is not likeable, but he works.",
        burned:
          "The agency uses you as small change in negotiations that have nothing to do with you. Your name gets handled carelessly.",
        steady:
          "You stay with the same man. Nothing explosive, but he is the only one who tells you the truth when you do not want to hear it.",
      },
    },
    "rival-team-approach": {
      title: "A discreet approach",
      story:
        "Another team's motorhome, an informal chat, no agents and no paperwork. Nobody is supposed to find out. In this paddock, nobody finds out for very long.",
      options: {
        listen: "Go and listen",
        decline: "Do not go",
      },
      outcomes: {
        leverage:
          "You listen, promise nothing, and come back with valuable information about what your signature is worth.",
        leaked:
          "Somebody saw you walk in. By Friday it is published and your own garage greets you with long faces.",
        trusted:
          "You say no and make sure your team hears about it. That kind of loyalty gets paid back in resources.",
      },
    },
    "pay-cut": {
      title: "Less money, better car",
      story:
        "A better team wants you, but the budget does not allow it: the only way in is to give up a large slice of your salary.",
      options: {
        accept: "Accept the pay cut",
        refuse: "Refuse and stay",
      },
      outcomes: {
        "worth-it":
          "You earn far less and you do not care: for the first time you have a car underneath you that does what you ask.",
        "no-return":
          "You gave up the salary and the car turned out only marginally better. An expensive bet.",
        dignity:
          "You say no. You stay where you were, with less car but without the feeling of having sold yourself short.",
      },
    },

    // ─── Press, sponsors and personal life ────────────────────────
    "press-blast": {
      title: "Open microphone",
      story:
        "Fourth retirement of the year from a fault you had already flagged. You climb out of the car furious and there are fifteen microphones waiting ten metres away.",
      options: {
        vent: "Say exactly what you think",
        diplomatic: "Hold it in and be diplomatic",
      },
      outcomes: {
        rallied:
          "You say all of it. There is noise for a week, but inside the team something shifts: the people who needed to wake up, woke up.",
        backfire:
          "Your words run everywhere without context. You come across as the driver who blames everyone else.",
        professional:
          "You say the right things with a straight face. Nobody writes a word and the factory is grateful not to have another fire to put out.",
      },
    },
    "social-media": {
      title: "The post",
      story:
        "A journalist wrote that you reached Formula 1 on your family's money rather than on talent. Your phone is in your hand with something typed out that you have not sent.",
      options: {
        post: "Post it",
        delete: "Delete it and say nothing",
      },
      outcomes: {
        viral:
          "Your reply lands perfectly: firm, funny, no insults. People share it all weekend.",
        storm:
          "The tone reads far worse than it sounded in your head. Two days of scandal and an awkward call from the press office.",
        quiet: "You delete the draft and put the phone away. The story dies on its own within forty-eight hours.",
      },
    },
    "sponsor-demand": {
      title: "Sponsor commitment",
      story:
        "The title sponsor has organised an event on another continent on the Thursday before a crucial race. Technically, you can say no.",
      options: {
        attend: "Attend the event",
        skip: "Prioritise the race weekend",
      },
      outcomes: {
        funded:
          "You go, you smile, you sign caps. The sponsor is delighted and renews for more money: that becomes development.",
        drained:
          "You arrive at the circuit on Friday wrecked, your body in another time zone. The weekend never gets going.",
        focused:
          "You stay, you sleep properly and you work the circuit from Thursday. It shows in your rhythm.",
        angered:
          "The sponsor hears you chose not to come and takes it personally. The renewal is suddenly uncertain.",
      },
    },
    documentary: {
      title: "Cameras inside",
      story:
        "A production company wants to follow you all year, with access to your radio, the motorhome and your home. They promise to show the real driver.",
      options: {
        join: "Open the doors",
        pass: "Turn it down",
      },
      outcomes: {
        beloved:
          "The episode about you connects with a lot of people. Suddenly you get stopped in the street by people who have never watched a race.",
        edited:
          "They cut your worst moments back to back and build a character you are not. That label is hard to shake.",
        private:
          "You say no and carry on quietly. Less fame, less noise, more headspace for the only thing that matters on Sunday.",
      },
    },
    "fame-pressure": {
      title: "The weight of the name",
      story:
        "You cannot eat out without being recognised. Three brands are fighting over your image and your diary is filling with things that are not driving.",
      options: {
        embrace: "Ride the moment",
        shield: "Set limits and withdraw",
      },
      outcomes: {
        thrives:
          "You move comfortably through the noise. The exposure adds without subtracting focus: not everyone can do both.",
        distracted:
          "Between flights, interviews and obligations you have stopped doing what got you here. On track it starts to show.",
        grounded:
          "You cut almost all of it and go back to basics. Fewer headlines, more simulator, your head back where it belongs.",
      },
    },
    "charity-cause": {
      title: "A cause of your own",
      story:
        "A foundation from your home town asks you to lend your name to a karting project for kids without means. There is no money in it for you, only time.",
      options: {
        lead: "Give it your face and your time",
        "quiet-support": "Help without publicising it",
      },
      outcomes: {
        admired:
          "The project grows and everyone associates it with you. It is the kind of thing that outlives a driving career.",
        personal:
          "You help quietly, no photographs, no press. It wins no headlines, but you sleep a little better.",
      },
    },

    // ─── Stewards and regulations ─────────────────────────────────
    "under-investigation": {
      title: "Under investigation",
      story:
        "The stewards are looking at your move on lap 30. It was on the edge, the kind that can be explained two ways. You are due in the room in twenty minutes.",
      options: {
        "defend-move": "Defend the move",
        admit: "Admit you went too far",
      },
      outcomes: {
        cleared:
          "You explain the move with the data in your hand and they agree. No penalty, and a reputation for arguing your corner well.",
        penalised:
          "Your explanation is not enough. Five seconds, and that drops you out of the points.",
        lenient:
          "You own the mistake straight away and the stewards appreciate it. The penalty is the minimum available.",
        harsh:
          "You admit it and they throw the book at you anyway, to set a precedent. Worse still, you did it on the record.",
      },
    },
    "appeal-penalty": {
      title: "Appeal",
      story:
        "You have been penalised for something that, in your view, was not an offence. The team can appeal, but that means weeks of noise and a federation that rarely reverses itself.",
      options: {
        appeal: "Appeal the penalty",
        accept: "Accept it and move on",
      },
      outcomes: {
        overturned:
          "Against all expectation, it is overturned. You get the points back and the feeling that sometimes it is worth fighting.",
        upheld:
          "It is upheld and you are now labelled as the driver who argues everything. Weeks of energy for nothing.",
        "move-on": "You swallow it and carry on. It stings, but your energy is intact for what comes next.",
      },
    },
    "penalty-points": {
      title: "One point from a ban",
      story:
        "You are one penalty point away from an automatic ban. The way you race, the thing that got you here, is exactly what has you on the edge.",
      options: {
        "cool-off": "Dial it back for a few races",
        "keep-style": "Keep racing the same way",
      },
      outcomes: {
        safe: "You drive within yourself and reach the end of the cycle without adding a point. Not fun, but it worked.",
        "got-away":
          "You carry on and get away with it. A couple of moves on the edge that the stewards let go and you are out of the hole.",
        banned:
          "One contact, one more point, and you are out of the next race. The team has to field the reserve driver.",
      },
    },
    "protest-rival": {
      title: "Protest the rival car",
      story:
        "Your team believes the car beating you has a part outside the regulations. If they protest and they are right, the season changes. If they are wrong, they look like whiners.",
      options: {
        protest: "Push the protest through",
        "let-go": "Let it go",
      },
      outcomes: {
        vindicated:
          "The FIA looks and agrees. The rival has to change the part and suddenly you are much closer.",
        petty:
          "The protest collapses within two hours. You look like the team that goes crying to the stewards instead of improving its car.",
        sporting:
          "You drop it. You would rather be beaten on track than in a stewards' room.",
      },
    },
    "fia-summons": {
      title: "Summoned by the federation",
      story:
        "You said in a press conference that stewards' decisions change depending on the colour of the car. The federation has summoned you for Thursday.",
      options: {
        apologise: "Apologise and close it down",
        "double-down": "Stand by what you said",
      },
      outcomes: {
        settled: "You sign a lukewarm clarification and everyone pretends it never happened. Dull, but effective.",
        "folk-hero":
          "You stand by every word. They fine you, but half the paddock thinks the same and does not dare say it: your standing grows.",
        fined:
          "They hold your gaze and hand you an exemplary fine. Now you are also under a microscope every single weekend.",
      },
    },

    // ─── Rivalries ────────────────────────────────────────────────
    "rival-born": {
      title: "A rivalry is born",
      story:
        "A driver from another team shut the door on you twice in one race and then told the press you drive 'like a junior'. The journalists have already worked out there is a story here.",
      options: {
        engage: "Take up the fight",
        ignore: "Give it no oxygen",
      },
      outcomes: {
        "fired-up":
          "You answer him on track and in the microphones. You have an enemy, and you discover that racing angry makes you quicker.",
        "above-it":
          "You smile and change the subject. With no fuel the story dies on its own and you come out looking like the adult.",
      },
    },
    "rival-media-war": {
      title: "War of words",
      story:
        "Your rival went again in a long interview: he says you get more press than results. The question is already on the table and everyone is waiting for your answer.",
      options: {
        "hit-back": "Hit back hard",
        "stay-quiet": "Refuse to play",
      },
      outcomes: {
        "crowd-loves-it":
          "Your answer hits exactly the right note: sharp, funny, no insults. The public enjoys it, the papers run it, and you come out ahead.",
        ugly: "It escalates further than it should and turns personal. Both of you come out stained.",
        classy:
          "You reply that you would rather talk on track. It sounds like a stock line, but it works: you look good and he is left talking to himself.",
      },
    },
    "rival-payback": {
      title: "Payback",
      story:
        "The perfect opportunity appears: your rival is within reach, on the inside, at the corner where he put you out last year. Nobody could accuse you of anything if it went wrong.",
      options: {
        revenge: "Settle the score",
        "race-clean": "Pass him cleanly",
      },
      outcomes: {
        even: "You pass him and squeeze him onto the grass. The message is clear, even if not everyone applauds.",
        "both-out": "The contact puts you both out. The press has a feast and neither of you gains a thing.",
        "respect-earned":
          "You pass him around the outside, clean, no contact. Even he comes to shake your hand afterwards.",
      },
    },
    "rival-truce": {
      title: "Laying down arms",
      story:
        "After years of needle, your rival suggests ending the circus: a photograph together, a couple of statements, and it is done. He says you are both too old for this.",
      options: {
        "make-peace": "Make peace",
        never: "Forgive nothing",
      },
      outcomes: {
        friends:
          "The photograph goes around the world. What was poison turns into one of those rivalries people remember fondly.",
        fuel: "You tell him no. You keep driving with that anger lit, and it keeps working.",
      },
    },
    "rival-final-duel": {
      title: "The final duel",
      story:
        "Last race, and after all these years you are both fighting for the same thing. What you decide in the next two hours is what they will tell about you long after you stop driving.",
      options: {
        "all-in": "Go for everything",
        points: "Drive for the points",
      },
      outcomes: {
        legend:
          "You risk it on every lap and it works. The race joins the list of the ones replayed on every anniversary.",
        heartbreak:
          "You overreach and lose it all at one corner. You do not come back from that kind of defeat unchanged.",
        smart:
          "You drive coolly, take what you needed to take, and let him make the mistake. Not epic, but correct.",
        "too-cautious":
          "You calculate too much and he goes for it. You end the year thinking about the lap you never did.",
      },
    },

    // ─── Team crisis ──────────────────────────────────────────────
    "sponsor-lost": {
      title: "The sponsor walks",
      story:
        "The title sponsor tore up the contract overnight. The car will run with blank spaces and the technical department is already talking about cuts.",
      options: {
        "help-find": "Go out and find a replacement",
        "focus-driving": "Concentrate on driving",
      },
      outcomes: {
        saved:
          "You knock on doors, use your contacts, and a replacement appears. The factory will not forget it.",
        failed:
          "You lose weeks in meetings that lead nowhere and turn up at races with your head elsewhere.",
        detached:
          "You leave it to the people whose job it is. The car suffers the cuts, but you arrive fresh every Sunday.",
      },
    },
    takeover: {
      title: "New owners",
      story:
        "An investment group has bought the team. They promise money, a new factory and ambition. The people who have been there twenty years have heard that speech before.",
      options: {
        "back-them": "Back the project publicly",
        "look-elsewhere": "Hedge your bets",
      },
      outcomes: {
        investment:
          "The money genuinely arrives. Within a year the team is transformed and you are on the right side of the story.",
        "empty-promises":
          "The promises evaporate and the real budget is smaller than before. You are tied to an empty project.",
        hedged:
          "You commit to nobody and keep conversations open. Not glamorous, but prudent.",
      },
    },
    "team-may-fold": {
      title: "The team is sinking",
      story:
        "There is talk that the team will not reach the end of the year. Suppliers have cut credit and there are mechanics updating their CVs in the garage.",
      options: {
        "stay-loyal": "Stay and fight for it",
        "jump-ship": "Find a way out now",
      },
      outcomes: {
        rescued:
          "You stay, you front up, and a buyer appears at the last moment. Everyone knows who did not get off while it was sinking.",
        sank: "You stay and the team folds anyway. You finish the season without a seat and with the market already closed.",
        survivor:
          "You get out in time. You save your career, though some people in that garage will never forgive you.",
      },
    },
    "unpaid-crew": {
      title: "The mechanics are not being paid",
      story:
        "The team has not paid the mechanics for two months. They still turn up and build your car every weekend. One of them told you almost apologetically.",
      options: {
        "pay-them": "Pay them out of your own pocket",
        "stay-out": "Stay out of it",
      },
      outcomes: {
        devotion:
          "You pay and ask for it to stay quiet. It does not stay quiet. From then on, those people do things for your car that are in no manual.",
        resentment:
          "The mood in the garage rots. Stops get slow and mistakes pile up.",
        resolved:
          "The team eventually sorts the payments out on its own. You avoided getting involved and it came to nothing.",
      },
    },
    "boss-fired": {
      title: "The boss is sacked",
      story:
        "The team boss who brought you into Formula 1 was sacked on Monday. His replacement has a reputation for rebuilding everything to his taste and for having no affection for anyone from the previous regime.",
      options: {
        "defend-boss": "Publicly back the man who left",
        "welcome-new": "Get on side with the new boss",
      },
      outcomes: {
        honourable:
          "You thank the departing boss publicly. It reads well and many respect you for it, even if you get sideways looks for a while.",
        marked:
          "The new man takes it as a personal challenge. Suddenly you are on the losing side of the change.",
        favoured: "You get close quickly and it works: the new boss puts you at the centre of the project.",
        clash:
          "You try to get close and it does not land. He arrived with his own driver in mind before he even signed.",
      },
    },

    // ─── Weather and chaos ────────────────────────────────────────
    monsoon: {
      title: "Monsoon",
      story:
        "It is coming down in sheets and the race is about to restart. The radar says it stops in ten minutes. You could take slicks now, while the track is still a river.",
      options: {
        "slicks-gamble": "Gamble on slicks",
        wets: "Take wets and wait",
      },
      outcomes: {
        masterstroke:
          "You survive three impossible laps and then the track dries. You pass everyone without a fight: the call of the year.",
        aquaplane:
          "At the second corner the car floats and you are in the grass. The gamble paid out, against you.",
        solid: "Wets were the logical call and it worked. You banked points while others spun off.",
      },
    },
    "safety-car-gamble": {
      title: "Safety car",
      story:
        "The safety car comes out just as you were about to stop. Coming in now is free in time, but you rejoin in traffic. Staying out leaves you ahead on tyres that are finished.",
      options: {
        pit: "Come into the pits",
        "stay-out": "Stay out on track",
      },
      outcomes: {
        jackpot: "You stop and come out just ahead of the pack. New tyres and clear track: a gift.",
        trapped: "You rejoin in the middle of a train of cars and stay stuck there to the flag.",
        "track-position":
          "You stay out and hang on with what you have. Track position ends up worth more than the tyres.",
        "sitting-duck":
          "At the restart your tyres are dead and they pick you off one by one. Five places gone in two laps.",
      },
    },
    "red-flag": {
      title: "Red flag",
      story:
        "Red flag and everyone into the pit lane. You can change everything for free. Half the grid will restart on a new strategy and there are fifteen laps of sprint left.",
      options: {
        aggressive: "Go for the fastest tyre",
        conservative: "Take the safe option",
      },
      outcomes: {
        charged:
          "You restart on the aggressive tyre and take three cars before turn 4.",
        "burned-out":
          "The tyre lasts five laps and then falls apart. The end of the race is agony.",
        banked: "You take the conservative option, you do not shine, but you finish where you should.",
      },
    },
    "grid-penalty-strategy": {
      title: "Last on the grid",
      story:
        "Engine change: you start last. The pit wall proposes a long strategy, against everyone else, that only works if you are capable of overtaking a lot.",
      options: {
        "long-game": "Go with the long strategy",
        "write-off": "Write the race off",
      },
      outcomes: {
        carved:
          "You pick them off one at a time, patiently, and in the closing laps the fresh tyres arrive. The kind of recovery drive people applaud.",
        stuck:
          "The strategy depends on overtaking and this circuit does not allow it. You spend the afternoon stuck.",
        "saved-parts":
          "The team uses the race to test parts and save mileage. No points, but data.",
      },
    },
    "first-lap-chaos": {
      title: "Chaos at the start",
      story:
        "The lights go out and turn 1 is a disaster in front of you: smoke, cars spinning, and a gap on the inside that opens and closes in a second.",
      options: {
        "thread-it": "Thread the gap",
        "back-off": "Lift and go around",
      },
      outcomes: {
        gained: "You go through the middle of the mess without touching anybody. You exit turn 1 six places up.",
        collected: "The gap closes exactly as you commit. A spinning car finds you square on.",
        survived: "You lift, avoid everything and come out clean. A couple of places lost, but you are still racing.",
      },
    },

    // ─── Health and fitness ───────────────────────────────────────
    "big-crash": {
      title: "Big crash",
      story:
        "Suspension failure at high speed. The car is in pieces and you walked away, but the medical check found something in your back. There is a race in six days.",
      options: {
        "rush-back": "Race anyway",
        "sit-out": "Sit out and recover properly",
      },
      outcomes: {
        brave:
          "You race on painkillers and see the chequered flag. The image of you climbing out goes around the world.",
        lingering:
          "You come back too early and the injury settles in. You will be living with that problem far longer than you expected.",
        healed: "You sit out and recover properly. You lose a race, but you come back whole.",
      },
    },
    "injury-legacy": {
      title: "The problem that stayed",
      story:
        "That injury never fully went away. In the long races, towards the end, your back starts working against you exactly when you need concentration most.",
      options: {
        surgery: "Have the operation now",
        "manage-it": "Live with it",
      },
      outcomes: {
        fixed:
          "The surgery goes well. After months of rehabilitation you drive again without thinking about your body.",
        complications:
          "The operation is complicated and recovery drags. You never quite feel the car the same way again.",
        coping: "With physio and a new seat you manage. Not ideal, but workable.",
        worse: "Putting it off made it worse. The problem grows and now it shapes every weekend.",
      },
    },
    "training-regime": {
      title: "Fitness programme",
      story:
        "Your trainer proposes a far harder winter programme. He promises you will arrive stronger than ever, but it means never fully stopping.",
      options: {
        brutal: "The demanding programme",
        balanced: "The balanced programme",
      },
      outcomes: {
        "peak-shape":
          "You reach testing in the best shape of your life. In the hot races the difference is obvious.",
        overtrained:
          "You overcook it. You arrive at the first test exhausted and drag the fatigue through the early months.",
        sustainable:
          "A programme you can hold all year. No spectacular peaks, but you arrive well at every race.",
      },
    },
    burnout: {
      title: "Burnout",
      story:
        "You have not enjoyed any of this for months. Travel, pressure, results that do not come. Sunday nights bring neither anger nor joy any more, only tiredness.",
      options: {
        break: "Stop and switch off",
        "power-through": "Push on regardless",
      },
      outcomes: {
        recharged:
          "You take a few genuine weeks away from all of it. You come back with a clarity you had not had in a long time.",
        grit: "You grit your teeth and come through without stopping. It was not healthy, but it worked and everyone noticed.",
        collapse:
          "You keep pushing until your body and your head say enough. The mistakes multiply.",
      },
    },
    "sports-psychologist": {
      title: "Working on your head",
      story:
        "The team suggests working with a sports psychologist. You have always believed these things get fixed by driving, and that asking for help shows a crack.",
      options: {
        "work-with": "Accept the help",
        alone: "Sort it out yourself",
      },
      outcomes: {
        clarity:
          "The sessions clear your head more than you expected. You enjoy it again and you perform better too.",
        "no-click": "You never quite engage with the process. It does no harm, but it changes nothing either.",
        "self-made":
          "You solve it your own way, with simulator hours and silence. It worked, though it took longer.",
        spiral: "Without help it snowballs. Every mistake weighs more than the last.",
      },
    },

    // ─── Engineer and mechanics ───────────────────────────────────
    "hide-problem": {
      title: "The fault nobody saw",
      story:
        "Your engineer privately shows you some odd data: a component is running outside specification. Declaring it means losing the result. He looks at you, waiting for you to decide.",
      options: {
        "cover-up": "Say nothing and carry on",
        report: "Report it to the team",
      },
      outcomes: {
        held: "You decide to say nothing. The car holds and the result stands. But now there is a file that exists and two people who know.",
        "fixed-early":
          "You report it. You lose the weekend's result, but they fix it before it becomes serious and the team values that.",
        blamed:
          "You report it and someone upstairs would rather find a culprit than a solution. The culprit ends up being the one who spoke.",
      },
    },
    "problem-surfaces": {
      title: "It comes out",
      story:
        "A technical journalist is asking very precise questions about that component. Too precise. Someone talked, and your engineer calls you before the story runs.",
      options: {
        confess: "Get ahead of it and tell everything",
        "keep-quiet": "Deny it and hold the line",
      },
      outcomes: {
        forgiven:
          "You tell the truth before they publish. There is noise, but having said it yourself saves you from the worst of it.",
        scandal:
          "You tell everything and the scandal takes half the team with it. Your name is attached to that headline forever.",
        buried:
          "The story runs, nobody can prove it and it fades. You got away with it, though you will not forget the week you spent.",
        exposed:
          "You deny it and three days later the emails appear. Looking bad is one thing; looking bad having lied is another.",
      },
    },
    "engineer-swap": {
      title: "Changing engineer",
      story:
        "You and your race engineer do not understand each other. He speaks in numbers, you speak in feel, and every weekend an hour disappears in translation. You could ask for a change.",
      options: {
        request: "Ask for the change",
        "work-on-it": "Work on the relationship",
      },
      outcomes: {
        "better-fit":
          "The new one understands how you speak. From the first Friday the car arrives much closer to what you ask for.",
        worse:
          "The change breaks a routine that was working anyway. It takes months to get back to where you started.",
        bond: "You sit down and work at it, and find a common language. What was friction is now trust.",
      },
    },
    "mechanic-error": {
      title: "The mistake in the pits",
      story:
        "A wheel not properly attached cost you a podium. The mechanic responsible is a twenty-three-year-old who cannot look at you. The press wants to know what happened.",
      options: {
        "shield-them": "Back him publicly",
        "call-out": "Call the mistake out",
      },
      outcomes: {
        loyalty:
          "You say the team wins and loses together, and that you have made mistakes too. That young man will work for you for the rest of his life.",
        sharper:
          "You call it out firmly and the pit crew sharpens up. Stops improve, though the mood stays tense.",
        resented:
          "You expose him and the whole garage charges you for it in coldness. Nobody will do you a favour when you need one.",
      },
    },
    "trust-the-wall": {
      title: "Trusting the pit wall",
      story:
        "The radio tells you to box now. You have been feeling the car well and you think you should extend. You have less than a lap to decide who is in charge.",
      options: {
        follow: "Do what the wall says",
        "own-call": "Make your own call",
      },
      outcomes: {
        "right-call":
          "You box when they told you and it was exactly right. They had information you could not see.",
        "wrong-call":
          "You box and it was too early. You rejoin in traffic and watch the driver who extended go past.",
        vindicated:
          "You extend against the call and you were right. You take the flag ahead and on the radio they cannot decide whether to scold you or congratulate you.",
        insubordinate:
          "You ignore the call and it goes wrong. Beyond the result, you broke something harder to repair than a front wing.",
      },
    },
    "engineer-leaves": {
      title: "Your engineer leaves",
      story:
        "Your race engineer, the man who knows you better than anyone after all these years, has accepted an offer from another team. He tells you himself, before anyone else.",
      options: {
        "follow-them": "Try to follow him",
        stay: "Stay and adapt",
      },
      outcomes: {
        reunited:
          "The pieces fall into place and you end up working together again. Rebuilding the understanding takes a race and a half.",
        stranded:
          "You chase the idea, it does not happen, and your team finds out you were looking at the door.",
        adapted: "You stay and build from scratch with someone new. The first stretch is hard, but it can be done.",
      },
    },

    // ─── Outside Formula 1 ────────────────────────────────────────
    "indycar-offer": {
      title: "An IndyCar offer",
      story:
        "A big IndyCar team offers you a seat, a good contract and genuinely competitive cars. They race on the other side of the ocean too, and there you could actually fight for things.",
      options: {
        tempted: "Listen to the offer seriously",
        committed: "Close the door",
      },
      outcomes: {
        recharged:
          "Hearing something else reminds you why you like racing. You come back to Formula 1 with a lighter head.",
        distracted:
          "You spend your time looking at what could be and stop being fully present in what is. Your garage notices.",
        focused: "You say no without hesitating. You came here for one thing and you have not got it yet.",
      },
    },
    "lemans-invite": {
      title: "An invitation to Le Mans",
      story:
        "A works team invites you to race the 24 Hours. It falls in a gap in the calendar, but your Formula 1 team would rather you did not climb into anything that is not their car.",
      options: {
        "race-it": "Race Le Mans",
        decline: "Decline the invitation",
      },
      outcomes: {
        glory:
          "You race, you are quick, and you even make the podium. You won something Formula 1 does not give: proof that you can race anything.",
        exhausted:
          "Twenty-four hours leaves you wrecked. You arrive at the next Formula 1 race with an empty tank.",
        "single-minded": "You say no. One thing at a time, and that thing is next Sunday.",
      },
    },
    "dakar-dream": {
      title: "The Dakar",
      story:
        "You always said that before retiring you wanted to do the Dakar. The concrete chance has appeared, with a team and a truck. So has the real risk of breaking something a long way from anywhere.",
      options: {
        go: "Do the Dakar",
        someday: "Leave it for later",
      },
      outcomes: {
        adventure:
          "Two weeks in the desert change your head. You come back with stories for life and a new kind of smile.",
        injured: "A rollover on stage seven leaves you with a fractured wrist and months of recovery.",
        shelved: "You leave it for when you hang up the helmet. Sensible, though the itch stays.",
      },
    },
    "esports-team": {
      title: "An esports team",
      story:
        "You are offered the chance to put your name and your money into a sim racing team. It is a world you know and it is growing fast, but building a team takes time and headspace.",
      options: {
        "found-it": "Found the team",
        "not-now": "Leave it for later",
      },
      outcomes: {
        thriving:
          "The team works, wins championships and connects you with a whole generation that did not know you.",
        "money-pit":
          "It turns out to be far more expensive and far more work than you were sold. An extra headache.",
        focused: "You put it off. There will be time for projects when you do not have to race on Sundays.",
      },
    },
    "reserve-role": {
      title: "Reserve driver",
      story:
        "You have no seat. A team offers you their reserve role: no racing, but inside the paddock, in the simulator, and on hand if someone gets injured.",
      options: {
        accept: "Take the role",
        "hold-out": "Hold out for a race seat",
      },
      outcomes: {
        "in-the-paddock":
          "You accept and you continue to exist for the paddock. They see you every weekend, and in this world being there is half the battle.",
        rewarded:
          "You wait, you sit with the anxiety, and mid-season a real seat opens up. The patience paid off.",
        forgotten:
          "Months pass away from all of it and your name stops appearing on the lists. Disappearing is quicker than it looks.",
      },
    },

    // ─── Legacy and mentoring ─────────────────────────────────────
    "mentor-rookie": {
      title: "The new kid",
      story:
        "An eighteen-year-old with frightening talent has joined the team's academy. They ask you to guide him. It is also true that in three years he could be after your seat.",
      options: {
        "take-them": "Take him under your wing",
        "no-time": "Stay out of it",
      },
      outcomes: {
        proud:
          "You open his mind, tell him the things nobody told you. Watching him progress gives you something a trophy does not.",
        selfish:
          "You tell him everyone works it out for themselves, the way you had to. You gain time for your own work, but some people take note.",
      },
    },
    "mentee-returns": {
      title: "The student",
      story:
        "That kid you helped now has a seat and he is quick. This weekend you are fighting for the same position, and he does not ask you for advice any more.",
      options: {
        "beat-them": "Beat him and mark your territory",
        "help-them": "Let him grow",
      },
      outcomes: {
        "still-sharp": "You beat him cleanly and remind him who used to be asking the questions. You are still here.",
        "passed-torch":
          "He beats you, and you realise he is no longer that kid. It hurts, though somewhere underneath there is pride.",
        "legacy-secured":
          "You let him through and then help him in the garage afterwards. Everyone understands what just happened, and it is worth more than a position.",
      },
    },
    "retirement-thoughts": {
      title: "Thinking about the end",
      story:
        "You no longer wake up on Thursdays with the same nerves. Your body takes longer to recover and there are twenty-year-olds going quicker without breaking sweat. The question starts asking itself.",
      options: {
        "one-more": "One more season",
        "plan-exit": "Start planning the exit",
      },
      outcomes: {
        renewed:
          "You decide to carry on and something lights up again. You drive without thinking, the way you did at the start.",
        fading:
          "You carry on for another year and the feeling does not return. Every weekend costs a little more than the last.",
        "at-peace":
          "You start arranging the exit with time to spare. Driving while knowing when it ends lifts a weight off you.",
      },
    },
    "academy-offer": {
      title: "Running the academy",
      story:
        "The team offers you the job of running their junior academy for when you stop racing. It is security for afterwards, but it means starting to look at the end with a date on it.",
      options: {
        accept: "Accept and secure the future",
        "still-racing": "Not yet, I am still racing",
      },
      outcomes: {
        "future-secured":
          "You sign and you know there is life after the helmet. The peace of mind has a price: part of your head is already on the other side.",
        "not-done":
          "You tell them to call you in a few years. You still wake up wanting to drive, and that decides it.",
      },
    },
    autobiography: {
      title: "Your book",
      story:
        "A publisher wants your autobiography. The advance is significant and so is the interest. The question is how much you are going to tell about what you saw inside the garages.",
      options: {
        "tell-all": "Tell everything",
        diplomatic: "Tell the publishable version",
      },
      outcomes: {
        bestseller:
          "The book is a success. You told things nobody had told and readers are grateful.",
        "burned-bridges":
          "The book makes half the grid uncomfortable. You sold copies and lost friends, and an ally you needed.",
        respectable:
          "A decent, pleasant book with no scandal. Nobody gets angry and nobody is surprised.",
      },
    },
    "final-season-announce": {
      title: "Announcing the end",
      story:
        "You have decided: this is the last one. You can announce it now and live a farewell tour, or keep it to yourself and have everyone guessing until December.",
      options: {
        announce: "Announce it now",
        "keep-guessing": "Say nothing yet",
      },
      outcomes: {
        "farewell-tour":
          "Every circuit prepares a tribute. It is beautiful and exhausting: saying goodbye in every country costs more energy than you imagined.",
        leverage:
          "You keep the news to yourself. The silence keeps you in every market conversation until the last day.",
      },
    },
  },
};

export default content;
