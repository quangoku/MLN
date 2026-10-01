import { useEffect } from 'react'
import { useMuseumStore } from '../store/useMuseumStore.js'
import { PLANETS } from './PlanetsData.js'
import { playClick, playPlanetSelect } from '../audio/sfx.js'

export default function SpaceHUD() {
  const exitSpaceScene = useMuseumStore((s) => s.exitSpaceScene)
  const selectedPlanet = useMuseumStore((s) => s.selectedPlanet)
  const setSelectedPlanet = useMuseumStore((s) => s.setSelectedPlanet)

  // Phím Esc để thoát khỏi Space Scene hoặc đóng card
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Escape') {
        if (selectedPlanet) {
          setSelectedPlanet(null)
        } else {
          exitSpaceScene()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedPlanet, setSelectedPlanet, exitSpaceScene])

  return (
    <div className="space-hud">
      {/* Thanh tiêu đề & nút quay lại */}
      <header className="space-hud__top">
        <button
          className="space-hud__back-btn"
          onClick={() => {
            playClick()
            exitSpaceScene()
          }}
          title="Phím Esc"
        >
          <span className="space-hud__arrow">←</span> Trở về Sảnh chính
        </button>

        <div className="space-hud__title-wrap">
          <p className="space-hud__eyebrow">HỌC PHẦN TRIẾT HỌC MÁC - LÊNIN (MLN111)</p>
          <h1 className="space-hud__title">Không Gian Vũ Trụ · Hệ Mặt Trời</h1>
        </div>

        <div className="space-hud__hint">
          <span>Kéo chuột: <strong>Xoay 360°</strong></span>
          <span>Cuộn chuột: <strong>Phóng to / thu nhỏ</strong></span>
        </div>
      </header>

      {/* Bảng thông tin chi tiết hành tinh khi được chọn */}
      {selectedPlanet && (
        <aside className="space-card">
          <div className="space-card__header">
            <div>
              <div className="space-card__tag" style={{ borderColor: selectedPlanet.color, color: selectedPlanet.color }}>
                {selectedPlanet.type}
              </div>
              <h2 className="space-card__name">{selectedPlanet.name}</h2>
              <p className="space-card__latin">{selectedPlanet.latinName}</p>
            </div>
            <button
              className="space-card__close"
              onClick={() => {
                playClick()
                setSelectedPlanet(null)
              }}
            >
              ✕
            </button>
          </div>

          <div className="space-card__body">
            {/* Thông số thiên văn học */}
            <div className="space-card__stats">
              <div className="stat-item">
                <span className="stat-label">Đường kính</span>
                <span className="stat-value">{selectedPlanet.facts.diameter}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Khoảng cách</span>
                <span className="stat-value">{selectedPlanet.facts.distance}</span>
              </div>
              {selectedPlanet.facts.orbitalPeriod && (
                <div className="stat-item">
                  <span className="stat-label">Chu kỳ quỹ đạo</span>
                  <span className="stat-value">{selectedPlanet.facts.orbitalPeriod}</span>
                </div>
              )}
              <div className="stat-item">
                <span className="stat-label">Nhiệt độ</span>
                <span className="stat-value">{selectedPlanet.facts.temp}</span>
              </div>
            </div>

            {/* Ý nghĩa Triết học Mác - Lênin */}
            <div className="space-card__philosophy">
              <div className="philosophy-badge">
                <span className="star-icon">⭐</span>
                <span>Ý nghĩa Triết học Mác - Lênin</span>
              </div>
              <h3 className="philosophy-concept">{selectedPlanet.philosophy.concept}</h3>
              {selectedPlanet.philosophy.quote && (
                <blockquote className="philosophy-quote">
                  "{selectedPlanet.philosophy.quote}"
                  {selectedPlanet.philosophy.author && (
                    <cite>— {selectedPlanet.philosophy.author}</cite>
                  )}
                </blockquote>
              )}
              <p className="philosophy-analysis">{selectedPlanet.philosophy.analysis}</p>
            </div>
          </div>
        </aside>
      )}

      {/* Thanh chọn nhanh hành tinh ở dưới cùng màn hình */}
      <footer className="space-hud__bottom">
        <div className="space-planet-bar">
          {PLANETS.map((planet) => {
            const active = selectedPlanet?.id === planet.id
            return (
              <button
                key={planet.id}
                className={`planet-btn ${active ? 'planet-btn--active' : ''}`}
                onClick={() => {
                  playPlanetSelect()
                  setSelectedPlanet(planet)
                }}
              >
                <span className="planet-btn__dot" style={{ backgroundColor: planet.color }} />
                <span className="planet-btn__text">{planet.name}</span>
              </button>
            )
          })}
        </div>
      </footer>
    </div>
  )
}
