/* How booking works — rendered into [data-booking-steps] by js/booking.js.
   PLACEHOLDER copy: confirm the real steps with the owners (design guide
   "before launch"). The band is laid out for 3 to 5 steps.

   `sticker` picks the flat die-cut graphic: calendar, chat, balloons,
   seal (signed card) or door. Keep titles to about 4 words and each line
   to one short sentence. */

export const bookingSteps = [
  { title: 'Check your weekend', line: 'Send your date and town. Two minutes, tops.', sticker: 'calendar' },
  { title: 'Design it together', line: 'A quick chat, then tap the ideas you love.', sticker: 'balloons' },
  { title: 'Lock in your date', line: 'Sign and pay the $200 deposit.', sticker: 'seal' },
  { title: 'She walks in', line: 'We style it before check-in. You take the credit.', sticker: 'door' },
];
