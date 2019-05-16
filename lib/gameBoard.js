/* eslint-disable linebreak-style */
const baseCell = {
  row: 0,
  col: 0,
  hidden: true,
  isMine: false,
};

const mineCell = {
  isMine: true,
  isMarked: false,
};

const randomPercentage = () => {
  return Math.floor(Math.random() * 100);
};

const createCell = () => {
  if (randomPercentage() < 16) {
    return Object.assign({}, baseCell, mineCell);
  }
  return Object.assign({}, baseCell);
};


const createArrayOfCells = (numOfRows) => {
  const cellsArray = [];
  for (let i = 0; i < numOfRows; i += 1) {
    for (let j = 0; j < numOfRows; j += 1) {
      const newCell = createCell();
      newCell.row = i;
      newCell.col = j;
      cellsArray.push(newCell);
    }
  }
  return cellsArray;
};

const createBoard = (difficultyLevel) => {
  const cellsArray = createArrayOfCells(difficultyLevel);
  return {
    cells: cellsArray,
    isCompleted: false,
  };
};

export default createBoard;
