/* StarWell Practice Line: people, shops, script library and coaching.
   Everything here is practice data. Shops and owners are invented each call. */
'use strict';

const TEAM = ['Bobby', 'Dan', 'RJ'];
const GUIDE = '../starwell-cold-call/';

/* ---------- Connecticut practice world ---------- */
const TOWNS = ['Wallingford','Hamden','Milford','Branford','Meriden','Shelton','Stratford','Trumbull','Orange','Guilford',
  'Cheshire','Naugatuck','Fairfield','Norwalk','Danbury','Madison','Seymour','Ansonia','East Haven','West Haven',
  'Woodbridge','Derby','Monroe','Southington','Wolcott','Prospect','Clinton','Westbrook','Bethel','Newtown'];
const MEN = ['Craig','Mike','Tony','Steve','Rich','Dave','Joe','Pete','Gary','Lou','Frank','Kevin','Sal','Tom','Ray','Paul','Ed','Vinny','Chris','Mark','Jim','Bob','Nick','Jeff'];
const WOMEN = ['Linda','Maria','Denise','Donna','Gina','Karen','Lisa','Terri','Angela','Michelle','Diane','Sue'];
const LAST = ['Russo','DeLuca','Kowalski','Sullivan','Marino','Brennan','Esposito','Nowak','Gallo','Fitzgerald','Testa',
  'Pelletier','Romano','Carbone','Murphy','Lombardi','Dwyer','Santoro','Ferrante','Kelly','Mancini','Pisani','Doyle','Caruso'];
const SHOP_PATTERNS = [
  s => `${s.last} & Sons Heating and Cooling`,
  s => `${s.town} Comfort Systems`,
  s => `${s.last} Mechanical`,
  s => `${s.last} Heating and Air`,
  s => `Shoreline ${['Air','Comfort','Heating'][s.r3]}`,
  s => `Nutmeg ${['Heating and Cooling','Mechanical','Comfort'][s.r3]}`,
  s => `${s.last} Oil and Heating`,
  s => `${s.first}'s Heating and Cooling`,
  s => `Valley ${['Comfort','Climate','Heating'][s.r3]}`,
  s => `${s.town} Heating and Air`,
  s => `${s.last} Brothers HVAC`,
  s => `All Seasons ${['Mechanical','Comfort','HVAC'][s.r3]}`
];
const TECHS = ['Mike','Jose','Kyle','Danny','Matt','Luis','Ryan','Tyler','Bobby','Eddie','Jake','Anthony'];
const SERVICES = ['boiler repair','furnace repair','oil-to-heat-pump conversions','ductless mini-splits','heat pump installs','AC tune-ups','oil burner service','water heaters'];
const SITUATIONS = [
  {where:'on a roof unit', noise:'(wind on the line)'},
  {where:'in the truck between calls', noise:'(road noise)'},
  {where:'at the supply house', noise:'(people talking in the background)'},
  {where:'in the office doing invoices', noise:''},
  {where:'eating lunch in the van', noise:'(radio playing low)'},
  {where:'just back from a no-heat call', noise:'(door closes)'},
  {where:'in a basement on a boiler', noise:'(burner humming)'}
];
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const TIMES = ['7:00','7:30','4:30','5:30'];

/* ---------- Owner personalities ----------
   base: starting trust (0-100). harsh: how hard weak lines hit. like/dislike: which opener styles land.
   Real calls give you clues, never labels, so prep shows only the clue. */
