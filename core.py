"""Deterministic rail connectivity puzzle; no railway operations simulation."""
from dataclasses import dataclass

DIRECTIONS = {"N": (0, -1), "S": (0, 1), "E": (1, 0), "W": (-1, 0)}
OPPOSITE = {"N": "S", "S": "N", "E": "W", "W": "E"}
PIECES = {"NS", "EW", "NE", "NW", "SE", "SW"}


@dataclass(frozen=True)
class Result:
    status: str
    reason: str
    visited: tuple[tuple[int, int], ...]


class Puzzle:
    def __init__(self, width: int, height: int, source=(0, 0), target=(2, 0)):
        if any(type(v) is not int or v <= 0 for v in (width, height)):
            raise ValueError("invalid grid size")
        self.width, self.height = width, height
        self.source, self.target = source, target
        if source == target or not self._inside(source) or not self._inside(target):
            raise ValueError("invalid endpoints")
        self.reset()

    def _inside(self, cell):
        return (isinstance(cell, tuple) and len(cell) == 2
                and all(type(v) is int for v in cell)
                and 0 <= cell[0] < self.width and 0 <= cell[1] < self.height)

    def reset(self):
        self.rails = {}

    def put(self, at, connectors):
        if not self._inside(at) or not isinstance(connectors, str) or "".join(sorted(connectors)) not in {"".join(sorted(p)) for p in PIECES}:
            raise ValueError("invalid rail")
        if at in self.rails:
            raise ValueError("rail cell already occupied")
        self.rails[at] = frozenset(connectors)

    def run(self, initial="E"):
        if initial not in DIRECTIONS:
            raise ValueError("invalid direction")
        current = self.source
        heading = initial
        visited = []
        seen = set()
        while True:
            if (current, heading) in seen:
                return Result("blocked", "loop", tuple(visited))
            seen.add((current, heading))
            visited.append(current)
            connectors = self.rails.get(current)
            if connectors is None:
                return Result("blocked", "missing rail", tuple(visited))
            if OPPOSITE[heading] not in connectors:
                return Result("blocked", "incompatible connector", tuple(visited))
            if current == self.target:
                return Result("arrived", "destination reached", tuple(visited))
            possible = connectors - {OPPOSITE[heading]}
            if len(possible) != 1:
                return Result("blocked", "dead end", tuple(visited))
            heading = next(iter(possible))
            dx, dy = DIRECTIONS[heading]
            current = (current[0]+dx, current[1]+dy)
            if not self._inside(current):
                return Result("blocked", "outside grid", tuple(visited))


if __name__ == "__main__":
    puzzle = Puzzle(4, 2)
    for x in range(3):
        puzzle.put((x, 0), "EW")
    print(puzzle.run())
