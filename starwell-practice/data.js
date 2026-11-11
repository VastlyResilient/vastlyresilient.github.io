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

/* ---------- Questions the owner raises after the free help ---------- */
const OBJ = {
  catch:{say:['So what\'s the catch? Nobody gives stuff away free.','Free? What\'s the catch?'], guide:'questions', skill:'The catch',
    best:'Fair question. StarWell is new to HVAC, and we\'d rather show you than tell you. If you like it, we could work together down the road. If not, it\'s still yours.',
    ok:'There\'s no catch, I promise. It\'s totally free.',
    weak:'Well, it\'s free for now, but most people end up upgrading, so…',
    why:{best:'Your real reason answers what the owner is really asking: what do you get out of it?',
         ok:'"I promise" gives no reason, so the owner fills one in, usually the worst one.',
         weak:'"Free for now" sounds like bait and switch, the exact trap the owner was listening for.'}},
  price:{say:['Alright, what\'s this going to cost me?','So how much is this?'], guide:'questions', skill:'The price question',
    best:'Fair question. This is free, and it stays yours. If you ever want ongoing help, it\'s three to four hundred a month, in writing.',
    ok:'It depends on a lot of things. We can talk about that later.',
    weak:'For you, I can do a special deal if you decide this week.',
    why:{best:'A real range, said calmly, builds trust; owners respect a straight number.',
         ok:'"Later" sounds like hiding. Owners hear a dodge and assume the number is scary.',
         weak:'A rushed "special deal" breaks our rule: no invented deadlines. It turns a helper into a salesman in one sentence.'}},
  allset:{say:['We\'re all set. My nephew does our website.','We\'re good, we already have a guy for that stuff.'], guide:'questions', skill:'"We\'re all set"',
    best:'That\'s great, sounds like you\'re covered there. Can I ask, when calls come in after you close, who picks those up?',
    ok:'No problem. I\'ll just send it over anyway in case it\'s useful.',
    weak:'Honestly, family-built websites usually hurt you on Google.',
    why:{best:'You agree first, then ask about a different gap. No argument, so nothing to defend.',
         ok:'Polite, but you gave up the conversation. A question would have kept it going.',
         weak:'You just criticized their nephew. Now the owner is defending family, not listening.'}},
  email:{say:['Just send me an email.','Send me something and I\'ll look at it.'], guide:'next', skill:'"Just send me an email"',
    best:'Happy to. What\'s the best email? And so it doesn\'t sit in your inbox, could I take fifteen minutes {day} at {time} to walk you through it?',
    ok:'Sure, what\'s the email?',
    weak:'Emails never get read. Can I just tell you about it now?',
    why:{best:'Say yes to the request, then add one specific time; a set time actually happens.',
         ok:'You got the email, but no time. "Send me an email" is often a polite way to end the call.',
         weak:'Arguing with the request says you won\'t respect their next "no" either.'}},
  busy:{say:['I\'m on a job right now, man.','I really can\'t talk, I\'m in the middle of something.'], guide:'greet', skill:'"I\'m busy"',
    best:'Totally get it, I\'ll be quick. Should I email you one page about {shop} and call you {day} morning, or is later today better?',
    ok:'Okay, I\'ll call you back sometime.',
    weak:'This will only take two seconds. So basically, we built…',
    why:{best:'Respecting their time is the whole message. Two easy choices keep the door open.',
         ok:'"Sometime" never happens. Without a time, there\'s no next step.',
         weak:'Ignoring "I\'m busy" proves you don\'t listen. Owners hang up on that.'}},
  ai:{say:['Is this one of those AI robot things? I don\'t want robots talking to my customers.','Wait, is this AI? I don\'t trust that stuff.'], guide:'questions', skill:'"Is this AI?"',
    best:'Smart to ask. With StarWell, what you\'d see is simple: calls you miss get answered, and you get a text. It runs on its own phone number first, and nothing touches your phones unless you say yes.',
    ok:'It\'s AI, but it\'s really good. It sounds just like a person.',
    weak:'Everyone\'s using AI now. You\'ll fall behind if you don\'t.',
    why:{best:'Talk about what the owner gets and controls, not the technology. Control lowers fear.',
         ok:'"Sounds like a person" can sound like tricking their customers. That worries owners.',
         weak:'Fear-based selling breaks our rule, and sounds like every call they have hung up on.'}},
  agency:{say:['We paid a marketing company two grand a month last year. Got nothing.','I tried one of these SEO companies. Total waste of money.'], guide:'questions', skill:'"We got burned before"',
    best:'That\'s frustrating, and I\'m sorry that happened. That\'s exactly why it\'s free first and it stays yours. You\'d judge it on your own numbers, not our promises.',
    ok:'We\'re not like those guys.',
    weak:'They probably didn\'t know what they were doing. We guarantee first page on Google.',
    why:{best:'Acknowledge the pain, then remove the risk. "Judge it on your own numbers" hands over control.',
         ok:'Every agency says "we\'re not like those guys". It proves nothing.',
         weak:'A ranking guarantee is a promise nobody can keep, and it\'s the same line that burned them.'}},
  wordofmouth:{say:['Ninety percent of my work is word of mouth.','We don\'t really need it. It\'s all referrals.'], guide:'questions', skill:'"It\'s all word of mouth"',
    best:'That\'s the best kind. When a neighbor recommends you, people still look you up before they call. This makes sure what they find matches what your neighbor said.',
    ok:'Sure, but you could still get more.',
    weak:'Word of mouth is kind of dying, though.',
    why:{best:'You honor what the owner is proud of, then show how the free help protects it.',
         ok:'"You could get more" ignores what they just told you they value.',
         weak:'Telling a proud owner their life\'s work is "dying" ends the call.'}},
  scam:{say:['How\'d you get my number? Is this a scam?','Who gave you this number?'], guide:'questions', skill:'"Is this a scam?"',
    best:'Smart to ask. It\'s on your website and your Google listing. We\'re StarWell, in North Haven. Nothing to pay, nothing to sign, no logins. Look us up, and call me back on this number if you\'d rather.',
    ok:'No, no, it\'s legit, I swear.',
    weak:'We have a lot of data on local businesses.',
    why:{best:'Say where you found the number. Hidden sources feel invasive; named ones feel normal.',
         ok:'"I swear" is what a scammer would say too. Specifics calm people down; promises don\'t.',
         weak:'"We have data on you" sounds like surveillance. That\'s the creepiest possible answer.'}}
};

/* Steps of every call, with the short labels shown in the step bar */
const STEPS = (SCRIPT_LIB.stageOrder || ['greet','reason','noticed','follow','offer','questions','next','thanks']).map(k => [k, SCRIPT_LIB.labels[k] || k]);

/* The owner's take for the report, by how well your line fit them */
const TAKE = {
  reason:{warm:'You told me plainly why you were calling. No games. I appreciated that.', even:'Okay reason. I was still figuring out what you wanted.', cool:'I wasn\'t sure what you were after.'},
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
    src:'Most callers land around 170 words a minute and speed up when nervous.'},
  fillers:['um','uh','umm','uhh','er','ah','like','you know','basically','kind of','sort of','i mean','literally'],
  hedges:['just wanted','just calling','sorry to bother','i was wondering','i think','hopefully','does that make sense']
};

/* the same takes under the new step names */
Object.assign(TAKE, {greet:TAKE.opener, noticed:TAKE.truth, follow:TAKE.discover, offer:TAKE.gift, questions:TAKE.handle, next:TAKE.close, thanks:TAKE.wrap});
