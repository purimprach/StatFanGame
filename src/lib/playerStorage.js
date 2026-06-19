const STORAGE_KEY = 'stat55_player_profile'

export function getPlayerProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const profile = JSON.parse(raw)
    if (!profile?.name) {
      return null
    }
    return profile
  } catch {
    return null
  }
}

export function savePlayerProfile({ name, branch }) {
  const profile = {
    name: name.trim(),
    branch: branch.trim(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  return profile
}

export function clearPlayerProfile() {
  localStorage.removeItem(STORAGE_KEY)
}