const ARCH = {
  oldtimer: {
    label:'The old-timer', gender:'m', base:52, harsh:0.8, rate:0.92, pitch:0.85, ages:[58,72],
    clue:'Reviews say he still answers the phone himself and has served the town for decades.',
    how:'Warm, proud, tells short stories. Respect his experience and he opens up. Rush him and he cools off.',
    likesHowBeen:true,
    answer:['{shop}, this is {name}.','{shop}, {name} speaking. How can I help ya?'],
    objections:{wordofmouth:4,catch:3,price:2,ai:3,email:1},
    reveal:{
      voicemail:'After five? It goes to the machine. I check it when I get home. Always have.',
      service:'We use an answering service at night. They take a message, I call back in the morning.',
      cell:'After hours it rings my cell. My wife loves that, believe me.',
      none:'After hours? Well, people call back in the morning, I guess.'},
    pain:['Last week, first cold snap, I bet I missed four or five at night. Two never left a message. Thirty years ago they would have waited for me. Now they just call the next guy.',
          'Funny you ask. Tuesday night a lady called, no heat, went to voicemail. By morning she\'d booked somebody else. Hurts a little.'],
    take:'I\'ve been doing this a long time. I can tell when somebody did their homework.'
  },
  busy: {
    label:'The busy tech-owner', gender:'m', base:36, harsh:1.4, rate:1.12, pitch:1.0, ages:[38,52],
    clue:'Small crew, owner still runs calls himself. Expect noise and short answers.',
    how:'Short on time and patience. Wants the point in one breath. Say why you called, fast, then let him go if he needs to.',
    likesHowBeen:false,
    answer:['Yeah, {name}.','{name}. Who\'s this?','Yeah, go ahead.'],
    objections:{busy:5,email:4,price:2,catch:2},
    reveal:{
      voicemail:'Voicemail. I\'m on jobs all day, I can\'t pick up.',
      service:'Answering service. Half the time they get the address wrong.',
      cell:'It\'s my cell. I\'m answering in a crawlspace half the time.',
      none:'Nobody, man. It just rings.'},
    pain:['Last week? Slammed. Probably missed a bunch. I don\'t even know how many.',
          'Saturday I missed three calls in a row, I was on a boiler. One was a no-heat, I never got her back.'],
    take:'I had like thirty seconds. You either use them or you don\'t.'
  },
  skeptic: {
    label:'The burned skeptic', gender:'m', base:30, harsh:1.5, rate:1.0, pitch:0.95, ages:[45,62],
    clue:'Website footer credits a marketing agency. He may have paid for help before.',
    how:'Got burned by an agency. Every promise sounds like a pitch. Honesty and specifics win. Hype loses fast.',
    likesHowBeen:false,
    answer:['Hello?','{shop}.','Yeah, who\'s calling?'],
    objections:{agency:5,catch:4,scam:3,price:2},
    reveal:{
      voicemail:'Goes to voicemail. And before you say it, I know.',
      service:'We have a service. It\'s fine.',
      cell:'My cell. Why?',
      none:'It rings. If I\'m around, I get it.'},
    pain:['Last week a few came in late. I called them back in the morning. Some had already booked. Whatever, that\'s the business.',
          'Couple of no-heats Friday night. I got one. The other one, I don\'t know.'],
    take:'Everybody promises me the world. I listen for the one thing that\'s actually true.'
  },
  numbers: {
    label:'The numbers guy', gender:'m', base:40, harsh:1.1, rate:1.0, pitch:1.0, ages:[40,58],
    clue:'Uses ServiceTitan-style online booking for some services. Likes data.',
    how:'Analytical. Asks what it costs and how you measure it. Give straight numbers and admit what you don\'t know.',
    likesHowBeen:false,
    answer:['{shop}, {name} speaking.','This is {name}.'],
    objections:{price:5,catch:3,ai:2,allset:2},
    reveal:{
      voicemail:'Voicemail after five. We get maybe fifteen percent of those back.',
      service:'Answering service. Costs me about two-fifty a month and books nothing.',
      cell:'Forwards to the on-call tech\'s cell.',
      none:'We don\'t have a great answer for after hours, honestly.'},
    pain:['Last week we had eleven after-hours calls. I know because I pulled the log. Four booked. A no-heat repair is worth four, five hundred to me, so you do the math.',
          'Our call log says nine missed calls last week, mostly evenings. Average ticket on those is around three-fifty.'],
    take:'I don\'t need a pitch. I need to know what it does, what it costs, and how I\'d know it\'s working.'
  },
  gatekeeper: {
    label:'The office manager', gender:'f', base:44, harsh:1.0, rate:1.0, pitch:1.1, ages:[35,60], gk:true,
    clue:'The owner\'s wife runs the office and answers the main line.',
    how:'She protects the owner\'s time and knows the business better than anyone. Win her respect and she books the meeting for him.',
    likesHowBeen:false,
    answer:['Good morning, {shop}, this is {name}.','{shop}, {name} speaking, how can I help you?'],
    objections:{email:4,catch:3,scam:3,price:2},
    reveal:{
      voicemail:'After I leave for the day it goes to voicemail. {owner} checks it at night if he\'s not too tired.',
      service:'We use an answering service. They\'re okay. They don\'t book anything though.',
      cell:'After hours it forwards to {owner}\'s cell, and he\'s already worked ten hours.',
      none:'Honestly, after five nobody picks up.'},
    pain:['Last week was crazy. I came in Monday to eight voicemails. Three were no-heats from Saturday, and by Monday they\'d gone with someone else.',
          'This week alone I had four people say they called Sunday and nobody answered. I felt terrible.'],
    take:'My job is protecting {owner}\'s time. If you respect mine, I\'ll get you in front of him.'
  },
  modernizer: {
    label:'The second-generation owner', gender:'m', base:46, harsh:1.0, rate:1.08, pitch:1.05, ages:[29,40],
    clue:'Took over from his father a few years ago. Active on Instagram, posts project photos.',
    how:'Into tech, but has heard a hundred AI pitches. Skip buzzwords, show you understand his trade, and he engages fast.',
    likesHowBeen:true,
    answer:['Hey, this is {name}.','{shop}, {name}.'],
    objections:{ai:5,allset:3,price:3,catch:2},
    reveal:{
      voicemail:'Voicemail, but I\'ve been meaning to fix that.',
      service:'My dad set up an answering service years ago. I hate it, honestly.',
      cell:'My cell. I want to get off that.',
      none:'Nothing yet. It\'s on my list.'},
    pain:['Last week I tracked it, actually. Seven missed after-hours calls. I\'ve looked at a few AI answering tools but they all sounded like robots.',
          'First cold night last week, phones went nuts after six. I answered what I could from the couch.'],
    take:'I\'ve heard every AI pitch out there. The ones I listen to actually know HVAC.'
  },
  friendly: {
    label:'The friendly but slammed owner', gender:'m', base:48, harsh:0.9, rate:1.02, pitch:1.0, ages:[42,60],
    clue:'Lots of five-star reviews about friendly service. Peak season right now.',
    how:'Nice, easy to talk to, but swamped. Easy to get a polite yes that means nothing. Get a specific time, not just "sure, send it".',
    likesHowBeen:true,
    answer:['{shop}, {name} here, how can I help ya?','Hey there, {name} speaking.'],
    objections:{email:4,busy:3,wordofmouth:3,price:2},
    reveal:{
      voicemail:'Voicemail after five. I try to call everybody back first thing.',
      service:'Answering service picks up. They\'re nice. They just take messages.',
      cell:'Goes to my cell, and my kids are getting tired of it, ha.',
      none:'Honestly it just rings out after hours.'},
    pain:['Oh, last week? First real cold night, phones were ringing off the hook. I\'m sure we missed some. You can\'t be everywhere.',
          'Saturday night I had my phone at my daughter\'s recital, buzzing the whole time. Couldn\'t get to most of them.'],
    take:'I\'m easy to talk to. That doesn\'t mean I\'ll remember you tomorrow unless you pin something down.'
  }
};

