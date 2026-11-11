/* StarWell Practice Line: in-call guide sheet content.
   Opened by the Guide button on the call screen, scrolled to the current step (currentHintStage()).
   Tokens like {name} {shop} {town} {me} {day} {time} {close} {rating} {reviews} {tech} {when}
   match p.vars, so the sheet can run each line through fill(line, C.p).
   Patterns, not scripts: the caller says it in their own words.
   The eight step cards come from SCRIPT_LIB.guide (script.js), so the step names match the step bar. */
const CALL_GUIDE = {
  steps: (typeof SCRIPT_LIB !== 'undefined' && SCRIPT_LIB.guide) || {},

  services: [
    {
      name: "Fresh website",
      ownerWords: "A fresh website that makes calling you the obvious choice: your trucks, your crew, your reviews, and call or book right up top.",
      analogy: "A showroom that's open all night.",
      honestLimits: "Built from the owner's own photos, no stock. They pick between two looks. Every page and link moves over, so they keep their Google traffic. Their name on the domain and files. Goes live only with their OK."
    },
    {
      name: "One-page search check",
      ownerWords: "One page showing how you show up when people in your town search Google, look at the map, or ask their phone or ChatGPT, and the simple fixes.",
      analogy: "Highway sign (Google), information desk (Google's AI summary), a well-read friend's pick (ChatGPT).",
      honestLimits: "Plain English, no jargon. Gains take months. Nobody can guarantee number one. Visibility gets the call; the owner's work wins the job."
    },
    {
      name: "Social posts",
      ownerWords: "A month of posts from your real jobs, so people checking you out see a busy, trusted shop. About 15 minutes of your time to approve.",
      analogy: "A page last updated in 2022 looks like a shop with the lights off.",
      honestLimits: "The owner's own photos by default. AI images only with their OK, labeled, never passed off as a real job. Accounts connect through each platform's official sign-in; we never see passwords. The owner approves the plan."
    },
    {
      name: "Demo line",
      ownerWords: "A demo line that answers like your office, books the job, and texts you a summary. Call it tonight and judge it yourself.",
      analogy: "A dispatcher who never sleeps.",
      honestLimits: "Runs on its own phone number. Nothing touches the owner's real phones without their yes. Emergencies first: gas smell or CO alarm means leave the home and call 911 or the gas company, then a live transfer to their on-call tech. Connecticut recording notice up front. No prices quoted unless the owner approves them. Say 'phone answering', never lead with 'AI'."
    },
    {
      name: "Ongoing help (optional)",
      ownerWords: "If you ever want ongoing help, it's $300 to $400 a month, in writing, no surprises.",
      analogy: "Like a service agreement: optional, and you can stop.",
      honestLimits: "Month to month, no setup fee. The free help stays the owner's either way. Never quote a custom number on the call; that comes in writing after a 15-minute walkthrough."
    }
  ],

  questions: [
    { q: "What's the catch?", a: "Fair question. StarWell is new to HVAC, and we'd rather show you than tell you. If you like it, we could work together down the road. If not, it's still yours. (Then stop talking.)" },
    { q: "What does this cost?", a: "Fair question. This is free, and it stays yours. If you ever want ongoing help, it's $300 to $400 a month, in writing." },
    { q: "What happens after the free part?", a: "Nothing, unless you ask. You keep everything. No contract, nothing to sign." },
    { q: "How do you make money?", a: "Some owners like it and ask us to keep it running. That's our business. The free work is how we earn the chance." },
    { q: "Is this AI? I don't trust that stuff.", a: "Smart to ask. We handle the tech. What you'd see is simple: calls you miss get answered and you get a text. It runs on its own phone number first, and nothing touches your phones unless you say yes." },
    { q: "Will it sound like a robot?", a: "Call the demo line tonight and judge for yourself. If you don't like it, you've lost nothing." },
    { q: "Will it mess with my phones?", a: "It can't. The demo line has its own phone number. Your phones stay exactly as they are." },
    { q: "What if it tells a customer something wrong?", a: "The demo only uses your public info. If you ever went live, you'd approve what it says and what it must never say." },
    { q: "Just send me an email.", a: "Happy to, that's my next step anyway. What's the best address? And so it doesn't sit in your inbox, could I take fifteen minutes {day} at {time} to walk you through it?" },
    { q: "Is this a scam? How'd you get my number?", a: "Smart to ask. Your number's on your website and Google listing. We're StarWell, here in Connecticut. Nothing to pay, nothing to sign, no logins. Look us up and call me back if you'd rather." },
    { q: "Do you have other HVAC clients?", a: "Not in HVAC yet. You'd be one of our first, which means our best attention. We run these same systems for a Connecticut transportation company." },
    { q: "Will this get me more calls?", a: "I can't promise a number, and I won't. It's built so more people find you and fewer calls slip by. The walkthrough shows where you stand today, so you can judge." },
    { q: "It's all word of mouth.", a: "That's the best kind. When a neighbor recommends you, people still look you up first. This makes sure what they find matches what your neighbor said." },
    { q: "We already have a guy for that.", a: "Great, sounds like you're covered there. Think of this as a second set of ideas to show him. Can I ask, who picks up the calls after you close?" },
    { q: "We got burned by a marketing company.", a: "I'm sorry that happened. That's exactly why it's free first and stays yours. You judge it on your own numbers, not our promises." },
    { q: "Are you going to sell my info?", a: "No. Never sold, team-only access." },
    { q: "I'm on a job right now.", a: "Totally get it. Should I email it and call you {day} morning, or is later today better?" },
    { q: "Not interested.", a: "Totally fair. Is that not at all, or just not right now while you're on a job? (If still no:) No problem. Thanks for your time, have a great day." },
    { q: "Call me back after the season.", a: "Will do. I'll send the free help now so it's waiting, and call when you said." },
    { q: "I'm not the owner.", a: "Thanks for telling me. You probably know the phones better than anyone. Who's the right person, and when's a good fifteen minutes? You're welcome to join." }
  ],

  rules: [
    "We're calling to help. Every owner should be better off for the call, even if they say no.",
    "Never sell, never pressure, never call it a sales call. Just say who you are and why you're calling.",
    "No trick questions, no leading questions, no fake urgency or invented deadlines.",
    "Only true claims. No ranking guarantees, no 'ten times the leads', no other company's numbers presented as ours.",
    "Missed-call money uses the owner's numbers only.",
    "Free stays free. It's theirs to keep, no strings.",
    "Nothing goes live on the owner's website, accounts or phones without their yes. The demo line has its own phone number.",
    "AI images only with the owner's OK, labeled, never shown as a real job. Otherwise their own photos.",
    "Never ask for passwords or card numbers.",
    "Know the shop, never the owner's private life. Say where you found a fact.",
    "Don't know? Say so, and promise an answer by tonight.",
    "A no is respected the same day. One kind clarifying question, then a warm goodbye.",
    "Reviews only after the owner has seen results, in their honest words, never traded for anything.",
    "A person dials, never our AI voice. Check the do-not-call list first."
  ]
};
