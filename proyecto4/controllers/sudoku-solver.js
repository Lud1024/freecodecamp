class SudokuSolver {

  validate(puzzleString) {
    if (!puzzleString) return { error: 'Required field missing' };
    if (puzzleString.length !== 81) return { error: 'Expected puzzle to be 81 characters long' };
    if (/[^1-9.]/.test(puzzleString)) return { error: 'Invalid characters in puzzle' };
    return { valid: true };
  }

  checkRowPlacement(puzzleString, row, colOrVal, maybeVal) {
    const value = (maybeVal !== undefined) ? maybeVal : colOrVal;
    const grid = puzzleString.split('');
    const startIdx = row * 9;

    for (let c = 0; c < 9; c++) {
      if (grid[startIdx + c] !== '.' && grid[startIdx + c] === value.toString()) {
        return false;
      }
    }
    return true;
  }

  checkColPlacement(puzzleString, col, rowOrVal, maybeVal) {
    const value = (maybeVal !== undefined) ? maybeVal : rowOrVal;
    const grid = puzzleString.split('');

    for (let r = 0; r < 9; r++) {
      if (grid[r * 9 + col] !== '.' && grid[r * 9 + col] === value.toString()) {
        return false;
      }
    }
    return true;
  }

  checkRegionPlacement(puzzleString, row, col, value) {
    const grid = puzzleString.split('');
    const regionRow = Math.floor(row / 3) * 3;
    const regionCol = Math.floor(col / 3) * 3;

    for (let r = regionRow; r < regionRow + 3; r++) {
      for (let c = regionCol; c < regionCol + 3; c++) {
        if (grid[r * 9 + c] !== '.' && grid[r * 9 + c] === value.toString()) {
          return false;
        }
      }
    }
    return true;
  }

  checkPlacement(puzzleString, coordinate, value) {
    // Parse coordinate (e.g., "A1" -> row 0, col 0)
    if (!coordinate || !/^[A-I][1-9]$/.test(coordinate)) {
      return { error: 'Invalid coordinate' };
    }

    if (!value || !/^[1-9]$/.test(value.toString())) {
      return { error: 'Invalid value' };
    }

    const row = coordinate.charCodeAt(0) - 65; // A = 0, B = 1, etc.
    const col = parseInt(coordinate[1]) - 1; // 1 = 0, 2 = 1, etc.

    // Check if the cell already contains the value
    const currentPos = row * 9 + col;
    if (puzzleString[currentPos] === value.toString()) {
      return { valid: true };
    }

    const validRow = this.checkRowPlacement(puzzleString, row, col, value);
    const validCol = this.checkColPlacement(puzzleString, row, col, value);
    const validRegion = this.checkRegionPlacement(puzzleString, row, col, value);

    const conflicts = [];
    if (!validRow) conflicts.push('row');
    if (!validCol) conflicts.push('column');
    if (!validRegion) conflicts.push('region');

    return conflicts.length === 0
      ? { valid: true }
      : { valid: false, conflict: conflicts };
  }

  solve(puzzleString) {
    // First validate the puzzle
    const validation = this.validate(puzzleString);
    if (validation.error) {
      return false;
    }

    const grid = puzzleString.split('');

    // Find empty positions (represented by '.')
    const findEmptyPosition = () => {
      for (let i = 0; i < 81; i++) {
        if (grid[i] === '.') {
          return i;
        }
      }
      return -1;
    };

    // Check if a number can be placed at a position
    const canPlace = (pos, num) => {
      const row = Math.floor(pos / 9);
      const col = pos % 9;

      // Check row
      for (let c = 0; c < 9; c++) {
        if (grid[row * 9 + c] === num) return false;
      }

      // Check column
      for (let r = 0; r < 9; r++) {
        if (grid[r * 9 + col] === num) return false;
      }

      // Check region
      const regionRow = Math.floor(row / 3) * 3;
      const regionCol = Math.floor(col / 3) * 3;
      for (let r = regionRow; r < regionRow + 3; r++) {
        for (let c = regionCol; c < regionCol + 3; c++) {
          if (grid[r * 9 + c] === num) return false;
        }
      }

      return true;
    };

    // Backtracking function
    const solveBacktrack = () => {
      const emptyPos = findEmptyPosition();

      // If no empty positions, puzzle is solved
      if (emptyPos === -1) {
        return true;
      }

      const row = Math.floor(emptyPos / 9);
      const col = emptyPos % 9;

      // Try numbers 1-9
      for (let num = 1; num <= 9; num++) {
        if (canPlace(emptyPos, num.toString())) {
          grid[emptyPos] = num.toString();

          if (solveBacktrack()) {
            return true;
          }

          // Backtrack
          grid[emptyPos] = '.';
        }
      }

      return false;
    };

    // Start solving
    if (solveBacktrack()) {
      return grid.join('');
    } else {
      return false;
    }
  }
}

module.exports = SudokuSolver;

