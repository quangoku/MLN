export function nearestExhibitId(player, exhibits, radius) {
  let nearestId = null
  let nearestDistance = radius * radius

  for (const exhibit of exhibits) {
    const dx = player.x - exhibit.position[0]
    const dz = player.z - exhibit.position[2]
    const distance = dx * dx + dz * dz
    if (distance > nearestDistance) continue
    nearestDistance = distance
    nearestId = exhibit.id
  }

  return nearestId
}
