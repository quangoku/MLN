import { useEffect, useState } from 'react'
import Pedestal from './Pedestal.jsx'
import FloatingBook from './FloatingBook.jsx'
import FloatingGem from './FloatingGem.jsx'
import InfoBoard from './InfoBoard.jsx'
import ExhibitPanel from './ExhibitPanel.jsx'
import { FLOAT } from '../config/constants.js'
import { useMuseumStore } from '../store/useMuseumStore.js'
import { playClick, playDiscover, playHover } from '../audio/sfx.js'

// Mọi hiện vật đều đi qua wrapper này: hover, ghim, khám phá, bảng thông tin chỉ viết một lần.
const TYPES = {
  book: { Item: FloatingBook, pedestal: true, panelY: FLOAT.height },
  gem: { Item: FloatingGem, pedestal: true, panelY: FLOAT.height },
  sign: { Item: InfoBoard, pedestal: false, panelY: 1.5 },
}

export default function Exhibit({ data }) {
  const [hovered, setHovered] = useState(false)
  const pinned = useMuseumStore((s) => s.pinnedId === data.id)
  const discovered = useMuseumStore((s) => s.discovered.has(data.id))
  const { Item, pedestal, panelY } = TYPES[data.type]
  const active = hovered || pinned

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
      const isNew = data.type !== 'sign' && useMuseumStore.getState().discover(data.id)
      if (isNew) playDiscover()
      else playHover()
    },
    onPointerOut: () => setHovered(false),
    onClick: (e) => {
      e.stopPropagation()
      useMuseumStore.getState().togglePin(data.id)
      playClick()
    },
  }

  return (
    <group position={data.position} rotation-y={data.rotation ?? 0}>
      {pedestal && <Pedestal highlighted={active} discovered={discovered} />}
      <Item hovered={active} accent={data.accent} {...handlers} />
      {active && <ExhibitPanel data={data} y={panelY} pinned={pinned} />}
    </group>
  )
}
