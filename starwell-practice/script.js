/* StarWell Practice Line: conversation script library (reviewer 6).
   Eight stages: greet -> reason -> noticed -> follow -> offer -> questions -> next -> thanks.
   Every caller option is a good, natural line; the three styles differ in HOW, not in quality.
   Every owner reply answers the exact caller line it is attached to.

   Option shape: {style, t, why, tags, owner:{warm,even,cool}, byArch?, gk?, lead?, ownerOnly?}
     gk:true        office-manager variant (refers to the owner in third person); offered only when p.gk
     ownerOnly:true never offered to the office manager
     lead:'phone'   only offered when p.lead matches (questions stage)
   next-stage owner replies are keyed by outcome: {booked, counter, email, later}.
   Owner-reply tokens filled by ownerReply(): {reveal} {pain} {objection} (from `extra`, else from ARCH/OBJ/p.painLine).
   Caller tokens: {name} {owner} {shop} {town} {me} {tech} {close} {rating} {reviews} {day} {day2} {time} {when} {email} {afterShort}
   Assumes globals pick(r, arr) and fill(text, p). Load after data.js / owner.js. */
'use strict';

const SCRIPT_LIB = (() => {
  const W = 'Warm & personal', S = 'Straight & brief', Q = 'Curious & listening';

  /* ------------------------------------------------------------------ GREET
     Owner has just picked up: "Nowak Brothers, this is Angela." */
  const greet = [
    {style:W, tags:['warmup','local'],
     t:"Hi {name}, this is {me} with StarWell, over in North Haven. How's the day treating you?",
     why:"Saying who you are first helped strangers accept calls (Schaeffer et al. 2013); the how-are-you is just manners.",
     owner:{warm:["Busy, but good, thanks. What can I do for you?","Not bad. Cold finally showed up. What's up?"],
            even:["Doing alright. StarWell? What's that?","Good, thanks. What's this about?"],
            cool:["Fine. What's this regarding?"]},
     byArch:{busy:{warm:["Busy. I'm on a job. What's up?"], even:["Slammed, honestly. Who'd you say you were?"]},
             gatekeeper:{warm:["Oh, doing well, thanks. Phones are nuts. What can I do for you?"]},
             oldtimer:{warm:["Well, can't complain. Busy, it's that time of year. What can I do for ya?"]}}},
    {style:W, tags:['warmup','local','respect'],
     t:"Hey {name}, thanks for picking up. I'm {me}, with StarWell over in North Haven. How's your week going?",
     why:"Thanking someone for answering a stranger is plain courtesy, and courtesy is a core rapport behavior (Gremler & Gwinner 2008).",
     owner:{warm:["Ha, it's going. Busy week. What can I do for you?","Pretty good, thanks for asking. What's up?"],
            even:["It's going. Sorry, who are you with?","Alright. What can I do for you?"],
            cool:["It's fine. What's this about?"]},
     byArch:{busy:{warm:["Crazy. First cold week. Go ahead, quick."]},
             gatekeeper:{warm:["It's a week, believe me. What can I do for you?"]}}},

    {style:S, tags:['brief','time','local'],
     t:"Hi {name}, {me} with StarWell, a Connecticut company out of North Haven. I know it's a busy week, so I'll keep this short.",
     why:"Interruptions raise stress and time pressure (Mark et al. 2008), so naming his time respects it.",
     owner:{warm:["Appreciate that. Go ahead.","Yeah, it's nuts. What's up?"],
            even:["Okay. What's this about?","Alright. What can I do for you?"],
            cool:["Okay. Go ahead."]},
     byArch:{busy:{warm:["Appreciate it. I'm on a job, so go."]}}},
    {style:S, tags:['brief','time','local'],
     t:"Hi {name}, it's {me} from StarWell in North Haven. Heating season's on, so I'll be quick.",
     why:"A real local name is honest common ground, a known rapport behavior (Gremler & Gwinner 2008).",
     owner:{warm:["Thanks. Yeah, it's on. What's up?","Appreciate that. Go ahead."],
            even:["Okay. StarWell, what's that?","Sure. What's it about?"],
            cool:["Alright. What is it?"]}},

    {style:Q, tags:['local','trade','warmup'],
     t:"Hi {name}, {me} with StarWell, over in North Haven. First real cold week, how's it been over in {town}?",
     why:"Asking about his world, not yours, signals interest; question-askers are liked more (Huang et al. 2017).",
     owner:{warm:["Ha, busy. Furnaces quitting left and right. What can I do for you?","Phones haven't stopped. What's up?"],
            even:["Busy. It's November. What's this about?","It's been cold. Who are you with again?"],
            cool:["Busy. What do you need?"]},
     byArch:{gatekeeper:{warm:["Oh, the phones haven't stopped since Sunday. What can I do for you?"]}}},
    {style:Q, tags:['local','trade','warmup'],
     t:"Hi {name}, this is {me} with StarWell, out of North Haven. Has the cold kept you guys hopping?",
     why:"Strangers are more willing to talk than we expect, so ask easily (Epley & Schroeder 2014).",
     owner:{warm:["Oh yeah. Every boiler in town picked this week. What's up?","Hopping is right. What can I do for you?"],
            even:["Yeah, it's busy. What's this about?","Sure has. Sorry, StarWell?"],
            cool:["Yeah. What do you need?"]}}
  ];

  /* ------------------------------------------------------------------ REASON
     Owner has asked "What can I do for you?" / "Who's this?" */
  const reason = [
    {style:W, tags:['plain','local'],
     t:"So, we're a small Connecticut team helping local HVAC shops with phones and websites. I had one question for you, if that's okay.",
     why:"A plain reason for the call was linked to about twice the success in Gong's call data.",
     owner:{warm:["Sure, go ahead.","Okay. What's the question?"],
            even:["Alright, one question. Go.","Okay... what is it?"],
            cool:["Depends on the question. Go ahead."]},
     byArch:{busy:{warm:["One question, sure. Go."]},
             skeptic:{even:["Phones and websites. Uh huh. What's the question?"]}}},
    {style:W, tags:['plain','respect','local'],
     t:"I'll be honest, this isn't a service call. We're a North Haven company helping HVAC shops with phones and websites. Can I ask you one thing?",
     why:"Owners expect a customer when the phone rings, so saying it isn't one early is simple honesty.",
     owner:{warm:["Ha, okay. Thanks for saying so. Go ahead.","Sure, ask away."],
            even:["Okay. What's the one thing?","Alright. Go ahead."],
            cool:["Okay. Quick, though."]}},
    {style:W, gk:true, tags:['respect','plain'],
     t:"So, we help local HVAC shops with their phones and websites. I had one question about {shop}. Is that you, or {owner}?",
     why:"Asking whether she's the right person treats her as someone who runs things, not a hurdle.",
     owner:{warm:["Honestly, that's me. I run the office. Go ahead.","You can ask me. I handle all that."],
            even:["Depends. What's the question?","Probably me. What is it?"],
            cool:["{owner}'s out on a call. What's it about?"]}},

    {style:S, tags:['brief','plain','local'],
     t:"Simple reason: StarWell helps Connecticut HVAC shops with phones and websites. I've been looking at shops around {town}, and I have one question.",
     why:"People stay on when they quickly understand why they were called (Gong).",
     owner:{warm:["Okay, shoot. What is it?","Alright, go ahead."],
            even:["Okay. What's the question?","Uh huh. Go ahead."],
            cool:["Okay. One question."]}},
    {style:S, tags:['brief','plain','control'],
     t:"Here's why I'm calling. We help local HVAC shops with phones and websites, and I had one quick question about {shop}. Okay to ask?",
     why:"A direct 'is it okay' beat a hedged 'I was wondering' when calls felt cool (Schaeffer et al. 2013).",
     owner:{warm:["Yeah, go ahead.","Sure, ask away."],
            even:["Okay. What is it?","Go ahead, I'm listening."],
            cool:["Make it quick."]}},
    {style:S, gk:true, tags:['brief','respect'],
     t:"Here's why I'm calling: StarWell helps local HVAC shops with phones and websites. One quick question. Can you help, or is that {owner}?",
     why:"Short and honest, and it lets her decide who answers instead of asking for 'the owner'.",
     owner:{warm:["I can probably help. Go ahead.","Try me. I know more about that stuff than he does."],
            even:["Depends what it is. Go ahead."],
            cool:["What's the question?"]}},

    {style:Q, tags:['local','specific'],
     t:"We help Connecticut HVAC shops with phones and websites. I was looking at shops around {town}, and yours came up. Can I ask something?",
     why:"Context he recognizes, his own town and shop, tells him why him (Gong).",
     owner:{warm:["Sure. Came up how?","Okay. What do you want to know?"],
            even:["Okay. What is it?","Uh huh. Go ahead."],
            cool:["Came up for what? Go ahead."]}},
    {style:Q, tags:['plain','control'],
     t:"Short version: we help local HVAC shops with phones and websites. I'm curious how {shop} handles one thing. Mind if I ask?",
     why:"Asking first hands him control, and curiosity about his shop is what builds liking (Huang et al. 2017).",
     owner:{warm:["No, go ahead.","Sure. What thing?"],
            even:["Okay. What is it?","Okay, go ahead."],
            cool:["Depends. What is it?"]}},
    {style:Q, gk:true, tags:['respect','plain'],
     t:"We help local HVAC shops with phones and websites. I'm curious how {shop} handles one thing. Would you know, or would {owner}?",
     why:"Assuming she knows the business is usually right, and it's respectful.",
     owner:{warm:["Oh, I'd know. Trust me. Go ahead.","Probably me. What is it?"],
            even:["Depends. What's the thing?"],
            cool:["What's it about?"]}}
  ];

  /* ------------------------------------------------------------------ NOTICED (keyed by lead) */
  const noticed = {
    phone: [
      {style:W, tags:['specific','warmup'],
       t:"I was reading your reviews, and people mention {tech} by name a lot. I'm curious, when someone calls after {close}, who picks up?",
       why:"A specific, checkable detail shows real homework; generic praise reads as flattery (Vonk 2002).",
       owner:{warm:["Yeah, {tech}'s great. {reveal}","Ha, everybody loves {tech}. {reveal}"],
              even:["Thanks. {reveal}","Appreciate it. {reveal}"],
              cool:["Hm. {reveal}"]}},
      {style:W, tags:['specific','trade'],
       t:"Your site says the office closes at {close}, and I got curious. When a no-heat call comes in after that, what happens?",
       why:"One true fact plus an honest question invites him to explain his world instead of defending it.",
       owner:{warm:["Good question. {reveal}","Ah, the night calls. {reveal}"],
              even:["{reveal}","Hm. {reveal}"],
              cool:["{reveal}"]}},

      {style:S, tags:['brief','specific'],
       t:"Quick one: {shop}'s office closes at {close}. When a customer calls after that, who answers?",
       why:"One fact, one question, no adjectives; a busy owner can answer in a breath.",
       owner:{warm:["{reveal}","Fair question. {reveal}"],
              even:["Hm. {reveal}","Okay. {reveal}"],
              cool:["{reveal}"]}},
      {style:S, tags:['brief','specific','trade'],
       t:"I saw you close at {close} on weekdays. This time of year, how do calls get handled after that?",
       why:"Plain, checkable and about his season, so it sounds like homework, not a pitch.",
       owner:{warm:["Yeah. {reveal}","Good question, actually. {reveal}"],
              even:["{reveal}","Hm. {reveal}"],
              cool:["{reveal}"]}},

      {style:Q, tags:['trade','specific'],
       t:"I noticed the office closes at {close}. In November, with no-heat calls, how do you handle the ones that come in at night?",
       why:"An open question about his operation gives him the floor; open questions beat feature talk in vendor data (Nooks).",
       owner:{warm:["Ah, the night calls. {reveal}","Good question. {reveal}"],
              even:["{reveal}","Hm. {reveal}"],
              cool:["{reveal}"]}},
      {style:Q, tags:['trade','plain'],
       t:"Your Google listing says you close at {close}. I'm curious, what happens when somebody's furnace quits at nine at night?",
       why:"A concrete scene from his trade is easier to answer than an abstract question about 'after-hours coverage'.",
       owner:{warm:["Ha. Happens more than you'd think. {reveal}","Good question. {reveal}"],
              even:["{reveal}","Okay. {reveal}"],
              cool:["{reveal}"]}}
    ],
    site: [
      {style:W, tags:['specific','plain'],
       t:"I pulled up your site on my phone like a customer would, and couldn't find a way to book at night. Did I miss it?",
       why:"Showing how you checked, and that you might be wrong, makes the fact feel fair, not like criticism.",
       owner:{warm:["No, you didn't miss it. They have to call.","Nope, that's right. People just call us."],
              even:["Probably not. We never set that up.","Yeah, I don't think there is one."],
              cool:["Could be. Most people call anyway."]},
       byArch:{oldtimer:{even:["Probably not. My nephew did that site years ago."]},
               modernizer:{warm:["No, you're right. It's on my list, honestly."]},
               skeptic:{even:["Maybe. Why were you on my site?"]}}},
      {style:W, tags:['specific','warmup'],
       t:"{rating} stars from {reviews} reviews is a lot of happy people. I noticed the site doesn't take bookings after hours. Have customers ever asked?",
       why:"A checkable number is sincere appreciation; then the fact becomes a question about his customers.",
       owner:{warm:["Thanks. A few have, yeah. Mostly younger folks.","Huh, now and then. People like doing it at night."],
              even:["Not really. They just call.","Once in a while, I guess."],
              cool:["Not that I know of."]}},

      {style:S, tags:['brief','specific','control'],
       t:"Quick one: I couldn't find a way to book on {shop}'s site after hours. Is that right, or did I miss it?",
       why:"Short and correctable, so he engages instead of tuning out.",
       owner:{warm:["You didn't miss it. There isn't one.","That's right. People call or email."],
              even:["Yeah, that's right.","I think so, yeah."],
              cool:["Probably. Why do you ask?"]}},
      {style:S, tags:['brief','specific'],
       t:"I checked your site on my phone. There's no way to book after {close}. Is that on purpose, or did it just never get set up?",
       why:"Offering two plain options makes the question easy to answer honestly.",
       owner:{warm:["Never got set up, honestly.","Ha, just never got to it."],
              even:["Never got around to it.","Not on purpose. Just never did it."],
              cool:["We like people to call."]}},

      {style:Q, tags:['plain','control'],
       t:"I tried your site on my phone like a customer at night, and didn't see a booking button. How do people get on your schedule?",
       why:"You share what you saw, then ask him to explain; he stays the expert on his own shop.",
       owner:{warm:["They call, mostly. We call back first thing.","Phone, mostly. Some email through the site."],
              even:["They just call us.","Phone. Always has been."],
              cool:["They call. Works fine."]}},
      {style:Q, tags:['plain','local'],
       t:"I noticed the site doesn't have night booking. I'm curious, do people find you more from the site or from neighbors?",
       why:"A real question about where his work comes from invites a story, not a yes or no.",
       owner:{warm:["Neighbors, mostly. But everybody checks the site first.","Both, honestly. More from Google lately."],
              even:["Mostly word of mouth.","Neighbors. Some Google."],
              cool:["Neighbors. Always has been."]}}
    ],
    found: [
      {style:W, tags:['specific','local'],
       t:"Your reviews are really solid, {rating} stars from {reviews}. When I searched furnace repair in {town}, though, other shops came up first. Noticed that?",
       why:"Crediting what he earned first makes the finding feel unfair to him, not a flaw in him.",
       owner:{warm:["Huh. No, I haven't looked in a while. Who came up?","Yeah, I've seen that. Bugs me, honestly."],
              even:["Huh. Didn't know that.","Doesn't surprise me. We don't do much online."],
              cool:["Most of our work's referrals anyway."]},
       byArch:{skeptic:{warm:["Yeah. I paid somebody to fix that once. Didn't work."]},
               numbers:{warm:["Huh. Where'd we land? I'd want to see that search."]},
               oldtimer:{even:["I don't do the computer stuff. But huh."]}}},
      {style:W, tags:['specific','local'],
       t:"Your reviews stood out around {town}. But on Google Maps, you weren't near the top. Does that match what you see?",
       why:"Asking if it matches his experience lets him confirm or correct it, so the conclusion stays his.",
       owner:{warm:["Huh. I figured we'd be up there. Who's above us?","Yeah, kind of. It's bugged me."],
              even:["I don't really check.","Could be. I never look."],
              cool:["We do fine either way."]}},

      {style:S, tags:['brief','specific','numbers'],
       t:"Quick one: I searched heating repair in {town}, and {shop} wasn't near the top, even with {rating} stars. Did you know that?",
       why:"A fact he can check himself in ten seconds is more believable than any claim.",
       owner:{warm:["No, I didn't. Huh.","Kind of. Didn't know it was that bad."],
              even:["Didn't know. Doesn't shock me.","Hm. No, I didn't."],
              cool:["Okay. And your point is?"]}},
      {style:S, tags:['brief','specific'],
       t:"I asked my phone who fixes furnaces in {town}. Other shops came up before you, and your reviews are better. Ever check that?",
       why:"Plain cause and effect, said the way a homeowner would search, with no marketing words.",
       owner:{warm:["Never. Who came up?","Once, a while back. Didn't love it."],
              even:["Not really, no.","No. Should I?"],
              cool:["No. Don't need to."]}},

      {style:Q, tags:['local','control'],
       t:"When I searched for heating help in {town}, {shop} wasn't the first name. How do most of your new customers find you?",
       why:"Share the fact, then ask about his world; questions about him build liking (Huang et al. 2017).",
       owner:{warm:["Word of mouth, mostly. Some Google. Why, who came up?","Neighbors, mostly. And our trucks around town."],
              even:["Mostly referrals, honestly.","Word of mouth. Some Google."],
              cool:["Referrals. Same as always."]}},
      {style:Q, tags:['specific','control'],
       t:"I looked at how {shop} shows up online. Your reviews are better than the shops listed above you. Does that surprise you?",
       why:"A question, not a verdict, gives a guarded owner nothing to push against.",
       owner:{warm:["A little, yeah. We work hard for those reviews.","Huh. Not totally. But it's annoying to hear."],
              even:["Not really, no.","Eh. Doesn't surprise me."],
              cool:["Not much surprises me."]}}
    ]
  };

  /* ------------------------------------------------------------------ FOLLOW (keyed by lead) */
  const follow = {
    phone: [
      {style:W, tags:['trade','warmup'],
       t:"That makes sense. On a cold Saturday night, when a few of those come in, how does it usually go?",
       why:"Follow-up questions on what he just said predicted liking best of all question types (Huang et al. 2017).",
       owner:{warm:["{pain}","Well... {pain}"],
              even:["Hm. {pain}","{pain}"],
              cool:["Some call back in the morning. Some don't."]}},
      {style:W, tags:['trade'],
       t:"Got it. And when the cold hit last week, how did those nights go for you?",
       why:"Asking about a real recent night gets a story, and stories are where he feels heard.",
       owner:{warm:["{pain}","Ha. {pain}"],
              even:["{pain}","Eh. {pain}"],
              cool:["It works out. Mostly."]},
       byArch:{gatekeeper:{cool:["It works out. Mostly. We call everybody back."]}}},

      {style:S, tags:['numbers','brief'],
       t:"Got it. Roughly how many came in after {close} last week, and how many turned into jobs?",
       why:"Owners guess they answer 97% of calls; the data says about 66% (Service Direct), so ask, don't tell.",
       owner:{warm:["{pain}","Roughly? {pain}"],
              even:["{pain}","Hm. {pain}"],
              cool:["Couldn't tell you exactly."]}},
      {style:S, tags:['brief','trade'],
       t:"Makes sense. When those calls stack up on a cold night, what usually happens to them?",
       why:"One short follow-up on his own words, then you stop talking and let him answer.",
       owner:{warm:["{pain}","Well... {pain}"],
              even:["{pain}","Hm. {pain}"],
              cool:["Some call back. Some don't."]}},

      {style:Q, tags:['control','trade'],
       t:"So after {close}, it's {afterShort}. How did that hold up when the cold hit last week?",
       why:"Repeating his words back shows you heard him before you ask more (Ramsey & Sohi 1997).",
       owner:{warm:["{pain}","Yeah. {pain}"],
              even:["{pain}","Eh. {pain}"],
              cool:["It holds up fine."]}},
      {style:Q, tags:['control','plain'],
       t:"Huh. And on the busy nights, what happens to the people who don't get through?",
       why:"Let him name the cost himself; top sellers ask, they don't tell (Rackham).",
       owner:{warm:["{pain}","Honestly? {pain}"],
              even:["{pain}","Hm. {pain}"],
              cool:["They call back. Or somebody else."]}}
    ],
    site: [
      {style:W, tags:['trade','plain'],
       t:"That makes sense. When someone's furnace quits at night and they find you on their phone, what usually happens next?",
       why:"Following his answer with a concrete scene keeps the talk about his customers, not your product.",
       owner:{warm:["They call, and if nobody picks up, who knows. Probably the next guy.","They call or fill out the form. We get back to them in the morning."],
              even:["They call, I guess. We get back to them.","They leave a message, usually."],
              cool:["They call in the morning."]}},
      {style:W, tags:['trade','warmup'],
       t:"Got it. Do you get a lot of people looking you up at night, after the house gets cold?",
       why:"A simple follow-up about his customers shows you're listening, not steering (Huang et al. 2017).",
       owner:{warm:["More than you'd think. Ten o'clock, house is cold, they're searching.","Oh yeah. Nights and weekends, that's when stuff breaks."],
              even:["Some, I'd guess. Hard to know.","Probably. I don't really track it."],
              cool:["No idea, honestly."]},
       byArch:{numbers:{warm:["About a third of our site visits are after six. I've looked."]}}},

      {style:S, tags:['numbers','brief'],
       t:"Makes sense. Last week, how many people do you think tried to reach you at night and gave up?",
       why:"A direct, honest question; most owners overestimate how many calls they catch (Service Direct).",
       owner:{warm:["Honestly? A few, probably. You never know who gave up.","Hard to say. A couple left messages saying they'd tried."],
              even:["No idea. That's the problem, I guess.","A couple, maybe."],
              cool:["Can't know that."]},
       byArch:{numbers:{warm:["The form got six after hours last week. We booked two."]}}},
      {style:S, tags:['brief','trade'],
       t:"Got it. On a cold Saturday night, if they can't book and nobody picks up, where do they go?",
       why:"Plain cause and effect from his own answer; he names the cost, you don't.",
       owner:{warm:["The next guy on Google, probably. Can't blame 'em.","Somebody else. That's the business."],
              even:["Next company, I guess.","Some wait till Monday. Some don't."],
              cool:["They wait. Or they don't."]}},

      {style:Q, tags:['control','trade'],
       t:"And when they call after {close} looking to book, who usually gets that?",
       why:"Picks up exactly where he left off ('they call'), the kind of follow-up that builds liking (Huang et al. 2017).",
       owner:{warm:["{reveal}","Good question. {reveal}"],
              even:["{reveal}","Hm. {reveal}"],
              cool:["Whoever's around, I guess."]}},
      {style:Q, tags:['control','warmup'],
       t:"That makes sense. What do customers say when they finally get through after trying at night?",
       why:"Asking what customers say lets him describe the problem in his own words (Braun).",
       owner:{warm:["Usually 'finally!' Ha. And sometimes they already booked someone.","Some say they tried last night. You can hear they're annoyed."],
              even:["Nothing much. They just want heat.","They just want somebody out there."],
              cool:["They want it fixed. That's it."]}}
    ],
    found: [
      {style:W, tags:['plain','warmup'],
       t:"That makes sense. When a neighbor recommends you, do people call right away, or look you up first?",
       why:"Builds on what he said about neighbors, so he feels heard rather than corrected.",
       owner:{warm:["Look us up, probably. Everybody googles everything now.","They look us up. Some say they read every review."],
              even:["Probably look us up, I guess.","Depends on the person."],
              cool:["They call. Mostly."]}},
      {style:W, tags:['plain'],
       t:"Got it. When somebody new calls, do they ever mention how they found you?",
       why:"A follow-up about his own customers is easy to answer and shows interest (Huang et al. 2017).",
       owner:{warm:["Yeah, I ask. Mostly neighbors, more Google than it used to be.","Sometimes. A lot say they saw the reviews."],
              even:["Sometimes. Mostly a neighbor.","Don't always ask."],
              cool:["Not really, no."]}},

      {style:S, tags:['numbers','brief'],
       t:"Makes sense. Roughly how much of your new work comes from search versus neighbors these days?",
       why:"Owners who track numbers like being asked for them; a range is fine.",
       owner:{warm:["Maybe a third from Google now. Used to be nothing.","More search every year. Maybe forty percent."],
              even:["Mostly neighbors. Some search.","Couldn't tell you exactly."],
              cool:["Mostly referrals. Always has been."]},
       byArch:{numbers:{warm:["Thirty-eight percent from search last quarter. I track it."]}}},
      {style:S, tags:['brief','trade'],
       t:"Got it. When it's a no-heat at night and they don't know anyone, how do they pick a company?",
       why:"A concrete scene from his trade makes the question about his customers, not your service.",
       owner:{warm:["Whoever comes up first and picks up, honestly.","First name on the phone that answers. That's how it goes."],
              even:["Google, I guess.","Whoever's first, probably."],
              cool:["Beats me, honestly."]}},

      {style:Q, tags:['control','warmup'],
       t:"Interesting. What do new customers usually say about why they picked you over the others?",
       why:"Lets him talk about what he's proud of, which is where a guarded owner relaxes.",
       owner:{warm:["The reviews, mostly. And {tech}. People ask for him by name.","They say a neighbor swore by us."],
              even:["Reviews, I guess.","A neighbor told 'em."],
              cool:["They needed heat."]}},
      {style:Q, tags:['control','plain'],
       t:"Huh. And when your name comes up second or third, do you think people still find their way to you?",
       why:"Lets him weigh the cost himself; you don't argue it (Rackham).",
       owner:{warm:["Some. The ones who read reviews. The rest call whoever's first.","Hard to say. Probably lose a few."],
              even:["Some do, I'd guess.","No idea, really."],
              cool:["We do fine."]}}
    ]
  };

  /* ------------------------------------------------------------------ OFFER (keyed by lead; replies end with {objection}) */
  const offer = {
    phone: [
      {style:W, tags:['plain','specific','local'],
       t:"Honest reason I called: StarWell's new in Connecticut and building local examples. We'd set up a free test line for those night calls.",
       why:"Unexplained free offers trigger 'what's the catch'; a stated reason reduces it (Vonasch et al.).",
       owner:{warm:["Huh. A test line for nights. {objection}","Okay, that's actually interesting. {objection}"],
              even:["Hm. A test line. {objection}","Okay... {objection}"],
              cool:["I get a lot of these calls. {objection}"]},
       byArch:{gatekeeper:{warm:["Huh. That'd save me the Monday voicemail pile. {objection}"]},
               modernizer:{warm:["Okay, I'd try to break it. {objection}"]},
               busy:{warm:["Huh. Something that picks up while I'm under a house? {objection}"]}}},
      {style:W, tags:['control','specific'],
       t:"Can I offer something small? We'd set up a free test line on a separate number for nights. We're new here and need local examples.",
       why:"Small and explained beats big and mysterious; big unexplained gifts look too good to be true (Vonasch et al.).",
       owner:{warm:["Separate number, so my phones stay the same? Huh. {objection}","Okay. Small I can do. {objection}"],
              even:["Hm. Okay. {objection}","A separate number. {objection}"],
              cool:["I've heard 'something small' before. {objection}"]},
       byArch:{gatekeeper:{warm:["A separate number, so nothing changes on ours? {objection}"]}}},

      {style:S, tags:['brief','specific','plain'],
       t:"Here's the offer, plainly: a free test line, separate number, that answers after-hours calls and texts you. Catch is, we're new and need examples.",
       why:"Naming your own catch first takes the sting out of his suspicion (Voss, accusation audit).",
       owner:{warm:["Huh. Texts me, so I'm not chasing voicemails? {objection}","Okay, that's straightforward. {objection}"],
              even:["Alright. {objection}","Hm. Separate number. {objection}"],
              cool:["Okay. {objection}"]},
       byArch:{gatekeeper:{warm:["So it texts {owner}, and I'm not chasing voicemails? {objection}"]}}},
      {style:S, tags:['brief','control','local'],
       t:"We'd set up a free test line for {shop}'s late calls. Separate number, nothing changes on yours. We're new in Connecticut, building local examples.",
       why:"What it is, what doesn't change, and why it's free, in plain words with no pressure.",
       owner:{warm:["Nothing changes on mine? Okay. {objection}","Huh. That's simple enough. {objection}"],
              even:["Okay. {objection}","Hm. A test line. {objection}"],
              cool:["We'll see. {objection}"]}},

      {style:Q, tags:['control','specific'],
       t:"Would a free test line help with that? Separate number, answers late calls, texts you. Honestly, we're new here and building local examples.",
       why:"Offering as a question keeps the choice his; controlling language breeds resistance (Ma, Ebesu & Dillard).",
       owner:{warm:["Maybe, yeah. I'd want to hear it myself. {objection}","Could, actually. {objection}"],
              even:["Maybe. {objection}","Hm. Not sure. {objection}"],
              cool:["I don't know. {objection}"]}},
      {style:Q, tags:['control','trade'],
       t:"What if you could call a test line tonight and hear how it'd answer? StarWell would set it up free. We're new here and need examples.",
       why:"Something he can try himself is easier to trust than anything you describe.",
       owner:{warm:["Huh. I could call it from the couch. {objection}","Okay, I'd try that. {objection}"],
              even:["Maybe. {objection}","Hm. {objection}"],
              cool:["I'm not big on trying stuff. {objection}"]}}
    ],
    site: [
      {style:W, tags:['plain','local'],
       t:"Honest reason I called: we're new in Connecticut and building local examples. We'd make you a fresh site that books at night, free.",
       why:"A stated motive answers the question he's really asking: what do you get out of it (Vonasch et al.).",
       owner:{warm:["Huh. You'd build the whole thing? {objection}","That'd be nice, honestly. {objection}"],
              even:["Hm. A new website. {objection}","Okay... {objection}"],
              cool:["I get website calls every week. {objection}"]},
       byArch:{oldtimer:{even:["Well, my nephew did the last one. {objection}"]}}},
      {style:W, tags:['control','plain'],
       t:"Here's an idea, if you're open to it. We'd build you a fresh site, free, and you'd see it before anything changes. We're new here.",
       why:"'If you're open to it' and 'you'd see it first' keep the decision his.",
       owner:{warm:["I'd see it first? Okay. {objection}","Huh. That's generous. {objection}"],
              even:["Hm. Okay. {objection}","A whole site? {objection}"],
              cool:["Sounds like a lot. {objection}"]}},

      {style:S, tags:['brief','specific'],
       t:"The offer: a fresh website that lets people book at night. Free, yours to keep. Catch is, we're new and need local examples.",
       why:"What it is, that it's his, and the catch, in one breath; no surprises later.",
       owner:{warm:["Okay, that's clear. {objection}","Huh. Booking at night. {objection}"],
              even:["Alright. {objection}","Hm. {objection}"],
              cool:["Okay. {objection}"]}},
      {style:S, tags:['brief','control'],
       t:"Plainly: we'd build you a fresh site with night booking, free. You see it first, nothing goes live without you. We need local examples.",
       why:"Control lowers risk for an owner who's been burned; nothing happens without his yes.",
       owner:{warm:["Nothing goes live without me. Good. {objection}","Okay. That I like. {objection}"],
              even:["Okay. {objection}","Hm. {objection}"],
              cool:["We'll see. {objection}"]}},

      {style:Q, tags:['control','plain'],
       t:"Would it be useful to see {shop}'s site rebuilt with night booking? Free, yours to keep. We're new here, building local examples.",
       why:"A question leaves room for a no, which makes a yes feel like his own.",
       owner:{warm:["It might, actually. {objection}","Huh. I'd look at that. {objection}"],
              even:["Maybe. {objection}","Could be. {objection}"],
              cool:["Not sure I need it. {objection}"]}},
      {style:Q, tags:['control','specific'],
       t:"What if you could look at a fresh version of your site before deciding anything? We'd build it free. We're new, building local examples.",
       why:"Seeing it before deciding anything is the lowest-risk yes you can offer.",
       owner:{warm:["Before deciding anything? Okay. {objection}","Huh. That's fair. {objection}"],
              even:["Hm. {objection}","Maybe. {objection}"],
              cool:["I don't know. {objection}"]}}
    ],
    found: [
      {style:W, tags:['plain','local'],
       t:"Honest reason I called: we're new in Connecticut and building local examples. We'd put together a free one-page check of how you show up online.",
       why:"Small, specific and explained; a reason for the gift reduces suspicion (Vonasch et al.).",
       owner:{warm:["Huh. I'd be curious, honestly. {objection}","Okay, I'd look at that. {objection}"],
              even:["Hm. One page. {objection}","Okay... {objection}"],
              cool:["I get those Google calls all day. {objection}"]},
       byArch:{skeptic:{warm:["One page I can check myself. Okay. {objection}"]}}},
      {style:W, tags:['specific','plain'],
       t:"Here's something small. We'd send you a one-page look at how {shop} shows up when people search, free. We're new here and need examples.",
       why:"A one-page gift is believable; a huge free promise invites 'phantom costs' (Vonasch et al.).",
       owner:{warm:["One page, I can handle. {objection}","Okay, that's useful. {objection}"],
              even:["Alright. {objection}","Hm. {objection}"],
              cool:["Okay. {objection}"]}},

      {style:S, tags:['brief','specific','numbers'],
       t:"The offer: a free one-page check of where you show up on Google, Maps and phone searches. Catch is, we're new and need examples.",
       why:"Concrete scope plus your motive, with nothing vague left to suspect.",
       owner:{warm:["Okay. I'd want to see that. {objection}","Huh. Maps too? {objection}"],
              even:["Alright. {objection}","Hm. {objection}"],
              cool:["Okay. {objection}"]},
       byArch:{numbers:{warm:["Okay. Where we land, in black and white. {objection}"]}}},
      {style:S, tags:['brief','local'],
       t:"One page, free: how {shop} shows up when people search in {town}, and who's ahead of you. We're new in Connecticut, building examples.",
       why:"Short, local and specific; he knows exactly what he'd get.",
       owner:{warm:["Who's ahead of us? Yeah, I'd look. {objection}","Okay, that's specific. {objection}"],
              even:["Hm. {objection}","Alright. {objection}"],
              cool:["Okay. {objection}"]}},

      {style:Q, tags:['control','plain'],
       t:"Would it help to see what people find when they search for you? One free page. We're new here, building local examples.",
       why:"Asks, doesn't push; autonomy-supportive wording draws less resistance (Ma, Ebesu & Dillard).",
       owner:{warm:["Yeah, actually. I'd like to see that. {objection}","Might, yeah. {objection}"],
              even:["Maybe. {objection}","Could be. {objection}"],
              cool:["Not sure. {objection}"]}},
      {style:Q, tags:['control','specific'],
       t:"Would a one-page look at how people find {shop} online be useful? Free, yours to keep. We're new, so we're building examples.",
       why:"He decides if it's useful; you only say what it is and why it's free.",
       owner:{warm:["Yeah, it would. {objection}","Huh. Probably. {objection}"],
              even:["Maybe. {objection}","Hm. {objection}"],
              cool:["I doubt it. {objection}"]}}
    ]
  };

  /* ------------------------------------------------------------------ QUESTIONS (keyed by objection) */
  const ackWarm = ["Okay. That's a straight answer.","Alright, that's fair."];
  const questions = {
    catch: [
      {style:W, tags:['plain','respect'],
       t:"Fair question. We're new in Connecticut and need real local examples. If you like it, maybe we work together someday. If not, it's yours.",
       why:"Naming your real motive removes the hidden cost he's imagining (Vonasch et al.).",
       owner:{warm:["Okay. So I'm your test case. Fair enough.","Alright, that's honest, at least."],
              even:["Hm. Okay, fair enough.","Alright. If you say so."],
              cool:["Hm. We'll see."]}},
      {style:W, tags:['plain','respect'],
       t:"I'd ask the same thing. Honestly, we hope a few shops like it and remember us later. That's it. Nothing to sign.",
       why:"Agreeing it's a fair question first lowers defenses; then a plain motive.",
       owner:{warm:["Ha. Okay, that I believe.","Alright. Fair enough."],
              even:["Okay. That's fair.","Hm. Alright, then."],
              cool:["Everybody says nothing to sign."]}},
      {style:S, tags:['brief','plain'],
       t:"The catch: we're new, and we need local examples to show people. You keep it either way. Nothing to sign, no card.",
       why:"Say the catch out loud, short and specific; suspicion feeds on what's left unsaid.",
       owner:{warm:ackWarm.concat(["Alright, I can live with that."]),
              even:["Hm. Okay, I hear you.","Alright, fair enough."],
              cool:["Okay. We'll see."]}},
      {style:S, tags:['brief','plain'],
       t:"No hidden one. We're building a track record in Connecticut. If it's useful, you'll remember us. If not, delete it.",
       why:"A plain reason plus an easy way out removes any sense of debt.",
       owner:{warm:["Fair enough. I respect that.","Okay. Simple enough."],
              even:["Alright, I hear you.","Okay, I guess."],
              cool:["Hm. I'll believe it when I see it."]}},
      {style:Q, tags:['control','plain'],
       t:"Fair question. Honestly, we're new and need local examples. Does that sound like a catch to you, or is something else bugging you?",
       why:"Answer, then check what's really behind the worry; listening lowers defensiveness (Itzchakov et al. 2017).",
       owner:{warm:["No, that's fair. I just get burned a lot.","No, that's honest. Okay."],
              even:["No. I guess not.","Alright. That's fine."],
              cool:["Hm. We'll see, I guess."]}},
      {style:Q, tags:['control','respect'],
       t:"Totally fair to ask. We're new here and building examples. What would you want to see so it doesn't feel like a setup?",
       why:"Asking what would make it feel safe hands him control of the terms.",
       owner:{warm:["No contract, no card number. That's it.","Just don't call me every day after."],
              even:["Nothing to sign, I guess.","Just keep it simple."],
              cool:["Hard to say."]}}
    ],
    price: [
      {style:W, tags:['plain','numbers'],
       t:"It's free, and it stays yours. If you ever wanted us to run it for you, most shops start around three or four hundred a month.",
       why:"A real number, said calmly, beats a dodge; 'later' sounds like hiding.",
       owner:{warm:["Okay. At least you gave me a number.","Alright. That's honest."],
              even:["Hm. Okay, good to know.","Alright, that's noted."],
              cool:["That adds up."]}},
      {style:W, tags:['plain','control'],
       t:"Nothing today, and nothing later unless you ask. If you ever want ongoing help, it's a few hundred a month, in writing.",
       why:"Being clear that more help is optional keeps the free part free in his mind.",
       owner:{warm:["Okay. Unless I ask. Got it.","Alright, that's fair."],
              even:["Okay, got it.","Hm. Alright, then."],
              cool:["A few hundred's real money."]}},
      {style:S, tags:['brief','numbers'],
       t:"Zero for this. It's yours. If you ever want us to keep it running, it's about three to four hundred a month.",
       why:"Numbers-minded owners trust a plain range more than any adjective.",
       owner:{warm:["Okay. Straight answer.","Alright. Good to know."],
              even:["Okay, good to know.","Hm. Noted, thanks."],
              cool:["Okay. That's not nothing."]},
       byArch:{numbers:{warm:["Three, four hundred against one no-heat call. I can do that math."]}}},
      {style:S, tags:['brief','plain','control'],
       t:"Free, no card, nothing to sign. Ongoing help, if you ever wanted it, starts around three hundred a month. Your call.",
       why:"Short, honest, and 'your call' leaves the decision with him.",
       owner:{warm:["Okay. That's clear.","Alright, fair enough."],
              even:["Alright, that's clear.","Okay, noted, thanks."],
              cool:["We'll see about that."]}},
      {style:Q, tags:['control','numbers'],
       t:"It's free. Ongoing help would be a few hundred a month, but honestly, look at the free part first. Does that seem fair?",
       why:"Answer first, then check his read; a question after an answer invites agreement, not pressure.",
       owner:{warm:["Yeah, that's fair.","Sure. Free first, then we talk."],
              even:["I guess so.","Seems fair, sure."],
              cool:["We'll see, I guess."]}},
      {style:Q, tags:['control','numbers'],
       t:"Free for this, no strings. If you ever want more, it's a few hundred a month. What would make that worth it to you?",
       why:"Letting him say what value looks like means the case is his, not yours (Rackham).",
       owner:{warm:["If it booked a couple jobs a month, it'd pay for itself.","Honestly? If I saw it bring in work."],
              even:["I'd have to see it work.","Depends what it does."],
              cool:["Not sure it would be."]}}
    ],
    allset: [
      {style:W, tags:['respect','plain'],
       t:"That's great, sounds like you're in good hands. Happy to send it anyway, and you can pass it along if it's useful.",
       why:"Agree with him first; no argument means nothing to defend.",
       owner:{warm:["Okay, sure. He'd probably look at it.","Alright, that's fair. Can't hurt."],
              even:["Okay. Maybe he would.","Sure, I guess."],
              cool:["We're good, really."]}},
      {style:W, tags:['respect','control'],
       t:"Glad you've got someone. This isn't meant to replace anybody. It's just a second look you can keep or toss.",
       why:"Protecting his guy, often family, protects his pride too.",
       owner:{warm:["Okay. As long as nobody's getting replaced.","Alright, that's fair."],
              even:["Okay, that's fine.","Fair enough, okay."],
              cool:["We're set, though."]}},
      {style:S, tags:['brief','control'],
       t:"Got it, no need to switch anything. This is just a free check. Keep it, hand it to your guy, or toss it.",
       why:"Three clear choices, all his; nothing to resist.",
       owner:{warm:["Okay. That's easy enough.","Alright, fair enough."],
              even:["Okay, sure, why not.","Sure, that's fine."],
              cool:["We're set, though."]}},
      {style:S, tags:['brief','plain'],
       t:"Makes sense. Nothing changes with your guy. It's one free look, and you decide what to do with it.",
       why:"Short and respectful of the help he already has.",
       owner:{warm:["Okay. Fair enough.","Alright, that's fine."],
              even:["Okay, that's fine.","Alright, fair enough."],
              cool:["We're covered, really."]}},
      {style:Q, tags:['control','trade'],
       t:"Glad you're covered. Out of curiosity, does your guy handle the after-hours calls too, or just the website?",
       why:"Accept his answer, then ask a real question; you learn instead of arguing.",
       owner:{warm:["Just the website, really.","Huh. Just the site, I think."],
              even:["Just the website.","Mostly the website."],
              cool:["He handles what we need."]}},
      {style:Q, tags:['control','respect'],
       t:"That's good to hear. What does he usually take care of for you, so I don't step on his toes?",
       why:"Respecting the people he already trusts is part of seeing it from his side.",
       owner:{warm:["The website, mostly. He's good, just busy.","Website and the Facebook page, when he gets to it."],
              even:["Website stuff, mostly.","Mostly the site."],
              cool:["Enough. We're covered."]}}
    ],
    email: [
      {style:W, tags:['respect','plain'],
       t:"Of course. I'll keep it to one page, so it's easy to look at when you get a minute.",
       why:"Say yes to what he asked for; arguing with 'just email me' tells him you won't respect a no.",
       owner:{warm:["Good. One page, I'll actually read.","That works. Thanks."],
              even:["Okay, that's fine.","Sure, that works."],
              cool:["Yeah, just send it."]}},
      {style:W, tags:['respect','plain'],
       t:"Happy to. I'll make it short and plain, nothing to click through or sign up for.",
       why:"Removing the work he's dreading is the kind thing, and it gets read.",
       owner:{warm:["Good. No sign-ups. I like that.","Perfect. Short and plain."],
              even:["Okay, sounds good.","Sure, send it over."],
              cool:["Fine. Send it."]}},
      {style:S, tags:['brief','plain'],
       t:"Sure, email works. One page, no links to sign up for. I'll send it today.",
       why:"Agree, say what he'll get, say when; that's the whole answer.",
       owner:{warm:["Good. Today's good.","Alright, that works."],
              even:["Okay, today's fine.","Sure, send it."],
              cool:["Fine. Send it."]}},
      {style:S, tags:['brief','control'],
       t:"Will do. Short, plain, and you can ignore it if it's not useful.",
       why:"An explicit easy out removes any sense of debt (Jiang, Hoegg & Dahl).",
       owner:{warm:["Ha. Fair enough. Send it.","Okay. I appreciate that."],
              even:["Okay, fair enough.","Alright, send it."],
              cool:["I probably will."]}},
      {style:Q, tags:['control','numbers'],
       t:"Absolutely. What would make it worth opening for you, the numbers, or just what you'd see?",
       why:"Tailoring the email to what he cares about makes it worth opening.",
       owner:{warm:["Just show me what it does. Keep it short.","Numbers. Keep it simple."],
              even:["Short. That's all.","Whatever's quickest to read."],
              cool:["Just send it, I'll look."]}},
      {style:Q, tags:['control','plain'],
       t:"Sure thing. Anything specific you'd want me to look at while I'm putting it together?",
       why:"Inviting his input turns your email into something he asked for.",
       owner:{warm:["Just whether it'd actually help us. That's it.","Show me what customers see. That's it."],
              even:["Not really, no.","Nah, just the basics."],
              cool:["No. Just send it."]}}
    ],
    busy: [
      {style:W, tags:['respect','time'],
       t:"Totally get it, you're working. Can I call you back at a better time? You pick when.",
       why:"Respecting his time is the most persuasive thing you can do right now; interruptions are costly (Mark et al. 2008).",
       owner:{warm:["Yeah, try me after four. Thanks.","Appreciate that. Tomorrow morning's better."],
              even:["Yeah, later's better.","Sure. Try me later."],
              cool:["Just send me something."]},
       byArch:{busy:{warm:["Appreciate that. After four, I'm in the truck."]},
               gatekeeper:{warm:["Thanks. After three's quieter here."]}}},
      {style:W, tags:['respect','brief'],
       t:"No problem, I'll be quick then. I'll send one page you can read tonight, and that's it.",
       why:"Shrinking the ask to fit his day shows you heard 'busy' and meant it.",
       owner:{warm:["Thanks. Tonight I can do.","Appreciate that. Send it."],
              even:["Okay. Send it.","Alright, thanks. Bye."],
              cool:["Yeah, okay. Gotta go."]}},
      {style:S, tags:['brief','time','control'],
       t:"Understood. Thirty more seconds, or should I call back after four? Your call.",
       why:"Two concrete choices, both his; no guilt, no 'bad time' question (Gong).",
       owner:{warm:["Thirty seconds. Go.","Call me after four."],
              even:["Make it quick, then.","Later's better, honestly."],
              cool:["Later. I gotta go."]}},
      {style:S, tags:['brief','time'],
       t:"Got it. I'll text you the short version, and you can look when you're off the job.",
       why:"Moves the conversation to when he's free, without making him decide on the spot.",
       owner:{warm:["Yeah, text's good. Thanks.","Perfect. Text me."],
              even:["Okay. Text's fine.","Sure, text me."],
              cool:["Fine. Text me."]},
       byArch:{gatekeeper:{warm:["Text's fine. I'll see it before he does."]}}},
      {style:Q, tags:['time','respect'],
       t:"Sorry, I know the timing's rough. When's usually a quieter time to catch you?",
       why:"Asking when works for him gives him control of the next conversation.",
       owner:{warm:["After four, in the truck. That's my time.","Early. Before seven."],
              even:["Hard to say. Evenings.","Afternoons, maybe. Late."],
              cool:["There isn't one, this time of year."]},
       byArch:{gatekeeper:{warm:["Mornings, before the phones start. Around eight."]}}},
      {style:Q, tags:['time','control'],
       t:"Understood. Would it be easier if I just sent it, or should I call back when you're out of there?",
       why:"A simple either-or he can answer in two words while working.",
       owner:{warm:["Just send it. I'll look tonight.","Call me back around four."],
              even:["Send it, I guess.","Either one, really."],
              cool:["Just send it, then."]}}
    ],
    ai: [
      {style:W, tags:['control','respect'],
       t:"Fair worry. You'd try it yourself first, and nothing reaches your customers unless you say so.",
       why:"Talk about what he controls, not the technology; control lowers the fear.",
       owner:{warm:["Okay. If I get to try it first, fine.","Alright. As long as it's my call."],
              even:["Hm. Okay, I guess.","We'll see how it sounds."],
              cool:["I still don't love that stuff."]},
       byArch:{modernizer:{warm:["Ha. Okay, I'll try to break it."]}}},
      {style:W, lead:'phone', tags:['control','trade'],
       t:"I get it, nobody wants a robot on the line with their customers. You'd test it yourself, and if you hate it, it's gone.",
       why:"Agreeing with his worry first shows you're on his side of the table.",
       owner:{warm:["Okay. That's fair. I'd test it.","Alright. If I can kill it, fine."],
              even:["Hm. Maybe I would.","We'll see how it goes."],
              cool:["I'd probably hate it."]}},
      {style:W, tags:['respect','plain'],
       t:"That's a good thing to be careful about. You'd see all of it first, and your customers see nothing until you're happy.",
       why:"Respecting his caution, then giving him the final word.",
       owner:{warm:["Okay. That's how it should be.","Alright. I appreciate that."],
              even:["Okay, that's fair.","Hm. Alright, then."],
              cool:["We'll see, I guess."]}},
      {style:S, tags:['brief','control'],
       t:"Fair. You try it yourself first. Nothing reaches your customers unless you say yes.",
       why:"Short, concrete, and the yes stays his.",
       owner:{warm:["Okay. That's fair.","Alright, I can work with that."],
              even:["Okay, that's fair.","Alright, I hear you."],
              cool:["Still not sure."]}},
      {style:S, lead:'phone', tags:['brief','control'],
       t:"Short answer: you'd test it on a separate number first. If it sounds wrong, you walk away.",
       why:"A separate test number is a risk-free way to judge it himself.",
       owner:{warm:["Separate number. Okay, fine.","Alright. I can live with that."],
              even:["Okay, that works.","Hm. Okay, fine."],
              cool:["We'll see how it sounds."]}},
      {style:S, tags:['brief','plain'],
       t:"Good question. Nothing goes in front of your customers until you've seen it and said okay.",
       why:"Answers the real fear, his customers, in one sentence.",
       owner:{warm:["Okay. Good to hear.","Alright, that's what I needed."],
              even:["Okay, that's fair.","Alright, that's good."],
              cool:["Hm. I'm still not sure."]}},
      {style:Q, tags:['control','respect'],
       t:"Fair to ask. You'd hear it yourself before anyone else does. What worries you most, how it sounds?",
       why:"Answer, then ask what's behind the worry; naming it calms it (Lieberman et al. 2007).",
       owner:{warm:["Sounding fake. People can tell.","That, and it promising stuff we can't do."],
              even:["Sounding like a robot, mostly.","Just don't trust it."],
              cool:["All of it, honestly."]}},
      {style:Q, tags:['control','trade'],
       t:"Good question. You'd test it first, and it's your call. What would you need to hear to trust it?",
       why:"He sets the bar, so a yes later is his own.",
       owner:{warm:["That it gets the address right and doesn't make promises.","That it sounds like us. Plain."],
              even:["I'd have to hear it.","Not sure. Something normal."],
              cool:["Nothing, probably. But go ahead."]}}
    ],
    agency: [
      {style:W, tags:['respect','control'],
       t:"That's rough, I'm sorry. That's why this is free and yours to keep. You'd judge it yourself, not on our word.",
       why:"Acknowledge the hurt, then remove the risk; promises are what burned him.",
       owner:{warm:["Okay. That's different, at least.","Alright. I appreciate you not pretending."],
              even:["Hm. We'll see, I guess.","Okay. Heard that before, though."],
              cool:["I've heard that one before."]},
       byArch:{skeptic:{warm:["Judge it myself. Okay, that I can work with."]}}},
      {style:W, tags:['respect','plain'],
       t:"I'm sorry, that's a lot of money for nothing. No contract here, no monthly bill. Look at it and decide.",
       why:"Sympathy without trashing the other company, then plain terms.",
       owner:{warm:["Yeah, it was. Okay, no contract helps.","Alright. That's fair."],
              even:["Okay, that's fair.","Hm. Alright, then."],
              cool:["We'll see, I guess."]}},
      {style:S, tags:['brief','control'],
       t:"Understood. No contract, no monthly fee, nothing to sign. You check it yourself, not on our promises.",
       why:"Burned owners trust what they can check, not what they're told.",
       owner:{warm:["Okay. That's a straight answer.","Alright. Check it myself. Fine."],
              even:["Okay, fair enough.","Alright, we'll see."],
              cool:["Hm. We'll see."]}},
      {style:S, tags:['brief','plain'],
       t:"Makes sense you'd be wary. This is free, you keep it, and you can check every bit of it yourself.",
       why:"Validates his caution in four words, then gives facts.",
       owner:{warm:["Okay. Fair enough.","Alright. I'll check it, believe me."],
              even:["Okay, fair enough.","Hm. Alright, then."],
              cool:["Uh huh. We'll see."]}},
      {style:Q, tags:['control','respect'],
       t:"I'm sorry, that's frustrating. What did they promise that didn't happen? I'd rather not repeat it.",
       why:"Learning what hurt him shows you care about not repeating it (Galinsky et al. 2008).",
       owner:{warm:["First page on Google. Calls. Never saw either.","Monthly reports. Never saw one."],
              even:["More calls. Didn't happen.","Everything, basically. Nothing happened."],
              cool:["Doesn't matter now. It's done."]}},
      {style:Q, tags:['control','numbers'],
       t:"That's fair to be wary. How would you want to check whether something like this is actually working?",
       why:"He picks the yardstick, so the result can't be spun.",
       owner:{warm:["My call log. If it catches calls, I'll see it.","Jobs booked. That's all I care about."],
              even:["See if I get more calls, I guess.","Jobs booked. Simple as that."],
              cool:["I'd know if it worked."]}}
    ],
    wordofmouth: [
      {style:W, tags:['respect','local'],
       t:"That's the best kind of work. Even then, people usually look you up before calling, so this checks what they find.",
       why:"Honor what he's proud of, then show how the gift protects it.",
       owner:{warm:["Huh. Yeah, they do look us up.","Fair point. My customers google everything."],
              even:["Maybe. I don't know.","Could be, I guess."],
              cool:["Nah, they just call us."]}},
      {style:W, tags:['respect','warmup'],
       t:"That says a lot about your work. This just makes sure the people your neighbors send can reach you.",
       why:"Sincere respect for his reputation, tied to something concrete.",
       owner:{warm:["Thanks. Yeah, that matters.","Huh. Okay, I like that."],
              even:["Okay, fair enough.","Maybe, yeah. Huh."],
              cool:["They reach us fine."]}},
      {style:S, tags:['brief','plain'],
       t:"Makes sense, and that's earned. When a neighbor sends someone, they still check online first. This helps there.",
       why:"Agree, add one fact, stop.",
       owner:{warm:["Huh. Yeah, that's true.","Okay. That's fair."],
              even:["Maybe, I guess.","Could be, sure."],
              cool:["Not my customers."]}},
      {style:S, tags:['brief','plain'],
       t:"Good, that's the hard part. This just covers the step after, when they look you up or call.",
       why:"Keeps his pride intact; the gift only supports what already works.",
       owner:{warm:["Okay. That makes sense.","Alright. Fair enough."],
              even:["Okay, makes sense.","Hm. Okay, then."],
              cool:["We're fine there."]}},
      {style:Q, tags:['control','local'],
       t:"That's great. When a neighbor recommends you, what do you think people do before they call?",
       why:"Let him reach the point himself; people trust conclusions they draw (Rackham).",
       owner:{warm:["Look us up, I guess. Read the reviews.","Probably check the reviews. Huh."],
              even:["Just call, mostly.","Not sure, honestly."],
              cool:["They call. Simple."]}},
      {style:Q, tags:['control','trade'],
       t:"Good to hear. Do the referrals ever try you after hours and miss you?",
       why:"A real question about his referrals, not an argument against them.",
       owner:{warm:["Huh. Probably, yeah. Some say they tried.","Sometimes. They mention it when they finally get through."],
              even:["Maybe once in a while.","Could happen, sure."],
              cool:["They wait for us."]}}
    ],
    scam: [
      {style:W, tags:['plain','local'],
       t:"Fair question. It's on your website and Google listing. We're StarWell in North Haven. Look us up, and call me back if you'd rather.",
       why:"Saying where you found him makes it normal; hidden sources feel invasive.",
       owner:{warm:["Okay. That's fair. I'll look you up.","Alright. Can't be too careful these days."],
              even:["Okay. I'll check.","Hm. Alright, I guess."],
              cool:["I'll be looking you up."]}},
      {style:W, tags:['plain','control'],
       t:"Smart to ask. I got it from your website. Nothing to pay, no logins, no card. You can call me back on this number.",
       why:"Owners know scams ask for cards and logins; ruling those out answers the real worry.",
       owner:{warm:["Okay. No card, that's what I needed.","Alright. Fair enough."],
              even:["Okay, good to know.","Hm. Okay, then."],
              cool:["We'll see, I guess."]}},
      {style:S, tags:['brief','plain','local'],
       t:"Your website and your Google listing. We're StarWell, North Haven. Nothing to pay, nothing to sign, no passwords.",
       why:"Short, specific, checkable facts calm suspicion; 'I swear' does not.",
       owner:{warm:["Okay. That's clear.","Alright. Good answer."],
              even:["Okay, that's clear.","Alright, good answer."],
              cool:["Uh huh. I'll check."]}},
      {style:S, tags:['brief','control'],
       t:"It's on your site. Look up StarWell in North Haven, and call back on this number if that feels better.",
       why:"Inviting him to verify you is the strongest proof you're real.",
       owner:{warm:["Okay. Fair enough.","Alright, I might."],
              even:["Okay, fair enough.","Maybe I will."],
              cool:["Oh, I will."]}},
      {style:Q, tags:['control','plain'],
       t:"Good instinct. It's from your website. What would help you feel sure, a link to look us up first?",
       why:"Ask what proof he'd trust instead of guessing.",
       owner:{warm:["Yeah, send me something I can check.","A website. Something real."],
              even:["Something I can look up.","I'll just google you."],
              cool:["I'll figure it out myself."]}},
      {style:Q, tags:['control','respect'],
       t:"Fair, you probably get a lot of those. It's from your website. Want to look us up and call me back instead?",
       why:"Naming his experience and offering an exit shows you're not one of them.",
       owner:{warm:["Nah, you're fine. Go ahead.","Ha. No, it's okay. Just checking."],
              even:["Maybe. Go ahead for now.","I'll look you up after."],
              cool:["I'll look you up."]}}
    ]
  };

  /* ------------------------------------------------------------------ NEXT (owner replies keyed by outcome) */
  const next = [
    {style:W, tags:['control','time','respect'],
     t:"Where should I send it, email or text? And if you'd like, I could walk you through it {day} at {time}. No worries if not.",
     why:"One small step plus an easy out; a specific time is easier to agree to than 'sometime'.",
     owner:{booked:["Email's fine, {email}. And sure, {day} at {time} works.","Email. It's {email}. {day} at {time}, okay."],
            counter:["Email, {email}. {day}'s no good, though. {day2}, same time?","It's {email}. {day} I've got an install. Try {day2}?"],
            email:["Email's fine, {email}. Let me read it first.","Just email it, {email}. I'll look when I can."],
            later:["Honestly, not right now. Maybe after the season.","I'll pass for now. Thanks, though."]},
     ownerOnly:true},
    {style:W, tags:['time','respect'],
     t:"Can I send it to your email? And if fifteen minutes {day} at {time} works, I'd be glad to go through it with you.",
     why:"A warm, specific invitation he can accept or skip without awkwardness.",
     owner:{booked:["Sure, {email}. {day} at {time}, I'll be around.","Yeah. {email}. {day} at {time} works."],
            counter:["{email}. {day} won't work. {day2} at {time}?","Sure, {email}. Make it {day2} instead."],
            email:["Sure, {email}. Let's start with that.","{email}. Just the email for now."],
            later:["Let's leave it for now. Thanks for calling, though.","Not right now. Maybe in the spring."]},
     ownerOnly:true},
    {style:W, gk:true, tags:['respect','time'],
     t:"Should I send it to you or to {owner}? And if {owner} wants a quick look, would {day} at {time} work?",
     why:"Letting her choose where it goes treats her as the person who runs the office.",
     owner:{booked:["Send it to me, {email}. I'll put {owner} down for {day} at {time}.","Me. {email}. {day} at {time} works, I'll make sure he's here."],
            counter:["Me, {email}. {day}'s full. {day2} at {time}, I'll pencil him in.","{email}. He's out {day}. How about {day2}?"],
            email:["Send it to me, {email}. I'll show him.","{email}. Let him read it first."],
            later:["Let's hold off for now. It's busy season.","I'll pass for now, but thanks for asking me."]}},

    {style:S, tags:['brief','time','control'],
     t:"Best email for it? And fifteen minutes {day} at {time}, {when}, or would you rather just read it?",
     why:"A direct request, one concrete time, and a real alternative (Schaeffer et al. 2013).",
     owner:{booked:["{email}. {day} at {time}, sure.","It's {email}. Yeah, {day} at {time}."],
            counter:["{email}. {day}'s bad. {day2} at {time}?","It's {email}. Make it {day2}, same time."],
            email:["{email}. I'll just read it.","Just read it. It's {email}."],
            later:["Not right now. Thanks, though.","Let's leave it for now."]},
     ownerOnly:true},
    {style:S, tags:['brief','time'],
     t:"What's the best email? I can also walk you through it, fifteen minutes, {day} at {time}, if that's useful.",
     why:"Get the address, offer one specific time, and leave it at that.",
     owner:{booked:["{email}. And yeah, {day} at {time}.","It's {email}. {day} at {time} is fine."],
            counter:["{email}. {day}'s tough. {day2}?","It's {email}. {day2} would be better."],
            email:["{email}. Just send it for now.","It's {email}. I'll call you if I want to talk."],
            later:["I'll pass for now. Thanks.","Not now. Busy season."]},
     ownerOnly:true},
    {style:S, gk:true, tags:['brief','time','respect'],
     t:"Best email to send it to? And if {owner} wants fifteen minutes, is {day} at {time} open on his calendar?",
     why:"She keeps the calendar, so ask her directly and specifically.",
     owner:{booked:["It's {email}. And yes, {day} at {time} is open. I'll put it in.","{email}. {day} at {time}, done."],
            counter:["{email}. {day}'s booked solid. {day2} at {time} is open.","It's {email}. Try {day2}, same time."],
            email:["{email}. Let him look first.","It's {email}. I'll pass it along."],
            later:["Let's leave it for now. Thanks.","Not right now, it's crazy here."]}},

    {style:Q, tags:['control','time'],
     t:"What's easier for you, email or a text? And would a short look together {day} at {time} help, or is reading it enough?",
     why:"He picks the channel and whether to meet; choice keeps resistance low (Ma, Ebesu & Dillard).",
     owner:{booked:["Email, {email}. And sure, {day} at {time}.","Email's better. {email}. {day} at {time} is good."],
            counter:["Email, {email}. {day2} would work better, same time.","{email}. Not {day}. {day2}?"],
            email:["Email, {email}. Reading's enough for now.","{email}. Let me read it first."],
            later:["Honestly, neither right now. Maybe after the season.","Let's not, for now. Thanks."]},
     ownerOnly:true},
    {style:Q, tags:['control','time'],
     t:"How do you like to get stuff like this? If it'd help, we could look at it together {day} at {time}.",
     why:"Asking his preference respects how he works, and the time is specific but optional.",
     owner:{booked:["Email. {email}. And yeah, {day} at {time}.","Email's best, {email}. {day} at {time}, fine."],
            counter:["Email, {email}. {day}'s no good. {day2}?","{email}. Make it {day2} at {time}."],
            email:["Email. {email}. I'll go from there.","Just email, {email}."],
            later:["Honestly, I'm all set for now. Thanks.","Not right now. Maybe later in the year."]},
     ownerOnly:true},
    {style:Q, gk:true, tags:['respect','control'],
     t:"What's the best way to get this in front of {owner}, an email to you? And would {day} at {time} work for a quick look?",
     why:"Asks for her advice on her own office, which is what earns her help.",
     owner:{booked:["Email me, {email}. {day} at {time}, I'll put it on his calendar.","{email}. And {day} at {time} is fine."],
            counter:["{email}. {day}'s out. {day2} at {time}?","Email me, {email}. {day2} works better."],
            email:["Email me, {email}. I'll show him.","{email}. He'll call you if he wants to."],
            later:["Not right now. Thanks for asking, though.","Let's hold off for now."]}}
  ];

  /* ------------------------------------------------------------------ THANKS (keyed yes / no) */
  const byeWarm = ["You too. Take care.","Alright, thanks. Talk soon."];
  const byeEven = ["Yep. Bye now.","Okay, thanks. Bye."];
  const byeCool = ["Okay. Bye now."];
  const thanks = {
    yes: [
      {style:W, tags:['warmup','respect'],
       t:"Thanks, {name}, I really appreciate the time. I'll send it today. Good luck with the cold nights.",
       why:"A warm, specific close leaves the door open; small warm exchanges build belonging (Sandstrom & Dunn 2014).",
       owner:{warm:["Thanks. You too. Take care.","Ha, thanks. Talk soon."], even:byeEven, cool:byeCool}},
      {style:W, tags:['warmup','local'],
       t:"Really appreciate you hearing me out, {name}. I'll get it over today. Stay warm out there.",
       why:"Thank him for his time, confirm the one thing you'll do, and go.",
       owner:{warm:["Ha, I'll try. Take care.","You too. Thanks for calling."], even:["Okay. Bye now.","Alright, thanks. Bye."], cool:byeCool}},
      {style:S, tags:['brief'],
       t:"Thanks, {name}. It'll be in your inbox today. Appreciate the time.",
       why:"Short and specific: what happens next, and thanks.",
       owner:{warm:["Sounds good. Thanks.","Alright. Talk soon."], even:byeEven, cool:byeCool}},
      {style:S, tags:['brief','time'],
       t:"Great, I'll send it this afternoon. Thanks for your time, {name}, and good luck this week.",
       why:"Confirms the next step so the yes turns into something real.",
       owner:{warm:["Thanks. You too.","Appreciate it. Take care."], even:byeEven, cool:byeCool}},
      {style:Q, tags:['control','respect'],
       t:"Thanks, {name}. If anything in it looks off, just tell me. I'd want to know.",
       why:"Inviting correction keeps him in control and shows you mean it.",
       owner:{warm:["Oh, I will. Don't worry. Take care.","Ha, you'll hear about it. Bye."], even:["Okay. Will do.","Sure. Bye now."], cool:byeCool}},
      {style:Q, tags:['respect','warmup'],
       t:"Thanks for walking me through how things work over there, {name}. I'll send it today.",
       why:"Thanking him for what he taught you makes the call feel two-way (Huang et al. 2017).",
       owner:{warm:["Sure thing. Take care.","No problem. Talk soon."], even:byeEven, cool:byeCool}}
    ],
    no: [
      {style:W, tags:['warmup','respect'],
       t:"No problem at all, {name}. Thanks for talking with me, and good luck with the cold nights.",
       why:"A gracious no protects your name in a small market; reputation travels (Grant).",
       owner:{warm:["Thanks. You too. Take care.","Appreciate it. Good luck to you."], even:["Yep. Take care.","Okay. Bye now."], cool:["Alright. Bye now."]}},
      {style:W, tags:['warmup','local'],
       t:"Totally understand, {name}. I appreciate the time. Stay warm out there.",
       why:"No pushback after a no; that's what makes the next call possible.",
       owner:{warm:byeWarm, even:byeEven, cool:byeCool}},
      {style:S, tags:['brief','respect'],
       t:"Understood. Thanks for your time, {name}. Have a good rest of the week.",
       why:"Brief and clean; respecting his no is the whole message.",
       owner:{warm:["Thanks. You too.","Appreciate it. Take care."], even:byeEven, cool:byeCool}},
      {style:S, tags:['brief','control'],
       t:"Fair enough. I won't keep calling. Thanks, {name}, and good luck this season.",
       why:"Promising not to keep calling lowers pressure (30MPC).",
       owner:{warm:["Ha. Appreciate that. Take care.","Thanks. You too."], even:byeEven, cool:byeCool}},
      {style:Q, tags:['respect','warmup'],
       t:"Fair enough. Thanks for telling me how things work over there, {name}. Good luck this winter.",
       why:"Thanking him for what he shared ends on respect, not disappointment.",
       owner:{warm:["Sure. Good luck to you too.","No problem. Take care."], even:byeEven, cool:byeCool}},
      {style:Q, tags:['control','local'],
       t:"Makes sense. If anything changes, StarWell's easy to find. Thanks for the time, {name}.",
       why:"Leaves the door open without asking him to promise anything.",
       owner:{warm:["Will do. Take care.","Alright. Thanks for calling."], even:byeEven, cool:byeCool}}
    ]
  };

  /* stage-level personality defaults (used when an option has no byArch for that personality) */
  const byArchStage = {
    next:{
      busy:{booked:["Yeah, {email}. {day} at {time}, call me in the truck."], later:["Not now, man. I'm buried. Thanks, though."]},
      oldtimer:{booked:["Sure, why not. It's {email}. {day} at {time}, I'll put the coffee on."]},
      numbers:{booked:["{email}. {day} at {time}. Bring whatever numbers you've got."]},
      runsit:{booked:["It's {email}. {day} at {time} works. Fifteen minutes, I'll hold you to it."]}
    },
    thanks:{
      gatekeeper:{warm:["You too. I'll tell {owner} you called.","Thanks. Take care now."]}
    }
  };

  return {
    styleOrder:[W, S, Q],
    stageOrder:['greet','reason','noticed','follow','offer','questions','next','thanks'],
    /* old engine stage names -> new ones */
    alias:{opener:'greet', truth:'noticed', discover:'follow', gift:'offer', handle:'questions', close:'next', wrap:'thanks'},
    styles:{
      [W]:{how:"Friendly and unhurried. Use his name once, notice something real, sound like a neighbor."},
      [S]:{how:"Point first, plain words, short sentences, give his time back."},
      [Q]:{how:"Ask, then let him talk. Pick up his words and follow them."}
    },
    bestFit:{
      oldtimer:W, friendly:W, gatekeeper:W,
      busy:S, numbers:S, runsit:S, growing:S,
      skeptic:Q, modernizer:Q
    },
    labels:{greet:'Hello', reason:'Why I called', noticed:'Noticed', follow:'Follow up', offer:'Offer', questions:'Questions', next:'Next step', thanks:'Thanks'},
    hints:{
      greet:"Say hello back, give your name and StarWell, add one light human touch.",
      reason:"One plain sentence on why you called. No offer yet.",
      noticed:"Mention one thing you can check about the shop, then ask about it.",
      follow:"Pick up the exact words just said and ask what happens next.",
      offer:"Tie it to what you just heard. Say why it's free and what StarWell gets.",
      questions:"Agree it's a fair question, answer it straight, then stop talking.",
      next:"Ask where to send it, offer one specific time, make no an easy answer.",
      thanks:"Use the name, thank them, close warmly either way."
    },
    arc:{
      greet:"Friendly and unhurried, like a neighbor saying hello.",
      reason:"Plain and honest: who you are and why this shop.",
      noticed:"Specific and humble: one true thing, then a real question.",
      follow:"Interested: follow the answer, then let them talk.",
      offer:"Generous and honest: small, free, catch named.",
      questions:"Steady: a fair question gets a straight answer.",
      next:"Easy: one small step, and no is fine.",
      thanks:"Grateful, whatever the answer."
    },
    guide:{
      greet:{title:'Say hello like a person',
        say:["Hi {name}, this is {me} with StarWell, over in North Haven.","Name and company before anything else.","One light touch: how's the week, or a nod to his busy season."],
        why:"People judge warmth from the first word of a call, and saying who you are first helped strangers accept calls (Schaeffer et al. 2013; McAleer et al. 2014).",
        avoid:["\"Did I catch you at a bad time?\" (the worst opener in Gong's data)","\"How have you been?\" to a stranger (fake familiarity)","Mentioning anything free before he knows who you are"]},
      reason:{title:'Give a plain reason',
        say:["We help local HVAC shops with phones and websites.","I had one question about {shop}.","Is it okay if I ask? (a direct check, not \"bad time\")"],
        why:"Stating a reason for the call went with about twice the success in Gong's data; owners hang up on mystery.",
        avoid:["Pitching the offer here","\"This is a cold call\" or anything that apologizes for existing","Asking the office manager for \"the owner\" before saying why"]},
      noticed:{title:'Notice one true thing',
        say:["Your site says you close at {close}...","I pulled up your site on my phone like a customer would...","When I searched furnace repair in {town}..."],
        why:"A specific, checkable detail shows homework; generic praise reads as flattery when you clearly want something (Vonk 2002).",
        avoid:["Over-the-top praise (\"I love what you guys do!\")","Trick questions that trap a yes (\"You'd want more customers, right?\")","Telling him he has a problem; ask instead"]},
      follow:{title:'Follow up on his words',
        say:["That makes sense. On a cold Saturday night, how does it go?","So after {close}, it's {afterShort}. How did that hold up?","What happens to the people who don't get through?"],
        why:"Follow-up questions were the type that predicted liking and second dates (Huang et al. 2017).",
        avoid:["Jumping to a new topic (full-switch questions lowered responsiveness)","Talking over him; if he starts, stop (Conrad et al. 2013)","Telling him what it costs him; let him say it"]},
      offer:{title:'Offer something small, and say why',
        say:["Honest reason I called: we're new in Connecticut and building local examples.","A free test line on a separate number for those nights.","Yours to keep, nothing changes unless you say so."],
        why:"Unexplained free offers make people imagine hidden costs; a stated reason removes them (Vonasch et al.).",
        avoid:["A big, vague gift (\"a whole free system\")","\"You need to\" or \"you should\" (controlling words breed resistance)","Jargon: SEO, AI agent, leads"]},
      questions:{title:'Answer straight',
        say:["Fair question.","The honest answer, in one or two sentences.","Hand control back: you check it, you decide."],
        why:"Agreeing it's fair, then answering plainly, lowers defensiveness; listening does the same (Itzchakov et al. 2017).",
        avoid:["\"No catch, I promise\" (no reason given)","Arguing or criticizing his current setup or his guy","Guarantees about rankings or calls"]},
      next:{title:'One small next step',
        say:["Where should I send it, email or text?","Fifteen minutes {day} at {time}, if that's useful.","Or would you rather just read it?"],
        why:"A direct, specific request worked better than a hedged one when calls felt cool (Schaeffer et al. 2013).",
        avoid:["\"Sometime next week\" (vague times never happen)","Invented deadlines or 'this week only'","Pushing past a polite no"]},
      thanks:{title:'Close warmly either way',
        say:["Thanks, {name}, I appreciate the time.","I'll send it today.","Good luck with the cold nights."],
        why:"Brief warm exchanges leave people feeling better, and a gracious no protects your name in town (Sandstrom & Dunn 2014; Grant).",
        avoid:["Guilt or a last pitch after a no","\"I'll follow up\" with no date","Long goodbyes"]}
    },
    stages:{greet, reason, noticed, follow, offer, questions, next, thanks},
    byArchStage
  };
})();

