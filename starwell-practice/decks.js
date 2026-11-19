/* =====================================================================
   STARWELL CALL DECKS: one caller-only read-along per real shop.
   Every fact below was read on the company's OWN website on the "checked" date.
   Anything we could not confirm is listed under "unknown": ask, never assume.
   Lines use the same five steps and terms as offer.js.
   ===================================================================== */
'use strict';
window.STARWELL_DECKS = {
  checked: 'November 16, 2026',

  /* who is calling: only used if the owner asks "who are you guys?" */
  callers: {
    Dan: {line:'I studied finance at Sacred Heart, and I spent two summers working for home improvement contractors, so I\'ve seen how a small crew\'s day really goes.', use:'Good with owners who talk numbers or run a tight crew.'},
    RJ: {line:'I studied IT at Sacred Heart, played football there, and did my MBA with a focus on AI. I worked on the university\'s phone systems, so this is my world.', use:'Good when the owner asks how the answering line or the tech works.'},
    Bobby: {line:'I build these systems myself. We set up the automations and the search work for Absolute Transportation in North Haven.', use:'Good when the owner asks who actually does the work.'}
  },
  company: {
    line:'We\'re a small Connecticut team. We built the systems and the search work for Absolute Transportation in North Haven, which saves their office time every week.',
    note:'Say this only if he asks who you\'ve worked with. If he asks more, be straight: it\'s a company one of our partners runs, and it\'s the one full setup we\'ve done so far. That\'s why the starter set is free.'
  },

  /* proof for each service, with where it comes from */
  proof: {
    found: [
      {t:'97% of people read reviews before choosing a local business.', s:'BrightLocal Local Consumer Review Survey 2026', u:'https://www.brightlocal.com/research/local-consumer-review-survey/'},
      {t:'45% now ask ChatGPT or another AI tool for local recommendations, up from 6% a year earlier.', s:'BrightLocal Local Consumer Review Survey 2026', u:'https://www.brightlocal.com/research/local-consumer-review-survey/'},
      {t:'72% of people look at three or fewer businesses before deciding, and 75% decide in under 30 minutes.', s:'BrightLocal Consumer Search Behavior 2026', u:'https://www.brightlocal.com/learn/local-seo/local-seo-statistics/'}
    ],
    site: [
      {t:'53% of phone visits are abandoned if a page takes longer than 3 seconds to load.', s:'Google, "The Need for Mobile Speed"', u:'https://www.marketingdive.com/news/google-53-of-mobile-users-abandon-sites-that-take-over-3-seconds-to-load/426070/'},
      {t:'54% of people visit the business\'s website after reading good reviews.', s:'BrightLocal Local Consumer Review Survey 2026', u:'https://www.brightlocal.com/learn/local-seo/local-seo-statistics/'},
      {t:'The top reason people pick which business to contact is clear, complete information.', s:'BrightLocal Consumer Search Behavior 2026', u:'https://www.brightlocal.com/learn/local-seo/local-seo-statistics/'}
    ],
    phone: [
      {t:'Home service companies miss about 14% of their calls.', s:'CallRail small-business benchmark, January 2025', u:'https://stealthagents.com/research/home-services-missed-call-revenue-statistics-2026'},
      {t:'66% of home-service buyers hung up when their call wasn\'t answered, and 51% stopped looking after reaching one provider.', s:'Invoca 2026 consumer survey', u:'https://stealthagents.com/research/home-services-missed-call-revenue-statistics-2026'},
      {t:'Companies that reply within an hour are about 7 times more likely to have a real conversation with the customer.', s:'Harvard Business Review, 2011', u:'https://scholarsarchive.byu.edu/facpub/9711'}
    ],
    social: [
      {t:'55% of people used social media to find a local business in the last 30 days.', s:'SOCi Local Discovery Index 2026', u:'https://golocal.soci.ai/rs/355-TUF-572/images/2026_LDI.pdf'},
      {t:'43% look at a business on social media before their first visit.', s:'SOCi Local Discovery Index 2026', u:'https://golocal.soci.ai/rs/355-TUF-572/images/2026_LDI.pdf'},
      {t:'59% say a social post or video has turned them into a customer of a local business.', s:'SOCi Local Discovery Index 2026', u:'https://golocal.soci.ai/rs/355-TUF-572/images/2026_LDI.pdf'}
    ],
    custom: [
      {t:'This one is our own work, not a study: the automations we built for Absolute Transportation save their office time every week.', s:'StarWell', u:''}
    ]
  },

  /* what a website rebuild includes, in caller words */
  rebuild: [
    {t:'The first screen', d:'Trade, town, star rating and review count at the top. A big call button next to a book-online button. A real photo of the team or trucks.'},
    {t:'More than one way to book', d:'A call button that stays on screen, online booking, a call-or-text option, and a form with 3 or 4 fields.'},
    {t:'Reviews people can check', d:'A review bar near the top (Google first, then Facebook, BBB), with recent reviews that name the service and the town.'},
    {t:'Answers that stop people from calling', d:'Price ranges for big jobs, financing as a monthly payment, the license number and dealer status.'},
    {t:'Services people can scan', d:'6 to 8 big tiles for the jobs he wants most, each linking to its own page.'},
    {t:'Behind the scenes', d:'Fast on a phone, every form tested, and every request answered by text within a minute.'}
  ],

  questions: {
    phone:'When you\'re out on a job or after the office closes, what happens when a customer calls?',
    site:'When someone finds your website at night, how do they usually reach you or book?',
    found:'How do most of your new customers find you these days?',
    social:'Do you get much time to post your jobs online, or is there never a minute for that?'
  },

  tiers: {
    1:'Call first. Owner-run, a clear gap we can fix for free, and a name neighbors already trust.',
    2:'Call next. Solid shops that already cover the basics, so the win is smaller and the bar is higher.'
  },

  companies: [
    {id:'benedetto', tier:1, name:'Benedetto Heating & AC LLC', said:'Benedetto Heating and AC', town:'Essex', area:'Shoreline', phone:'(860) 434-1574', site:'https://benedettohvac.com',
     ask:'Joe Benedetto', askNote:'Reviews name Joe Benedetto. The site doesn\'t state his title, so ask for him by name, not as "the owner".',
     since:'Established 2005, family-owned',
     facts:['Mitsubishi Diamond Elite Contractor, which the site calls Mitsubishi\'s highest certification','4.9 on Google with 75+ reviews shown','10 certified technicians and weekly team training','Tagline: "Where Pride and Quality Count"','Loyalty Program at $225 a year'],
     hours:'Mon to Fri, 8 to 4', emergency:'24-hour emergency access is for Loyalty Program members. Nothing stated for everyone else.', booking:'"Book Now" opens a contact form that says they reply within one business day. No online scheduler, text or chat.', reviews:'4.9 Google, 75+ reviews', social:'Instagram, Facebook, YouTube',
     lead:'phone', why:'The office closes at 4, the form answers the next business day, and 24-hour access is for members. A new customer with no heat at 7 p.m. has no quick way in.',
     notice:'I saw you\'re a Mitsubishi Diamond Elite contractor with a 4.9 on Google, and that your team trains every week. You don\'t see that often.',
     q:'When someone who isn\'t a Loyalty member calls after 4, what happens to that call?',
     fit:{phone:'Catches non-member calls after 4 and sends the details, so a new no-heat customer isn\'t lost overnight.', site:'The site is current. The one gap is booking: a real time picker would beat a next-day reply.', found:'"Ductless heat pump specialist on the shoreline" is exactly what people ask Google and ChatGPT.', social:'Already on three platforms. Job photos of ductless installs would keep them fresh.'},
     custom:'Loyalty Program renewals: reminders and tune-up booking without anyone calling down a list.',
     unknown:['Who owns the company (Joe Benedetto is named only in reviews)','What happens to non-member calls after hours'], careful:'Don\'t suggest they miss calls. Ask how it works and let him tell you.'},

    {id:'silvercity', tier:1, name:'Silver City Furnace Company', said:'Silver City Furnace', town:'Meriden', area:'Central', phone:'203-237-0995', site:'http://www.silvercityfurnace.com',
     ask:'John', askNote:'A review on the site names the owner as John. No last name is given.',
     since:'Family-owned, "over 50 years"',
     facts:['Four-time Readers\' Choice winner for Best Heating and Air Conditioning Service','Tagline: "Your Indoor Comfort Specialist"','The site says "Committed to our community"','A review says the owner helped a customer start a new AC unit for free','American Standard products'],
     hours:'Mon to Fri, 8 to 5', emergency:'Not stated on the site.', booking:'Phone only (a click-to-call button). No form, scheduler or text.', reviews:'Two reviews quoted, no star rating shown', social:'A Facebook icon that doesn\'t lead to a real page',
     lead:'phone', why:'Phone is the only way in, the office closes at 5, and the site says nothing about after hours.',
     notice:'I saw you\'ve won the Readers\' Choice award four times, and one review says the owner got a customer\'s new AC running for free. That says a lot about how you treat people.',
     fit:{phone:'With phone as the only way to reach them, every call after 5 matters. The line answers and sends John the details.', site:'The site was last updated around 2020. A fresh one would put the four awards and 50 years at the top with a request button.', found:'Four awards and 50 years in Meriden should show up when people search.', social:'The Facebook link on the site doesn\'t go anywhere. Real job posts would fix that.'},
     custom:'After-job review requests, so the goodwill in those stories shows up as Google reviews.',
     unknown:['John\'s last name and exact role','What happens to calls after 5','Their Google rating'], careful:'Never say the site is old. Say the new one would "show off the awards".'},

    {id:'broadbrook', tier:1, name:'Broad Brook Heating & Cooling Inc', said:'Broad Brook Heating and Cooling', town:'Preston', area:'Southeast', phone:'(860) 887-0147', site:'http://www.broadbrookheating.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'"Keeping You Comfortable Since 1999"',
     facts:['5 certified HVAC professionals and 3 service trucks','"5-Star Rated", with a 100% satisfaction guarantee on replacements','Serves New London County and Westerly, Rhode Island','Online scheduler on the site','Comfort Club maintenance plans'],
     hours:'Mon to Fri, 8 to 5. Saturday by appointment.', emergency:'Emergency service is for Comfort Club members only.', booking:'Online scheduler, email form and phone', reviews:'"5-Star Rated", no count shown', social:'Facebook, Yelp, Angi',
     lead:'phone', why:'Five people and three trucks means the phone rings while everyone is on a job, and emergency service is for members only.',
     notice:'I saw you\'ve been keeping people comfortable since 1999 with five techs and three trucks, and you put a 100% satisfaction guarantee on replacements.',
     q:'With everybody out in the three trucks, who catches the phone during the day, and after 5?',
     fit:{phone:'A five-person crew can\'t answer from a crawl space. The line picks up and sends the details.', site:'The site works and has a scheduler. Small win: show the review count next to "5-Star Rated".', found:'"Ductless experts in Norwich and Groton" is a search people make. The check shows where they land.', social:'Three trucks of daily jobs is plenty of photos for a month of posts.'},
     custom:'Comfort Club renewals and tune-up reminders.',
     unknown:['Owner\'s name','Who answers the phone during the day'], careful:'They already have a scheduler, so don\'t pitch booking. Stay on calls.'},

    {id:'rw', tier:1, name:'R&W Heating & Energy Solutions LLC', said:'R and W Heating', town:'Salem', area:'Southeast', phone:'860-848-9993', site:'http://www.rw-heating.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'Family owned, "Committed to Quality Since 2004"',
     facts:['4.6 on Google from 187 reviews','More than 1,000 full system installations','Technicians take refresher courses every year','10% military and senior discount on maintenance','Fujitsu ductless heat pumps'],
     hours:'Not stated on the site.', emergency:'24-hour service for contracted clients.', booking:'Phone and a contact page. No online scheduler.', reviews:'Google 4.6 from 187 reviews', social:'Facebook, Instagram',
     lead:'phone', why:'24-hour service is for contracted clients, and there\'s no way to book online. New customers after hours get no quick answer.',
     notice:'I saw you\'ve done over a thousand full system installs since 2004, with a 4.6 from 187 Google reviews. That\'s a lot of happy basements.',
     q:'When someone who isn\'t a contract customer calls at night, what happens to that call?',
     fit:{phone:'Answers the non-contract callers at night and sends the details, so they can become contract customers.', site:'A request-service button and those 187 reviews at the top would do more of the selling.', found:'1,000+ installs is a strong story for Google and AI answers about heat pumps in southeast Connecticut.', social:'Install photos would back up the "1,000+" number.'},
     custom:'Service-contract renewals and annual tune-up scheduling.',
     unknown:['Owner\'s name','Office hours'], careful:'Lead with respect for the install count. It\'s their pride.'},

    {id:'corbett', tier:1, name:'Corbett HVAC Services, LLC', said:'Corbett HVAC', town:'Willimantic', area:'East', phone:'(860) 942-0183', site:'https://www.corbetthvac.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'"25+ years of service"',
     facts:['BBB Accredited and Google Guaranteed badges','5-year labor warranty on select new installations','0% financing for up to 24 months','Serves Windham and the rest of Eastern Connecticut','Boilers, furnaces, heat pumps, mini splits, duct cleaning'],
     hours:'Office Mon to Fri, 8 to 3:30', emergency:'Open 24 hours, but only for existing clients who had their annual maintenance done.', booking:'Quote request form, phone and email. No online scheduler.', reviews:'Badges only, no numbers shown', social:'Facebook, Instagram',
     lead:'phone', why:'The office closes at 3:30 and after-hours service is for existing maintained clients only.',
     notice:'I saw you put a five-year labor warranty on installs and you\'re Google Guaranteed. That\'s standing behind your work.',
     q:'After the office closes at 3:30, what happens when someone who isn\'t a client yet calls?',
     fit:{phone:'Answers new callers after 3:30 and takes their details, so they can be signed up as clients the next morning.', site:'Showing the Google rating in numbers, not just badges, would build trust faster.', found:'Being Google Guaranteed is rare. It should show when Eastern Connecticut searches.', social:'Two pages already. Warranty and before-and-after posts would work well.'},
     custom:'New-client sign-up: collects what the office needs so a caller becomes a client without phone tag.',
     unknown:['Owner\'s name','Their Google rating and review count'], careful:'Their after-hours rule is a choice, not a mistake. Respect it and offer to catch the callers it leaves out.'},

    {id:'quietcorners', tier:1, name:'Quiet Corners Mechanical Services, LLC', said:'Quiet Corners Mechanical', town:'Windham area', area:'East', phone:'(860) 423-8560', site:'https://www.quietcornersmechanicalservices.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'Family-owned since 2011, "over 45 years of industry experience"',
     facts:['Serves Tolland, Windham and New London counties','You can call or text the same number','1-year labor warranty on installs, free quotes','Heat pumps, mini-splits, radiant floor, tankless, duct cleaning'],
     hours:'Mon to Fri, 8 to 4:30. Closed weekends.', emergency:'Not stated on the site.', booking:'Request form, phone and text', reviews:'None shown on the site', social:'Facebook, Instagram',
     lead:'phone', why:'Closed weekends, nothing stated about emergencies, and no reviews on the site.',
     notice:'I saw you\'re family-owned since 2011 with over 45 years of experience between you, and that people can text you. That\'s easy to do business with.',
     fit:{phone:'Covers weekends and evenings without anyone giving up family time.', site:'A few spots on the site still show filler text. A rebuild fixes that and adds reviews.', found:'No reviews on the site, so the search check shows what customers see first.', social:'Family-owned is a story neighbors like to follow.'},
     custom:'Free-quote follow-up, so estimates don\'t go quiet.',
     unknown:['Owner\'s name','Weekend and after-hours handling','Google rating'], careful:'The filler text is a kind heads-up for later in the call or the walkthrough, never the opener.'},

    {id:'superiorcomfort', tier:1, name:'Superior Comfort Heating & Air Conditioning LLC', said:'Superior Comfort', town:'Ansonia', area:'Valley', phone:'(203) 736-6309', site:'https://superiorcomfort.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'In business since 1996',
     facts:['The site says: "We stand behind our workmanship one hundred percent"','Homes and businesses across New Haven and Fairfield counties','Oil-to-gas conversions, radiant heat, ductless, boilers','Yearly service agreements'],
     hours:'Not stated on the site.', emergency:'There\'s an "Emergency HVAC" heading, but no policy is stated.', booking:'Phone and a "Get A Quote" page. No online scheduler.', reviews:'None shown on the site', social:'Facebook',
     lead:'site', why:'The site still says "26+ years" and shows a 2023 date, with no reviews and no quick way to book. It undersells a 30-year shop.',
     notice:'I saw you\'ve been at it since 1996, and I liked the line on your site: you stand behind your workmanship one hundred percent.',
     fit:{phone:'Hours and emergency policy aren\'t on the site, so ask first. The line would cover whatever gap he names.', site:'A fresh site would say 30 years, show reviews at the top and add a request button.', found:'No reviews on the site, so the check shows how they look next to the shops ranked first.', social:'Facebook only. Job photos would show the work they stand behind.'},
     custom:'Service-agreement renewals.',
     unknown:['Owner\'s name','Hours and after-hours handling','Google rating'], careful:'Never say "outdated". Say the site "doesn\'t show off your 30 years yet".'},

    {id:'masters', tier:1, name:'Masters Heating & Air Conditioning, Inc.', said:'Masters Heating and Air', town:'Wallingford', area:'Central', phone:'203-265-4434', site:'http://mastersheatingandair.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'Began in 1972 as Masters Refrigeration Service, incorporated under today\'s name in 1992',
     facts:['Independent Lennox dealer','Custom ductwork and their own sheet metal fabrication','24/7 emergency service','Senior discount and free estimates on new equipment'],
     hours:'Not stated on the site.', emergency:'24 hours, 7 days a week.', booking:'Phone or email only. No form, scheduler or text.', reviews:'None shown on the site', social:'Facebook',
     lead:'site', why:'Phone and email are the only ways in, there are no reviews, and an old phone-outage notice is still on the homepage.',
     notice:'I saw you started in 1972 as Masters Refrigeration, and that you still make your own ductwork in-house. Not many shops do that anymore.',
     fit:{phone:'They list 24/7 service. Ask who carries the phone at night before offering anything.', site:'A rebuild adds a request button, reviews and photos of the sheet metal shop.', found:'"Custom ductwork Wallingford" is a search few shops can answer. They can.', social:'Sheet metal fabrication photos are the kind people stop and look at.'},
     custom:'Estimate follow-up on new equipment quotes.',
     unknown:['Owner\'s name','Office hours','Google rating'], careful:'Mention the old outage notice only as a friendly heads-up in the walkthrough.'},

    {id:'nutmeg', tier:1, name:'Nutmeg Mechanical Services, Inc.', said:'Nutmeg Mechanical', town:'Manchester', area:'Hartford area', phone:'860.643.2042', site:'http://www.nutmegmechanical.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'Since 1982',
     facts:['Tagline: "The Heating, Air Conditioning and Mini Split Specialist"','Angie\'s List Super Service Award winner','Installs for homes, banks, churches and industrial plants','Aeroseal duct sealing and geothermal','24-hour emergency service, 7 days a week'],
     hours:'Not stated on the site.', emergency:'24-hour emergency service, 7 days a week.', booking:'Phone and a "Request A Quote" form. No online scheduler.', reviews:'None shown on the site', social:'Facebook',
     lead:'site', why:'The site carries a 2015 date and shows no reviews. 44 years of work isn\'t visible on it.',
     notice:'I saw you\'ve been the mini split specialist in Manchester since 1982, and that you\'ve done everything from homes to banks and churches.',
     fit:{phone:'They already run 24-hour emergency service. Ask how daytime overflow is handled.', site:'A fresh site built for phones would show the award, reviews and a request button.', found:'"Mini split specialist" and "Aeroseal" are exactly what people type into Google and ChatGPT.', social:'Bank and church installs make strong before-and-after posts.'},
     custom:'Quote follow-up for commercial and residential estimates.',
     unknown:['Owner\'s name','Office hours','Google rating'], careful:'Don\'t mention the 2015 date. Talk about what a new site would show.'},

    {id:'rb', tier:1, name:'R&B Refrigeration, Air Conditioning & Heating', said:'R and B Refrigeration', town:'Guilford', area:'Shoreline', phone:'203-453-6831', site:'https://rbrefrig.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'"Trusted Cooling Contractor Since 1984"',
     facts:['Trane dealer','Commercial refrigeration plus home heating and cooling','A 24-hour phone line','Office on Boston Post Road in Guilford'],
     hours:'Mon to Fri, 8 to 5', emergency:'A 24/7 phone line: "available 24 hours".', booking:'Request form, quote form, phone and email', reviews:'Five testimonials from 2018, no star rating', social:'Facebook, LinkedIn',
     lead:'site', why:'The blog and testimonials stop around 2018 to 2019, so the site looks quieter than the business is.',
     notice:'I saw you\'ve been in Guilford since 1984 and that you handle commercial refrigeration as well as homes. That\'s a rare mix.',
     fit:{phone:'They have a 24-hour line. Ask who answers it and whether it ever goes to voicemail.', site:'A rebuild brings in current reviews and shows both sides: restaurants and homes.', found:'Restaurant owners searching "commercial refrigeration repair Guilford" should find them first.', social:'Walk-in cooler rescues make good local posts.'},
     custom:'Maintenance scheduling for commercial refrigeration accounts.',
     unknown:['Owner\'s name','Google rating'], careful:'Don\'t say the site looks abandoned. Say "your newest reviews aren\'t on it yet".'},

    {id:'homehvac', tier:1, name:'Home Heating & Air Conditioning, LLC', said:'Home Heating and Air Conditioning', town:'West Haven', area:'New Haven area', phone:'(203) 932-5484', site:'http://homehvac.net',
     ask:'Dave', askNote:'Reviews on the site mention "Dave". His role isn\'t stated, so ask for him by name.',
     since:'"Proudly serving southern CT for 45 years"',
     facts:['Natural gas conversions and gas water heaters','The site says water heater installs are "often done in under 2 hours"','Their own in-house ductwork','CT license 303043-S1'],
     hours:'Not stated on the site.', emergency:'Not stated on the site.', booking:'A "Call Today" button and an email address. No form or scheduler.', reviews:'Three testimonials, no star rating', social:'Facebook, Yelp',
     lead:'site', why:'Calling or emailing are the only ways in, and there are no ratings on the site.',
     notice:'I saw you\'ve served southern Connecticut for 45 years, and that you can swap a water heater in under two hours. People love that when they have no hot water.',
     fit:{phone:'Hours aren\'t on the site, so ask. The line would catch calls while he\'s on an install.', site:'A request button, reviews and "45 years" at the top would do the selling for him.', found:'"Water heater replacement West Haven" is an urgent search. The check shows who gets it now.', social:'Two-hour water heater swaps are easy before-and-after posts.'},
     custom:'A quick quote tool for water heater replacements.',
     unknown:['Whether Dave is the owner','Hours and after-hours handling','Google rating'], careful:'Small shop. Keep it short and practical.'},

    {id:'heatpeople', tier:1, name:'The Heat People, Inc.', said:'The Heat People', town:'Uncasville', area:'Southeast', phone:'(860) 848-4121', site:'http://theheatpeople.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'Family owned, 33 years serving southeastern Connecticut',
     facts:['Serves about 40 towns from Norwich to Mystic','Ductless heat pumps, furnaces and boilers, oil-to-gas, fuel delivery','Complimentary in-home estimates','The site says "strength in customer satisfaction"'],
     hours:'Not stated on the site.', emergency:'24-hour heat and hot water service for existing customers.', booking:'Phone only. No form, scheduler or text.', reviews:'None shown on the site', social:'None linked',
     lead:'site', why:'Phone is the only way in, and there are no reviews or social links. The site gives a new customer little to go on.',
     notice:'I saw you\'re family owned and have been keeping southeastern Connecticut warm for 33 years, across about 40 towns.',
     fit:{phone:'24-hour service is for existing customers. The line catches new callers and sends the details.', site:'A rebuild adds a request button, reviews and photos of the family and trucks.', found:'With no reviews on the site, the check shows what Google shows instead.', social:'No social pages are linked. A starter month gives them a real one.'},
     custom:'Fuel delivery reminders and tune-up scheduling.',
     unknown:['Owner\'s name','Office hours','Google rating'], careful:'Family business. Lead with the 33 years.'},

    {id:'seans', tier:1, name:'Sean\'s Heating & Cooling, LLC', said:'Sean\'s Heating and Cooling', town:'Milford', area:'Shoreline', phone:'203-901-1134', site:'http://seansheatingandcooling.com',
     ask:'Sean', askNote:'The owner\'s name isn\'t stated. Asking for Sean is a fair guess from the company name. If someone else answers, ask who the owner is.',
     since:'"20 years\' experience"',
     facts:['Same-day emergency service','Free estimates, and a tune-up advertised at $185','Heating, AC, water heaters, home and commercial repairs','Licensed, bonded and insured'],
     hours:'Not stated on the site.', emergency:'Same-day emergency service available.', booking:'A link to the contact page and a phone number. No scheduler.', reviews:'None shown on the site', social:'None linked',
     lead:'site', why:'No reviews, no social links, and parts of the footer still show unfilled template text.',
     notice:'I saw you offer same-day emergency service and you post your tune-up price right on the site. Most shops won\'t show a price.',
     fit:{phone:'A small shop can\'t answer while on a job. The line picks up and sends the details.', site:'A rebuild puts reviews, the $185 tune-up and a request button on the first screen.', found:'With no reviews on the site, the check shows what customers see on Google.', social:'No pages linked. A starter month gives him something to show.'},
     custom:'Tune-up reminders for past customers each season.',
     unknown:['Whether Sean is the owner','Address and hours','Google rating'], careful:'Posting a price takes confidence. Compliment it.'},

    {id:'kevindean', tier:1, name:'Kevin T. Dean Heating & Cooling Services, LLC', said:'Kevin Dean Heating and Cooling', town:'Wolcott', area:'Waterbury area', phone:'203-509-0219', site:'http://kevindeanheatingandcooling.com',
     ask:'Kevin Dean', askNote:'The site names Kevin T. Dean as owner and operator.',
     since:'"Trust 40 Years of HVAC Experience"',
     facts:['Owner-operated, with a "small team of locals"','Homes, commercial and industrial work','24/7 emergency service','Free estimates and upfront pricing'],
     hours:'Mon to Fri, 8 to 4:30', emergency:'24/7 emergency service.', booking:'Phone and a contact page. No scheduler.', reviews:'None shown on the site', social:'Facebook',
     lead:'found', why:'Forty years of experience, but no reviews or ratings on the site. The search check is an easy, useful first gift.',
     notice:'I saw you\'ve got 40 years in the trade and you still run it yourself with a small local team.',
     fit:{phone:'He lists 24/7 service. Ask if that means his own cell phone at 2 a.m.', site:'Reviews and a request button would back up the 40 years.', found:'The check shows where a 40-year name lands next to newer shops in Wolcott.', social:'Facebook only. Industrial and home jobs both make good posts.'},
     custom:'Quote follow-up for commercial jobs.',
     unknown:['Google rating','How after-hours calls are handled'], careful:'He is the business. Respect the 40 years and keep it brief.'},

    {id:'chickos', tier:1, name:'Chickos Home Comfort LLC', said:'Chickos Home Comfort', town:'Seymour', area:'Valley', phone:'(203) 659-8409', site:'https://www.chickoshomecomfort.com',
     ask:'Matthew Chickos', askNote:'The site names Matthew A. Chickos as owner.',
     since:'Third-generation family business, "over three decades"',
     facts:['Tagline: "The name you know, the quality you expect!"','Two-year labor coverage on new installations','Open every day, 8 to 5, with 24/7 emergency service','You can call or text'],
     hours:'Every day, 8 to 5', emergency:'24/7 emergency service.', booking:'Phone, text and a call-back form. No online scheduler.', reviews:'None shown on the site (a link only)', social:'Facebook',
     lead:'found', why:'Three generations and a name the Valley knows, but no ratings on the site. The check shows what a new neighbor sees.',
     notice:'I saw you\'re third generation, and you put two years of labor coverage on new installs. That\'s a real promise.',
     fit:{phone:'They list 24/7 service and text. Ask who handles the overnight calls.', site:'A few spots still show template text. A rebuild cleans that up and shows reviews.', found:'People who "know the name" still look it up. The check shows what they find.', social:'Three generations is a story. Old photos next to new installs would do well.'},
     custom:'Two-year coverage reminders and tune-up booking.',
     unknown:['Google rating','Overnight call handling'], careful:'Family pride matters here. Lead with the generations.'},

    {id:'onofreo', tier:1, name:'Onofreo Home Comfort Systems LLC', said:'Onofreo Home Comfort', town:'Milford', area:'Shoreline', phone:'(203) 202-0891', site:'https://www.onofreohomecomfort.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'In business since 2018, with 30+ years of experience',
     facts:['Woman-owned and minority-owned','Mitsubishi Diamond Dealer, NATE-certified technicians','Estimates within 24 hours','2-year labor warranty on installations','24/7 emergency service, and you can text them'],
     hours:'Mon to Fri, 8:30 to 4:30. Closed weekends.', emergency:'24/7 emergency service.', booking:'Request form, phone and text', reviews:'The site mentions high Google ratings but shows no count', social:'Facebook, Instagram, X, LinkedIn',
     lead:'found', why:'A young company with strong credentials. Being found is what grows a shop that started in 2018.',
     notice:'I saw you\'re woman-owned, a Mitsubishi Diamond Dealer, and you promise estimates within 24 hours.',
     fit:{phone:'Closed weekends with 24/7 emergency service. Ask who covers Saturday calls.', site:'A few spots on the site still show filler text. A rebuild fixes that and shows the real review count.', found:'"Woman-owned HVAC Milford" and "Mitsubishi Diamond Dealer" are searches they should own.', social:'Four pages already. A steady month of job posts keeps them all current.'},
     custom:'24-hour estimate promise: a tool that drafts the estimate so the promise is easy to keep.',
     unknown:['Owner\'s name','Google review count'], careful:'The filler text is a kind heads-up for the walkthrough, not the opener.'},

    {id:'giordanos', tier:1, name:'Giordano\'s Heating & Air Conditioning', said:'Giordano\'s Heating and Air', town:'Derby', area:'Valley', phone:'203-941-5099', site:'http://www.giordanosct.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'Since 1979',
     facts:['Lennox Premier Dealer with a 10-year partnership award','Tagline: "HVAC Service You Can Depend On"','Serves Derby, Ansonia, Shelton, Seymour, Milford and more','$500 off a new system right now'],
     hours:'Not stated on the site.', emergency:'Not stated on the site.', booking:'Contact form, "Request Service" button and phone. No scheduler.', reviews:'None shown (a link only)', social:'Facebook',
     lead:'phone', why:'Hours and after-hours aren\'t on the site, so asking is natural, and the answer tells you what to offer.',
     notice:'I saw you\'ve been in Derby since 1979 and you\'re a Lennox Premier Dealer with a ten-year partnership award.',
     fit:{phone:'If nights go to voicemail, the line answers and sends the details.', site:'The page title spells the name "Gioranos". A rebuild fixes details like that and adds reviews.', found:'47 years in the Valley should show up first for "furnace repair Derby".', social:'Facebook only. Job photos would keep it active.'},
     custom:'Service-agreement renewals.',
     unknown:['Owner\'s name','Hours and after-hours handling','Google rating'], careful:'The title typo is a friendly heads-up for later, never the opener.'},

    {id:'nero', tier:1, name:'Nero Air Conditioning & Heating Inc.', said:'Nero Air Conditioning and Heating', town:'North Haven', area:'New Haven area', phone:'(203) 248-8110', site:'https://neroac.com',
     ask:'Steve or Sue Nero', askNote:'The site names Sue and Steve Nero as owners.',
     since:'Serving since 1988, "over 37 years of experience"',
     facts:['Trane Comfort Specialist','A+ with the BBB','Homes and businesses, plus refrigeration and custom ductwork','A sister company, Bartol Heating and Cooling, in New London','24/7 emergency service'],
     hours:'Mon to Fri, 8 to 4. Closed weekends.', emergency:'24/7 emergency service.', booking:'Phone, email and a request form that asks for the best time to call back', reviews:'A review widget with no count, BBB A+', social:'Facebook',
     lead:'found', why:'A respected local name with phones covered. The search check is the easy first yes.',
     notice:'I saw you and Sue have run Nero since 1988, you\'re a Trane Comfort Specialist, and you have an A+ with the BBB.',
     fit:{phone:'The office closes at 4. Ask who takes the calls between 4 and bedtime.', site:'A 2020 COVID notice is still on the site. A refresh clears that and adds booking.', found:'37 years and two locations should lead Google and AI answers for North Haven.', social:'Facebook only. Custom ductwork and refrigeration jobs make good posts.'},
     custom:'Maintenance-plan renewals across both companies.',
     unknown:['Google rating and count','Who answers after 4'], careful:'Local to us. Be extra respectful: this is a neighbor.'},

    {id:'airinc', tier:2, name:'AIR, Inc. Heating & Air Conditioning', said:'Air Inc', town:'Branford', area:'Shoreline', phone:'(203) 871-0801', site:'https://www.airinchvac.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'"Keeping Homeowners Comfy Since 1991"',
     facts:['BBB A+ with zero complaints since 2000','Mitsubishi Diamond Contractor logo on the site','24/7 emergency support, same-day and weekend appointments','Serves 50+ towns along the shoreline'],
     hours:'Not stated on the site.', emergency:'24/7 emergency support.', booking:'Online scheduling link, form and phone', reviews:'No star rating shown, three testimonials', social:'Facebook, YouTube',
     lead:'found', why:'Phones and site are in good shape. The open question is whether they show up when people search.',
     notice:'I saw you\'ve kept homeowners comfy since 1991 with zero BBB complaints since 2000. That\'s rare.',
     fit:{phone:'They advertise 24/7 support. Ask who picks up at 2 a.m. before offering.', site:'The site is current. Small win: show the Google rating near the top.', found:'35 years and a clean record should come up for "ductless" along the shoreline.', social:'Job posts from 50+ towns would keep Facebook and YouTube fresh.'},
     custom:'Maintenance reminders across 50+ towns.',
     unknown:['Owner\'s name','Google rating'], careful:'A well-run shop. The search check is the only honest first offer.'},

    {id:'nathan', tier:2, name:'A&S Nathan Heating & Cooling LLC', said:'A and S Nathan Heating and Cooling', town:'Ansonia', area:'Valley', phone:'(203) 735-5332', site:'http://nathanheating.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'Family-owned, established 2000',
     facts:['Mitsubishi Preferred Diamond Dealer','2024 Pulse Award winner','15% off for veterans, active military and first responders','Estimates within 24 hours, 24/7 emergency service','Tagline: "We Service And Install It All!"'],
     hours:'Not stated on the site.', emergency:'24/7 emergency service.', booking:'Online appointment form with a date and time window, plus phone', reviews:'5 stars shown, no count', social:'Facebook',
     lead:'found', why:'The basics are covered. The veteran discount and the award are stories more people should find.',
     notice:'I saw you give 15% off to veterans and first responders, and you won a Pulse Award last year.',
     fit:{phone:'They list 24/7 service. Ask how nights are handled.', site:'The site is current and takes appointments. No rebuild needed.', found:'The check shows whether the award and reviews appear when people search.', social:'Facebook only. The veterans discount is a post people share.'},
     custom:'24-hour estimate turnaround.',
     unknown:['Owner\'s name','Google review count'], careful:'Thank them for the veterans discount. Mean it.'},

    {id:'homecomfort', tier:2, name:'Home Comfort Heating & Cooling Solutions', said:'Home Comfort Heating and Cooling', town:'East Haven', area:'New Haven area', phone:'(203) 349-2331', site:'https://lovemyheating.com',
     ask:'Stephen', askNote:'A review on the site names the owner as Stephen. No last name is given.',
     since:'Family-owned, 30 years of experience',
     facts:['Tagline: "We Help Turn Your Home Into An Oasis"','Open Saturdays 8 to 2, with a 24/7 emergency banner','BBB seal, Wells Fargo financing','They\'re hiring','The mission statement mentions their faith'],
     hours:'Mon to Fri, 7:30 to 6. Saturday 8 to 2.', emergency:'A "24/7 Emergency Service" banner.', booking:'"Request Service" form and phone. No scheduler.', reviews:'No rating shown (a Google link)', social:'Facebook',
     lead:'found', why:'Long hours and emergency cover are in place. Ratings aren\'t shown, so the search check is the useful gift.',
     notice:'I saw you\'re open till 6 and on Saturdays, and I liked the line about turning a home into an oasis.',
     fit:{phone:'Long hours already. Ask if hiring means the phones are stretched.', site:'A booking button and visible reviews would finish a good site.', found:'The check shows how they rank next to New Haven shops.', social:'Facebook only. "Oasis" before-and-after posts fit the brand.'},
     custom:'A hiring helper that screens applicants.',
     unknown:['Stephen\'s last name','Google rating'], careful:'They mention their faith. Be respectful and don\'t bring it up yourself.'},

    {id:'mandr', tier:2, name:'M&R Mechanical Services', said:'M and R Mechanical', town:'Milford', area:'Shoreline', phone:'203-874-7914', site:'https://mandrmechanical.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'"Heating & Cooling Experts Since 1959"',
     facts:['Over 65 years serving southern Connecticut','EliteCare Club maintenance membership','Serves 21 towns from Milford to Greenwich','0% financing for 18 months on a new system'],
     hours:'Not stated on the site.', emergency:'Emergency repairs are mentioned, but no policy is stated.', booking:'Online "Schedule Service" page, form and phone', reviews:'One sample review, no rating shown', social:'Facebook, LinkedIn',
     lead:'found', why:'65 years and a working site. Reviews aren\'t shown, so the check is the natural first gift.',
     notice:'I saw you\'ve been at it since 1959. Sixty-five years in one trade is something.',
     fit:{phone:'After-hours policy isn\'t stated. Ask.', site:'The site works. Showing ratings at the top is the one gap.', found:'21 towns means 21 chances to show up. The check shows which ones do.', social:'65 years of history makes easy "then and now" posts.'},
     custom:'EliteCare Club renewals.',
     unknown:['Owner\'s name','After-hours handling','Google rating'], careful:'Probably a larger team. Expect an office manager to answer.'},

    {id:'modern', tier:2, name:'Modern Heating & Air Conditioning, LLC', said:'Modern Heating and Air', town:'Milford', area:'Shoreline', phone:'203-295-7549', site:'http://www.modernhvacct.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'Not stated on the site',
     facts:['American Standard Customer Care Dealer','"Best Of Milford" and NATE-certified technicians','A review names a technician, Victor','Blog posts through 2026','You can text them'],
     hours:'Not stated on the site.', emergency:'Not stated on the site.', booking:'"Schedule a Service" link, form, phone and text', reviews:'Testimonials, no rating shown', social:'Facebook, Instagram, Yelp',
     lead:'phone', why:'An active, modern shop, but hours and after-hours aren\'t on the site. Asking is natural.',
     notice:'I saw you were named Best of Milford and you\'re an American Standard Customer Care Dealer. One of your reviews mentions Victor by name.',
     fit:{phone:'If nights and weekends go to voicemail, the line covers them.', site:'The site is current. No rebuild needed.', found:'The page title says New Haven while the office is in Milford. The check shows how that affects search.', social:'Three pages already. A steady month keeps them matched.'},
     custom:'Review requests after each job.',
     unknown:['Owner\'s name','Hours and after-hours handling','Google rating'], careful:'They already market well. Offer only what\'s missing.'},

    {id:'climatepros', tier:2, name:'Climate Pros Heating & Cooling Corp', said:'Climate Pros', town:'Orange', area:'New Haven area', phone:'203-242-4422', site:'https://climateprosct.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'Family-owned, "decades of experience"',
     facts:['Open 24/7/365','Heating, cooling and plumbing','Comfort Club membership with guaranteed 24/7 service','They\'re hiring (a Careers page)'],
     hours:'Open 24/7/365', emergency:'24/7. Comfort Club members get guaranteed emergency service.', booking:'Phone, and a review mentions scheduling on the website', reviews:'Six testimonials, no rating shown', social:'Facebook',
     lead:'found', why:'Phones are covered around the clock. Being found and showing reviews is the gap.',
     notice:'I saw you\'re family-owned and open 24/7, 365 days a year. That\'s a real commitment.',
     fit:{phone:'Already 24/7. Ask who answers at night: staff or a service?', site:'One section still says "Coming Soon". A refresh finishes it and shows ratings.', found:'"24/7 HVAC Orange CT" is a search they should win.', social:'Facebook only. 2 a.m. rescue stories make good posts.'},
     custom:'Comfort Club renewals.',
     unknown:['Owner\'s name','Google rating'], careful:'Don\'t offer the answering line unless he says nights are a burden.'},

    {id:'climatech', tier:2, name:'Climatech Mechanical', said:'Climatech Mechanical', town:'Wallingford', area:'Central', phone:'(475) 253-5209', site:'http://www.climatechmechanical.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'Family-owned since 1994',
     facts:['"Celebrating 30 Years of Premier HVAC Service"','Same-day service when staffing allows','Commercial HVAC and refrigeration too','Serves 23 towns in three counties'],
     hours:'Mon to Fri, 8 to 5', emergency:'Emergency service is offered. After-hours policy isn\'t stated.', booking:'Request form, phone and text', reviews:'Four testimonials, no rating shown', social:'Facebook, LinkedIn, X',
     lead:'phone', why:'The office closes at 5 and the after-hours policy isn\'t stated.',
     notice:'I saw you\'ve been family-owned since 1994 and you offer same-day service when you can.',
     fit:{phone:'Covers after 5 and the days when same-day isn\'t possible.', site:'Showing the Google rating would finish it.', found:'23 towns to show up in. The check shows where they do.', social:'Three pages. Commercial and home jobs both post well.'},
     custom:'Same-day scheduling helper.',
     unknown:['Owner\'s name','After-hours handling','Google rating'], careful:'Keep it simple. One question, then listen.'},

    {id:'airspecialties', tier:2, name:'Air Specialties Air Conditioning & Heating', said:'Air Specialties', town:'West Haven', area:'New Haven area', phone:'(475) 253-8825', site:'https://www.airspecialtiesac.com',
     ask:'the owner', askNote:'Founded by Frank Bradley in 1952 and now second generation. The current owner isn\'t named.',
     since:'Founded 1952, family-owned, second generation',
     facts:['5 stars from 100 reviews across Google, Yelp and Facebook','Some customers have been on service contracts since the early 1990s','24/7 emergency service, including weekends and holidays','Tagline: "A Legacy of Comfort You Can Count On"'],
     hours:'Mon to Fri, 7:30 to 4', emergency:'24/7, including weekends and holidays.', booking:'Phone, request form and an appointment link', reviews:'5 stars from 100 reviews', social:'Facebook, X, Yelp',
     lead:'found', why:'A 74-year name with perfect reviews. The check shows whether new neighbors can find it.',
     notice:'I saw the company goes back to 1952, and you have customers who\'ve stayed on service contracts since the early nineties. That\'s loyalty.',
     fit:{phone:'They list 24/7 service. Ask who carries it.', site:'The headline says New Haven while the office is in West Haven. A small fix.', found:'100 five-star reviews should put them at the top of AI answers.', social:'A 1952 founding story is made for "then and now" posts.'},
     custom:'Service-contract renewals.',
     unknown:['Current owner\'s name','How after-hours calls are handled'], careful:'Legacy matters. Lead with 1952.'},

    {id:'allamerican', tier:2, name:'All American Heating & Air Conditioning', said:'All American Heating and Air', town:'Wolcott', area:'Waterbury area', phone:'(475) 219-2216', site:'https://www.allamericanhvacct.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'Since 1987',
     facts:['Works with builders including Toll Brothers and Pulte Homes','Heating, cooling and plumbing','Tagline: "From A Neighbor You Can Count On"','Maintenance plan with two visits a year'],
     hours:'Mon to Thu, 8 to 4:30. Friday 8 to 2.', emergency:'Emergency service is for maintenance plan members.', booking:'Phone, form and a "Schedule Your Appointment" link', reviews:'Nine testimonials, no rating shown', social:'Facebook',
     lead:'phone', why:'The office closes at 2 on Fridays and emergency service is for plan members.',
     notice:'I saw you\'ve been at it since 1987 and you do work for builders like Toll Brothers and Pulte.',
     q:'On a Friday after 2, what happens when someone who isn\'t on a maintenance plan calls?',
     fit:{phone:'Covers Friday afternoons and weekends for non-members.', site:'Showing a star rating would finish a good site.', found:'Builder work is strong proof. The check shows if homeowners can see it.', social:'New-construction installs make clean, good-looking posts.'},
     custom:'Builder job scheduling and updates.',
     unknown:['Owner\'s name','Google rating'], careful:'Their member-only rule is a choice. Offer to catch the rest.'},

    {id:'centralair', tier:2, name:'Central Air, LLC', said:'Central Air', town:'Brookfield', area:'Danbury area', phone:'203-403-6174', site:'https://www.centralairllc.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'Locally owned and operated since 2003',
     facts:['Named "Best Air Conditioning Contractor in Brookfield for 2026"','Lennox dealer and Mitsubishi Diamond Contractor','Takes part in Lennox\'s "Feel the Love" community program','Serves 29 towns around Brookfield and Danbury'],
     hours:'Not stated on the site.', emergency:'Not clearly stated.', booking:'Contact form, "Request service" button and phone. No scheduler.', reviews:'None shown (links only)', social:'Facebook',
     lead:'phone', why:'Hours and after-hours aren\'t stated, so the question is natural.',
     notice:'I saw you were named Best Air Conditioning Contractor in Brookfield this year, and that you take part in Feel the Love.',
     fit:{phone:'If nights go to voicemail, the line answers and sends the details.', site:'A booking tool and visible reviews would match the award.', found:'An award-winner should lead the answers for Brookfield and Danbury.', social:'Facebook only. Feel the Love is a story worth telling.'},
     custom:'Service-agreement renewals.',
     unknown:['Owner\'s name','Hours and after-hours handling','Google rating'], careful:'Congratulate the award first.'},

    {id:'hellas', tier:2, name:'Hellas Air Temp Inc', said:'Hellas Air Temp', town:'Norwalk', area:'Fairfield County', phone:'(475) 208-4828', phoneNote:'This number comes from a directory listing, not their homepage. Confirm it before calling.', site:'http://www.hellasairtemp.com',
     ask:'the owner', askNote:'No owner name on the site.',
     since:'"Trusted since 1978"',
     facts:['Radiant snow melt, walk-in coolers and wine coolers, plus home heating and cooling','Carrier and Mitsubishi Diamond Contractor','Runs the "Trades by Tony Scholarship"','NATE certified'],
     hours:'Mon to Fri, 8 to 4:30', emergency:'Emergency service is for maintenance clients only.', booking:'A "Get a Quote Now" page. No phone number on the homepage.', reviews:'None shown on the site', social:'Instagram, Facebook',
     lead:'site', why:'The homepage shows no phone number and a few menu links are broken, so a ready customer has to hunt.',
     notice:'I saw you\'ve been trusted since 1978, and that you run the Trades by Tony Scholarship. That\'s giving back to the trade.',
     fit:{phone:'Emergency service is for maintenance clients. The line catches everyone else.', site:'A rebuild puts the phone number and a request button on the first screen and fixes the links.', found:'"Snow melt" and "wine cooler repair" are searches almost nobody else can answer.', social:'Snow melt driveways and wine rooms are eye-catching posts.'},
     custom:'Maintenance scheduling for commercial coolers.',
     unknown:['Owner\'s name','The right phone number','Google rating'], careful:'The scholarship likely honors someone. Mention it with respect and don\'t ask who Tony was.'},

    {id:'dynamic', tier:2, name:'Dynamic Heating, Cooling & Geothermal', said:'Dynamic Heating and Cooling', town:'Plainville', area:'Hartford area', phone:'(860) 589-8367', site:'https://dynamichvac.net',
     ask:'Nathan Noiseux', askNote:'A review on the site names Nathan Noiseux as the owner.',
     since:'Family-owned since 2006',
     facts:['4.9 on Google','Geothermal and high-velocity systems, not just standard heating and cooling','Tagline: "Connecticut Trusted, One Home at a Time"','24/7 emergency service, often same-day'],
     hours:'Mon to Fri, 8 to 6', emergency:'24/7 emergency service.', booking:'"Book Appointment" button, form and phone', reviews:'Google 4.9, no count shown', social:'Facebook, Instagram, X, YouTube',
     lead:'found', why:'A strong, modern shop. Geothermal is a specialty people research with AI before they call anyone.',
     notice:'I saw you have a 4.9 on Google and you do geothermal, which not many shops around here take on.',
     fit:{phone:'They list 24/7 service. Ask who carries it.', site:'The site is current. No rebuild needed.', found:'People ask ChatGPT "is geothermal worth it in Connecticut?" The check shows if Dynamic is in that answer.', social:'Four pages already. Geothermal installs are great video.'},
     custom:'Loyalty-program renewals.',
     unknown:['Google review count','How after-hours calls are handled'], careful:'They already do most things right. Be humble and offer only the check.'}
  ]
};

