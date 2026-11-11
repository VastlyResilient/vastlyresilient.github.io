/* StarWell Practice Line: in-call guide sheet content.
   Opened by the Guide button on the call screen, scrolled to the current step (currentHintStage()).
   Tokens like {name} {shop} {town} {me} {day} {time} {close} {rating} {reviews} {tech} {when}
   match p.vars, so the sheet can run each line through fill(line, C.p).
   Patterns, not scripts: the caller says it in their own words. */
const CALL_GUIDE = {
  steps: {
    opener: {
      title: "1 · Hello and why you're calling",
      secs: 10,
      say: [
        "Who you are + StarWell + Connecticut: “Hi {name}, this is {me} with StarWell, here in Connecticut.”",
        "One real compliment about his shop: “People keep naming {tech} in your reviews.”",
        "A gift with no strings, then a small ask: “I made {shop} something free to keep. Can I take thirty seconds to tell you what it is?”"
      ],
      why: "An owner on a roof with an unknown number thinks 'sales or scam?' Your name, a Connecticut company and one clear reason answer that in ten seconds. Saying why you're calling is tied to about twice as many meetings.",
      avoid: [
        "Saying 'this is a cold call' or anything that sounds like a sales script",
        "'Did I catch you at a bad time?' (hands him the exit)",
        "'How have you been?' to a stranger (fake familiarity)",
        "'We help HVAC companies grow with AI' (tech words, pitch voice)"
      ]
    },
    truth: {
      title: "2 · One true thing about his shop",
      secs: 15,
      say: [
        "One checkable fact + where you saw it + a curious question.",
        "“Your site says the office closes at {close}, and I didn't see a way to reach anyone after that. How do evening no-heat calls get handled?”",
        "“{rating} stars from {reviews} reviews, and people keep naming {tech}. That's rare.”"
      ],
      why: "A real, specific fact shows you did homework on HIS shop, not a list. Naming where you found it (website, Google) keeps it from feeling creepy.",
      avoid: [
        "Judgments: 'your website looks outdated'",
        "Anything about his home or family",
        "A fact you didn't check today. One wrong fact costs all trust"
      ]
    },
    discover: {
      title: "3 · Ask about his week, then listen",
      secs: 45,
      say: [
        "Ask about something that already happened: “When that first cold night hit last week, how did the phones go after hours?”",
        "Follow up once on his own words: “You said it goes to your cell. What happens when you're on a job?”",
        "Let him do the math: “What's a no-heat call usually worth to you?”",
        "Then stop talking. This is the longest step, and he does the talking."
      ],
      why: "'Last week' gets real facts; 'would you ever' gets polite guesses. When he names the problem in his own words, it's his, not your pitch.",
      avoid: [
        "'Would you be interested in more calls?'",
        "Leading questions: 'You're losing a ton of calls, right?'",
        "Quoting our own dollar figures for missed calls. Only his numbers"
      ]
    },
    gift: {
      title: "4 · Offer the one gift that fits",
      secs: 20,
      say: [
        "Tie it to what he just said: “That's exactly why we built you something.”",
        "Phones: “StarWell set up a demo line that answers like your office, books the call and texts you. Separate test number, nothing touches your phones. Call it tonight.”",
        "Website: “We built a fresh version of your website, made so people can reach you even after {close}. It's yours either way.”",
        "Getting found: “I'll send one page showing how {shop} shows up when people in {town} search Google, the map, or ask their phone. Plain English.”",
        "Social: “We'll put together a month of posts from your real jobs. About 15 minutes of your time to approve.”",
        "Why free, word for word: “StarWell is new to Connecticut HVAC, and we'd rather show you than tell you. If you love it, maybe we work together down the road. If not, it's still yours.”",
        "The rest in one line, then stop: “The other pieces are in the email.”"
      ],
      why: "One thing that matches his problem beats a menu. Naming our motive answers 'what's the catch?' before he asks.",
      avoid: [
        "Listing every service",
        "Jargon: SEO, AEO, GEO, AI agent, voice bot",
        "Promises: 'ten times the leads', 'page one on Google'",
        "Talking through the silence after the why-free line"
      ]
    },
    handle: {
      title: "5 · His questions: thank, truth, tie, turn",
      secs: 20,
      say: [
        "Thank: “Fair question.” / “Smart to ask.”",
        "Truth: the honest answer, including what we don't know.",
        "Tie: connect it to his shop and what he told you.",
        "Turn: hand control back. “Want to call the demo line and judge for yourself?”",
        "Don't know? “I'm not sure. I'll find out and text you by tonight.”"
      ],
      why: "A question means he's listening. A straight answer to a hard question earns more trust than any pitch.",
      avoid: [
        "Dodging ('we'll talk about that later')",
        "Arguing or 'you're wrong'",
        "Inventing a number or a deadline, or discounting on the spot",
        "Asking again after a second no"
      ]
    },
    close: {
      title: "6 · Email, then one specific time",
      secs: 15,
      say: [
        "“What's the best email? I'll send it within the hour.”",
        "“Could I walk you through it {day} at {time}, {when}? Fifteen minutes.”",
        "Give an easy out: “If it's not useful, tell me and I won't follow up.”",
        "Office manager on the line: “When's a good fifteen minutes for {owner}? You're welcome to join.”"
      ],
      why: "A day and a time makes follow-through far more likely than 'sometime.' The easy out shows we'll respect his no.",
      avoid: [
        "'Can I send you some information?' with no time",
        "'Sign up today' or any pressure",
        "Asking for referrals or reviews now"
      ]
    },
    wrap: {
      title: "7 · End warm",
      secs: 10,
      say: [
        "Yes: “Perfect. You'll have it from StarWell within the hour, {name}. Stay warm out there.”",
        "No: “Totally understand. Thanks for your time, {name}. StarWell's here if anything changes.”",
        "No answer? Voicemail: “Hi {name}, {me} with StarWell, here in Connecticut. I noticed [true thing]. We put together a free website and phone demo for {shop}, yours either way. Details by email. My number is [number].”",
        "After: recap email within the hour, log the call."
      ],
      why: "The last thing he hears is what he remembers. A gracious no keeps the door open for next season.",
      avoid: [
        "'Are you sure? It's free.'",
        "Following up after a clear no",
        "A flat 'okay, bye'"
      ]
    }
  },

  services: [
    {
      name: "Website",
      ownerWords: "A fresh website that makes calling you the obvious choice: your trucks, your crew, your reviews, Call and Book right up top.",
      analogy: "A showroom that's open all night.",
      honestLimits: "Built from his own photos, no stock. He picks between two looks. Every page and link moves over so he keeps his Google traffic. His name on the domain and files. Goes live only with his OK."
    },
    {
      name: "Getting found (one-page check)",
      ownerWords: "One page showing how you show up when people in your town search Google, look at the map, or ask their phone or ChatGPT, and the simple fixes.",
      analogy: "Highway sign (Google), information desk (Google's AI summary), a well-read friend's pick (ChatGPT).",
      honestLimits: "Plain English, no jargon. Gains take months. Nobody can guarantee number one. Visibility gets the call; his work wins the job."
    },
    {
      name: "Social posts",
      ownerWords: "A month of posts from your real jobs, so people checking you out see a busy, trusted shop. About 15 minutes of your time to approve.",
      analogy: "A page last updated in 2022 looks like a shop with the lights off.",
      honestLimits: "His own photos by default. AI images only with his OK, labeled, never passed off as a real job. Accounts connect through each platform's official sign-in; we never see passwords. He approves the plan."
    },
    {
      name: "Phone answering demo",
      ownerWords: "A demo line that answers like your office, books the job, and texts you a summary. Call it tonight and judge it yourself.",
      analogy: "A dispatcher who never sleeps.",
      honestLimits: "Separate test number. Nothing touches his real phones without his yes. Emergencies first: gas smell or CO alarm means leave the home and call 911 or the gas company, then a live transfer to his on-call tech. Connecticut recording notice up front. No prices quoted unless he approves them. Say 'phone answering', never lead with 'AI'."
    },
    {
      name: "Ongoing help (optional)",
      ownerWords: "If you ever want us to keep it running, most shops start around $300 to $400 a month, in writing, no surprises.",
      analogy: "Like a service agreement: optional, and you can stop.",
      honestLimits: "Month to month, no setup fee. The free package stays his either way. Never quote a custom number on the call; that comes in writing after a walkthrough."
    }
  ],

  questions: [
    { q: "What's the catch?", a: "Fair question. StarWell is new to Connecticut HVAC, and we'd rather show you than tell you. If you love it, maybe we work together down the road. If not, it's still yours. (Then stop talking.)" },
    { q: "What does this cost?", a: "The package is free, and it stays yours. If you ever want us to keep it running, most shops start around $300 to $400 a month, in writing, no surprises." },
    { q: "What happens after the free part?", a: "Nothing, unless you ask. You keep everything. No contract, nothing to sign." },
    { q: "How do you make money?", a: "Some owners like it and ask us to keep it running. That's our business. The free work is how we earn the chance." },
    { q: "Is this AI? I don't trust that stuff.", a: "Smart to ask. We handle the tech. What you'd see is simple: calls you miss get answered and you get a text. It runs on a test number, and nothing touches your phones unless you say yes." },
    { q: "Will it sound like a robot?", a: "Call the demo line tonight and judge for yourself. If you don't like it, you've lost nothing." },
    { q: "Will it mess with my phones?", a: "It can't. It's a separate test number. Your phones stay exactly as they are." },
    { q: "What if it tells a customer something wrong?", a: "The demo only uses your public info. If you ever went live, you'd approve what it says and what it must never say." },
    { q: "Just send me an email.", a: "Happy to, that's my next step anyway. What's the best address? And so it doesn't sit in your inbox, could I take fifteen minutes {day} at {time} to walk you through it?" },
    { q: "Is this a scam? How'd you get my number?", a: "Smart to ask. Your number's on your website and Google listing. We're StarWell, a Connecticut company in North Haven. Nothing to pay, nothing to sign, no logins. Look us up and call me back if you'd rather." },
    { q: "Do you have other HVAC clients?", a: "Not in HVAC yet. You'd be one of our first, which means our best attention. We run these same systems for a Connecticut transportation company." },
    { q: "Will this get me more calls?", a: "I can't promise a number, and I won't. It's built so more people find you and fewer calls slip by. The walkthrough shows where you stand today, so you can judge." },
    { q: "It's all word of mouth.", a: "That's the best kind. When a neighbor recommends you, people still look you up first. This makes sure what they find matches what your neighbor said." },
    { q: "We already have a guy for that.", a: "Great, sounds like you're covered there. Think of this as a second set of ideas to show him. Can I ask, who picks up the calls after you close?" },
    { q: "We got burned by a marketing company.", a: "I'm sorry that happened. That's exactly why it's free first and stays yours. You judge it on your own numbers, not our promises." },
    { q: "Are you going to sell my info?", a: "No. Never sold, team-only access." },
    { q: "I'm on a job right now.", a: "Totally get it. Should I email it and call you {day} morning, or is later today better?" },
    { q: "Not interested.", a: "Totally fair. Is that not at all, or just not right now while you're on a job? (If still no:) No problem. Thanks for your time, have a great day." },
    { q: "Call me back after the season.", a: "Will do. I'll send the package now so it's waiting, and call when you said." },
    { q: "I'm not the owner.", a: "Thanks for telling me. You probably know the phones better than anyone. Who's the right person, and when's a good fifteen minutes? You're welcome to join." }
  ],

  rules: [
    "We're calling to help. Every owner should be better off for the call, even if he says no.",
    "Never sell, never pressure, never say 'this is a cold call'. Just say who you are and why you're calling.",
    "No trick questions, no leading questions, no fake urgency or invented deadlines.",
    "Only true claims. No ranking guarantees, no 'ten times the leads', no other company's numbers presented as ours.",
    "Missed-call money uses his numbers only.",
    "Free stays free. It's his to keep, no strings.",
    "Nothing goes live on his website, accounts or phones without his yes. The phone demo is a separate test number.",
    "AI images only with his OK, labeled, never shown as a real job. Otherwise his own photos.",
    "Never ask for passwords or card numbers.",
    "Know the shop, never his private life. Say where you found a fact.",
    "Don't know? Say so, and promise an answer by tonight.",
    "A no is respected the same day. One kind clarifying question, then a warm goodbye.",
    "Reviews only after he's seen results, in his honest words, never traded for anything.",
    "A person dials, never our AI voice. Check the do-not-call list first."
  ]
};

/* step-by-step guide now comes from the call script (greeting first, gradual opening) */
if(typeof SCRIPT_LIB !== 'undefined' && SCRIPT_LIB.guide) CALL_GUIDE.steps = SCRIPT_LIB.guide;