/* ---------- Owner reactions by stage and how good your line was ---------- */
const REACT = {
  opener: {
    best:['Okay. What\'d you notice?','Alright, I\'ve got a minute. Go ahead.','Cold call, huh? At least you\'re honest. What is it?','Okay, you\'ve got thirty seconds. What is it?'],
    ok:['Uh, fine. Do I know you?','Okay... what\'s this about?','Good, I guess. Who is this again?'],
    weak:['Honestly? Kind of a bad time. What do you want?','I\'m in the middle of something. Make it quick.','If you\'re selling something, I\'m not interested.']
  },
  truthOk:['Thanks, appreciate that. {tech}\'s a good guy. So what\'s this about?','Yeah, people like us. What are you calling about?'],
  truthWeak:['Outdated? It works fine. We\'re plenty busy.','Okay, so you called to insult my website?','Huh. Well, nobody\'s complained.'],
  discoverOk:['Mostly word of mouth. Some Google. Why?','Referrals, mostly. And Google, I guess.'],
  discoverWeak:['Everybody wants more calls. What are you selling?','Would I be interested? Depends what it costs. What is it?'],
  giftBest: {
    phone:['Huh. A separate number, so it doesn\'t mess with my phones?','Hm. So I just call it and see?','Okay, that\'s actually interesting.'],
    site:['Okay, that\'s actually interesting.','Huh. You already built it?','Hm. And I don\'t have to do anything?'],
    found:['Okay, I\'d be curious about that, honestly.','Huh. Two other shops come up first?','Hm. That\'s worth a look.']
  },
  gift: {
    best:['Okay, that\'s actually interesting.'],
    ok:['That\'s a lot of stuff.','Okay... so what exactly do I get?','Everybody does websites.'],
    weak:['Ten times? Come on.','I don\'t know what half those words mean.','Yeah, I get these calls every week.']
  },
  handle: {
    best:['Okay. That\'s fair.','Alright, that\'s honest at least.','Okay, I can respect that.'],
    ok:['Hm.','Okay...','If you say so.'],
    weak:['Yeah, that\'s what I figured.','See, that\'s what worries me.','Right. Okay.']
  },
  confused:['Sorry, you cut out there. What?','Say that again? I didn\'t catch it.'],
  tooFast:{drive:'Whoa, slow down a little. I\'m driving.', other:'Whoa, slow down a little. I can barely keep up.'},
  hangup:['Look, I gotta go. Good luck.','I\'m gonna let you go. Not interested.','Alright, I\'m hanging up now. Take care.']
};

