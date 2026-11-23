export function stepSpring(value, velocity, target, seconds, response = 22) {
  const offset = value - target;
  const impulse = velocity + response * offset;
  const decay = Math.exp(-response * seconds);
  return {
    value: target + (offset + impulse * seconds) * decay,
    velocity: (velocity - response * impulse * seconds) * decay,
  };
}

export function interpolateSegment(segments, center) {
  const rightIndex = segments.findIndex((segment) => center <= segment.center);
  if (rightIndex === 0) return { ...segments[0] };
  if (rightIndex < 0) return { ...segments.at(-1) };
  const left = segments[rightIndex - 1];
  const right = segments[rightIndex];
  const ratio = (center - left.center) / (right.center - left.center);
  return { center, width: left.width + ratio * (right.width - left.width) };
}

export function boundSegment(shape, groupWidth) {
  const width = Math.max(0, Math.min(shape.width, groupWidth));
  return { width, center: Math.max(width / 2, Math.min(shape.center, groupWidth - width / 2)) };
}