/* =====================================================================
   UPDATES from the research check on November 16, 2026
   (CT business registry, each shop's own site, Google Maps).
   Applied on top of the records above. Each value replaces the old one.
   ===================================================================== */
(function(){
  const D = window.STARWELL_DECKS;
  D.researchChecked = 'November 16, 2026';
  D.tiers[3] = 'On hold. Something needs to be confirmed before anyone dials.';
  const U = {
    benedetto: {askNote:'The site lists "Joe Benedetto, Founder". The state registry shows Joseph P. Benedetto.', reviews:'4.9 on Google from 145 reviews',
      facts:{'4.9 on Google with 75+ reviews shown':'4.9 on Google from 145 reviews'}, unknown:['What happens to non-member calls after hours']},
    rw: {ask:'Rick Hatch', askNote:'The site says "Owner Rick Hatch". The state registry lists Wanda Hatch as a principal.', hours:'Mon to Fri, 8 to 4:30', unknown:['What happens to non-contract calls after 4:30']},
    masters: {ask:'Thomas Dunkin', askNote:'The site names Thomas Dunkin as president. The legal name is Master\'s Heating and Air Conditioning, Inc.', unknown:['Office hours','Google rating']},
    nutmeg: {ask:'Steve or Henry Wierzbicki', askNote:'The site names Steve and Henry Wierzbicki as founders. The registry lists Stephen and Henry Jr. as officers.', unknown:['Office hours','Google rating']},
    rb: {ask:'Russ Amato or Brian Mackenzie', askNote:'The site lists Russ Amato and Brian Mackenzie as owners. Their site spells the second name "Mackenize", so check how he says it.', hours:'Mon to Fri, 8 to 4:30 on the contact page (the footer still says 8 to 5)', unknown:['Google rating']},
    homehvac: {ask:'Dave Teodosio', askNote:'The site says "Dave Teodosio, Owner".', unknown:['Hours and after-hours handling','Google rating']},
    onofreo: {ask:'Mark Onofreo', askNote:'The site names Mark Onofreo as founder and owner.', reviews:'4.9 on Google from 737 reviews', unknown:['Who covers Saturday calls']},
    airinc: {ask:'Wayne Krasnow', askNote:'The site names Wayne Krasnow as president and founder.', phoneNote:'Their Google profile shows a different number, (203) 315-0323. The number here is the one on their website.', unknown:['Google rating']},
    nathan: {ask:'Jake Nathan', askNote:'The site says Jake took on the role of owner. The registry shows Jacob Nathan.', unknown:['Google review count']},
    homecomfort: {ask:'Steve Viglione', askNote:'The site says "Steve Viglione Jr., Owner".', unknown:['Google rating']},
    centralair: {hours:'Mon to Fri, 8 to 4:30', why:'The office closes at 4:30 and the site doesn\'t say what happens after that, so the question is natural.',
      phoneNote:'Their Google profile shows a different number, (203) 546-7776. The number here is the one on their website.', unknown:['Owner\'s name','After-hours handling','Google rating']},
    mandr: {phoneNote:'Three numbers are in use: 203-874-7914 (our record), (475) 306-7914 on Google and 475-549-1913 on the live site. Open their website and dial the number shown there today.'},
    allamerican: {phoneNote:'Their Google profile shows a different number, (203) 879-4928. The number here is the one on their website.'},
    dynamic: {reviews:'4.7 on Google from 322 reviews (the site says 4.9)', facts:{'4.9 on Google':'4.7 on Google from 322 reviews'},
      notice:'I saw you do geothermal, which not many shops around here take on, and you have over 300 Google reviews.', unknown:['How after-hours calls are handled']},
    airspecialties: {reviews:'4.6 on Google from 288 reviews. The 5 stars from 100 on the site is a mix of platforms.', facts:{'5 stars from 100 reviews across Google, Yelp and Facebook':'4.6 on Google from 288 reviews'},
      fit:{found:'288 Google reviews and a 1952 start should put them near the top of AI answers. The check shows if they are.'}},
    climatepros: {askNote:'No owner name on the site. Google lists the address as 132 Pepes Farm Rd in Milford, while the site says Orange. Say "Orange" unless he corrects you.'},
    nero: {ask:'Sue or Steve Nero', askNote:'The site is signed "Sue & Steve" but doesn\'t call them owners. The registry lists Suzanne and Michael Nero as officers. Ask for either by first name.',
      notice:'I saw Nero has been serving since 1988, you\'re a Trane Comfort Specialist, and you have an A+ with the BBB.', unknown:['Who the owner is today','Google rating and count','Who answers after 4']},
    silvercity: {askNote:'A review on the site names the owner as John. No last name is given. Google lists the shop as "Silver City Heating and Cooling" at the same address and phone.'},
    hellas: {phone:'(203) 354-9398', phoneNote:'This is the number on their website. Google shows (203) 852-0666. The old directory number, (475) 208-4828, is on neither, so don\'t use it.', hours:'Mon to Fri, 8 to 4:30 on the site (Google says 8 to 3:30)', unknown:['Owner\'s name','Google rating']},
    giordanos: {hours:'Mon to Fri, 8 to 4:30. Closed weekends.', why:'The office closes at 4:30 and is closed weekends, and the site says nothing about after hours.',
      q:'After 4:30 or on a weekend, what happens when a customer calls?', phoneNote:'Their Google profile shows a different number, (203) 734-7648. The number here is the one on their website.',
      unknown:['Owner\'s name','After-hours handling','Google rating']},
    seans: {ask:'Sean Auddino', askNote:'The state registry lists Sean G. Auddino as principal.', hours:'Mon to Fri, 8 to 5', unknown:['Google rating']},
    kevindean: {reviews:'None on the site, and no Google profile was found',
      why:'Forty years of experience, but no reviews on the site and no Google profile that we could find. The search check is an easy, useful first gift.',
      fit:{found:'We couldn\'t find a Google profile for the shop. The check would show that, and setting one up is part of the free starter pack.'}, unknown:['Whether a Google profile exists under another name','How after-hours calls are handled']},
    heatpeople: {tier:3, flag:'Closed. Do not call.'}
  };
  D.companies.forEach(c => {
    const u = U[c.id]; if(!u) return;
    Object.keys(u).forEach(k => {
      if(k === 'facts') c.facts = c.facts.map(f => u.facts[f] || f);
      else if(k === 'fit') Object.assign(c.fit, u.fit);
      else c[k] = u[k];
    });
    c.updated = true;
  });
})();