/* ---------- Objections he raises after the gift ---------- */
const OBJ = {
  catch:{say:['So what\'s the catch? Nobody gives stuff away free.','Free? What\'s the catch?'], guide:'price', skill:'The catch',
    best:'Fair question. StarWell is new to Connecticut HVAC, and we\'d rather show you than tell you. If you love it, maybe we work together down the road. If not, it\'s still yours.',
    ok:'There\'s no catch, I promise. It\'s totally free.',
    weak:'Well, it\'s free for now, but most people end up upgrading, so...',
    why:{best:'Naming your real motive answers the question he is actually asking: "what does this guy get out of it?" People trust a stated motive more than a promise (Friestad & Wright, 1994).',
         ok:'"I promise" gives him no reason. With no motive stated, his brain fills one in, usually the worst one.',
         weak:'"Free for now" sounds like bait and switch. That is exactly the trap he was listening for.'}},
  price:{say:['Alright, what\'s this going to cost me?','So how much is this?'], guide:'price', skill:'The price question',
    best:'Great question. The package StarWell built is free, and it stays yours. If you ever want us to keep it running, most shops start around $300 to $400 a month, in writing, no surprises.',
    ok:'It depends on a lot of things. We can talk about that later.',
    weak:'For you, I can do a special deal if you decide this week.',
    why:{best:'A real range, said calmly, builds trust. Volunteering cost details raised trust and sales in a field study (Mohan, Buell & John, 2020).',
         ok:'"Later" sounds like hiding. Owners hear a dodge and assume the number is scary.',
         weak:'A rushed "special deal" breaks our rule: no invented deadlines. It turns a helper into a salesman in one sentence.'}},
  allset:{say:['We\'re all set. My nephew does our website.','We\'re good, we already have a guy for that stuff.'], guide:'questions', skill:'"We\'re all set"',
    best:'That\'s great, sounds like you\'re covered there. Can I ask, when calls come in after you close, who picks those up?',
    ok:'No problem. I\'ll just send it over anyway in case it\'s useful.',
    weak:'Honestly, family-built websites usually hurt you on Google.',
    why:{best:'You agree with him first, then ask about a different gap. No argument, so nothing to defend (Carnegie: never say "you\'re wrong").',
         ok:'Polite, but you gave up the conversation. A question would have kept it going.',
         weak:'You just criticized his nephew. Now he is defending family, not listening.'}},
  email:{say:['Just send me an email.','Send me something and I\'ll look at it.'], guide:'step5', skill:'"Just send me an email"',
    best:'Happy to. What\'s the best email? And so it doesn\'t sit in your inbox, could I take fifteen minutes {day} at {time} to walk you through it?',
    ok:'Sure, what\'s the email?',
    weak:'Emails never get read. Can I just tell you about it now?',
    why:{best:'Say yes to his request, then attach one specific time. A when-and-where plan makes follow-through far more likely (Gollwitzer & Sheeran, 2006).',
         ok:'You got the email, but no time. "Send me an email" is often a polite way to end the call.',
         weak:'Arguing with his request tells him you won\'t respect his next "no" either.'}},
  busy:{say:['I\'m on a job right now, man.','I really can\'t talk, I\'m in the middle of something.'], guide:'step1', skill:'"I\'m busy"',
    best:'Totally get it, I\'ll be quick. StarWell put something together for {shop}. Should I email it and call you {day} morning, or is later today better?',
    ok:'Okay, I\'ll call you back sometime.',
    weak:'This will only take two seconds. So basically, we built...',
    why:{best:'Respecting his time is the pitch. Giving him two easy choices keeps the door open.',
         ok:'"Sometime" never happens. Without a time, there\'s no next step.',
         weak:'Ignoring "I\'m busy" proves you don\'t listen. Owners hang up on that.'}},
  ai:{say:['Is this one of those AI robot things? I don\'t want robots talking to my customers.','Wait, is this AI? I don\'t trust that stuff.'], guide:'questions', skill:'"Is this AI?"',
    best:'Smart to ask. With StarWell, what you\'d see is simple: every call you miss gets answered, and you get a text. It runs on a separate test number first, and nothing touches your phones unless you say yes.',
    ok:'It\'s AI, but it\'s really good. It sounds just like a person.',
    weak:'Everyone\'s using AI now. You\'ll fall behind if you don\'t.',
    why:{best:'Talk about what he gets and what he controls, not the technology. Control lowers fear.',
         ok:'"Sounds like a person" can sound like tricking his customers. That worries owners.',
         weak:'Fear-based selling breaks our rule. It also makes you sound like every other pitch he has hung up on.'}},
  agency:{say:['We paid a marketing company two grand a month last year. Got nothing.','I tried one of these SEO companies. Total waste of money.'], guide:'questions', skill:'"We got burned before"',
    best:'That\'s frustrating, and I\'m sorry that happened. That\'s exactly why it\'s free first and it stays yours. You\'d judge it on your own numbers, not our promises.',
    ok:'We\'re not like those guys.',
    weak:'They probably didn\'t know what they were doing. We guarantee first page on Google.',
    why:{best:'Acknowledge the pain, then remove the risk. "Judge it on your own numbers" hands him control.',
         ok:'Every agency says "we\'re not like those guys". It proves nothing.',
         weak:'A ranking guarantee is a promise nobody can keep, and it\'s the same line that burned him.'}},
  wordofmouth:{say:['Ninety percent of my work is word of mouth.','We don\'t really need it. It\'s all referrals.'], guide:'questions', skill:'"It\'s all word of mouth"',
    best:'That\'s the best kind. When a neighbor recommends you, people still look you up before they call. This makes sure what they find matches what your neighbor said. That\'s what StarWell built for you.',
    ok:'Sure, but you could still get more.',
    weak:'Word of mouth is kind of dying, though.',
    why:{best:'You honor what he\'s proud of, then show how the gift protects it. No argument needed.',
         ok:'"You could get more" ignores what he just told you he values.',
         weak:'Telling a proud owner his life\'s work is "dying" ends the call.'}},
  scam:{say:['How\'d you get my number? Is this a scam?','Who gave you this number?'], guide:'questions', skill:'"Is this a scam?"',
    best:'Smart to ask. It\'s on your website and your Google listing. We\'re StarWell, a Connecticut company. Nothing to pay, nothing to sign, no logins. Look us up, and call me back on this number if you\'d rather.',
    ok:'No, no, it\'s legit, I swear.',
    weak:'We have a lot of data on local businesses.',
    why:{best:'Say where you found him. Hidden sources feel invasive; named ones feel normal (Aguirre et al., 2015).',
         ok:'"I swear" is what a scammer would say too. Specifics calm him down; promises don\'t.',
         weak:'"We have data on you" sounds like surveillance. That\'s the creepiest possible answer.'}}
};

