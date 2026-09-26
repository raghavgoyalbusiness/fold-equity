import { Routes, Route } from 'react-router-dom'
import { Header, Footer, ScrollManager } from './components/Shell'
import { Home } from './pages/Home'
import { Library } from './pages/Library'
import { GamePage } from './pages/GamePage'
import { BluffLab } from './pages/BluffLab'
import { Trainers } from './pages/Trainers'
import { Coach } from './pages/Coach'
import { Glossary } from './pages/Glossary'
import { Responsible } from './pages/Responsible'
import { About, NotFound } from './pages/About'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <ScrollManager />
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Library />} />
          <Route path="/games/:slug" element={<GamePage />} />
          <Route path="/bluff-lab" element={<BluffLab />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/responsible-play" element={<Responsible />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
