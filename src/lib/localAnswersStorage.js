const LOCAL_KEY = 'stat55_answers_local'

function readLocalAnswers() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLocalAnswers(rows) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(rows))
}

export function insertLocalAnswer(row) {
  const rows = readLocalAnswers()
  const alreadyExists = rows.some(
    (entry) =>
      entry.player_name === row.player_name &&
      entry.game_type === row.game_type &&
      entry.question_key === row.question_key,
  )
  if (alreadyExists) {
    return null
  }

  const entry = {
    id: crypto.randomUUID(),
    ...row,
  }
  rows.push(entry)
  writeLocalAnswers(rows)
  return entry
}

export function fetchLocalAnswers() {
  return readLocalAnswers()
}

export function clearLocalAnswers() {
  localStorage.removeItem(LOCAL_KEY)
}
