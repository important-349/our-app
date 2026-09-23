function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0)
}

function resolveEventDate(specialDay, year) {
  const { month, day } = specialDay
  const targetDay = (month === 2 && day === 29 && !isLeapYear(year)) ? 28 : day
  return new Date(year, month - 1, targetDay, 0, 0, 0, 0)
}

function evaluateSpecialDay(specialDay, today) {
  const currentYear = today.getFullYear()
  let targetYear = currentYear
  let targetDate = resolveEventDate(specialDay, targetYear)

  // Calendar day difference using Math.round to handle DST shifts
  let diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  // If this year's occurrence is already past its postDays window, resolve to next year's occurrence instead
  if (diffDays < 0 && -diffDays > (specialDay.postDays || 0)) {
    targetYear = currentYear + 1
    targetDate = resolveEventDate(specialDay, targetYear)
    diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  } else if (diffDays > 0 && today.getMonth() === 0 && specialDay.month === 12) {
    // Edge case: In early January, check if previous year's late December occurrence is still in postDays
    const prevYearDate = resolveEventDate(specialDay, currentYear - 1)
    const prevDiff = Math.round((prevYearDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (prevDiff < 0 && -prevDiff <= (specialDay.postDays || 0)) {
      targetYear = currentYear - 1
      targetDate = prevYearDate
      diffDays = prevDiff
    }
  }

  const occurrenceNumber = specialDay.originYear ? (targetYear - specialDay.originYear) : null

  if (diffDays === 0) {
    return {
      day: specialDay,
      phase: 'event',
      daysUntil: 0,
      daysSince: 0,
      occurrenceNumber,
    }
  }

  if (diffDays > 0) {
    const daysUntil = diffDays
    if (daysUntil <= (specialDay.previewDays || 0)) {
      return {
        day: specialDay,
        phase: 'approaching',
        daysUntil,
        daysSince: 0,
        occurrenceNumber,
      }
    }
  }

  if (diffDays < 0) {
    const daysSince = -diffDays
    if (daysSince <= (specialDay.postDays || 0)) {
      return {
        day: specialDay,
        phase: 'post',
        daysUntil: 0,
        daysSince,
        occurrenceNumber,
      }
    }
  }

  return null
}

export function getActivePhase(specialDays, now = new Date()) {
  if (!Array.isArray(specialDays) || specialDays.length === 0 || !now || isNaN(now.getTime())) {
    return {
      day: null,
      phase: 'normal',
      daysUntil: 0,
      daysSince: 0,
      occurrenceNumber: null,
    }
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)

  for (const specialDay of specialDays) {
    const result = evaluateSpecialDay(specialDay, today)
    if (result) {
      return result
    }
  }

  return {
    day: null,
    phase: 'normal',
    daysUntil: 0,
    daysSince: 0,
    occurrenceNumber: null,
  }
}
