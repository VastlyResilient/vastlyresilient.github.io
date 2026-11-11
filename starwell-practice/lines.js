/* StarWell Practice Line: caller option library, SHORT version (one easy breath per line).
   Model: at every step all three options are GOOD and respectful. They differ in STYLE,
   and the lesson is picking the style that fits THIS owner (adaptive selling).
   Shape of every option: {style, fits:[personalities], tags:[style tags], t:'template', why:'one sentence'}.
   Optional gk:true marks a variant written for the office manager (only offered when p.gk).
   Tags (from owner.js): brief, specific, respect, numbers, plain, control, local, warmup, trade, time.
   Tokens: {name} person on the line, {owner} shop owner, {shop} {town} {me} {tech} {close}
           {rating} {reviews} {day} {time} {when}; truth.custom also uses {true} (p.trueThing).
   Limits: openers at most 28 words, every other line at most 24 (template words).
   Drop-in: load after data.js, then use newOptionsFor() (bottom of file) in place of optionsFor(). */
'use strict';

const NEWLINES = {
  styleOrder: ["Warm & personal", "Straight & brief", "Curious & listening"],
  styles: {
    "Warm & personal":     {how:"Use their name, notice what they are proud of, sound like a neighbor.", fits:["oldtimer","friendly","gatekeeper"]},
    "Straight & brief":    {how:"Point first, numbers plain, short sentences, give their time back.", fits:["busy","numbers","runsit","growing"]},
    "Curious & listening": {how:"Ask, then let them talk. Invite doubts and answer them straight.", fits:["skeptic","modernizer"]}
  },
  /* Default best style per personality (individual lines widen this, e.g. skeptic fits some Straight handlers,
     runsit and growing fit some Curious lines). */
  bestFit: {
    oldtimer:"Warm & personal", friendly:"Warm & personal", gatekeeper:"Warm & personal",
    busy:"Straight & brief", numbers:"Straight & brief", runsit:"Straight & brief", growing:"Straight & brief",
    skeptic:"Curious & listening", modernizer:"Curious & listening"
  },
  /* The encouraging arc: how the caller's tone should grow through the call. */
  arc: {
    opener:"Respectful: a real compliment, a no-strings gift, and a small permission ask.",
    truth:"Humble: one checkable fact, offered as a question they can correct.",
    discover:"Interested: ask about last week, then stop talking.",
    gift:"Generous: one gift that fits what they just said. Theirs to keep.",
    handle:"Reassuring: agree it is a fair question, answer straight, hand control back.",
    close:"Encouraging: credit what they have built, ask for an email and one specific 15 minutes.",
    wrap:"Grateful: thank them, confirm next steps, leave the door open on a no."
  },

  /* ---------------- OPENER: who + one compliment + a no-strings gift + a small permission ask. ---------------- */
  opener: [
    {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["specific","warmup","local"],
     t:"Hi {name}, it's {me} with StarWell, here in Connecticut. Your reviews keep naming {tech}. I made {shop} a free gift to keep. Can I tell you about it?",
     why:"Sincere, specific praise first (Carnegie), then a gift with no strings, which invites goodwill before any ask (Cialdini)."},
    {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["specific","warmup","local"],
     t:"Hi {name}, {me} from StarWell, a small Connecticut company. {rating} stars from {reviews} reviews is something to be proud of. I made {shop} a free gift. Thirty seconds?",
     why:"Praising something they earned makes answering feel worth it, and a small, specific permission ask is easy to grant."},
    {style:"Warm & personal", fits:["gatekeeper","friendly","oldtimer"], tags:["respect","local","warmup"], gk:true,
     t:"Hi {name}, {me} with StarWell, here in Connecticut. I bet you keep {shop} running. I made you and {owner} a free gift. Can I tell you about it?",
     why:"Office managers guard the owner's time; recognizing her role and including her in the gift makes her an ally."},

    {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","time","local"],
     t:"Hi {name}, {me} with StarWell in Connecticut. I'll be quick. I made {shop} something free, yours to keep. Can I take thirty seconds to explain?",
     why:"Who you are and why you called, in one breath; Gong's research links an early, clear reason with more meetings."},
    {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","time","control"],
     t:"{name}, it's {me} from StarWell, here in Connecticut. I'm calling because I built something for {shop}, free, and it's yours either way. Thirty seconds?",
     why:"States the reason up front and asks for a small, fixed slice of time (Gong, Langer et al. 1978)."},
    {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","specific","time"],
     t:"Hi {name}, {me} with StarWell in Connecticut. {rating} stars from {reviews} reviews, nicely done. I made {shop} a free gift to keep. Thirty seconds?",
     why:"One specific compliment and one small ask, with nothing extra, suits an owner who decides fast."},

    {style:"Curious & listening", fits:["skeptic","modernizer","runsit"], tags:["specific","control"],
     t:"Hi {name}, {me} with StarWell, here in Connecticut. I looked at {shop} this morning and noticed one thing that could help. Mind if I share it?",
     why:"Leading with something you noticed, and asking first, leaves them in control with no hidden tactic (Friestad & Wright 1994)."},
    {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["plain","control","local"],
     t:"Hi {name}, {me} from StarWell in Connecticut. We're new to {town} HVAC shops, so we'd rather show than tell. I made {shop} something free. Can I share it?",
     why:"Admitting you're new is honest, and stating your motive answers a skeptic's first question (Friestad & Wright 1994)."}
  ],

  /* ---------------- TRUTH: one checkable fact about the shop, offered humbly. Keyed by p.lead; custom uses the brief's own fact. ---------------- */
  truth: {
    phone: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["specific","warmup"],
       t:"Your reviews name {tech} a lot, which is great. I noticed the office closes at {close}. Who catches the evening no-heat calls?",
       why:"Praise first, then one fact, so it lands as a friendly observation, not a criticism (Carnegie)."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["specific","warmup"],
       t:"Your customers clearly love you, {rating} stars. Your site says the office closes at {close}. How do the late calls usually go?",
       why:"A real compliment plus a soft question keeps a proud owner talking instead of defending."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","specific","control"],
       t:"One thing StarWell found: {shop}'s office closes at {close}, and I didn't see a way to reach anyone after. Did I get that right?",
       why:"One fact, no adjectives; asking them to confirm invites a quick yes or a correction, and both keep them talking."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","specific","control"],
       t:"Quick fact: after {close}, I couldn't find a way for a customer to reach {shop}. Is that right, or did I miss something?",
       why:"Short and checkable; 'did I miss something' shows you'd rather be accurate than right."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control","trade"],
       t:"I may have missed it, but I didn't see a way to reach {shop} after {close}. How do you handle the late no-heat calls?",
       why:"Humble framing gives a skeptic nothing to push against and hands over the floor."},
      {style:"Curious & listening", fits:["skeptic","modernizer","growing"], tags:["specific","trade"],
       t:"Your office closes at {close}. I couldn't tell what happens to a no-heat call at nine at night. How do you handle those?",
       why:"A concrete scene, then a genuine question; people like those who ask about them (Huang et al. 2017)."}
    ],
    site: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["specific","warmup"],
       t:"{rating} stars from {reviews} reviews, that's great. I noticed your site has no way to book after hours. Did I read that right?",
       why:"Starts with what they earned, then one fact about the site, never a judgment of it."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["specific","warmup"],
       t:"People love {tech} and the crew. I noticed there's no way to book on {shop}'s site at night. How do night customers reach you?",
       why:"Naming the tech shows you read the reviews, and the gap becomes a question about their customers."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","specific","numbers"],
       t:"One fact StarWell found: {shop}'s website has no way to book after hours, and your {reviews} reviews send people there. Is that right?",
       why:"The fact plus why it matters, in one breath, then a yes-or-no check."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","specific","control"],
       t:"Quick one: people find {shop} online, but I couldn't see a way to book after {close}. Did I get that right?",
       why:"Short, specific and correctable, which suits an owner who wants the point first."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control","plain"],
       t:"Maybe I missed it, but I couldn't book on {shop}'s site after hours. How do people reach you at night?",
       why:"Owning that you might be wrong lowers a skeptic's guard and turns the fact into a conversation."},
      {style:"Curious & listening", fits:["skeptic","modernizer","growing"], tags:["specific","plain"],
       t:"I opened {shop}'s site on my phone, like a customer would, and couldn't find a way to book. What do people usually do?",
       why:"Showing your method earns a practical owner's respect, then you ask instead of tell."}
    ],
    found: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["specific","local"],
       t:"{rating} stars is earned. But when I searched heating help in {town}, {shop} wasn't the first name. That surprised me.",
       why:"'That surprised me' sides with them: the gap is the search engine's fault, not theirs."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["specific","local","trade"],
       t:"People keep naming {tech} in your reviews. Still, when I asked my phone for furnace repair in {town}, {shop} wasn't near the top.",
       why:"Honors their reputation first, so the finding reads as unfair to them rather than a flaw in them."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","specific","numbers"],
       t:"One fact StarWell found: when I search heating repair in {town}, {shop} isn't the first name, even with {rating} stars. Does that surprise you?",
       why:"A fact they can check in ten seconds, which numbers-minded owners trust."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","specific","local"],
       t:"Quick one: I searched furnace repair in {town} like a homeowner would. Other shops came up before {shop}. Did you know that?",
       why:"Plain cause and effect, with no jargon (Oppenheimer 2006)."},
      {style:"Curious & listening", fits:["skeptic","modernizer","growing"], tags:["local","control"],
       t:"When I searched heating help in {town}, {shop} wasn't the first name. How do most of your new customers find you?",
       why:"Shares the fact, then asks them to explain their world, which builds liking (Huang et al. 2017)."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["specific","control"],
       t:"I asked my phone who fixes furnaces in {town}, and {shop} wasn't the first answer. Does that match what new customers tell you?",
       why:"Invites them to confirm or correct from their own experience, so the conclusion is theirs."}
    ],
    custom: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["local","warmup"],
       t:"I like what {shop} has built in {town}. One thing I noticed: {true}. How's that been going?",
       why:"Your own researched fact, wrapped in appreciation, lands as homework, not criticism."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["specific","warmup"],
       t:"{shop} clearly has loyal customers, {rating} stars. One thing I spotted: {true}. How's that been working for you?",
       why:"Compliment, one fact, one open question: the warm version of 'one true thing'."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","specific","control"],
       t:"One fact from StarWell's look at {shop}: {true}. Did I get that right?",
       why:"Your fact, stated plainly, with a quick check and nothing extra to sit through."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","specific","control"],
       t:"Here's the one thing I found: {true}. Is that right, or did I miss something?",
       why:"Short and correctable, so they engage instead of tuning out."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control","plain"],
       t:"I noticed something about {shop}: {true}. I might be missing context. How has that been going?",
       why:"Admitting you might lack context makes the fact feel fair, not like a setup."},
      {style:"Curious & listening", fits:["skeptic","modernizer","runsit"], tags:["specific","control"],
       t:"Before anything else, I noticed {true}. What's the story there?",
       why:"Asking for the story behind the fact lets them teach you, which lowers their guard."}
    ]
  },

  /* ---------------- DISCOVER: ask about something that already happened (last week), then stop. Keyed by p.lead. ---------------- */
  discover: {
    phone: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["warmup","respect"],
       t:"Before I tell you what StarWell made, I'd love to hear from you. How did the phones go after {close} last week?",
       why:"Signals respect for their experience, and a real night gets a real answer."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["respect","trade"],
       t:"You know cold snaps better than anyone. Last week, when it got cold, what happened with the late calls?",
       why:"Defers to their expertise (Carnegie) and asks about a specific, recent moment."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","numbers","specific"],
       t:"One question first: last week, after {close}, roughly how many calls came in, and who picked them up?",
       why:"A countable question suits owners who think in numbers and can answer fast."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","time"],
       t:"One quick question so I don't waste your time: last week, when the cold hit, what happened to the after-hours calls?",
       why:"Giving a reason makes a busy owner more willing to answer (Langer et al. 1978)."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control","trade"],
       t:"Can I ask about last week? When that first cold night hit, what happened to the calls after you closed?",
       why:"Lets them describe it in their own words; adapting to what they say works (Franke & Park 2006)."},
      {style:"Curious & listening", fits:["skeptic","modernizer","growing"], tags:["control","trade"],
       t:"I'd rather learn than guess. The last time someone called with no heat after {close}, how did that go?",
       why:"'Learn than guess' tells a skeptic you won't assume their problems for them."}
    ],
    site: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["warmup","respect"],
       t:"I'd love to hear it from you first. Last week, when people found {shop} online at night, how did they reach you?",
       why:"A warm lead-in, then one concrete question about last week."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["warmup"],
       t:"{shop} has such a good name. Last week, when a new customer looked you up after hours, what happened next?",
       why:"Affirms their reputation, then asks about a real moment instead of a hypothetical."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","numbers"],
       t:"One question so I don't waste your time: last week, roughly how many new customers booked after hours?",
       why:"A number they can estimate quickly, and the stated reason earns the question (Langer et al. 1978)."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","specific"],
       t:"Quick one: last week, when somebody found your site after {close}, how did they get on your schedule?",
       why:"Straight to the point and tied to a real time window."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control"],
       t:"I'd rather learn than guess. Last week, when people found {shop} online at night, how did they reach you?",
       why:"An open question about what already happened gets facts, not polite guesses."},
      {style:"Curious & listening", fits:["skeptic","modernizer","growing"], tags:["control","local"],
       t:"Think about last week. When someone in {town} found your site at night, what did they do next?",
       why:"Walking through a real scene surfaces details nobody volunteers to a pitch."}
    ],
    found: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["warmup","respect"],
       t:"Before I tell you what StarWell made, I'd love to hear from you. How did last week's new customers find you?",
       why:"Respectful and specific; owners enjoy talking about their own business."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["warmup","local"],
       t:"I bet you know a lot of your customers by name. The new ones last week, how did they find {shop}?",
       why:"Acknowledges the personal service they're proud of before asking."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","numbers"],
       t:"One quick question: of last week's new customers, roughly how many found you on Google versus a referral?",
       why:"A simple split they can answer with numbers in one breath."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","plain"],
       t:"Quick one: the new customers who called last week, did most come from referrals or from searching online?",
       why:"Two easy buckets, so answering takes seconds."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control"],
       t:"I'd rather learn than guess. When new customers called last week, how did most of them say they found {shop}?",
       why:"Open, recent and humble; follow-up questions like this increase liking (Huang et al. 2017)."},
      {style:"Curious & listening", fits:["skeptic","modernizer","runsit"], tags:["control","respect"],
       t:"Think about the last few new customers who called. How did they hear about you? I'd like to understand that first.",
       why:"Promising to understand before talking is the opposite of a pitch."}
    ]
  },

  /* ---------------- GIFT: the one piece that fits what they just said, in owner words, theirs to keep. Keyed by p.lead. ---------------- */
  gift: {
    phone: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["plain"],
       t:"Thanks for telling me that. StarWell built {shop} a test line that answers missed calls, books them, and texts you. It's free to keep.",
       why:"Thanks them, then one gift that matches their story; an unconditional gift invites goodwill (Cialdini)."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["plain","control"],
       t:"That's exactly why I called. StarWell set up a test line for {shop}. Call it tonight from your couch. It's free.",
       why:"Connects the gift to their exact story and gives them a tiny, friendly first step."},
      {style:"Straight & brief", fits:["busy","numbers","runsit"], tags:["brief","plain","control"],
       t:"StarWell made {shop} a separate test number. It answers missed calls, books them, and texts you. Free, and your phones stay untouched.",
       why:"What it does, what it doesn't touch, what it costs: three facts, no adjectives."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","control"],
       t:"Simple version: StarWell built {shop} a test line that picks up after {close} and texts you. Free, and you decide if it goes live.",
       why:"Short sentences and a clear 'you decide' put control in their hands."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","control","trade"],
       t:"StarWell built {shop} a test line that catches the calls your team can't reach. It never touches your dispatch. Free to keep.",
       why:"Framing it as catching overflow, without touching dispatch, respects a growing shop's system."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control"],
       t:"That makes sense. StarWell built a test line that answers like your office and texts you. Want to call it yourself tonight?",
       why:"Lets them test it instead of trusting your word, which skeptics and hands-on owners prefer."},
      {style:"Curious & listening", fits:["skeptic","modernizer","growing"], tags:["control"],
       t:"Based on what you said, StarWell set up a test line for {shop}. Nothing changes on your phones. Want to try it tonight?",
       why:"'Based on what you said' proves you listened; adapting beats a canned pitch (Franke & Park 2006)."}
    ],
    site: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["local"],
       t:"Thanks for sharing that. StarWell built a fresh version of {shop}'s website, so people in {town} can book after hours. It's yours to keep.",
       why:"Warm thanks, one clear gift, and 'yours to keep' removes any feeling of a trap."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["specific"],
       t:"You've earned those {reviews} reviews. StarWell built {shop} a new website that shows them off and takes bookings at night. Free to keep.",
       why:"Frames the site as a showcase for what they built, not a fix for something broken."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","control"],
       t:"StarWell already built {shop} a new website that takes bookings after hours. It's free, and it's yours whether we talk again or not.",
       why:"'Already built' means zero work for them, which is what a busy owner needs to hear."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","plain"],
       t:"Short version: StarWell built {shop} a fresh website so night visitors can book a call. Free, yours to keep, nothing to sign.",
       why:"Cost, ownership and commitment, the three things they're listening for, in plain words."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control"],
       t:"That's what I figured. StarWell built a fresh version of {shop}'s site for night booking. Want to see it next to your current one?",
       why:"Offers proof they can judge themselves, which beats any claim."},
      {style:"Curious & listening", fits:["skeptic","modernizer","growing"], tags:["control"],
       t:"Thanks, that helps. StarWell already built {shop} a new site for after-hours booking. It's yours either way. What would you change?",
       why:"Inviting their edits makes it their project, not your pitch."}
    ],
    found: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["plain","local"],
       t:"Thanks for telling me. StarWell made a one-page check of how {shop} shows up when {town} folks search. Plain English, free to keep.",
       why:"One page, plain English, no cost: a gift that's easy to accept (Oppenheimer 2006)."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["local"],
       t:"Your neighbors already trust you. StarWell made one free page on how newcomers in {town} find {shop} when they search.",
       why:"Ties the gift to the reputation they're proud of instead of to a weakness."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","specific"],
       t:"StarWell made one page showing where {shop} shows up on Google and Maps in {town}, plus the few fixes that matter. Free.",
       why:"Says exactly what's on the page and that it's short; numbers people like a finite deliverable."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","control"],
       t:"Short version: StarWell checked how {shop} shows up when {town} homeowners search for heat. One page, free. Use it or toss it.",
       why:"'Use it or toss it' is a freedom-to-refuse cue, which raises acceptance (Carpenter 2013)."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control","local"],
       t:"That's helpful. StarWell made one free page on how {shop} shows up in {town} searches. Want to see who comes up ahead of you?",
       why:"Sparks curiosity about competitors, with the gift already given."},
      {style:"Curious & listening", fits:["skeptic","modernizer","runsit"], tags:["control","plain"],
       t:"Makes sense. StarWell put together a plain-English page on how {shop} shows up online. It's yours either way. Want to see it?",
       why:"Offers evidence instead of claims and lets them choose to look."}
    ]
  },

  /* ---------------- HANDLE: objection handlers. Agree it's fair, answer straight, hand control back. ---------------- */
  handle: {
    catch: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["respect","local"],
       t:"Fair question, {name}. StarWell is new to Connecticut HVAC, and we'd rather show than tell. If you don't love it, it's still yours.",
       why:"Naming your real motive answers what they're really asking (Friestad & Wright 1994)."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["respect","local"],
       t:"I'd ask the same thing. StarWell is the new kid in Connecticut, and the best way to earn trust is good work first.",
       why:"Agreeing with their caution and admitting you're new makes the offer believable."},
      {style:"Straight & brief", fits:["busy","numbers","skeptic","runsit","growing"], tags:["brief","plain"],
       t:"No catch. StarWell is new to Connecticut HVAC, so we build first to earn trust. You keep it either way.",
       why:"Motive, then terms, in short sentences a skeptic can check."},
      {style:"Straight & brief", fits:["busy","numbers","skeptic","runsit","growing"], tags:["brief","plain","control"],
       t:"Straight answer: StarWell hopes to earn your business later. Nothing to sign, nothing to pay, and you keep everything.",
       why:"Saying the motive out loud leaves no hidden angle to find (Friestad & Wright 1994)."},
      {style:"Curious & listening", fits:["skeptic","modernizer","runsit"], tags:["control"],
       t:"Good question, and you should ask it. StarWell is new here, so this is how we earn trust. What would you need to see?",
       why:"Validates the doubt, then asks them to set the bar, which hands them control."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control","plain"],
       t:"Smart to ask. Honestly, StarWell hopes you'll like it enough to talk later. What part sounds too good to be true?",
       why:"Inviting the toughest question shows you have nothing to hide."}
    ],
    price: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["numbers","plain"],
       t:"Great question. What StarWell built is free and stays yours. If you ever want help running it, it's about $300 to $400 a month.",
       why:"A real range, said calmly; sharing cost openly raised trust and purchases (Mohan, Buell & John 2020)."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["numbers","respect"],
       t:"I'm glad you asked up front. The StarWell package costs nothing and stays yours. Ongoing help is optional, around $300 to $400 a month.",
       why:"Thanking them for asking treats price as a normal topic, not a secret."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","numbers"],
       t:"Today it's zero, and you keep it. If you want StarWell to run it later, about $300 to $400 a month, in writing.",
       why:"Numbers first and no promises, so they can do their own math (Mohan, Buell & John 2020)."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","numbers"],
       t:"Straight numbers: free now, and it's yours. If StarWell keeps it running later, $300 to $400 a month, no surprises.",
       why:"Short, specific, no dodging: the opposite of 'we'll talk about that later'."},
      {style:"Curious & listening", fits:["skeptic","modernizer","runsit"], tags:["numbers","control"],
       t:"Fair question. It's free and stays yours. Optional StarWell help later runs $300 to $400 a month. What would make that worth it?",
       why:"Gives the number, then lets them define value, so they judge on their own terms."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["numbers","control"],
       t:"Free now, and you keep it. Optional StarWell help is about $300 to $400 a month. How do you judge if something pays off?",
       why:"Asking how they measure results shows you expect to be judged on them."}
    ],
    allset: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["respect"],
       t:"That's great, sounds like the website's covered. StarWell isn't here to replace anybody. Who picks up the calls after {close}?",
       why:"Agree first, then move to a different gap, so there's nothing to defend (Carnegie)."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["respect","warmup"],
       t:"Love that it's family. StarWell would never step on that. Can I ask how after-hours calls get handled at {shop}?",
       why:"Honoring the family helper keeps things friendly while you look for the real gap."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","control"],
       t:"Good, keep what's working. The website is only one piece. StarWell's test phone line and Google check are separate, and free. Want those?",
       why:"Respects their choice and offers a smaller, easier yes."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","control"],
       t:"Totally fair, skip the website. StarWell also made {shop} a Google check and a test phone line, both free. Worth a look?",
       why:"Drops the part they objected to instead of arguing for it."},
      {style:"Curious & listening", fits:["skeptic","modernizer","growing"], tags:["control","plain"],
       t:"Sounds like you're covered there. I'm curious, who picks up calls after you close? That's where StarWell might actually help.",
       why:"A question about a different gap keeps the talk going without any argument."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control"],
       t:"Glad you've got someone. StarWell only helps where there's a gap. What's one thing you'd change about how customers find {shop}?",
       why:"Letting them name their own gap is far more persuasive than you naming it."}
    ],
    email: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["time","control"],
       t:"Happy to. What's the best email? And could StarWell walk you through it {day} at {time}? Fifteen minutes. If not, no problem.",
       why:"Yes to their request plus one specific time; a when-and-where plan aids follow-through (Gollwitzer & Sheeran 2006)."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["time","respect"],
       t:"Of course, {name}. What email should StarWell use? So you're not reading it alone, could I take fifteen minutes {day} at {time}?",
       why:"Frames the walkthrough as a favor to them, not a request from you."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","time"],
       t:"Sure. What's the email? StarWell will send it within the hour. Fifteen minutes {day} at {time} to walk through it, or another time?",
       why:"Agree, get the email, and offer one time with an easy alternative."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","time","specific"],
       t:"Done. Best email? StarWell sends it right after this. Then fifteen minutes {day} at {time} to show you on screen. Work for you?",
       why:"A specific slot is easier to say yes to than 'sometime' (Gollwitzer & Sheeran 2006)."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control","time"],
       t:"What's the best email? And what will you look at first? StarWell could walk you through that {day} at {time}, fifteen minutes.",
       why:"Asking what they care about makes the walkthrough about their priorities."},
      {style:"Curious & listening", fits:["skeptic","modernizer","runsit"], tags:["control","time"],
       t:"What email works? StarWell wants this to be useful, so could I walk you through it {day} at {time} and hear your take?",
       why:"Positions the meeting as getting their opinion, which skeptics are glad to give."}
    ],
    busy: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["time","respect"],
       t:"Totally get it, {name}, go take care of that. StarWell made something free for {shop}. Can I call you {day} at {time}?",
       why:"Respecting their time is the whole message, and one specific callback keeps the door open."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["time","control"],
       t:"No problem at all, sounds like a full day. StarWell's gift for {shop} will keep. Later today, or {day} at {time}?",
       why:"'It will keep' takes the pressure off, and a choice of two times is easy to answer."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","time"],
       t:"Got it, I'll be fast. StarWell built something free for {shop}. I'll email it and call {day} at {time} for two minutes. Okay?",
       why:"Short, specific, and lets them get back to work in seconds."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","time"],
       t:"Understood. StarWell made {shop} something free to keep. What's the best email? I'll call {day} at {time}.",
       why:"The whole call in one breath, with a concrete next step."},
      {style:"Curious & listening", fits:["skeptic","modernizer","growing"], tags:["time","control","trade"],
       t:"Of course, sounds like you're on a job. When are you usually off the tools? StarWell would rather call when it suits you.",
       why:"Asking when suits them is respectful and gets a time they'll actually pick up."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["time","control"],
       t:"No problem. What's better for you, later today or {day} at {time}? StarWell made something free for {shop}, and it can wait.",
       why:"A choice question gets a real answer instead of a polite 'call me sometime'."}
    ],
    ai: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["plain","control"],
       t:"Smart to ask. With StarWell, missed calls get answered and you get a text. Nothing touches your phones without your yes.",
       why:"Talks about what they get and what they control, not the technology; control lowers worry."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["respect","control"],
       t:"Your customers trust you, and StarWell respects that. Try the test line first. If it doesn't sound like {shop}, it never goes live.",
       why:"Puts their customer relationships first and gives them a veto."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","plain","control"],
       t:"Yes, StarWell's line uses AI. It answers missed calls, books them, and texts you, on a separate test number until you say yes.",
       why:"A plain yes, then what it does; being open about it avoids feeling tricked later."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","control"],
       t:"Yes, AI answers the calls you miss and texts you. StarWell runs it on a test number. You hear it first, you decide.",
       why:"Three short facts and a clear 'you decide'."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control"],
       t:"Fair. What worries you most, how it sounds or what it says? StarWell's test number lets you hear it first.",
       why:"Finds the real concern before answering, then lets them test it."},
      {style:"Curious & listening", fits:["skeptic","modernizer","growing"], tags:["control"],
       t:"Good to ask. Heard ones that sounded like robots? StarWell's runs on a test number, so you can call it and judge it yourself.",
       why:"Acknowledges the bad tools they've heard and invites a hands-on test."}
    ],
    agency: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["respect","control"],
       t:"I'm sorry that happened. That's why StarWell does it free first. You keep everything and judge it on your own numbers.",
       why:"Acknowledge the hurt, then remove the risk; 'your own numbers' hands them control."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["respect","plain"],
       t:"Paying for nothing would make anyone careful. StarWell builds first, free, and it stays yours. No contract, and no ranking promises.",
       why:"Empathy plus what you won't do; skipping ranking promises sets you apart from whoever burned them."},
      {style:"Straight & brief", fits:["busy","numbers","skeptic","runsit","growing"], tags:["brief","numbers","control"],
       t:"Makes sense you'd be wary. StarWell builds first: no cost, nothing to sign, no ranking promises. You judge it on your numbers.",
       why:"Short and specific; a burned owner trusts terms more than reassurance."},
      {style:"Straight & brief", fits:["busy","numbers","skeptic","runsit","growing"], tags:["brief","control"],
       t:"Fair. So don't trust StarWell yet. Look at what we built for {shop}, keep it free, and only talk again if it helps.",
       why:"Telling them not to trust you yet is the most believable thing you can say."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control","respect"],
       t:"That's a lousy experience, I'm sorry. What did they promise, and what did you get? StarWell wants to avoid repeating it.",
       why:"A follow-up question about their experience shows you care and builds liking (Huang et al. 2017)."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control"],
       t:"That's frustrating. What would have made it worth it for you? StarWell builds first and free, so you judge results, not a pitch.",
       why:"Lets them define success before you promise anything."}
    ],
    wordofmouth: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["respect","local"],
       t:"That's the best kind of business. Even referred customers look you up first. StarWell's gift helps them find what your neighbor described.",
       why:"Honors what they're proud of, then shows how the gift protects it, with no argument needed."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["respect","local"],
       t:"Referrals like that say a lot about {shop}. StarWell's gift helps the folks your customers send find you and reach you, even late.",
       why:"Positions the gift as serving their referrals, not replacing them."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","plain"],
       t:"Referrals are the best. Even referred customers search your name first. StarWell's free gift helps them find {shop}, not the next shop.",
       why:"Agrees, adds one fact, ties it to the gift: three beats, done."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","specific"],
       t:"Makes sense. Referrals still search your name before calling. StarWell checked what they find for {shop}. Want the free one-page version?",
       why:"A small, concrete offer right after agreeing."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control"],
       t:"That's great. When a neighbor gives someone your name, what do you think they do before calling? StarWell's gift is built for that moment.",
       why:"Lets them reason their way to the gap themselves."},
      {style:"Curious & listening", fits:["skeptic","modernizer","runsit"], tags:["control","specific"],
       t:"Love that. Has a referral ever said they couldn't reach you, or called someone else first? StarWell's gift is built for exactly that.",
       why:"A question about real past events surfaces a gap they may not have linked to referrals."}
    ],
    scam: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["local","plain"],
       t:"Smart to ask, {name}. Your number's on your Google listing. StarWell is in North Haven, Connecticut. Nothing to pay. Look us up anytime.",
       why:"Say where you found the number; named sources feel normal, hidden ones feel invasive (Aguirre et al. 2015)."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["local","control"],
       t:"I'd wonder too. I found {shop} on Google. StarWell is here in North Haven, Connecticut. Feel free to look us up and call back.",
       why:"Agreeing with their caution and offering a callback gives them full control."},
      {style:"Straight & brief", fits:["busy","numbers","skeptic","runsit","growing"], tags:["brief","local","plain"],
       t:"Fair. Your number's on your Google listing. StarWell is a North Haven, Connecticut company. No payment, no logins, nothing to sign.",
       why:"Source, location, and what you'll never ask for: the facts that calm scam fears."},
      {style:"Straight & brief", fits:["busy","numbers","skeptic","runsit","growing"], tags:["brief","local"],
       t:"Good question. I got it from {shop}'s website. StarWell's in North Haven, Connecticut. I'll never ask for money or passwords.",
       why:"Specifics calm people down; promises like 'I swear' don't."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control"],
       t:"Smart to ask. Your number's on your Google listing. What would help you feel sure? StarWell can email first so you can check us.",
       why:"Asks what proof they need instead of guessing, then offers a low-risk way to verify."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control","local"],
       t:"Good instinct. I found you on Google. StarWell is in North Haven, Connecticut. Want to look us up and call me back? Totally fine.",
       why:"'Totally fine' is a freedom-to-refuse cue, which raises yes rates (Carpenter 2013)."}
    ]
  },

  /* ---------------- CLOSE: credit their work, ask for the email + ONE specific 15-minute time, easy out. ---------------- */
  close: [
    {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["respect","time","control"],
     t:"You've built something people trust, {name}. What's the best email for StarWell? And could we take fifteen minutes {day} at {time}? No pressure.",
     why:"Encouragement plus a specific when-and-where makes follow-through more likely (Gollwitzer & Sheeran 2006)."},
    {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["time","control"],
     t:"I think you'll like what StarWell made. Best email for you? And fifteen minutes {day} at {time}? If it's not useful, just say so.",
     why:"Warm confidence plus an easy out; reminding people they're free to say no raises yes rates (Carpenter 2013)."},
    {style:"Warm & personal", fits:["gatekeeper"], tags:["respect","time"], gk:true,
     t:"{owner}'s lucky to have you. Best email? Could StarWell take fifteen minutes with you both {day} at {time}? No pressure.",
     why:"Credits the office manager and invites her in, so she books the owner instead of screening you out."},
    {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","time","control"],
     t:"What's the best email? StarWell will send it within the hour. Fifteen minutes {day} at {time}? If it's not useful, I won't follow up.",
     why:"One email, one time, one easy out; nothing to decode."},
    {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","time","control"],
     t:"Two quick things: your email, and fifteen minutes {day} at {time} with StarWell. Does that work, or is another time better?",
     why:"Naming two small asks makes them feel finite, and a specific slot helps it happen (Gollwitzer & Sheeran 2006)."},
    {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","respect","time"],
     t:"You run a tight shop, {name}. Best email for StarWell? And fifteen minutes {day} at {time}? Totally fine to say no.",
     why:"Short credit, then two small asks with a freedom-to-refuse cue (Carpenter 2013)."},
    {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control","time"],
     t:"What's the best email? I'd love fifteen minutes {day} at {time} to hear what you think. StarWell wants your honest take, good or bad.",
     why:"Framing the meeting as their review, not your pitch, suits owners who distrust sales calls."},
    {style:"Curious & listening", fits:["skeptic","modernizer","growing"], tags:["specific","control","time"],
     t:"What email should StarWell send it to? And does {day} at {time} work for fifteen minutes? You'd see everything, and you can say no.",
     why:"Saying what they'll see, and that no is fine, removes the mystery a skeptic dislikes (Carpenter 2013)."}
  ],

  /* ---------------- WRAP: grateful and short. yes = confirm next steps; no = accept gracefully. ---------------- */
  wrap: {
    yes: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["warmup","time"],
       t:"Perfect, {name}. StarWell will send it within the hour, and I'll call {day} at {time}. Thanks so much. Stay warm out there.",
       why:"People remember how a call ends, so finish warm and clear."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["warmup"],
       t:"Thank you, {name}. I really enjoyed talking with you. I'm looking forward to {day}. Go take care of those customers.",
       why:"Genuine appreciation at the end makes them glad they said yes."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","time"],
       t:"Done. You'll get the StarWell email within the hour, and I'll call {day} at {time}. Thanks, {name}.",
       why:"Confirms exactly what happens next, then gives their time back."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","time","respect"],
       t:"Got it all. It's coming within the hour, and I'll call {day} at {time}. I'll let you get back to work.",
       why:"Short, clear, and respects that they're mid-job."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control"],
       t:"Thanks, {name}. If anything in the email raises a question before {day}, just reply. I'd love to hear what you think.",
       why:"Opens a channel for doubts, which builds trust before the meeting."},
      {style:"Curious & listening", fits:["skeptic","modernizer","growing"], tags:["control","time"],
       t:"Appreciate you, {name}. When you look it over, jot down anything you'd change, and we'll go through it {day} at {time}.",
       why:"A small role before the meeting makes showing up more likely."}
    ],
    no: [
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["local","warmup"],
       t:"Totally understand, {name}. Thanks for your time. StarWell's right here in Connecticut if anything changes. Keep up the great work.",
       why:"Ending warm after a no keeps the door open for next season."},
      {style:"Warm & personal", fits:["oldtimer","friendly","gatekeeper"], tags:["warmup","trade"],
       t:"No problem at all. I appreciate you hearing me out. If a cold snap ever buries the phones, StarWell's an easy call.",
       why:"Graceful and specific, so they remember you when the problem shows up."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","control"],
       t:"Understood. Thanks for the time, {name}. The gift for {shop} is still yours if you ever want it.",
       why:"Accepts the no and leaves the gift on the table, with zero pressure."},
      {style:"Straight & brief", fits:["busy","numbers","runsit","growing"], tags:["brief","time"],
       t:"Fair enough, I'll let you go. My number's on your caller ID if anything changes. Thanks, {name}.",
       why:"Fast and respectful; the last impression is that you listened."},
      {style:"Curious & listening", fits:["skeptic","modernizer"], tags:["control"],
       t:"Thanks for being straight with me, {name}. What would have made this worth your time? Totally fine if you'd rather not say.",
       why:"Asking for advice, with permission to skip it, often turns a no into goodwill (Carpenter 2013)."},
      {style:"Curious & listening", fits:["skeptic","modernizer","runsit"], tags:["control","respect"],
       t:"Totally fair, {name}. Thanks for the honest answer. If you're ever curious, the gift for {shop} is still there for you.",
       why:"Leaves curiosity open without asking for anything."}
    ]
  },

  /* ---------------- Updated hints. ---------------- */
  hints: {
    opener:"Who you are (StarWell, Connecticut), one real compliment, a free gift to keep, and a small ask like 'Thirty seconds?'",
    truth:"One specific fact from the prep slides, offered so they can correct you. A fact, never a judgment.",
    discover:"Ask about something that already happened, like last week. Then stop talking.",
    gift:"One gift that matches what they just told you. Say it's free and theirs to keep.",
    handle:"Agree it's a fair question, give the honest answer, then hand control back.",
    close:"Credit what they've built, then ask for the email and one specific 15-minute time.",
    wrap:"Thank them. If yes, confirm what happens next. If no, accept it warmly."
  },

  /* Suggested owner reaction to replace REACT.opener.best. */
  reactOpenerBest: ["Okay. What'd you make?","Alright, I've got a minute. Go ahead.","Huh. Free? Okay, what is it?","Okay, you've got thirty seconds. Go."]
};