/* ---------- Caller lines. {name} = person on the line, {owner} = shop owner ---------- */
const LINES = {
  opener: {
    skill:'Opener', guide:'step1',
    best:['Hi {name}, this is {me} with StarWell, here in Connecticut. This is a cold call, so I\'ll be quick. I was looking at {shop} this morning and noticed one thing I think could help.',
          'Hi {name}, {me} with StarWell, here in Connecticut. I\'ll be honest, this is a cold call, so I\'ll keep it short. The reason I\'m calling: I noticed something about {shop}\'s after-hours calls.'],
    ok:['Hi {name}, this is {me} from StarWell in Connecticut. How have you been? The reason for my call is we put together something free for HVAC shops in {town}.'],
    weak:['Hi, is this the owner? Did I catch you at a bad time? I\'m with StarWell, we help HVAC companies with marketing.'],
    why:{best:'Who you are, that it\'s a cold call, and one reason. Saying the reason for your call is linked to 2.1 times more booked meetings (Gong).',
         ok:'"How have you been?" scored well in Gong\'s data, but to a stranger it can feel fake, so some owners ask "do I know you?". The reason came late and stayed vague.',
         weak:'"Did I catch you at a bad time?" hands him an easy exit. Gong found it made success 40% less likely.'}
  },
  truth: {
    skill:'One true thing', guide:'step2',
    weak:['Honestly, your website looks pretty outdated.'],
    why:{best:'A specific, checkable fact proves you did homework and names a gap without insulting him.',
         ok:'A real compliment is warm, but it didn\'t give him a reason to keep talking.',
         weak:'Criticism makes people defend instead of listen. Point to a fact, never a judgment.'}
  },
  discover: {
    skill:'His week', guide:'step3',
    best:['When that first cold night hit last week, how did the phones go after hours?','Last week, when it got cold, what happened with the calls that came in after you closed?'],
    ok:['How do most new customers find you these days?'],
    weak:['Would you be interested in getting more calls?','You\'re probably losing a ton of calls, right?'],
    why:{best:'"Last week" gets real facts, and letting him describe the problem means he owns it. Adapting to the buyer improves sales performance (Franke & Park, 2006).',
         ok:'A fair question, but general. It gets a general answer.',
         weak:'"Would you be interested" invites a polite guess, and leading questions feel like a setup.'}
  },
  gift: {
    skill:'The gift', guide:'step4',
    best:{
      phone:'StarWell built a demo line that answers like your office, books the call and texts you. It\'s a separate test number, so nothing touches your phones. You can call it tonight.',
      found:'I\'ll send you one page showing how {shop} shows up when people in {town} search or ask their phone, in plain English. It\'s free from StarWell.',
      site:'StarWell built a fresh version of your website, made so people book a call even after hours. It\'s yours either way.'},
    ok:['StarWell does websites, SEO, social media and phone answering. We do all of it for HVAC shops.'],
    weak:['We\'ve got an AI voice agent with GEO and AEO optimization that\'ll get you ten times the leads.'],
    why:{best:'One gift that fits what he just told you, said in owner words. One clear thing beats a list.',
         ok:'A list of services makes him do the work of figuring out what matters. He won\'t.',
         weak:'Jargon makes speakers seem less smart (Oppenheimer, 2006), and "ten times the leads" is a promise we can\'t back.'}
  },
  close: {
    skill:'Email + date', guide:'step5',
    best:['What\'s the best email? I\'ll send it from StarWell within the hour. Could I walk you through it {day} at {time}, before the trucks go out? Fifteen minutes. If it\'s not useful, say so and I won\'t follow up.'],
    ok:['Can I send you some information?'],
    weak:['If you sign up today, I can lock in the free package for you.'],
    why:{best:'Email plus one specific time, and an easy out. A when-and-where plan makes follow-through far more likely (Gollwitzer & Sheeran, 2006).',
         ok:'"Some information" is easy to say yes to and easy to forget. There\'s no next step.',
         weak:'"Sign up today" is invented urgency and breaks our promise that free stays free.'}
  },
  wrap: {
    skill:'Ending', guide:'followup',
    yes:{best:'Perfect. You\'ll have it from StarWell within the hour, {name}. Thanks for your time, and stay warm out there.',
         ok:'Great, talk soon.',
         weak:'Awesome. And if you know any other shop owners, send them my way too.'},
    no:{best:'Totally understand. Thanks for your time, {name}. StarWell\'s here if anything changes. Have a great day.',
        ok:'Okay, no problem. Bye.',
        weak:'Are you sure? It\'s free. You\'d be crazy not to.'},
    why:{best:'Ending warm, and accepting a no gracefully, keeps the door open for next season.',
         ok:'Fine, but a little flat. The last thing he hears is what he remembers.',
         weak:'Pushing after a no, or asking for favors before you\'ve delivered anything, burns the bridge.'}
  }
};

