/**
 * Returns all months from July 2025 up to today
 */
export function getActiveMonths(): string[] {
  const start = new Date("2025-07-01")
  const now = new Date()

  const months: string[] = []

  const current = new Date(start)
  while (
    current.getFullYear() < now.getFullYear() ||
    (current.getFullYear() === now.getFullYear() && current.getMonth() <= now.getMonth())
  ) {
    const year = current.getFullYear()
    const month = `${current.getMonth() + 1}`.padStart(2, "0")
    months.push(`${year}-${month}`)
    current.setMonth(current.getMonth() + 1)
  }

  return months
}

/**
 * Return "YYYY-MM" for this month
 */
export function getCurrentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, "0")
  return `${year}-${month}`
}

/**
 * Format month string to readable format
 */
export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-")
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" })
}

/**
 * Check if month is valid (>= July 2025 and not in future)
 */
export function isValidMonth(monthStr: string): boolean {
  const minDate = new Date("2025-07-01")
  const maxDate = new Date()
  const checkDate = new Date(monthStr + "-01")

  return checkDate >= minDate && checkDate <= maxDate
}

/**
 * Get filter options for month dropdown
 */
export function getMonthFilterOptions(): Array<{ label: string; value: string }> {
  const activeMonths = getActiveMonths()
  const currentMonth = getCurrentMonth()

  return activeMonths.map((month) => ({
    label: month === currentMonth ? `🟢 ${formatMonth(month)} (This Month)` : formatMonth(month),
    value: month,
  }))
}

/**
 * Check if a month is the current month
 */
export function isCurrentMonth(monthStr: string): boolean {
  return monthStr === getCurrentMonth()
}

/**
 * Get subscription start month
 */
export function getSubscriptionStartMonth(): string {
  return "2025-07"
}
