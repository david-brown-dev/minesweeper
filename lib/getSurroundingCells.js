/* eslint-disable linebreak-style */
const getRange = (begin, end) => {
  return Array.apply(begin, Array(end - begin + 1))
    .map((n, i) => {
      return begin + i;
    });
};

const getLowerBound = (n) => {
  return n - 1 < 0 ? 0 : n - 1;
};

const getUpperBound = (gameBoard, n) => {
  const limit = Math.sqrt(gameBoard.cells.length);
  return n + 1 > limit ? limit : n + 1;
};

// Returns a subset of the `cells` array, including only those cells
// which are adjacent to `row`, `col`
const getSurroundingCells = (gameBoard, row, col) => {
  const columns = getRange(getLowerBound(col), getUpperBound(gameBoard, col));
  const rows = getRange(getLowerBound(row), getUpperBound(gameBoard, row));
  return gameBoard.cells
    .filter((cell) => {
      // Filter out the current cell
      if (cell.row === row && cell.col === col) {
        return false;
      }
      // Grab the rest of the adjacent cells
      return columns.includes(cell.col) && rows.includes(cell.row);
    });
};

export default getSurroundingCells;
