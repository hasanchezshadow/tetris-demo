export interface Piece {
    position: Position,
    shape: number[][]
}

interface Position {
    x: number,
    y: number
}