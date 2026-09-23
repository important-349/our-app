export function getEffectiveNow() {
  const params = new URLSearchParams(window.location.search)
  const override = params.get('asOf')
  if (override) {
    const d = new Date(override + 'T00:00:00')
    if (!isNaN(d)) return d
  }
  return new Date()
}