/* Adapter: same return shape as optionsFor() ({q, t}) plus style, why, fits, tags.
   q is 'best' when the style fits this owner, 'ok' when it's good but not the best fit. No 'weak' options. */
function newOptionsFor(stage, p, objKey){
  const r = p.r || Math.random;
  const N = NEWLINES;
  let pool = null;
  if(stage === 'opener' || stage === 'close') pool = N[stage];
  else if(stage === 'truth') pool = p.trueThing ? N.truth.custom : N.truth[p.lead];
  else if(stage === 'discover' || stage === 'gift') pool = N[stage][p.lead];
  else if(stage === 'handle') pool = N.handle[objKey];
  else if(stage === 'wrap') pool = N.wrap[objKey === 'yes' ? 'yes' : 'no'];
  if(!pool) return [];
  const vars = Object.assign({}, p.vars, {true: p.trueThing || ''});
  const fillT = t => t.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
  return N.styleOrder.map(style => {
    const vs = pool.filter(o => o.style === style && (p.gk || !o.gk));
    const o = vs[Math.floor(r()*vs.length)];
    return {q: o.fits.includes(p.arch) ? 'best' : 'ok', style, fits: o.fits, tags: o.tags, t: fillT(o.t), why: o.why};
  });
}

if(typeof module !== 'undefined') module.exports = {NEWLINES, newOptionsFor};
