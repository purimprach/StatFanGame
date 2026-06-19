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
