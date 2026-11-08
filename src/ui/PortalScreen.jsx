import { useState, useEffect, useRef } from 'react'
import { usePortalStore } from '../store/usePortalStore.js'
import { useMuseumStore } from '../store/useMuseumStore.js'
import { unlockAudio } from '../audio/sfx.js'

// ── Canvas 2D renderers for each gate (pure CSS + SVG aesthetic) ──────────────

function Gate1Canvas({ hovered, onClick }) {
  return (
    <div
      className={`portal-gate portal-gate--1 ${hovered ? 'portal-gate--hovered' : ''}`}
      onClick={onClick}
    >
      {/* Background sky */}
      <div className="gate1-sky">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="gate1-star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            animationDelay: `${Math.random() * 3}s`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
          }} />
        ))}
      </div>

      {/* Ground / floor */}
      <div className="gate1-ground" />

      {/* Left column – solid stone */}
      <div className="gate1-col gate1-col--left">
        <div className="gate1-col-body">
          <div className="gate1-col-flutes" />
          {/* Philosopher statue silhouette */}
          <div className="gate1-statue gate1-statue--left" />
        </div>
        <div className="gate1-col-capital" />
        <div className="gate1-col-base" />
      </div>

      {/* Right column – lighter, ethereal */}
      <div className="gate1-col gate1-col--right">
        <div className="gate1-col-body gate1-col-body--light">
          <div className="gate1-col-flutes" />
          <div className="gate1-statue gate1-statue--right" />
        </div>
        <div className="gate1-col-capital" />
        <div className="gate1-col-base" />
      </div>

      {/* Arch / Pediment */}
      <div className="gate1-arch">
        {/* Left half: stone / matter */}
        <div className="gate1-arch-half gate1-arch-half--matter" />
        {/* Right half: light / consciousness */}
        <div className="gate1-arch-half gate1-arch-half--spirit" />
        {/* Center keystone glow */}
        <div className="gate1-arch-keystone" />
      </div>

      {/* Light rays from keystone */}
      <div className="gate1-rays">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="gate1-ray" style={{ '--i': i }} />
        ))}
      </div>

      {/* Floating light particles (spirit side) */}
      <div className="gate1-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="gate1-particle" style={{
            '--x': `${50 + 15 + Math.random() * 30}%`,
            '--delay': `${Math.random() * 4}s`,
            '--dur': `${2 + Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* Shadow on ground */}
      <div className="gate1-shadow" />

      {/* Labels */}
      <div className="gate1-label">
        <div className="portal-label__eyebrow">Cổng 1</div>
        <div className="portal-label__name">PhiloVerse</div>
        <div className="portal-label__tagline">Bảo tàng Triết học 2.5D</div>
      </div>
    </div>
  )
}

function Gate2Canvas({ hovered, onClick }) {
  const ringRef = useRef(null)
  useEffect(() => {
    let frame, angle = 0
    const tick = () => {
      angle += hovered ? 0.025 : 0.008
      if (ringRef.current) {
        ringRef.current.style.setProperty('--angle', `${angle}rad`)
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [hovered])

  return (
    <div
      className={`portal-gate portal-gate--2 ${hovered ? 'portal-gate--hovered' : ''}`}
      onClick={onClick}
    >
      {/* Dark atmospheric background */}
      <div className="gate2-bg" />

      {/* Stone columns with engravings */}
      <div className="gate2-col gate2-col--left">
        <div className="gate2-col-engraving gate2-col-engraving--scales" />
        <div className="gate2-col-engraving gate2-col-engraving--wheat" />
      </div>
      <div className="gate2-col gate2-col--right">
        <div className="gate2-col-engraving gate2-col-engraving--scales" />
        <div className="gate2-col-engraving gate2-col-engraving--wheat" />
      </div>

      {/* Stone archway */}
      <div className="gate2-archway">
        {/* Coin emblem at top */}
        <div className="gate2-coin-emblem">
          <div className="gate2-coin-rays">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="gate2-coin-ray" style={{ '--n': i }} />
            ))}
          </div>
          <div className="gate2-coin-face">₫</div>
        </div>
      </div>

      {/* Steps */}
      <div className="gate2-steps">
        <div className="gate2-step gate2-step--1" />
        <div className="gate2-step gate2-step--2" />
        <div className="gate2-step gate2-step--3" />
        {/* Scattered coins */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="gate2-floor-coin" style={{
            '--cx': `${20 + i * 14 + Math.random() * 8}%`,
            '--cy': `${10 + Math.random() * 30}%`,
          }} />
        ))}
      </div>

      {/* Jade sphere with orbital rings */}
      <div ref={ringRef} className="gate2-sphere-wrap" style={{ '--angle': '0rad' }}>
        <div className="gate2-sphere-glow" />
        <div className="gate2-sphere">
          <div className="gate2-sphere-inner" />
          {/* Circuit/gear patterns inside sphere */}
          <div className="gate2-sphere-pattern" />
        </div>
        <div className="gate2-ring gate2-ring--1" />
        <div className="gate2-ring gate2-ring--2" />
        <div className="gate2-ring gate2-ring--3" />
      </div>

      {/* Ground glow */}
      <div className="gate2-ground-glow" />

      {/* Coins that glow on hover */}
      <div className="gate2-coins">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="gate2-coin" style={{ '--ci': i }} />
        ))}
      </div>

      {/* Vines/moss on columns */}
      <div className="gate2-moss gate2-moss--left" />
      <div className="gate2-moss gate2-moss--right" />

      {/* Labels */}
      <div className="gate2-label">
        <div className="portal-label__eyebrow">Cổng 2</div>
        <div className="portal-label__name">Mê Cung Kinh Tế</div>
        <div className="portal-label__tagline">Thoát khỏi mê cung kinh tế</div>
      </div>
    </div>
  )
}

// ── Main PortalScreen ──────────────────────────────────────────────────────────

export default function PortalScreen() {
  const gameMode = usePortalStore((s) => s.gameMode)
  const setGameMode = usePortalStore((s) => s.setGameMode)
  const museumStart = useMuseumStore((s) => s.start)

  const [hoveredGate, setHoveredGate] = useState(null)
  const [transitioning, setTransitioning] = useState(null) // null | 1 | 2
  const [quote, setQuote] = useState('')

  const quotes = {
    1: 'Vật chất hay ý thức, cái nào có trước?',
    2: 'Của cải đến từ đâu, và giá trị do ai tạo ra?',
  }

  const handleHover = (gate) => {
    setHoveredGate(gate)
    setQuote(gate ? quotes[gate] : '')
  }

  const handleClickGate1 = () => {
    setTransitioning(1)
    unlockAudio()
    setTimeout(() => {
      setGameMode('philosophy')
      museumStart()
    }, 900)
  }

  const handleClickGate2 = () => {
    setTransitioning(2)
    setTimeout(() => {
      setGameMode('economy')
    }, 900)
  }

  if (gameMode !== null) return null

  return (
    <div className={`portal-screen ${transitioning ? `portal-screen--exit-${transitioning}` : ''}`}>
      {/* Ambient starfield */}
      <div className="portal-stars">
        {[...Array(60)].map((_, i) => (
          <div key={i} className="portal-star-dot" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
          }} />
        ))}
      </div>

      {/* Title */}
      <header className="portal-header">
        <div className="portal-header__eyebrow">MLN111 · MLN122 · Triết học & Kinh tế Mác-Lênin</div>
        <h1 className="portal-header__title">PhiloVerse</h1>
        <p className="portal-header__subtitle">Chọn cánh cổng để bước vào thế giới tri thức</p>
      </header>

      {/* Gates container */}
      <div className="portal-gates">
        <div
          className="portal-gate-wrap"
          onMouseEnter={() => handleHover(1)}
          onMouseLeave={() => handleHover(null)}
        >
          <Gate1Canvas hovered={hoveredGate === 1} onClick={handleClickGate1} />
        </div>

        {/* Divider */}
        <div className="portal-divider">
          <div className="portal-divider__line" />
          <div className="portal-divider__orb">VS</div>
          <div className="portal-divider__line" />
        </div>

        <div
          className="portal-gate-wrap"
          onMouseEnter={() => handleHover(2)}
          onMouseLeave={() => handleHover(null)}
        >
          <Gate2Canvas hovered={hoveredGate === 2} onClick={handleClickGate2} />
        </div>
      </div>

      {/* Quote area */}
      <div className={`portal-quote ${quote ? 'portal-quote--visible' : ''}`}>
        <span className="portal-quote__mark">"</span>
        <span className="portal-quote__text">{quote}</span>
        <span className="portal-quote__mark">"</span>
      </div>

      {/* Transition overlay */}
      {transitioning && (
        <div className={`portal-transition portal-transition--${transitioning}`} />
      )}
    </div>
  )
}
