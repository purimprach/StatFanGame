import puzzleA from '../assets/puzzle/puzzle-a.png'
import puzzleB from '../assets/puzzle/puzzle-b.png'
import puzzleC from '../assets/puzzle/puzzle-c.png'

export const PUZZLE_GRID_SIZE = 4
export const PUZZLE_TILE_COUNT = PUZZLE_GRID_SIZE * PUZZLE_GRID_SIZE

export const puzzleCategories = [
  {
    id: 'a',
    name: 'A',
    label: 'ภาพ A',
    image: puzzleA,
    aspectRatio: 768 / 1024,
    answer: 'ผศ. ดร.ภูริพันธุ์ รุจิขจร',
    available: true,
  },
  {
    id: 'b',
    name: 'B',
    label: 'ภาพ B',
    image: puzzleB,
    aspectRatio: 620 / 1024,
    answer: 'อ. ดร.ฐิตา วานิชย์บัญชา',
    available: true,
  },
  {
    id: 'c',
    name: 'C',
    label: 'ภาพ C',
    image: puzzleC,
    aspectRatio: 710 / 1024,
    answer: 'รศ. ดร.จันทร์เจ้า มงคลนาวิน',
    available: true,
  },
]

export function getPuzzleCategoryById(id) {
  return puzzleCategories.find((category) => category.id === id)
}

export function getTileBackgroundPosition(index, cols = PUZZLE_GRID_SIZE, rows = PUZZLE_GRID_SIZE) {
  const col = index % cols
  const row = Math.floor(index / cols)
  const x = cols > 1 ? (col / (cols - 1)) * 100 : 0
  const y = rows > 1 ? (row / (rows - 1)) * 100 : 0
  return `${x}% ${y}%`
}
