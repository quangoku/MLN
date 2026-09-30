import { useMemo } from 'react'
import Visitor from './Visitor.jsx'
import { ROOMS, VISIT_POINTS } from '../world/layout.js'
import { hashString } from '../utils/random.js'

export default function Visitors() {
  const list = useMemo(
    () =>
      ROOMS.flatMap((room) =>
        Array.from({ length: room.visitors }, (_, i) => ({
          key: `${room.id}-${i}`,
          points: VISIT_POINTS[room.id],
          seed: hashString(`${room.id}-${i}`),
        })),
      ),
    [],
  )

  return list.map((v) => <Visitor key={v.key} points={v.points} seed={v.seed} />)
}
