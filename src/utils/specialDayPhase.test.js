import { getActivePhase } from './specialDayPhase.js'

// Sanity checks covering: normal day, first day of preview window, the event day itself,
// last day of post window, and Feb 29 in a non-leap year.
export function runSanityChecks() {
  const specialDays = [
    {
      id: 'anniversary',
      month: 6,
      day: 28,
      originYear: 2025,
      previewDays: 5,
      postDays: 2,
    },
    {
      id: 'leap_day_event',
      month: 2,
      day: 29,
      originYear: 2024,
      previewDays: 3,
      postDays: 1,
    }
  ]

  const testCases = [
    { desc: 'normal day', date: new Date(2026, 5, 22), expectedPhase: 'normal', expectedDay: null },
    { desc: 'first day of preview window', date: new Date(2026, 5, 23), expectedPhase: 'approaching', expectedUntil: 5 },
    { desc: 'the event day itself', date: new Date(2026, 5, 28), expectedPhase: 'event', expectedUntil: 0, expectedSince: 0 },
    { desc: 'last day of post window', date: new Date(2026, 5, 30), expectedPhase: 'post', expectedSince: 2 },
    { desc: 'day after post window', date: new Date(2026, 6, 1), expectedPhase: 'normal', expectedDay: null },
    { desc: 'Feb 29 fallback in non-leap year (2025)', date: new Date(2025, 1, 28), expectedPhase: 'event', expectedDayId: 'leap_day_event' },
    { desc: 'Feb 29 on leap year (2028)', date: new Date(2028, 1, 29), expectedPhase: 'event', expectedDayId: 'leap_day_event' }
  ]

  for (const tc of testCases) {
    const res = getActivePhase(specialDays, tc.date)
    if (res.phase !== tc.expectedPhase) {
      throw new Error(`Sanity check failed for "${tc.desc}": expected phase ${tc.expectedPhase}, got ${res.phase}`)
    }
    if (tc.expectedUntil !== undefined && res.daysUntil !== tc.expectedUntil) {
      throw new Error(`Sanity check failed for "${tc.desc}": expected daysUntil ${tc.expectedUntil}, got ${res.daysUntil}`)
    }
    if (tc.expectedSince !== undefined && res.daysSince !== tc.expectedSince) {
      throw new Error(`Sanity check failed for "${tc.desc}": expected daysSince ${tc.expectedSince}, got ${res.daysSince}`)
    }
    if (tc.expectedDay === null && res.day !== null) {
      throw new Error(`Sanity check failed for "${tc.desc}": expected day to be null`)
    }
    if (tc.expectedDayId && (!res.day || res.day.id !== tc.expectedDayId)) {
      throw new Error(`Sanity check failed for "${tc.desc}": expected day.id to be ${tc.expectedDayId}`)
    }
  }

  return true
}
