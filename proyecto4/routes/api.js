'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body || {};

      if (!puzzle || !coordinate || !value) {
        return res.json({ error: 'Required field(s) missing' });
      }

      const validation = solver.validate(puzzle);
      if (validation.error) {
        return res.json(validation);
      }

      // Validate coordinate format (A-I, 1-9)
      if (!/^[A-I][1-9]$/.test(coordinate)) {
        return res.json({ error: 'Invalid coordinate' });
      }

      // Validate value (1-9)
      if (!/^[1-9]$/.test(value.toString())) {
        return res.json({ error: 'Invalid value' });
      }

      const result = solver.checkPlacement(puzzle, coordinate, value);
      res.json(result);
    });

  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body || {};

      if (!puzzle) {
        return res.json({ error: 'Required field missing' });
      }

      const validation = solver.validate(puzzle);
      if (validation.error) {
        return res.json(validation);
      }

      const solution = solver.solve(puzzle);
      if (!solution) {
        return res.json({ error: 'Puzzle cannot be solved' });
      }
      res.json({ solution });
    });
};
