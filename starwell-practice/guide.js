/* StarWell Practice Line: in-call guide.
   All content comes from the shared offer card (offer.js), the same file the cold-call guide reads,
   so the two tools can never disagree. This file only keeps the old CALL_GUIDE name working. */
const CALL_GUIDE = {
  steps: Object.fromEntries(window.STARWELL_OFFER.steps.map(s => [s.key, s])),
  gifts: window.STARWELL_OFFER.gifts,
  questions: window.STARWELL_OFFER.questions,
  rules: window.STARWELL_OFFER.rules
};
