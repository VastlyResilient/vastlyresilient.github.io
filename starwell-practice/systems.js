/* =====================================================================
   STARWELL SYSTEMS: what each system is, how it works, and the answers
   to the questions owners ask. Caller knowledge. Terms always come from
   offer.js (the single source of truth); nothing here changes them.
   "check" notes are things to confirm before you promise them.
   ===================================================================== */
'use strict';
window.STARWELL_SYSTEMS = {
  order: ['phone','site','found','social','custom'],

  phone: {
    name: 'Answering line', icon: '☎', pillar: 'Closes missed leads',
    one: 'A phone assistant, trained on his shop, that picks up the calls he can\'t.',
    problem: 'A homeowner with no heat calls at 7 p.m., gets voicemail, and calls the next shop.',
    say15: 'You keep your number. When you can\'t pick up, an assistant trained on your shop answers, gets the details, and texts them to you right away.',
    say45: 'You keep your number and nothing changes for your customers. When you\'re on a job or closed, the call rolls to an assistant trained on your services, your area, your hours and how you handle emergencies. It answers in about two rings, finds out what the caller needs, and sends you a summary right away. A real emergency, like no heat, gets passed straight to whoever is on call. You hear it and approve it before any customer does.',
    how: [
      'He keeps his number. His carrier forwards a call only when he doesn\'t pick up, the line is busy, or the office is closed.',
      'The assistant answers in about two rings with his greeting.',
      'It asks what he would ask: name, address, what\'s wrong, how urgent.',
      'It sends him a text or email summary right away. Recordings and transcripts are his.',
      'Emergencies he defines (no heat, gas smell) are transferred live to his on-call number.'
    ],
    scenario: 'Saturday, 9 p.m. A furnace quits in Hamden. The owner is at dinner. The assistant answers, takes the name, address and "no heat, two kids in the house", marks it urgent, and rings the on-call tech. The owner gets a text with everything. Nobody went to voicemail.',
    notDo: [
      'It does not pretend to be a person. If asked, it says it is an automated assistant.',
      'It does not quote prices, promise arrival times or take card numbers.',
      'It does not book on his calendar until we have connected it and he has approved that.',
      'It does not make things up. If it doesn\'t know, it takes the details and hands off.'
    ],
    ask: 'When you\'re out on a job or after the office closes, what happens when a customer calls?',
    qa: [
      {group:'How it works', items:[
        {q:'How does it work?', a:'You keep your number. When you can\'t answer, or after hours, the call rolls to an assistant trained on your business. It finds out what the caller needs, takes the details, and texts or emails you a summary right away. Real emergencies get transferred to whoever\'s on call.'},
        {q:'Is it a robot? Will my customers know?', a:'It\'s a natural-sounding voice assistant, not a press-1 menu. Most callers just talk to it like a receptionist. If someone asks, it tells the truth, and it can always pass them to a person.'},
        {q:'What does it say to callers?', a:'Whatever you\'d want your best office person to say. We build it with you: your greeting, the questions to ask, and what to do with each kind of call. You hear it and approve it before it goes live.'},
        {q:'What if it doesn\'t know the answer?', a:'It won\'t make anything up. It takes the details and says someone will call back, or it transfers. Pricing, warranties and anything it isn\'t sure about go to you.'}
      ]},
      {group:'His phone number', items:[
        {q:'Can I keep my own number?', a:'Yes, and that\'s the normal setup. Customers keep calling the number they always have.'},
        {q:'How do calls get to it?', a:'Call forwarding from your phone carrier. Most shops forward only when they don\'t pick up or the line is busy. You can also forward everything after hours. It takes about a minute to turn on and you can turn it off just as fast.', check:'Forwarding steps differ by carrier (Verizon, AT&T, Comcast Business, RingCentral). Look up his carrier before you promise a specific code.'},
        {q:'Do I have to move my number over?', a:'No. Moving a number is called porting, and we don\'t recommend it for a trial. Forwarding does the same job in minutes and undoes in seconds.'},
        {q:'Will my phone still ring first?', a:'Yes, if you choose. With no-answer forwarding your phone rings as usual, and it only picks up the calls you would have missed.'},
        {q:'Can it have its own number?', a:'Yes. It starts on its own demo number so nothing touches your phones. It can also keep a separate local number for an ad or a second line.'}
      ]},
      {group:'Bookings and emergencies', items:[
        {q:'Can it book jobs on my calendar?', a:'On the trial it collects everything and sends it to you to confirm, so nothing gets double-booked. Once you trust it, it can connect to your calendar or field software.', check:'Ask which software he uses (ServiceTitan, Housecall Pro, Jobber). Don\'t promise a connection until we\'ve confirmed it.'},
        {q:'What about an emergency at 2 a.m.?', a:'You decide what counts as an emergency. Those calls get transferred live to your on-call number. If nobody answers, it takes the details, tells the caller help is being reached, and sends you an urgent text.'},
        {q:'How do I see what happened on a call?', a:'After each call you get a text or email with the caller\'s name, number, address, the problem and how urgent it is. You can also get the recording and transcript.'},
        {q:'Can it handle Spanish speakers?', a:'It can answer in Spanish or switch when the caller does.', check:'Confirm Spanish is set up and tested on his line before saying yes.'},
        {q:'Does it take payments?', a:'No. It never takes card details over the phone. That stays with you.'}
      ]},
      {group:'Trial and cost', items:[
        {q:'What does the free trial include?', a:'A demo number you can call anytime, free. Then a free 30-day trial on your real after-hours calls, with a minute cap we put in writing. No card, no contract, nothing renews on its own.'},
        {q:'How long does setup take?', a:'About a day or two once we have your services, service area, hours, emergency rules and on-call number. Your part is around 20 minutes.'},
        {q:'What happens after the trial?', a:'We look at the numbers together: calls answered that you\'d have missed, and after-hours calls. Then you decide. If you do nothing, it pauses.'},
        {q:'What does it cost after that?', a:'It\'s priced per shop and you\'d get it in writing first. Let\'s see what it does for you, then decide if it makes sense.', check:'Never quote a number that hasn\'t been set.'}
      ]},
      {group:'Trust', items:[
        {q:'Is it legal to record calls here?', a:'The greeting tells every caller up front that the call may be recorded, so everyone knows.', check:'This is our understanding of Connecticut\'s rule, not legal advice. Don\'t present it as a legal opinion.'},
        {q:'Is my customer information safe?', a:'It\'s used only to handle your calls and send you the summaries. It isn\'t sold or shared, and you can ask for it to be deleted anytime.'},
        {q:'What if it messes up a call?', a:'You see every call, so we catch it fast. Tell us what was off and we fix the script, usually the same day. During the trial we review calls with you.'},
        {q:'Can I hear it first?', a:'Yes. We set up a demo number and you call it yourself before any customer does.'}
      ]}
    ],
    deeper: [
      'What\'s inside: speech-to-text hears the caller, a language model decides what to say from the shop\'s approved script and facts, text-to-speech answers. A human handoff rule sits on top.',
      'Demo vs live: the demo number is a sandbox with no link to his phones. Live means his carrier forwards real calls to it. Those are two separate yes decisions.',
      'Cost drivers for us: minutes of talk time. That is why it is a trial with a cap and not a forever gift.',
      'Where it can fail: heavy accents on a bad line, callers who want a person right away, questions outside the script. Each of those should end in a clean handoff.'
    ]
  },

  site: {
    name: 'Website', icon: '▣', pillar: 'Saves time',
    one: 'A fast, clear website built for phones that makes it easy to trust the shop and request service.',
    problem: 'A homeowner finds him at night on a phone, can\'t see a number or a way to book in the first screen, and goes back to Google.',
    say15: 'We build you a modern site that\'s easy to get around on a phone, shows your reviews, and makes it simple to request service. The first version is free and it\'s yours to keep.',
    say45: 'Most people find a shop on their phone, often at night, and decide in under a minute. We rebuild the site around that: your trade, town and reviews at the top, a call button next to a request button, real photos, and plain answers to the questions that stop people from calling, like financing and your license. We don\'t touch your booking or payment setup. You approve it before it goes live, and the files and web address are in your name.',
    how: [
      'We collect his real facts: services, towns, hours, license, brands, photos. Nothing is invented.',
      'We build the first version and show him in the 15 minutes.',
      'He tells us what to change. Nothing goes live until he approves it.',
      'The files and the web address are in his name. We host it free for the first year.'
    ],
    parts: [
      {t:'The first screen', d:'Trade, town, star rating and review count. A call button next to a book button. A real photo of the team or trucks.'},
      {t:'More than one way to book', d:'A call button that stays on screen, online booking, call-or-text, and a form with 3 or 4 fields.'},
      {t:'Reviews people can check', d:'Google first, then Facebook and BBB, with recent reviews that name the service and the town.'},
      {t:'Answers that stop people from calling', d:'How to reach him, license number, financing if he offers it, and price ranges only if he approves them.'},
      {t:'Services people can scan', d:'6 to 8 big tiles for the jobs he wants most, each with its own page.'},
      {t:'Behind the scenes', d:'Fast on a phone, every form tested, every request answered quickly.'}
    ],
    scenario: 'A homeowner in Milford searches "furnace repair" at 9 p.m. She taps his site. In the first screen she sees "Furnace repair in Milford", 4.9 stars from 300 reviews, a truck photo, and two buttons: Call and Request service. She taps one. That\'s the whole job of the site.',
    notDo: [
      'It does not guarantee more calls. Say "easier to trust and easier to act".',
      'We do not post prices unless he approves the exact ranges in writing.',
      'We do not touch his booking, dispatch or payment forms. We link to what he already uses.',
      'We do not delete his existing pages unless he names the page.'
    ],
    ask: 'When someone finds your website on their phone at night, how do they usually reach you or book?',
    qa: [
      {group:'What he gets', items:[
        {q:'What exactly do you change?', a:'The first screen, the ways to book, where your reviews show, the answers people look for before they call, and how your services are laid out. It\'s built for phones first.'},
        {q:'Do I own it?', a:'Yes. The files and the web address are in your name. We host it free for the first year. Changes after launch are part of an optional care plan, priced in writing first.'},
        {q:'How long does it take?', a:'We bring a first version to the 15-minute walkthrough. After that it depends on how many pages you want.', check:'Don\'t promise a launch date on the call.'},
        {q:'What do you need from me?', a:'Your real facts and photos: services, towns, hours, license, brands, and pictures of your team and trucks. Your part is small.'}
      ]},
      {group:'His worries', items:[
        {q:'Will this mess up my site or my booking form?', a:'No. We don\'t delete your original pages or touch your booking, dispatch or payment forms. Nothing goes live without your OK.'},
        {q:'I don\'t want prices on my site.', a:'Then there won\'t be any. If you ever want ranges shown, we only publish numbers you approve. Otherwise we explain what drives the cost and how your quotes work.'},
        {q:'My nephew built our site.', a:'That\'s great, sounds like you\'re covered. Can I ask, when someone lands on it from their phone at night, how do they usually reach you?'},
        {q:'I don\'t want AI writing on my site.', a:'The facts come from you, made-up claims are off the table, and you approve everything before it goes live.'}
      ]},
      {group:'Results', items:[
        {q:'Will a new site get me more calls?', a:'We can\'t promise a number. What we can do is make it easier to trust you and easier to reach you, and you\'d judge it on your own results.'},
        {q:'Will it get me to number one on Google?', a:'No one can honestly promise that. A clear, fast site helps, and the search work is a separate piece we can show you.'},
        {q:'Should I add an FAQ so Google shows my answers?', a:'Answers on your pages help people and help search tools quote you. Google stopped showing the special FAQ boxes in 2026, so we write answers for your customers, not for a badge.'}
      ]}
    ],
    deeper: [
      'Where answers live: the 3 to 5 that stop a call go on the first screen. Job-specific answers go on that service\'s page. Town pages only get local questions. One answer, one page.',
      'Answer format: the answer first in 40 to 60 words, then detail, then a next step. Owner-verified facts only.',
      'Google and FAQ boxes: Google limited FAQ rich results in August 2023 and stopped showing them for everyone on May 7, 2026. Google also says no special markup is needed for its AI features.',
      'Never: copy the same 10 questions onto every town page, or mass-produce pages that swap the town name. Google treats that as spam.',
      'Outside claim we do not repeat to owners: one consultant reports big booking numbers from this layout.'
    ]
  },

  found: {
    name: 'Getting found', icon: '⌕', pillar: 'Increases visibility',
    one: 'Helping the shop show up when people search Google, look at the map, or ask ChatGPT who to call.',
    problem: 'A new neighbor asks ChatGPT "who\'s a good HVAC company near me?" and three other shops are named.',
    say15: 'When someone searches Google or asks ChatGPT for an HVAC company near you, we help you have a better chance of showing up. I can send you a free one-page check of where you show up today.',
    say45: 'People find a shop three ways now: Google\'s regular results, the map, and AI tools like ChatGPT. Those three don\'t move together, so we check each one separately for your town. Then we fix the real cause: a missing page, a weak page, or a Google listing that\'s out of date. It starts with a free one-page check so you can see where you stand today. No ranking promises, and you approve every page.',
    how: [
      'The one-page check: where he shows for 2 or 3 real searches, on Google, on the map, and in AI answers.',
      'Diagnose before writing anything: is a page missing, weak, or is his Google listing the problem?',
      'Fix the real cause. Improve an existing page first. Write a new one only for a real gap.',
      'Tune his Google Business Profile: hours, services, photos, review replies.',
      'Re-check the same searches every 28 days and report honestly, up or down.'
    ],
    words: [
      {t:'SEO', d:'Showing up in Google\'s regular results and on the map.'},
      {t:'AEO', d:'Being the source Google\'s AI answer box quotes or links.'},
      {t:'GEO', d:'Being named correctly by ChatGPT, Gemini, Perplexity and similar tools.'},
      {t:'With an owner', d:'Never say those letters. Say "showing up on Google, on the map, and when people ask ChatGPT".'}
    ],
    scenario: 'We search "furnace repair Wolcott CT" on the map and ask ChatGPT the same thing. He is fourth on the map and not named by ChatGPT. The check shows why: his Google listing has no services filled in. Fixing that is free and takes a day.',
    notDo: [
      'We never promise a ranking or "first page".',
      'We never invent facts: licenses, rebates, prices, towns or 24/7 hours.',
      'We never buy "best of" lists, fake reviews or links.',
      'We never edit his main pages or Google listing without his approval.',
      'It does not replace his ads. We won\'t tell him to turn ads off.'
    ],
    ask: 'How do most of your new customers find you these days?',
    qa: [
      {group:'Results', items:[
        {q:'Can you guarantee number one for "AC repair near me"?', a:'No, and I\'d be careful of anyone who does. "Near me" mostly comes down to the map: how close you are, your categories and your reviews. We can improve your chances, not sell a spot.'},
        {q:'SEO takes forever. I need calls this week.', a:'Some fixes help quickly, like correcting your hours or your Google listing. Steady gains usually take months. Before heating season we\'d start with your listing and your emergency page.'},
        {q:'Do you have proof this works?', a:'On our first live run, for a Connecticut car service, the searches we targeted went up in about three weeks, the broad ones didn\'t, and the AI results were early and uneven. Not a miracle, not a flop. We\'d measure yours the same honest way.', check:'That company is run by one of our partners. Say so if he asks.'},
        {q:'ChatGPT already recommends my competitor.', a:'We check that separately and find out why. Often it\'s reading a listing or a review site. We don\'t buy fake "top 10" lists. It takes repeated checks to see a trend.'}
      ]},
      {group:'What he already has', items:[
        {q:'I already pay for Google Ads.', a:'Good, keep them. This isn\'t a replacement. Ads stop when the budget stops. This is the part that keeps working.'},
        {q:'Just write a bunch of blogs and we\'ll rank.', a:'Thin, same-sounding posts have hurt companies. We\'d rather make your furnace page better and fix your Google listing than publish 40 look-alike posts.'},
        {q:'Ninety percent of my work is word of mouth.', a:'That\'s the best kind. People still look you up before they call. This makes sure what they find matches what your neighbor said.'}
      ]},
      {group:'His worries', items:[
        {q:'Will this mess up my website?', a:'No. We don\'t delete your pages or touch your booking forms. Changes to your main pages wait for your yes.'},
        {q:'I don\'t want AI writing on my site.', a:'Facts come from you, nothing is invented, and you approve it before it goes live.'},
        {q:'What do you need from me?', a:'Your real facts, a few photos, and access to your Google Business Profile so we can see what the map sees.'},
        {q:'What is the one-page search check?', a:'One page showing where you appear for a couple of real searches, what ChatGPT says, your reviews next to the shops that show first, and three plain fixes. It\'s free and it\'s yours.'}
      ]}
    ],
    deeper: [
      'Three scoreboards, never blended: Google and the map, Google\'s AI answers, and chatbots. A rise in one is not a rise in the others.',
      'Mentioned, cited and recommended are three different things in an AI answer. We track each.',
      'A big ranking can mean nothing locally. HVAC is won within a few miles, so we measure his towns, not the state.',
      'What we need at kickoff: his fact file, real photos, Google Business Profile access, Search Console if he has it, and one named person who approves.',
      'Our own first run (Absolute Transportation, started around Oct 21, 2026; checked Nov 14): targeted searches up, broad statewide searches flat or down, AI mentions flat. Do not present those numbers as HVAC results.'
    ]
  },

  social: {
    name: 'Social posts', icon: '◎', pillar: 'Increases visibility',
    one: 'Turning the shop\'s own job photos into posts, so a neighbor who looks him up sees real, recent work.',
    problem: 'A referral looks him up on Facebook before calling and the last post is from two years ago.',
    say15: 'A lot of people look a shop up on Facebook before they call. We\'d put together a month of posts from your own job photos, free. You approve each one and they\'re yours.',
    say45: 'When a neighbor recommends you, people still look you up, and a page with recent, real jobs builds trust fast. Your techs snap a photo or a short video on the job, which takes under a minute. We turn those into posts with your town in them, timed to the season. The first month is free and yours to keep. You approve everything before it goes up.',
    how: [
      'He or his techs send job photos or short clips from their phones.',
      'We write the posts: the job, the town, one useful tip, one clear way to reach him.',
      'He approves each post. Nothing goes up without his OK.',
      'The starter month is his to keep and reuse.',
      'If he wants us to keep posting after that, it is part of the optional care plan, priced in writing first.'
    ],
    scenario: 'A tech in Guilford photographs a walk-in cooler he just got running again. We write: "Back up and cold in Guilford before the lunch rush." It goes on Facebook and his Google listing. A restaurant owner two towns over sees it that week.',
    notDo: [
      'We never promise followers, "going viral" or a number of calls.',
      'No stock photos and no made-up reviews. Real jobs only.',
      'No dancing and no trends. Honest "here\'s what we found" posts do best for trades.',
      'We don\'t post prices unless he wants a special promoted.'
    ],
    ask: 'Do you get much time to post your jobs online, or is there never a minute for that?',
    qa: [
      {group:'What it is', items:[
        {q:'What do you need from us?', a:'Mostly photos and short videos from jobs. Your techs can shoot them on their phones in under a minute. We handle the writing.'},
        {q:'Who approves what gets posted?', a:'You do. Every post, for as long as you like.'},
        {q:'What\'s free and what isn\'t?', a:'The starter month of posts is free and yours to keep. If you want us to keep posting for you after that, it\'s priced in writing first.'},
        {q:'Do we have to dance or do trends?', a:'No. Plain, honest job posts usually do best for trades.'}
      ]},
      {group:'Results', items:[
        {q:'Will social media bring in calls?', a:'It builds trust and keeps your name in front of people, so when the AC dies you\'re the one they remember. I can\'t promise a number of calls.'},
        {q:'How long until we see anything?', a:'Usually a few weeks before you see activity build. Steady results take longer.'},
        {q:'How often would you post?', a:'On an ongoing plan, usually 3 to 5 times a week, more during heat waves and cold snaps. The free starter month gives you a set of posts to begin with.'}
      ]},
      {group:'His worries', items:[
        {q:'What about negative comments?', a:'On an ongoing plan we\'d respond quickly and politely with replies you\'ve approved, and move it to a phone call.'},
        {q:'Will you post our prices?', a:'Only if you want. We can share a tune-up special without listing your pricing.'},
        {q:'Why would I be on TikTok or Reddit?', a:'You don\'t have to be. Facebook and your Google listing matter most for local homeowners. The others are optional.'},
        {q:'Do you run paid ads too?', a:'We can boost a post that\'s already doing well, on a budget you set. That\'s optional and separate.'}
      ]}
    ],
    deeper: [
      'Platform by platform: Facebook is strongest for local homeowners. Instagram short videos reach the most new people. TikTok rewards plain, educational clips. Reddit is for helpful answers only, never ads, and always with disclosure.',
      'What makes a post work: the first line names the problem, the town is in the words, one clear next step, captions on every video.',
      'Timing: tie posts to weather and seasons. AC tune-ups in spring, furnace checks in fall.',
      'Best posting times come from his own page\'s numbers, not a generic chart.'
    ]
  },

  custom: {
    name: 'Custom tools', icon: '⚙', pillar: 'Saves time', paid: true,
    one: 'A small tool that does the one office job that eats an hour of his day.',
    problem: 'Estimates go out and nobody follows up, because everyone is on a job.',
    say15: 'You know that one office job that eats an hour every day? We build a small tool that does just that job, set up around how you already work.',
    say45: 'Every shop has one job that never gets done on time: chasing estimates, renewing maintenance plans, asking for reviews, turning tech notes into invoices. We look at how you do it today and build a small tool that does that one thing for you. It\'s custom work, so it\'s quoted up front, and it usually takes one to two weeks.',
    how: [
      'He names the headache himself. We never suggest he has one.',
      'In the 15 minutes we ask how he handles it today.',
      'We send a fixed quote in writing.',
      'We build, test and launch it, usually in 1 to 2 weeks.'
    ],
    scenario: 'He says, "Honestly, I send ten estimates a week and never call any of them back." You say, "We build small tools for exactly that. Happy to show you in the 15 minutes."',
    notDo: [
      'It is never free. Say so the first time it comes up.',
      'Nothing is pre-built. Never say "we have a tool for that".',
      'Don\'t raise it on the first call unless he names a problem himself.'
    ],
    ask: 'Only if he brings it up: "How do you handle that today?"',
    qa: [
      {group:'The basics', items:[
        {q:'Could you build something for how we schedule?', a:'Probably, yes. That\'s custom work, quoted up front, usually one to two weeks. Happy to look at it in the 15 minutes.'},
        {q:'Is that free too?', a:'No. The starter set is free. Custom tools are quoted up front, in writing, before any work starts.'},
        {q:'What kind of things do you build?', a:'Small things that save office time: plan renewals, estimate follow-up, review requests after a job, tech notes turned into invoices.'},
        {q:'Will it work with my software?', a:'We\'d need to look at what you use first. I don\'t want to promise that until we\'ve checked.', check:'Never promise an integration on the call.'}
      ]}
    ],
    deeper: [
      'This is the largest long-term value we offer, because it removes work every single day. It is also the one thing that must be earned: he has to name the problem.',
      'Our proof here is our own work for Absolute Transportation, a company one of our partners runs. Say that plainly if asked.'
    ]
  },

  /* What the evidence proves, what it does NOT prove, and what never to say. */
  evidence: {
    phone: {shows:'What his site and Google say about hours and who gets help after hours.', not:'It does not prove he misses calls or loses customers. He may have a great system we can\'t see.', never:'"You\'re missing calls." Or anything from a bad review.'},
    site:  {shows:'What a homeowner sees in the first screen on a phone, and how fast it loads.', not:'It does not prove customers leave, or that he is unhappy with his site.', never:'"Your site is slow / old / broken." Offer one fix as a favor, later, if he\'s interested.'},
    found: {shows:'Where he appears on the map and in AI answers for searches we ran on the date shown.', not:'It does not prove he is losing jobs. Results change by day and by where the searcher is.', never:'"You don\'t show up on Google." Say "I can send you what I saw."'},
    social:{shows:'When his pages last posted and what they show.', not:'It does not prove his customers care about social media.', never:'"Your Facebook is dead."'}
  },

  /* Live branches: tap what he just said. Answers reuse the offer card. */
  branches: [
    {key:'yes', label:'He\'s interested', means:'He sees something useful.', not:'It is not a yes to buying anything.', say:'Great. The easiest next step is 15 minutes where I show you what we made. Would tomorrow morning or the day after in the afternoon work better?', stop:'Book the time, get the email, say thanks, hang up. Don\'t keep selling.'},
    {key:'catch', label:'What\'s the catch?', q:'catch', means:'He is checking if you\'re honest. That is a good sign.', not:'It is not a rejection.', stop:'Answer once, then stop talking.'},
    {key:'allset', label:'Already has someone', q:'allset', means:'He has a solution he trusts today.', not:'It does not mean every gap is covered.', stop:'Ask one question about a different area. If that\'s covered too, thank him and go.'},
    {key:'proof', label:'Wants proof', means:'He has been burned before, or he is careful.', not:'He is not calling you a liar.', say:'Fair to ask. We\'re new here, so I\'d rather show you than tell you. That\'s why what we make is free: you judge it on your own results, not our promises.', stop:'Offer the 15 minutes once.'},
    {key:'price', label:'What does it cost?', q:'price', means:'He is interested enough to check the risk.', not:'He is not asking for a price list.', stop:'Don\'t quote numbers that aren\'t set.'},
    {key:'busy', label:'Too busy now', q:'busy', means:'It\'s a bad moment. That is all.', not:'It is not a no.', stop:'Get a time, call back exactly then.'},
    {key:'email', label:'Just email me', q:'email', means:'He wants control of his time.', not:'It may be a polite brush-off, and that\'s fine.', stop:'Get the email, offer the time once, send it the same day.'},
    {key:'ai', label:'Doesn\'t trust AI', q:'ai', means:'He cares how his customers are treated.', not:'He is not against saving time.', stop:'Offer the demo number so he can hear it himself.'},
    {key:'scam', label:'Is this a scam?', q:'scam', means:'He gets a lot of junk calls.', not:'It is not personal.', stop:'Give him a way to check you out, and offer to let him call you back.'},
    {key:'wrong', label:'Wrong person', means:'You have someone who knows the owner\'s day.', not:'They are not in your way.', say:'No problem, thanks for telling me. Who\'s the best person to ask about that, and when\'s a good time to catch them?', stop:'Get the name and the time. Thank them by name.'},
    {key:'custom', label:'Names a headache', q:'custom', means:'He just told you his real problem. This is the most valuable thing he can say.', not:'It is not a request for a quote today.', stop:'One line, then offer the 15 minutes.'},
    {key:'no', label:'Not interested', means:'Not now, or not for him.', not:'It does not mean you did it wrong.', say:'No problem at all. Thanks for taking the call, and good luck this season.', stop:'Hang up kindly. If he asks to come off the list, do it the same day.'}
  ],

  /* Why each step works: honest about how strong the evidence is. */
  coach: [
    {tone:'Warm and unhurried. Smile before you dial.', principle:'People decide "is this a sales call?" in the first seconds, and once they spot a hidden motive they resist.', source:'Persuasion Knowledge Model (Friestad & Wright, 1994)', level:'Research on persuasion in general, not tested on HVAC calls.', mistake:'Rushing the name and the company, or sounding like you\'re reading.', lift:'You are calling to give something useful. Stand tall, say your name like you\'re proud of it.'},
    {tone:'Curious. Then quiet.', principle:'A specific, true detail shows you did your homework. Asking a real question and following up on the answer makes people like the conversation more.', source:'Huang, Yeomans, Brooks, Minson & Gino (2017), follow-up questions; a correction was published in 2025', level:'Peer-reviewed research on conversations in general. Supportive, not proof for sales calls.', mistake:'Stacking a second question before he answers the first, or turning the compliment into a critique.', lift:'This is the step where you stop performing and start listening. Whatever he says next is a gift.'},
    {tone:'Plain and specific.', principle:'An offer lands best after the person has described the need in their own words.', source:'Neil Rackham, SPIN Selling (1988)', level:'Field research on larger sales plus long practice. Not a controlled test of short calls.', mistake:'Listing features, or offering the thing before he has said anything.', lift:'One gift, one sentence. You know this cold. Say it like you\'re handing him something.'},
    {tone:'Honest and matter-of-fact.', principle:'Free with no reason sounds like a trick. Naming your real motive removes the hidden part.', source:'Persuasion Knowledge Model (Friestad & Wright, 1994); reciprocity (Cialdini)', level:'General research plus practitioner experience.', mistake:'Listing everything we do, or talking past his silence.', lift:'The truth is your strongest line. Say it, then be comfortable in the quiet.'},
    {tone:'Calm and clear. Ask as if yes is normal.', principle:'A specific, small next step is easier to say yes to than "sometime".', source:'Common practice among prospecting coaches', level:'Practitioner advice. We should test it with our own calls.', mistake:'Not asking. Or asking, then filling the silence.', lift:'You\'ve earned the ask. And a kind no is still a good call: people usually like us more than we think they do (Boothby et al., 2018).'}
  ],

  /* Short coach notes shown around the app. Encouragement, never pressure. */
  lifts: [
    'Preparation beats nerves. You have done the homework most callers never do.',
    'You are not interrupting his day. You are offering him something useful.',
    'Every call makes the next one easier. Count the calls, not the yeses.',
    'Slow down by ten percent. Calm sounds like confidence.',
    'One true compliment, one real question. That is the whole craft.',
    'A warm goodbye today is an open door next month.'
  ]
};
