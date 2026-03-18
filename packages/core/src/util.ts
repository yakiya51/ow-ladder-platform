export function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rands(count: number, min: number, max: number): Array<number> {
  if (count <= 0) return [];

  const res = new Set<number>();

  while (res.size < count) {
    res.add(rand(min, max));
  }

  return Array.from(res);
}