/* Owner's first-person take, used in the report */
const TAKE = {
  opener:{best:'You told me who you were and why you called right away. That\'s why I didn\'t hang up.',
          ok:'I wasn\'t sure if I knew you. It took a second to figure out why you were calling.',
          weak:'"Bad time?" Every call is a bad time. You gave me an easy out.'},
  truth:{best:'You knew something real about my shop. That got my attention.',
         ok:'Nice compliment. I still didn\'t know why you were calling.',
         weak:'You called my website outdated. After that I was looking for a reason to hang up.'},
  discover:{best:'You asked about last week, and I ended up telling you more than I meant to.',
            ok:'Normal question. I gave you a normal answer.',
            weak:'It felt like you were setting me up for a pitch.'},
  gift:{best:'You offered one thing that fit what I\'d just told you. Simple.',
        ok:'That was a lot of stuff at once. I tuned out a bit.',
        weak:'Too many buzzwords. Sounded like every other sales call.'},
  handle:{best:'I threw you a hard question and you gave me a straight answer.',
          ok:'You didn\'t really answer my question.',
          weak:'That answer is exactly what I was worried about.'},
  close:{best:'You asked for something small and specific. Easy to say yes.',
         ok:'You didn\'t ask for anything specific, so I didn\'t commit to anything.',
         weak:'"Sign up today"? That\'s pressure. Hard no.'},
  wrap:{best:'You ended it nice. I\'d take your call again.',
        ok:'It ended a little flat.',
        weak:'The ending left a bad taste.'}
};

