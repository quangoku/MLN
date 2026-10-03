import { useEffect, useMemo, useState } from 'react'
import Pedestal from './Pedestal.jsx'
import FloatingBook from './FloatingBook.jsx'
import FloatingGem from './FloatingGem.jsx'
import FloatingArtifact from './FloatingArtifact.jsx'
import FloatingDialecticsArtifact from './FloatingDialecticsArtifact.jsx'
import FloatingHistoryArtifact from './FloatingHistoryArtifact.jsx'
import InfoBoard from './InfoBoard.jsx'
import ExhibitPanel from './ExhibitPanel.jsx'
import { FLOAT } from '../config/constants.js'
import { useMuseumStore } from '../store/useMuseumStore.js'
import { playClick, playDiscover, playHover } from '../audio/sfx.js'
import { hashString } from '../utils/random.js'

// C2: vật phẩm chủ đề biện chứng chuyên biệt (FloatingDialecticsArtifact)
// C3: vật phẩm chủ đề lịch sử chuyên biệt (FloatingHistoryArtifact)

// Mọi hiện vật đều đi qua wrapper này: hover, ghim, khám phá, bảng thông tin chỉ viết một lần.
const TYPES = {
  book: { Item: FloatingBook, pedestal: true, panelY: FLOAT.height },
  gem: { Item: FloatingGem, pedestal: true, panelY: FLOAT.height },
  sign: { Item: InfoBoard, pedestal: false, panelY: 1.5 },
}

export default function Exhibit({ data }) {
  const [hovered, setHovered] = useState(false)
  const pinnedId = useMuseumStore((s) => s.pinnedId)
  const pinned = pinnedId === data.id
  const nearby = useMuseumStore((s) => s.nearbyId === data.id)
  const discovered = useMuseumStore((s) => s.discovered.has(data.id))
  const active = hovered || nearby || pinned
  const showPanel = pinned || (!pinnedId && nearby)

  // Phân loại rendering theo phòng
  const isC2Exhibit = data.roomId === 'ch2' && data.type !== 'sign'
  const isC3Exhibit = data.roomId === 'ch3' && data.type !== 'sign'
  const artifactSeed = useMemo(() => hashString(data.id), [data.id])

  const { Item, pedestal, panelY } = TYPES[data.type]

  useEffect(() => {
    if (!hovered) return
    document.body.style.cursor = 'pointer'
    return () => { document.body.style.cursor = 'auto' }
  }, [hovered])

  const handlers = {
    onPointerOver: (e) => {
      e.stopPropagation()
      if (hovered) return
      setHovered(true)
      playHover()
    },
    onPointerOut: () => setHovered(false),
    onClick: (e) => {
      e.stopPropagation()
      useMuseumStore.getState().togglePin(data.id)
      playClick()
    },
  }

  const check = () => {
    if (useMuseumStore.getState().discover(data.id)) playDiscover()
  }

  return (
    <group position={data.position} rotation-y={data.rotation ?? 0}>
      {pedestal && <Pedestal highlighted={active} discovered={discovered} />}
      {isC2Exhibit
        ? <FloatingDialecticsArtifact hovered={active} accent={data.accent} exhibitId={data.id} {...handlers} />
        : isC3Exhibit
          ? <FloatingHistoryArtifact hovered={active} accent={data.accent} exhibitId={data.id} {...handlers} />
          : <Item hovered={active} accent={data.accent} {...(data.type === 'book' ? { checked: discovered } : {})} {...handlers} />
      }
      {showPanel && <ExhibitPanel data={data} y={panelY} pinned={pinned} checked={discovered} onCheck={check} />}
    </group>
  )
}
