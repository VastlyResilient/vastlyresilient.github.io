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

/* Steps of every call, with the short labels shown in the step bar */
const STEPS = [['opener','Hello'],['truth','Noticed'],['discover','His week'],['gift','The gift'],['handle','Questions'],['close','Send it'],['wrap','Thanks']];

/* The owner's take for the report, by how well your line fit him */
const TAKE = {
  opener:{warm:'You were friendly and got to the point. That\'s why I kept listening.', even:'Nice enough. It took me a second to know why you were calling.', cool:'Polite, but it didn\'t feel like it was meant for me.'},
  truth:{warm:'You noticed something real about my shop. That got me.', even:'Kind words. I still wasn\'t sure where you were going.', cool:'It felt like something you\'d say to any shop.'},
  discover:{warm:'You asked about last week, and I ended up telling you more than I meant to.', even:'Fair question. I gave you the usual answer.', cool:'I wasn\'t sure why you were asking.'},
  gift:{warm:'You offered one thing that fit what I\'d just told you. Simple.', even:'Sounded useful. I needed a second to see how it fit me.', cool:'I wasn\'t sure what I was getting.'},
  handle:{warm:'I asked you something hard and you gave me a straight answer.', even:'Okay answer. Didn\'t totally settle it.', cool:'I still had the same question afterwards.'},
  close:{warm:'You asked for something small and specific. Easy to say yes.', even:'You didn\'t ask for anything specific, so I didn\'t commit.', cool:'I wasn\'t sure what you wanted from me.'},
  wrap:{warm:'You ended it nice. I\'d take your call again.', even:'It ended fine.', cool:'The ending felt a little rushed.'}
};

/* Delivery coaching */
const DELIVERY = {
  pace:{low:125, high:190, target:'about 150 to 180 words a minute',
    src:'Gong\'s data puts the average sales rep around 173 words a minute, and average reps speed up to about 188 when flustered by an objection.'},
  fillers:['um','uh','umm','uhh','er','ah','like','you know','basically','kind of','sort of','i mean','literally'],
  hedges:['just wanted','just calling','sorry to bother','i was wondering','maybe','i think','hopefully','if that\'s okay','does that make sense']
};