/* Hints: nudges, never the full line */
const HINTS = {
  opener:'Three parts: who you are (with StarWell), that it\'s a cold call, and the one reason you\'re calling. Don\'t ask about his time.',
  truth:'Mention one specific fact you found in the prep slides: hours, reviews, booking, social. A fact, never a judgment.',
  discover:'Ask about something that already happened, like last week or the first cold night. Then stop talking.',
  gift:'Offer the one gift that matches what he just told you. Use his words, not tech words. Mention it\'s his to keep.',
  handle:'Thank him for the question, give the honest answer, then hand control back to him.',
  close:'Two things: his email, and one specific day and time for a fifteen-minute walkthrough.',
  wrap:'Warm and short. If he said no, accept it. If yes, confirm what happens next.'
};

/* Delivery coaching */
const DELIVERY = {
  pace:{low:125, high:190, target:'about 150 to 180 words a minute',
    src:'Gong\'s data puts the average sales rep around 173 words a minute, and average reps speed up to about 188 when flustered by an objection.'},
  fillers:['um','uh','umm','uhh','er','ah','like','you know','basically','kind of','sort of','i mean','literally'],
  hedges:['just wanted','just calling','sorry to bother','i was wondering','maybe','i think','hopefully','if that\'s okay','does that make sense']
};
