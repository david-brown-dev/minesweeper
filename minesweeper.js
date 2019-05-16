/* eslint-disable linebreak-style */
import getSurroundingCells from './lib/getSurroundingCells.js';
import createBoard from './lib/gameBoard.js';

const setDifficultyLevel = () => {
  const diffSelector = document.getElementById('difficulty');
  const difficultyLevel = diffSelector.options[diffSelector.selectedIndex].value;
  switch (difficultyLevel) {
    case 'easy':
      return 6;
    case 'medium':
      return 12;
    case 'hard':
      return 18;
    default:
      return 6;
  }
};

function displayMessage(msg, id) {
  document.getElementById(id || 'message').innerHTML = '<p>' + msg + '</p>';
}

// Define this function to look for a win condition:
//
// 1. Are all of the cells that are NOT mines visible?
// 2. Are all of the mines marked?
function checkForWin(gameBoard) {
  let allMinesMarked = true;
  let allCellsDisplayed = true;

  gameBoard.cells.forEach((element) => {
    if (element.isMine === true && element.isMarked === false) allMinesMarked = false;
    if (element.isMine === false && element.hidden === true) allCellsDisplayed = false;
  });

  if (allMinesMarked === true && allCellsDisplayed === true) {
    displayMessage('You win!');
  }
}
// You can use this function call to declare a winner (once you've
// detected that they've won, that is!)
//   displayMessage('You win!')

// Define this function to count the number of mines around the cell
// (there could be as many as 8). You don't have to get the surrounding
// cells yourself! Just use `getSurroundingCells`:
//
//   var surrounding = getSurroundingCells(cell.row, cell.col)
//
// It will return cell objects in an array. You should loop through
// them, counting the number of times `cell.isMine` is true.
function countSurroundingMines(gameBoard, cell) {
  let mineCount = 0;
  const surrounding = getSurroundingCells(gameBoard, cell.row, cell.col);
  surrounding.forEach((element) => {
    if (element.isMine === true) {
      mineCount += 1;
    }
  });
  return mineCount;
}

// Convert classLists and HTMLCollections
function makeArray(list) {
  return [].slice.call(list);
}

function getCellIndex(gameBoard, row, col) {
  let idx = null;
  gameBoard.cells.find((cell, i) => {
    if (cell.row === row && cell.col === col) {
      idx = i;
      return true;
    }
  });
  return idx;
}

function getCoordinate(element, coordinate) {
  return makeArray(element.classList)
    .find((cssClass) => {
      return cssClass.substring(0, coordinate.length) === coordinate;
    })
    .split('-')[1];
}

function getRow(element) {
  return parseInt(getCoordinate(element, 'row'), 10);
}

function getCol(element) {
  return parseInt(getCoordinate(element, 'col'), 10);
}


function getNodeByCoordinates(row, col) {
  const rowClass = 'row-' + row;
  const colClass = 'col-' + col;
  return document.getElementsByClassName(rowClass + ' ' + colClass)[0];
}


// For the given cell object, set innerHTML to cell.surroundingMines
// under the following conditions:
//  - cell has not been marked by the user
//  - surroundingMines is > 0
// If surroundingMines is 0, greedily attempt to expose as many more cells
// as possible.
function setInnerHTML(gameBoard, cell) {
  cell.isProcessed = true;
  const element = getNodeByCoordinates(cell.row, cell.col);
  if (element.innerHTML !== '') {
    return;
  }
  element.innerHTML = cell.surroundingMines > 0 ?
    cell.surroundingMines : '';
  if (element.classList.contains('hidden')) {
    cell.hidden = false;
    element.classList.remove('hidden');
    if (cell.surroundingMines === 0) {
      return showSurrounding(gameBoard, element);
    }
  }
}

// For the given DOM element, displays surrounding mine counts
// under the following conditions:
//  - cell is not a mine
//  - cell has not already been checked
function showSurrounding(gameBoard, element) {
  getSurroundingCells(gameBoard, getRow(element), getCol(element))
    .filter((cell) => {
      return !cell.isMine && !cell.isMarked;
    })
    .filter((cell) => {
      // Avoid breaking the call stack with recurrent checks on same cell
      return !cell.isProcessed;
    })
    .forEach((element) => {
      setInnerHTML(gameBoard, element);
    });
}


function revealMines() {
  makeArray(document.getElementsByClassName('mine'))
    .forEach((element) => {
      element.classList.remove('hidden');
      element.classList.remove('marked');
    });
}

function showCell(evt, gameBoard) {
  const idx = getCellIndex(gameBoard, getRow(evt.target), getCol(evt.target));
  const cell = gameBoard.cells[idx];
  cell.hidden = false;
  cell.isMarked = false;
  evt.target.classList.remove('hidden');
  evt.target.classList.remove('marked');
  if (evt.target.classList.contains('mine')) {
    displayMessage('BOOM!');
    revealMines();
    removeListeners(gameBoard);
    return;
  }
  setInnerHTML(gameBoard, cell);
  if (cell.surroundingMines === 0) {
    showSurrounding(gameBoard, evt.target);
  }
}

function markCell(evt, gameBoard) {
  evt.preventDefault();
  evt.target.classList.toggle('marked');
  const idx = getCellIndex(gameBoard, getRow(evt.target), getCol(evt.target));
  const cell = gameBoard.cells[idx];
  cell.isMarked = cell.isMarked ? false : true;
}

function addListeners(gameBoard, boardNode) {
  for (let i = 0; i < boardNode.children.length; i += 1) {
    boardNode.children[i].addEventListener('click', (event) => {
      showCell(event, gameBoard);
      checkForWin(gameBoard);
    });
    boardNode.children[i].addEventListener('contextmenu', (event) => {
      markCell(event, gameBoard);
      checkForWin(gameBoard);
    });
  }
  document.getElementById('reset').addEventListener('click', startGame);
  document.getElementById('difficulty').addEventListener('change', startGame);
}


// Cloning removes event listeners
function removeListeners() {
  const board = document.getElementsByClassName('board')[0];
  const clone = board.cloneNode(true);
  board.parentNode.replaceChild(clone, board);
}


function cellsToNodes(boardNode, cell) {
  const node = document.createElement('div');
  node.classList.add('row-' + cell.row);
  node.classList.add('col-' + cell.col);
  if (cell.isMine) {
    node.classList.add('mine');
  }
  if (cell.hidden) {
    node.classList.add('hidden');
  } else {
    if (cell.surroundingMines && !cell.isMine) {
      node.innerHTML = cell.surroundingMines;
    }
  }
  boardNode.appendChild(node);
  return boardNode;
}

// Draw board based on number of cells and an assumption about how much 
// space should be allowed for each cell.
function drawBoard(gameBoard, boardNode) {
  boardNode.style.width = Math.sqrt(gameBoard.cells.length) * 58 + 'px';
  gameBoard.cells.reduce(cellsToNodes, boardNode);
}


function initBoard(gameBoard) {
  displayMessage("Let\'s play!");
  const boardNode = document.getElementsByClassName('board')[0];
  boardNode.innerHTML = '';
  drawBoard(gameBoard, boardNode);
  addListeners(gameBoard, boardNode);
  return true;
}


function startGame() {
  const difficultyLevel = setDifficultyLevel();
  const gameBoard = createBoard(difficultyLevel);
  // Don't remove this function call: it makes the game work!
  initBoard(gameBoard);
  gameBoard.cells.forEach((element) => {
    element.surroundingMines = countSurroundingMines(gameBoard, element);
  });
}

document.addEventListener('DOMContentLoaded', startGame());