/* ------------------------------------------------------------------ helpers */
const SCRIPT_AFTER_SHORT = {voicemail:'voicemail', service:'the answering service', cell:'the cell phone', none:'just ringing'};

function scriptVars(p){
  const v = Object.assign({}, p.vars || {});
  if(!v.afterShort){
    const after = p.facts && p.facts.after;
    v.afterShort = SCRIPT_AFTER_SHORT[after] || 'voicemail';
  }
  return v;
}
function scriptTidy(s){
  s = String(s).replace(/\s+/g, ' ').replace(/\s+([.,?!])/g, '$1').replace(/([?!])\1+/g, '$1').replace(/\.\s+\./g, '.').trim();
  if(/^\S*@/.test(s)) return s;                       // starts with an email address: leave as is
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function scriptDefaultKey(stage, p){
  if(stage === 'noticed' || stage === 'follow' || stage === 'offer') return p.lead || 'phone';
  if(stage === 'questions') return (p.objections && p.objections[0]) || 'catch';
  if(stage === 'thanks') return 'yes';
  return null;
}

/* Three options (one per style) for a stage, with owner replies attached.
   key: lead for noticed/follow/offer, objection for questions, 'yes'/'no' for thanks. */
function scriptOptions(stage, p, key){
  const L = SCRIPT_LIB;
  stage = L.alias[stage] || stage;
  const data = L.stages[stage];
  if(!data) return [];
  if(!key) key = scriptDefaultKey(stage, p);
  let list = Array.isArray(data) ? data : (data[key] || data[Object.keys(data)[0]]);
  if(!Array.isArray(data) && !data[key]) key = Object.keys(data)[0];
  const lead = p.lead || 'phone';
  list = list.filter(v => !v.lead || v.lead === lead);
  const vars = scriptVars(p), fp = {vars};
  const best = L.bestFit[p.arch];
  const out = [];
  for(const style of L.styleOrder){
    let cands = list.filter(v => v.style === style);
    if(p.gk){
      const g = cands.filter(v => v.gk);
      cands = g.length ? g : cands.filter(v => !v.ownerOnly);
    } else {
      cands = cands.filter(v => !v.gk);
    }
    if(!cands.length) continue;
    const v = pick(p.r, cands);
    const opt = {
      stage, key, style, raw:v.t, t:scriptTidy(fill(v.t, fp)), why:v.why, tags:v.tags || [],
      q: style === best ? 'best' : 'ok', gk:!!v.gk, owner:v.owner, byArch:v.byArch || null
    };
    opt.reply = (fit, extra) => ownerReply(opt, fit, p, extra);
    out.push(opt);
  }
  return out;
}

/* One owner reply to an option. fit: warm | even | cool (or best/ok/weak),
   or for the next stage an outcome: booked | counter | email | later (glad, email_only, not_now also accepted).
   extra: {reveal, pain, objection}; missing ones are taken from ARCH / p.painLine / OBJ when available. */
function ownerReply(opt, fit, p, extra){
  const L = SCRIPT_LIB, stage = opt.stage, owner = opt.owner || {};
  extra = extra || {};
  let f = ({best:'warm', ok:'even', weak:'cool', off:'cool'})[fit] || fit || 'even';
  if(stage === 'next'){
    f = ({warm:'booked', glad:'booked', gkBooked:'booked', even:'email', email_only:'email', cool:'later', not_now:'later', hung_up:'later'})[f] || f;
  }
  const a = opt.byArch && opt.byArch[p.arch];
  const sa = L.byArchStage[stage] && L.byArchStage[stage][p.arch];
  const fallback = stage === 'next' ? (owner.email || []) : (f === 'cool' ? (owner.even || []) : (owner.even || owner.warm || []));
  const useStage = sa && sa[f] && !(stage === 'next' && opt.gk);
  let pool = (a && a[f]) || (useStage ? sa[f] : null) || owner[f] || fallback;
  if(!pool || !pool.length) pool = fallback;
  if(!pool.length) return '';
  const used = p.used || (p.used = new Set());
  const fresh = pool.filter(x => !used.has(x));
  const line = pick(p.r, fresh.length ? fresh : pool);
  used.add(line);

  const A = (typeof ARCH !== 'undefined' && ARCH[p.arch]) || null;
  let reveal = extra.reveal;
  if(reveal == null && A && A.reveal && p.facts) reveal = A.reveal[p.facts.after] || '';
  let pain = extra.pain;
  if(pain == null) pain = p.painLine || (A && A.pain && A.pain.length ? pick(p.r, A.pain) : '');
  let objection = extra.objection;
  if(objection == null && typeof OBJ !== 'undefined'){
    const k = extra.objKey || (p.objections && p.objections[0]);
    objection = (k && OBJ[k]) ? pick(p.r, OBJ[k].say) : '';
  }
  let text = line.replace(/\{reveal\}/g, reveal || '').replace(/\{pain\}/g, pain || '').replace(/\{objection\}/g, objection || '');
  text = fill(text, {vars:scriptVars(p)});
  return scriptTidy(text);
}

if(typeof module !== 'undefined') module.exports = {SCRIPT_LIB, scriptOptions, ownerReply};
