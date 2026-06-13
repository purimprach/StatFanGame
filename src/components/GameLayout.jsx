import Particles from './Particles'

export default function GameLayout({ children, className = '' }) {
  return (
    <div className={`landing ${className}`.trim()}>
      <div className="landing__bg" aria-hidden="true">
        <div className="landing__spotlight landing__spotlight--left" />
        <div className="landing__spotlight landing__spotlight--right" />
        <div className="landing__orb landing__orb--1" />
        <div className="landing__orb landing__orb--2" />
        <div className="landing__orb landing__orb--3" />
        <Particles />
        <div className="landing__vignette" />
      </div>
      {children}
    </div>
  )
}
