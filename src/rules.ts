/** Small immutable track-connection rules; independent from browser and Phaser. */
export type Direction = 'N' | 'E' | 'S' | 'W';
export type Kind = 'empty' | 'straight' | 'corner' | 'start' | 'end';
export type Tile = Readonly<{ kind: Kind; rotation: number }>;
export type Position = Readonly<{ x: number; y: number }>;

export const OPPOSITE: Readonly<Record<Direction, Direction>> = { N: 'S', E: 'W', S: 'N', W: 'E' };
const ADVANCE: Readonly<Record<Direction, Position>> = {
  N: { x: 0, y: -1 }, E: { x: 1, y: 0 }, S: { x: 0, y: 1 }, W: { x: -1, y: 0 }
};
const CORNERS: readonly (readonly Direction[])[] = [['N', 'E'], ['E', 'S'], ['S', 'W'], ['W', 'N']];

export function ports(tile: Tile): readonly Direction[] {
  const r = ((tile.rotation % 4) + 4) % 4;
  switch (tile.kind) {
    case 'start': return ['E'];
    case 'end': return ['W'];
    case 'straight': return r % 2 === 0 ? ['N', 'S'] : ['E', 'W'];
    case 'corner': return CORNERS[r];
    default: return [];
  }
}

export function rotate(tile: Tile): Tile {
  if (tile.kind === 'start' || tile.kind === 'end' || tile.kind === 'empty') return tile;
  return { ...tile, rotation: (tile.rotation + 1) % 4 };
}

function inside(p: Position, width: number, height: number): boolean {
  return p.x >= 0 && p.y >= 0 && p.x < width && p.y < height;
}

function index(p: Position, width: number): number { return p.y * width + p.x; }

/** Return the complete railway path, or [] for a disconnected, cyclic or malformed network. */
export function traceRoute(
  tiles: readonly Tile[], width: number, height: number, start: Position, destination: Position
): Position[] {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 ||
      tiles.length !== width * height || !inside(start, width, height) || !inside(destination, width, height) ||
      tiles[index(start, width)].kind !== 'start' || tiles[index(destination, width)].kind !== 'end') return [];

  const route: Position[] = [{ ...start }];
  let current: Position = { ...start };
  let outgoing: Direction = 'E';
  const visited = new Set<number>([index(start, width)]);

  for (let steps = 0; steps < tiles.length; steps++) {
    const move = ADVANCE[outgoing];
    const next = { x: current.x + move.x, y: current.y + move.y };
    if (!inside(next, width, height)) return [];
    const nextIndex = index(next, width);
    if (visited.has(nextIndex)) return [];
    visited.add(nextIndex);
    const tile = tiles[nextIndex];
    const entry: Direction = OPPOSITE[outgoing];
    const connections = ports(tile);
    if (!connections.includes(entry)) return [];
    route.push(next);
    if (tile.kind === 'end') return next.x === destination.x && next.y === destination.y ? route : [];
    if (connections.length !== 2) return [];
    const other: Direction | undefined = connections.find((direction: Direction) => direction !== entry);
    if (!other) return [];
    outgoing = other;
    current = next;
  }
  return [];
}
