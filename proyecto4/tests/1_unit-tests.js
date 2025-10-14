const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');

let solver;

suite('Unit Tests', () => {
  suiteSetup(() => {
    solver = new Solver();
  });

  // Test valid 81 character puzzle string
  test('Logic handles valid 81 character puzzle string', () => {
    const validPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    const result = solver.validate(validPuzzle);
    assert.isObject(result);
    assert.property(result, 'valid');
    assert.strictEqual(result.valid, true);
  });

  // Test puzzle string with invalid characters
  test('Logic handles puzzle string with invalid characters', () => {
    const invalidPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37a';
    const result = solver.validate(invalidPuzzle);
    assert.isObject(result);
    assert.property(result, 'error');
    assert.equal(result.error, 'Invalid characters in puzzle');
  });

  // Test puzzle string with incorrect length
  test('Logic handles puzzle string with incorrect length', () => {
    const shortPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3';
    const result = solver.validate(shortPuzzle);
    assert.isObject(result);
    assert.property(result, 'error');
    assert.equal(result.error, 'Expected puzzle to be 81 characters long');
  });

  // Test valid row placement
  test('Logic handles valid row placement', () => {
    const puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    const result = solver.checkRowPlacement(puzzle, 0, '3');
    assert.isBoolean(result);
    assert.strictEqual(result, true);
  });

  // Test invalid row placement
  test('Logic handles invalid row placement', () => {
    const puzzle = '135..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    const result = solver.checkRowPlacement(puzzle, 0, '1');
    assert.isBoolean(result);
    assert.strictEqual(result, false);
  });

  // Test valid column placement
  test('Logic handles valid column placement', () => {
    const puzzle = '.................................................................................';
    const result = solver.checkColPlacement(puzzle, 0, '2');
    assert.isBoolean(result);
    assert.strictEqual(result, true);
  });

  // Test invalid column placement
  test('Logic handles invalid column placement', () => {
    const puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    const result = solver.checkColPlacement(puzzle, 0, '1');
    assert.isBoolean(result);
    assert.strictEqual(result, false);
  });

  // Test valid region placement
  test('Logic handles valid region placement', () => {
    const puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    const result = solver.checkRegionPlacement(puzzle, 0, 0, '3');
    assert.isBoolean(result);
    assert.strictEqual(result, true);
  });

  // Test invalid region placement
  test('Logic handles invalid region placement', () => {
    const puzzle = '135..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    const result = solver.checkRegionPlacement(puzzle, 0, 0, '3');
    assert.isBoolean(result);
    assert.strictEqual(result, false);
  });

  // Test valid puzzle passes solver
  test('Valid puzzle strings pass the solver', () => {
    const [puzzle, solution] = puzzlesAndSolutions[0];
    const solved = solver.solve(puzzle);
    assert.isString(solved);
    assert.equal(solved, solution);
  });

  // Test invalid puzzle fails solver
  test('Invalid puzzle strings fail the solver', () => {
    const invalidPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37a';
    assert.isFalse(solver.solve(invalidPuzzle));
  });

  // Test incomplete puzzle returns expected solution
  test('Solver returns the expected solution for incomplete puzzle', () => {
    const [puzzle, expectedSolution] = puzzlesAndSolutions[1];
    const actualSolution = solver.solve(puzzle);
    assert.isString(actualSolution);
    assert.equal(actualSolution, expectedSolution);
  });
});
