/* =====================================================================
   STARWELL OFFER CARD: the one source of truth.
   The cold-call guide (../starwell-cold-call/) and the Practice Line both
   load this file. Change the offer HERE and both tools change together.
   Tokens filled by each tool: {name} {me} {shop} {town} {close} {day} {time} {day2}
   ===================================================================== */
'use strict';
window.STARWELL_OFFER = {
  updated: 'November 13, 2026',
  changes: [
    'Five steps instead of eight. The guide, the practice line and your prep sheet now use the same five.',
    'We lead with ONE gift that fits the shop, then mention the rest in one line.',
    'The answering line is a free 30-day trial (it costs us to run). Everything else we make is theirs to keep.',
    'We never say "we already built it" unless it exists.',
    'The walkthrough is 15 minutes, and Bobby runs it for now.'
  ],
  example: {name:'Dave', shop:'Hillside Heating', town:'Hamden', close:'5', day:'Tuesday', time:'7:30', day2:'Wednesday', tech:'Mike'},

  /* ------------------------------------------------------------ the goal */
  goal: 'The owner feels noticed and respected, and gladly says yes to 15 minutes.',
  goalWhy: 'We are not trying to sell anything on this call. We are trying to earn 15 minutes with a busy owner who has never heard of us. If he feels respected, he says yes or he says no kindly and would take our call again. Both are wins.',

  /* ------------------------------------------------------------ the five steps */
  steps: [
    {key:'hello', thinks:'"Who is this, and what do they want?"', n:1, name:'Hello', time:'10 seconds',
     stages:['greet','reason'],
     goal:'He knows who you are and why you are calling, in ten seconds.',
     say:[
       {who:'you', t:'Hi, is this {name}? Hey {name}, this is {me} with StarWell, here in Connecticut. Heating season\'s on, so I\'ll be quick.'},
       {who:'him', t:'Okay. What can I do for you?'},
       {who:'you', t:'We help Connecticut HVAC shops get found and catch more calls, and I had one question about {shop}.'}
     ],
     why:[
       'An unknown number makes an owner think "sales or spam?" before you say a word. Your name, StarWell and Connecticut answer "who is this?"',
       'One plain reason answers his next thought: "what do they want?" Gong studied hundreds of millions of sales calls: callers who simply said why they were calling did about twice as well as callers who didn\'t.',
       '"I\'ll be quick" respects his time before you take any of it, and then you keep that promise.'
     ],
     owner:'He is on a roof, in a basement or driving between jobs. In the first ten seconds he decides one thing: is this person going to waste my time? A real name, a local company and one honest reason tell him no.',
     avoid:['"This is a cold call" (our rule: never say it)','"Did I catch you at a bad time?" It hands him an easy way out.','Anything about free help yet. He doesn\'t know you.','A long company speech. One sentence, then the question.'],
     ifHe:[
       {he:'I\'m on a job right now.', you:'Totally get it. Can I call you back at 4:30, or is tomorrow morning better?', why:'Respecting "I\'m busy" is the whole message. A specific time keeps the door open.'},
       {he:'Who is this again?', you:'{me}, with StarWell. We\'re a small Connecticut team that helps HVAC shops.', why:'Answer it calmly and plainly. Repeating it slowly sounds sure, not pushy.'}
     ]},

    {key:'notice', thinks:'"Did they actually look at my shop, or is this a script?"', n:2, name:'Notice & ask', time:'30 to 60 seconds',
     stages:['noticed','follow'],
     goal:'Show you looked at his shop, then ask one real question and listen.',
     say:[
       {who:'you', t:'I was looking at {shop}. People mention {tech} by name in your reviews.'},
       {who:'you', t:'Can I ask you one thing? When you\'re out on a job or after you close at {close}, what happens when a customer calls?'},
       {who:'him', t:'Goes to voicemail, mostly. I call them back in the morning.'},
       {who:'you', t:'Got it. And on a cold Saturday night, how does that usually go?'}
     ],
     questions:{
       phone:'When you\'re out on a job or after you close, what happens when a customer calls?',
       site:'When someone finds you online at night, how do they usually reach you or book?',
       found:'How do most of your new customers find you these days?'
     },
     why:[
       'One specific detail he can check (a review, his hours, a service) proves you did homework. General praise sounds like flattery.',
       'Ask instead of tell. If you say "you\'re missing calls", he defends himself. If he tells you, he believes it, because people trust problems they name themselves.',
       'The follow-up on his own words is where he feels heard. Harvard researchers (Huang and colleagues, 2017) found people who ask follow-up questions are liked more.',
       'His answer tells you which gift to lead with. Prep picks your best guess; the call confirms it.'
     ],
     owner:'"They actually looked at my shop." Then: "They\'re asking, not telling me I\'m doing it wrong." He is proud of what he built. A real question gives him the floor, and most people enjoy talking about their own work more than callers expect.',
     listenFor:[
       {heard:'Voicemail, missed calls, "I call them back in the morning"', lead:'phone'},
       {heard:'Old website, "people call to book", "nobody uses the site"', lead:'site'},
       {heard:'"Word of mouth", "not sure how they find us", competitors showing up', lead:'found'}
     ],
     avoid:['Telling him he has a problem ("you\'re losing calls at night")','Over-the-top praise ("I love what you guys do!")','Trick questions that trap a yes ("You\'d want more customers, right?")','Talking when he starts talking. Let him finish.'],
     ifHe:[
       {he:'We have an answering service. It\'s fine.', you:'That\'s great. How do they handle the no-heat calls on a busy night?', why:'Agree first, then stay curious. No argument means nothing to defend.'},
       {he:'Why are you asking?', you:'Fair question. We help with exactly this, and I\'d rather understand how you do it before I say anything.', why:'Honest and humble. You earn the right to talk by asking first.'}
     ]},

    {key:'gift', thinks:'"Does this fit what I just told them?"', n:3, name:'The one gift', time:'20 seconds',
     stages:['offer'],
     goal:'Offer ONE thing that fits what he just told you.',
     say:[
       {who:'you', t:'That\'s actually what we help with.'},
       {who:'you', t:'(Then the line for the ONE gift that fits, below.)'}
     ],
     why:[
       'One small, specific thing that fits his own words is easy to picture and easy to say yes to. "That\'s what we help with" proves you listened.',
       'A big list sounds too good to be true and turns the call into a pitch. Owners hang up on pitches, not on help.',
       'Something he can try himself (call a demo number, read one page about his shop) is easier to trust than anything you describe.'
     ],
     owner:'"That\'s exactly what I just told him about." One thing he can check from the couch feels safe. Five services in a row feels like every sales call he has ever hung up on.',
     avoid:['Jargon: SEO, AEO, GEO, AI agent, leads, funnel','"We already built it for you", unless it truly exists','Promises nobody can keep: "first page", "never miss a call", "double your calls"','Criticizing his website, his nephew or his answering service'],
     ifHe:[
       {he:'Huh. How does that work?', you:'Give the "what it is" in two sentences (see the gift), then: "Easier to show you than tell you."', why:'Curiosity is a yes in disguise. Keep it short and steer to the 15 minutes.'}
     ]},

    {key:'rest', thinks:'"Okay, what do they get out of it? What\'s the catch?"', n:4, name:'The rest, and why it\'s free', time:'15 seconds',
     stages:['rest','questions'],
     goal:'Mention the rest in one line, say honestly why it\'s free, then stop and answer his question.',
     say:[
       {who:'you', t:'It\'s part of a small free starter set we\'re doing for Connecticut shops, {others} too.'},
       {who:'you', t:'Honest reason: we\'re new here, and we\'d rather earn real results and honest reviews than make a quick sale.'},
       {who:'you', t:'(Then stop talking. His question comes next. Answer it straight.)'}
     ],
     why:[
       'Free with no reason makes people imagine a catch. Researchers call it persuasion knowledge: when people sense a hidden motive, they resist. Naming your real motive takes the hidden part away.',
       '"We\'re new and want honest reviews" is a motive every small-business owner understands. He was new once too.',
       'One line about the rest plants the seed without turning the call into a pitch. If he\'s curious, he will ask, and then it\'s his idea.',
       'His question (the catch, the price, "do I keep it?") is a good sign. People only ask about things they are considering.'
     ],
     owner:'"Okay, so what do they get out of it?" gets answered before he asks it. Hearing the real reason, plus "honest reviews", sounds like a person being straight with him, not a script.',
     avoid:['Listing every service in detail','"There\'s no catch, I promise" (a promise with no reason)','"Free for now" (sounds like bait and switch)','Arguing with his question'],
     ifHe:[
       {he:'What\'s the catch?', you:'{catchLine}', why:'Agree it\'s fair, give the real reason and the real terms, then stop.'},
       {he:'Do I get to keep it?', you:'{keepLine}', why:'The exact terms, said first and plainly, are what keep us from ever sounding sketchy later.'}
     ]},

    {key:'invite', thinks:'"Is this small, specific, and easy to say no to?"', n:5, name:'Next step', time:'15 seconds',
     stages:['next','thanks'],
     goal:'Ask for 15 minutes at a specific time, and his email. Then a warm goodbye, whatever he says.',
     say:[
       {who:'you', t:'No commitment at all. Could I show you in 15 minutes? Would {day} at {time} or {day2} afternoon work?'},
       {who:'you', t:'And what\'s the best email to send it to?'},
       {who:'you', t:'Thanks, {name}. I\'ll send it today. Good luck with the cold nights.'}
     ],
     why:[
       'A specific time is easier to say yes to, and it actually happens. "Sometime this week" almost never does.',
       'Two choices let him decide without a yes-or-no wall.',
       'Saying "no commitment" and meaning it lowers pressure. Studies of the "but you are free to say no" technique found that reminding people of their choice roughly doubles how often they say yes.',
       'The email turns the call into something real. Send the recap the same day, with the terms in writing.',
       'A warm goodbye after a no protects StarWell\'s name. Owners talk to each other.'
     ],
     owner:'"Fifteen minutes, he named a time, nothing to sign." Small and specific feels easy. And if he says no, a kind goodbye means he would take your call again in the spring.',
     avoid:['Pushing after a polite no','Fake deadlines ("this week only")','"I\'ll follow up" with no date','A long goodbye'],
     ifHe:[
       {he:'Just send me an email.', you:'Happy to. What\'s the best email? And so it doesn\'t sit in your inbox, could I take 15 minutes {day} at {time} to walk you through it?', why:'Say yes to his request, then add one small, specific time.'},
       {he:'Not right now. Maybe after the season.', you:'Totally fair. Would early spring be better? I\'ll send it now so it\'s waiting for you.', why:'He asked for later, so honor it exactly. That\'s how a no becomes a yes in March.'}
     ]}
  ],

  /* ------------------------------------------------------------ the gifts */
  gifts: {
    phone: {key:'phone', name:'The answering line', short:'Picks up when you can\'t.',
      others:'a fresh website and help showing up on Google and ChatGPT',
      what:'A phone line trained on the shop: its services, hours and service area. When the owner can\'t pick up (on a job, after hours), it answers, handles the basics, takes the caller\'s name, number and problem, and sends the owner the details right away so he can call back. It starts on its own demo number, so nothing touches his phones.',
      say:'We set up an answering line trained on your company. It picks up when you can\'t, answers the basics, and sends you the job details right away. You can call the demo number yourself first and hear it.',
      feels:'Peace of mind: customers are taken care of without him answering every call himself.',
      value:'Fewer missed calls, faster replies to no-heat emergencies, less time chasing voicemails.',
      truth:['Say "answers and sends you the details". Only say it books appointments if it\'s connected to his calendar.','If a caller asks, it says it\'s an automated assistant for the shop. It never pretends to be him.','Nothing touches his real phone line unless he says yes.'],
      before:'Nothing. We build it after he says yes.',
      after:'We set it up on a demo number, he calls it, tells us what to change, and approves it before any real customer hears it.',
      terms:'The demo number is free to try, with no limit. The live line is a free 30-day trial on his real after-hours calls, with a minute cap written in the email. After that it pauses unless he chooses a plan. He keeps the call recordings, transcripts and the setup.',
      termsShort:'a free 30-day trial, then your choice',
      whyTrial:'Every minute of a live call costs us money, so it\'s a trial, not a forever gift. Saying that up front is what keeps us honest.'},
    site: {key:'site', name:'The website', short:'Turns visitors into booked jobs.',
      others:'help showing up on Google and ChatGPT, and an answering line for late calls',
      what:'A modern, fast website built for phones: clear services, service area, real reviews and photos, and an easy "request service" button. Built from his real business information and his own job photos.',
      say:'We build you a modern website that\'s easy to get around, builds trust, and makes it simple for homeowners to request service. We\'d make the first version for {shop} at no cost, and it\'s yours to keep.',
      feels:'Confidence that his website brings in customers even while he\'s busy running the business.',
      value:'More service requests, installation estimates and maintenance bookings, because visitors trust the shop and can act fast.',
      truth:['Never criticize his current site. Say the new one is built for how people look for help now: on their phone, often at night.','No promises about how many calls it will bring.','Nothing goes live until he approves it.'],
      before:'Only if Bobby made a homepage preview for this shop. Mention it only if it exists.',
      after:'We finish it with his photos and details, he reviews it, and nothing goes live until he approves.',
      terms:'Free and his to keep: the files, and the web address in his name. We host it free for the first year. Changes after launch are part of the optional care plan.',
      termsShort:'yours to keep'},
    found: {key:'found', name:'Getting found', short:'Show up on Google and in AI answers.',
      others:'a fresh website and an answering line for late calls',
      what:'Helping the shop show up when people search Google, look at the map, or ask ChatGPT or another AI assistant for an HVAC company nearby. It starts with the one-page search check, then a free starter pack: a page for each main service and top town written from real jobs, answers to the questions customers actually ask, and a tuned Google Business Profile.',
      say:'When someone searches Google or asks ChatGPT for an HVAC company near {town}, we help make sure {shop} has a better chance of showing up. I can send you a one-page check of where you show up today, free.',
      feels:'Confidence that more homeowners can find his business right when they need help.',
      value:'More local visibility, more calls for repairs, installs and maintenance, and less reliance on paid ads.',
      truth:['Never promise rankings or "first page". Say "a better chance of showing up".','Pages are written from his real jobs, not mass-produced. Google treats mass-produced pages as spam.','He approves every page before it\'s published.'],
      before:'The one-page search check, if you made it during prep.',
      after:'We send the search check, then build the starter pack with his approval on each page.',
      terms:'Free starter pack, his to keep. Ongoing work is the optional growth plan, priced in writing first.',
      termsShort:'yours to keep'}
  },

  searchCheck: {
    name:'The one-page search check',
    what:'One page we put together about the shop, showing how it shows up today when a homeowner looks for help. It takes about 15 minutes to make, and it\'s free.',
    includes:[
      'Where the shop appears for 2 or 3 real searches, like "furnace repair {town}" and "AC repair near me", on Google and on the map',
      'What ChatGPT and Google\'s AI answer say when asked for an HVAC company in that town, and whether the shop is named',
      'Its reviews next to the shops that show up first (how many, and the rating)',
      'Its Google Business Profile basics: hours, services and photos filled in, or not',
      'Three plain fixes, most useful first'
    ],
    why:'It is the easiest gift to say yes to: no setup, nothing to approve, just useful facts about his own shop. It also shows exactly where the website and search help would make a difference, so the walkthrough has something real to talk about.',
    owner:'"Huh, that\'s where I show up." Most owners have never seen this about their own business. It\'s about him, not us, and he keeps it.'
  },

  /* ------------------------------------------------------------ free, honestly */
  free: {
    keep:['The website (files and web address in his name, hosting free for the first year)','The service and town pages, and the answers to customer questions','The one-page search check','Google Business Profile tuning'],
    trial:['The answering line: free demo number anytime, then a free 30-day live trial with a minute cap'],
    notFree:['Custom tools built for his shop: a fixed quote up front, usually 1 to 2 weeks to build','Ongoing care, search work or the live answering line after the trial: priced per shop, in writing first'],
    line:'The website, the pages and the search check are yours to keep. The one thing that costs us to run is the answering line, so that\'s a free 30-day trial. After that it\'s completely your call. No card, nothing automatic.',
    reason:'We\'re new here, and we\'d rather earn real results and honest reviews than make a quick sale.',
    rules:['No card, ever, for anything free.','Nothing renews or starts charging on its own.','The terms go in the follow-up email the same day.','Nothing goes live without his OK.']
  },

  /* ------------------------------------------------------------ the 15 minutes */
  walkthrough: {
    sentence:'We show you what we made, ask how your week runs, and you decide if you want any of it. No pressure, no card.',
    who:'Bobby runs the walkthrough for now. Your job on the call is to book it and get the email.',
    agenda:[
      {t:'Show what we made', d:'The gift that fits, live on screen: the search check, the site preview, or the demo line.'},
      {t:'Ask how his week runs', d:'Calls, booking, how customers find him, what eats his time. This is where custom tools come up, if they do.'},
      {t:'Plain terms', d:'What is his to keep, what is a trial, and what costs money later, in writing.'},
      {t:'He decides', d:'A next step only if he wants one.'}
    ]
  },

  custom: {
    when:'Not on the first call, unless he names a problem himself.',
    line:'We also build small tools for exactly that. Happy to show you in the 15 minutes.',
    terms:'Custom tools are quoted up front and usually take 1 to 2 weeks to build, test and launch.'
  },

  /* ------------------------------------------------------------ owner questions */
  questions: [
    {key:'catch', q:'What\'s the catch?', a:'Fair question. We\'re new here, and we\'d rather earn real results and honest reviews than make a quick sale. {termsLine} No card, nothing to sign.',
     why:'Agree it\'s fair, then give the real reason and the real terms. Suspicion feeds on what\'s left unsaid.', owner:'He has been burned before. A plain reason plus plain terms is what a trustworthy person sounds like.'},
    {key:'keep', q:'Do I get to keep it?', a:'The website, the pages and the search check are yours to keep, with the web address in your name. The answering line is the one exception: it\'s a free 30-day trial, then your choice.',
     why:'Exact terms, said first, mean nothing surprises him later.', owner:'"Yours to keep" is the opposite of what he expects from a cold call, so say it exactly and never stretch it.'},
    {key:'forever', q:'Is the answering line free forever?', a:'No, and I\'d rather tell you now. The demo number is free to try anytime. The live line is a free 30-day trial, because every call costs us to run. After that it\'s your call. No card, and you keep the recordings and the setup.',
     why:'Telling him the limit before he finds it is what makes everything else you said believable.', owner:'Owners trust the person who tells them the downside first.'},
    {key:'price', q:'What\'s this going to cost me?', a:'What I mentioned is free. If you ever want ongoing help, it\'s priced per shop, and you\'d get it in writing first. No surprises.',
     why:'A calm, straight answer builds trust. "We\'ll talk about that later" sounds like hiding.', owner:'He hears a dodge as "it\'s expensive". He hears a straight answer as "they respect me".'},
    {key:'walk', q:'What happens in the 15 minutes?', a:'We show you what we made, ask how your week runs, and you decide if you want any of it. No pressure, no card.',
     why:'Knowing exactly what happens makes a small yes easy.', owner:'He is guarding his time. A clear, short agenda tells him you will guard it too.'},
    {key:'ai', q:'Is this AI? I don\'t trust that stuff.', a:'Smart to ask. What you\'d see is simple: calls you miss get answered, and you get the details. It runs on its own number first, and nothing touches your phones unless you say yes.',
     why:'Talk about what he gets and controls, not the technology. Control lowers fear.', owner:'His worry is his customers getting a bad experience. Control and a test number answer that.'},
    {key:'scam', q:'How\'d you get my number? Is this a scam?', a:'Smart to ask. It\'s on your website and your Google listing. We\'re StarWell, here in Connecticut. Nothing to pay, nothing to sign, no logins. Look us up, and call me back on this number if you\'d rather.',
     why:'Say where you found the number. Named sources feel normal; hidden ones feel creepy.', owner:'He gets scam calls every week. Specifics and an easy way to check you calm him down.'},
    {key:'allset', q:'We\'re all set. My nephew does our website.', a:'That\'s great, sounds like you\'re covered there. Can I ask, when calls come in after you close, who picks those up?',
     why:'Agree first, then ask about a different gap. No argument, nothing to defend.', owner:'You just respected his family. Now he\'s willing to answer one more question.'},
    {key:'agency', q:'We paid a marketing company before. Got nothing.', a:'That\'s frustrating, and I\'m sorry that happened. That\'s exactly why what we make is free and yours to keep. You\'d judge it on your own results, not our promises.',
     why:'Acknowledge the pain, then remove the risk.', owner:'He is waiting for the same promises that burned him. Hearing none is what makes him listen.'},
    {key:'wordofmouth', q:'Ninety percent of my work is word of mouth.', a:'That\'s the best kind. When a neighbor recommends you, people still look you up before they call. This makes sure what they find matches what your neighbor said.',
     why:'Honor what he\'s proud of, then show how the gift protects it.', owner:'His reputation is his life\'s work. You just agreed with him.'},
    {key:'email', q:'Just send me an email.', a:'Happy to. What\'s the best email? And so it doesn\'t sit in your inbox, could I take 15 minutes {day} at {time} to walk you through it?',
     why:'Say yes to the request, then add one specific time.', owner:'"Send me an email" is often a polite exit. A small, specific time makes it a real next step.'},
    {key:'busy', q:'I\'m on a job right now.', a:'Totally get it, I\'ll be quick. Can I call you back at 4:30, or is tomorrow morning better?',
     why:'Respecting his time is the whole message.', owner:'Everyone else keeps talking. You stopped. He remembers that.'},
    {key:'custom', q:'Could you build something for how we schedule?', a:'Probably, yes. That\'s custom work, quoted up front, usually one to two weeks. Happy to look at it in the 15 minutes.',
     why:'Say yes honestly, give the terms, steer to the walkthrough.', owner:'He just told you his real pain. Taking it seriously is how a gift becomes a client.'}
  ],

  /* ------------------------------------------------------------ team questions (Dan and RJ) */
  team: [
    {q:'Which do we offer first: one gift or the whole package?', a:'One gift, the one on that shop\'s prep sheet, confirmed by his answer in step 2. Everything else gets one line in step 4. Never list the whole package.'},
    {q:'Is anything built before we dial?', a:'Only what\'s quick to make ahead: the one-page search check, and a homepage preview if Bobby made one. Never say "we built it" unless it exists. The answering line and custom tools are built after he says yes.'},
    {q:'When does custom software come up?', a:'Not on the first call, unless he names a problem himself. Then one line: "We also build small tools for exactly that. Happy to show you in the 15 minutes."'},
    {q:'How much do I need to know about the 15 minutes?', a:'One sentence: "We show you what we made, ask how your week runs, and you decide if you want any of it." Bobby runs the walkthrough for now. Knowing the four parts (show, ask, terms, decide) is plenty.'},
    {q:'Is the demo line just a sample, or does it answer his real calls? Does he keep it?', a:'Both, in order. First a demo number he calls himself: free, no limit. Then, if he wants it, a free 30-day trial on his real after-hours calls. After that it pauses unless he chooses a plan. He keeps the recordings and the setup.'},
    {q:'Which tool do I use for what?', a:'The guide is for knowing what to say and why. The practice line is for saying it out loud until it sounds like you. Both use this same call card.'},
    {q:'What if the guide and the practice line ever disagree?', a:'They can\'t anymore: both read the same offer file. If something still looks off, tell Bobby. The offer card at the top of the guide shows the date it last changed.'}
  ],

  /* ------------------------------------------------------------ words */
  words: [
    {say:'the answering line', not:'AI voice agent, AI receptionist bot'},
    {say:'showing up on Google and ChatGPT', not:'SEO, AEO, GEO'},
    {say:'the one-page search check', not:'audit, analysis'},
    {say:'a fresh website', not:'website revamp, redesign of your bad site'},
    {say:'15 minutes', not:'demo, presentation, meeting'},
    {say:'a small free starter set', not:'package deal, bundle, special offer'},
    {say:'yours to keep / a free 30-day trial', not:'free for now, free forever (for the answering line)'}
  ],

  rules: [
    'Never say "this is a cold call".',
    'Ask before you tell. He names the problem, not you.',
    'One gift first. The rest in one line.',
    'Every promise is true: no rankings, no "never miss a call", no "we built it" unless it exists.',
    'Say the terms before he asks: yours to keep, or a 30-day trial.',
    'No card, no contract, nothing automatic, ever, for anything free.',
    'A no gets a warm goodbye the same day, and he comes off the list if he asks.',
    'Nothing goes live without his OK.'
  ]
};

/* helpers both tools use */
window.STARWELL_OFFER.fill = function(t, v){
  v = Object.assign({}, window.STARWELL_OFFER.example, {me:'[your name]'}, v || {});
  const O = window.STARWELL_OFFER, g = O.gifts[v.lead || 'phone'];
  const extra = {
    others: g.others,
    termsLine: v.lead === 'phone' ? 'The answering line is a free 30-day trial, then it\'s your call.' : v.lead ? 'What we make is yours to keep.' : 'What we make is yours to keep, and the answering line is a free 30-day trial.',
    keepLine: O.questions.find(q => q.key === 'keep').a,
    catchLine: O.questions.find(q => q.key === 'catch').a
  };
  const all = Object.assign(extra, v);
  let out = String(t || '');
  for(let i = 0; i < 2; i++) out = out.replace(/\{(\w+)\}/g, (m, k) => all[k] !== undefined && all[k] !== null && all[k] !== '' ? String(all[k]) : m);
  return out;
};
