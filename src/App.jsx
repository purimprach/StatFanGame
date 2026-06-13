import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import HintCategoryPage from './pages/HintCategoryPage'
import HintPlayPage from './pages/HintPlayPage'
import PuzzleCategoryPage from './pages/PuzzleCategoryPage'
import PuzzlePlayPage from './pages/PuzzlePlayPage'
import TosakanthCategoryPage from './pages/TosakanthCategoryPage'
import TosakanthPlayPage from './pages/TosakanthPlayPage'
import SiasaCategoryPage from './pages/SiasaCategoryPage'
import SiasaPlayPage from './pages/SiasaPlayPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/hints" element={<HintCategoryPage />} />
      <Route path="/hints/:categoryId" element={<HintPlayPage />} />
      <Route path="/puzzle" element={<PuzzleCategoryPage />} />
      <Route path="/puzzle/:categoryId" element={<PuzzlePlayPage />} />
      <Route path="/tosakanth" element={<TosakanthCategoryPage />} />
      <Route path="/tosakanth/:categoryId" element={<TosakanthPlayPage />} />
      <Route path="/siasa" element={<SiasaCategoryPage />} />
      <Route path="/siasa/:categoryId" element={<SiasaPlayPage />} />
    </Routes>
  )
}
