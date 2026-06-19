/** Production site — used for QR when MC runs the app on localhost */
export const PRODUCTION_SITE_URL = 'https://stat-fan-game.vercel.app'

export function getAudienceUrl() {
  const configured = import.meta.env.VITE_AUDIENCE_URL?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }

  const { hostname, origin } = window.location

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${PRODUCTION_SITE_URL}/audience`
  }

  return `${origin}/audience`
}
