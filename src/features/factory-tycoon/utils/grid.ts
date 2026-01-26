import { Direction } from "../types";

export function getTargetCoordinates(
	x: number,
	y: number,
	dir: Direction,
): { x: number; y: number } {
	switch (dir) {
		case "N":
			return { x, y: y - 1 };
		case "S":
			return { x, y: y + 1 };
		case "E":
			return { x: x + 1, y };
		case "W":
			return { x: x - 1, y };
		default:
			return { x, y };
	}
}

export function getOppositeDir(dir: Direction): Direction {
	const map: Record<Direction, Direction> = { N: "S", S: "N", E: "W", W: "E" };
	return map[dir];
}

export function getLeftDir(dir: Direction): Direction {
	const map: Record<Direction, Direction> = { N: "W", W: "S", S: "E", E: "N" };
	return map[dir];
}

export function getRightDir(dir: Direction): Direction {
	const map: Record<Direction, Direction> = { N: "E", E: "S", S: "W", W: "N" };
	return map[dir];
}