/* ---- 50 shops added from the Nov 18, 2026 research ---- */
/* Only the identity is kept here. Contact, hours, strengths, lead and proof are filled in by needs.js. */
(function(){
  const D = window.STARWELL_DECKS;
  const base = () => ({tier:2, phone:'', ask:'the owner', askNote:'', since:'', facts:[], hours:'', emergency:'', booking:'', reviews:'', social:'', lead:'site', why:'', notice:'', fit:{}, custom:'Only if he names an office headache. Custom tools are quoted up front, never free.', unknown:[], careful:'', isNew:true});
  [{"id": "airsolutions", "name": "Air Solutions, Inc.", "said": "Air Solutions", "town": "Stamford", "site": "https://airsolutions.tv", "area": "Fairfield County"}, {"id": "practice", "name": "Home Comfort Practice, Inc.", "said": "Home Comfort Practice", "town": "Stratford", "site": "https://homecomfortpractice.com", "area": "Fairfield County"}, {"id": "tremetemp", "name": "X-treme Temp Heating & Cooling, LLC", "said": "X-treme Temp Heating and Cooling", "town": "Wallingford", "site": "https://xtremetempct.com", "area": "Central"}, {"id": "aquila", "name": "Aquila Heating & Cooling, LLC", "said": "Aquila Heating and Cooling", "town": "Redding", "site": "https://aquilaheatingandcooling.com", "area": "Danbury area"}, {"id": "peterkupchick", "name": "Peter Kupchick Heating & Cooling Inc.", "said": "Peter Kupchick Heating and Cooling", "town": "Fairfield", "site": "https://fairfieldheatingcooling.com", "area": "Fairfield County"}, {"id": "michaelbarrett", "name": "Michael Barrett Plumbing & Heating", "said": "Michael Barrett Plumbing and Heating", "town": "Danbury", "site": "https://barrettplumbing.biz", "area": "Danbury area"}, {"id": "precise", "name": "Precise HVAC Home Services", "said": "Precise HVAC Home Services", "town": "Bristol", "site": "https://precisehvachomeservices.com", "area": "Hartford area"}, {"id": "setpoint", "name": "Setpoint Refrigeration LLC", "said": "Setpoint Refrigeration", "town": "Farmington", "site": "https://setpointhvacr.com", "area": "Hartford area"}, {"id": "minutemen", "name": "Minutemen Plumbing And Heating LLC.", "said": "Minutemen Plumbing and Heating", "town": "Torrington", "site": "https://minutemenct.com", "area": "Northwest"}, {"id": "grodecki", "name": "Grodecki Plumbing & Heating", "said": "Grodecki Plumbing and Heating", "town": "Plymouth", "site": "", "area": "Waterbury area"}, {"id": "hypercool", "name": "Hyper Heat & Cool LLC", "said": "Hyper Heat and Cool", "town": "Meriden", "site": "", "area": "Central"}, {"id": "burnside", "name": "Burnside Plumbing Heating & AC LLC", "said": "Burnside Plumbing Heating and AC", "town": "North Stonington", "site": "", "area": "Southeast"}, {"id": "unlimited", "name": "Energy Unlimited LLC", "said": "Energy Unlimited", "town": "Bolton", "site": "https://heatingrepairct.com", "area": "East"}, {"id": "alltech", "name": "All-Tech Plumbing & Heating LLC", "said": "All-Tech Plumbing and Heating", "town": "Canterbury", "site": "https://alltechph.com", "area": "East"}, {"id": "newengland", "name": "New England Smart Energy", "said": "New England Smart Energy", "town": "Fairfield", "site": "https://ne-smartenergy.com", "area": "Fairfield County"}, {"id": "ybc", "name": "YBC Air LLC", "said": "YBC Air", "town": "Bridgeport", "site": "https://ybcair.com", "area": "Fairfield County"}, {"id": "diamond", "name": "Diamond Mechanical", "said": "Diamond Mechanical", "town": "Meriden", "site": "https://diamondmechanicals.com", "area": "Central"}, {"id": "temp", "name": "Temp Air Company", "said": "Temp Air Company", "town": "Stamford", "site": "https://tempaircthvac.com", "area": "Fairfield County"}, {"id": "ag", "name": "A G Heating and Cooling LLC", "said": "A G Heating and Cooling", "town": "Danbury", "site": "https://agheatcool.com", "area": "Danbury area"}, {"id": "murphy", "name": "Murphy Heating & Cooling", "said": "Murphy Heating and Cooling", "town": "New Milford", "site": "https://murphyheatcool.com", "area": "Danbury area"}, {"id": "edgerton", "name": "Edgerton, Inc.", "said": "Edgerton", "town": "Monroe", "site": "https://edgertonhvac.com", "area": "Fairfield County"}, {"id": "omni", "name": "Omni Mechanical Services", "said": "Omni Mechanical Services", "town": "South Windsor", "site": "https://omnimechanicalct.com", "area": "Hartford area"}, {"id": "escape", "name": "Escape Plumbing & Heating, LLC", "said": "Escape Plumbing and Heating", "town": "Morris", "site": "https://escapeplumbing.com", "area": "Northwest"}, {"id": "re", "name": "R & E Heating and Air Conditioning, LLC", "said": "R and E Heating and Air Conditioning", "town": "Plymouth", "site": "https://reheatingairconditioning.com", "area": "Waterbury area"}, {"id": "godwinsons", "name": "R.E. Godwin and Sons LLC", "said": "R.E. Godwin and Sons", "town": "Essex", "site": "https://godwinplumbers.com", "area": "Shoreline"}, {"id": "jj", "name": "J&J Plumbing and Heating LLC", "said": "J and J Plumbing and Heating", "town": "Deep River", "site": "", "area": "Shoreline"}, {"id": "kneeland", "name": "Kneeland heating & Cooling LLC", "said": "Kneeland Heating and Cooling", "town": "Ledyard", "site": "", "area": "Southeast"}, {"id": "gas", "name": "E. M. Gas Services LLC", "said": "E. M. Gas Services", "town": "Brooklyn", "site": "", "area": "East"}, {"id": "superiortank", "name": "Superior HVAC & Tank Removal", "said": "Superior HVAC and Tank Removal", "town": "Waterbury", "site": "https://superiorhvacct.com", "area": "Waterbury area"}, {"id": "elite", "name": "Elite Comfort", "said": "Elite Comfort", "town": "Harwinton", "site": "https://elitecomfortpro.com", "area": "Northwest"}, {"id": "rbsouthbur", "name": "R & B Mechanical HVAC Services LLC", "said": "R and B Mechanical HVAC Services", "town": "Southbury", "site": "https://rbmhvac.com", "area": "Waterbury area"}, {"id": "chernin", "name": "Chernin HVAC & Refrigeration L.L.C.", "said": "Chernin HVAC and Refrigeration", "town": "Oxford", "site": "https://cherninhvac.com", "area": "Valley"}, {"id": "mechanitech", "name": "MechaniTech HVAC Solutions LLC", "said": "MechaniTech HVAC Solutions", "town": "Bethlehem", "site": "https://mechanitechac.com", "area": "Northwest"}, {"id": "millas", "name": "Millas Heating & Cooling LLC", "said": "Millas Heating and Cooling", "town": "Groton", "site": "https://millashc.com", "area": "Southeast"}, {"id": "bosse", "name": "Bosse Heating & Air Conditioning LLC.", "said": "Bosse Heating and Air Conditioning", "town": "Southington", "site": "https://bosseheating.com", "area": "Central"}, {"id": "airmax", "name": "Airmax Solutions Heating & Air Conditioning", "said": "Airmax Solutions Heating and Air Conditioning", "town": "Milford", "site": "https://airmax-solutions.com", "area": "New Haven area"}, {"id": "goldeneagles", "name": "Golden Eagles llc", "said": "Golden Eagles", "town": "Farmington", "site": "https://mygoldeneagles.com", "area": "Hartford area"}, {"id": "soykasheetmetal", "name": "Soyka Sheetmetal", "said": "Soyka Sheetmetal", "town": "West Hartford", "site": "https://soykasheetmetal.com", "area": "Hartford area"}, {"id": "priority", "name": "Priority Mechanical LLC", "said": "Priority Mechanical", "town": "Wolcott", "site": "", "area": "Waterbury area"}, {"id": "thermotech", "name": "Thermo-Tech LLC.", "said": "Thermo-Tech", "town": "Barkhamsted", "site": "https://thermotechct.com", "area": "Northwest"}, {"id": "ob", "name": "OB Mechanical Services LLC", "said": "OB Mechanical Services", "town": "Glastonbury", "site": "", "area": "Hartford area"}, {"id": "fritz", "name": "Fritz Air LLC", "said": "Fritz Air", "town": "Harwinton", "site": "https://fritzairllc.com", "area": "Northwest"}, {"id": "munro", "name": "Munro Plumbing & Heating", "said": "Munro Plumbing and Heating", "town": "Madison", "site": "", "area": "Shoreline"}, {"id": "croccorepair", "name": "Crocco Mechanical", "said": "Crocco Mechanical", "town": "Waterbury", "site": "https://croccohvac.com", "area": "Waterbury area"}, {"id": "apex", "name": "APEX Refrigeration, Cooling and Heating", "said": "APEX Refrigeration, Cooling and Heating", "town": "Coventry", "site": "https://apexcoolingandheating.com", "area": "East"}, {"id": "modernenfield", "name": "Modern Comfort Mechanical", "said": "Modern Comfort Mechanical", "town": "Enfield", "site": "https://moderncomfortmechanical.com", "area": "Hartford area"}, {"id": "parks", "name": "Parks Heating and Cooling LLC", "said": "Parks Heating and Cooling", "town": "Watertown", "site": "https://parkshvacct.com", "area": "Waterbury area"}, {"id": "hm", "name": "H&M Heating and Cooling LLC", "said": "H and M Heating and Cooling", "town": "Newington", "site": "https://hmheatingandcooling.com", "area": "Hartford area"}, {"id": "allstar", "name": "All-Star Plumbing, Heating & Cooling, Inc.", "said": "All-Star Plumbing, Heating and Cooling", "town": "Colchester", "site": "", "area": "Southeast"}, {"id": "infinite", "name": "Infinite HVAC Solutions, LLC", "said": "Infinite HVAC Solutions", "town": "Burlington", "site": "https://infinitehvacsolutions.com", "area": "Hartford area"}].forEach(s => D.companies.push(Object.assign(base(), s)));
})();
