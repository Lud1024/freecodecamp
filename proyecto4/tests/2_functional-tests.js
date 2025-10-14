const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  // Test POST /api/solve with valid puzzle
  test('Solve puzzle with valid puzzle string: POST /api/solve', (done) => {
    const [puzzle] = puzzlesAndSolutions[0];
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'solution');
        assert.isString(res.body.solution);
        assert.equal(res.body.solution.length, 81);
        done();
      });
  });

  // Test POST /api/solve with missing puzzle
  test('Solve puzzle with missing puzzle string: POST /api/solve', (done) => {
    chai.request(server)
      .post('/api/solve')
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Required field missing');
        done();
      });
  });

  // Test POST /api/solve with invalid characters
  test('Solve puzzle with invalid characters: POST /api/solve', (done) => {
    const invalidPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37a';
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: invalidPuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Invalid characters in puzzle');
        done();
      });
  });

  // Test POST /api/solve with incorrect length
  test('Solve puzzle with incorrect length: POST /api/solve', (done) => {
    const shortPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3';
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: shortPuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
        done();
      });
  });

  // Test POST /api/solve with unsolvable puzzle
  test('Solve puzzle that cannot be solved: POST /api/solve', (done) => {
    // Create an unsolvable puzzle by making two 1's in the same row
    const unsolvablePuzzle = '115..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: unsolvablePuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Puzzle cannot be solved');
        done();
      });
  });

  // Test POST /api/check with all fields
  test('Check placement with all fields: POST /api/check', (done) => {
    const puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A4', value: '9' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'valid');
        assert.strictEqual(res.body.valid, true);
        done();
      });
  });

  // Test POST /api/check with single conflict
  test('Check placement with single placement conflict: POST /api/check', (done) => {
    const puzzle = '135..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A4', value: '4' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'valid');
        assert.strictEqual(res.body.valid, false);
        assert.property(res.body, 'conflict');
        assert.isArray(res.body.conflict);
        assert.sameMembers(res.body.conflict, ['row', 'column']);
        done();
      });
  });

  // Test POST /api/check with multiple conflicts
  test('Check placement with multiple placement conflicts: POST /api/check', (done) => {
    const puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A2', value: '1' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'valid');
        assert.strictEqual(res.body.valid, false);
        assert.property(res.body, 'conflict');
        assert.isArray(res.body.conflict);
        assert.sameMembers(res.body.conflict, ['row', 'column', 'region']);
        done();
      });
  });

  // Test POST /api/check with all conflicts
  test('Check placement with all placement conflicts: POST /api/check', (done) => {
    const puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A2', value: '2' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'valid');
        assert.strictEqual(res.body.valid, false);
        assert.property(res.body, 'conflict');
        assert.isArray(res.body.conflict);
        assert.include(res.body.conflict, 'row');
        assert.include(res.body.conflict, 'column');
        assert.include(res.body.conflict, 'region');
        done();
      });
  });

  // Test POST /api/check with missing fields
  test('Check placement with missing required fields: POST /api/check', (done) => {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Required field(s) missing');
        done();
      });
  });

  // Test POST /api/check with invalid characters
  test('Check placement with invalid characters: POST /api/check', (done) => {
    const invalidPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37a';
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: invalidPuzzle, coordinate: 'A1', value: '1' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Invalid characters in puzzle');
        done();
      });
  });

  // Test POST /api/check with incorrect length
  test('Check placement with incorrect length: POST /api/check', (done) => {
    const shortPuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3';
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: shortPuzzle, coordinate: 'A1', value: '1' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
        done();
      });
  });

  // Test POST /api/check with invalid coordinate
  test('Check placement with invalid coordinate: POST /api/check', (done) => {
    const puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A10', value: '1' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Invalid coordinate');
        done();
      });
  });

  // Test POST /api/check with invalid value
  test('Check placement with invalid value: POST /api/check', (done) => {
    const puzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1', value: '10' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Invalid value');
        done();
      });
  });
});

