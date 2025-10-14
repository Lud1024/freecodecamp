const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Issue = require('../models/Issue');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testIssueId;

  suiteSetup(async function() {
    // Clean up test database before running tests
    try {
      await Issue.deleteMany({});
    } catch (err) {
      console.error(err);
    }
  });

  suite('POST /api/issues/{project} => Create issue', function() {
    test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
      chai.request(server)
        .post('/api/issues/testproject')
        .send({
          issue_title: 'Test Issue Title',
          issue_text: 'Test Issue Text',
          created_by: 'Test User',
          assigned_to: 'Assigned User',
          status_text: 'In Progress'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Test Issue Title');
          assert.equal(res.body.issue_text, 'Test Issue Text');
          assert.equal(res.body.created_by, 'Test User');
          assert.equal(res.body.assigned_to, 'Assigned User');
          assert.equal(res.body.status_text, 'In Progress');
          assert.equal(res.body.project, 'testproject');
          assert.equal(res.body.open, true);
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          testIssueId = res.body._id;
          done();
        });
    });

    test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
      chai.request(server)
        .post('/api/issues/testproject')
        .send({
          issue_title: 'Required Fields Only',
          issue_text: 'This issue has only required fields',
          created_by: 'Test User 2'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Required Fields Only');
          assert.equal(res.body.issue_text, 'This issue has only required fields');
          assert.equal(res.body.created_by, 'Test User 2');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          assert.equal(res.body.project, 'testproject');
          assert.equal(res.body.open, true);
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          done();
        });
    });

    test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
      chai.request(server)
        .post('/api/issues/testproject')
        .send({
          issue_title: 'Missing Required Fields'
          // Missing issue_text and created_by
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });

  suite('GET /api/issues/{project} => View issues', function() {
    test('View issues on a project: GET request to /api/issues/{project}', function(done) {
      chai.request(server)
        .get('/api/issues/testproject')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtLeast(res.body.length, 1);
          res.body.forEach(issue => {
            assert.equal(issue.project, 'testproject');
            assert.property(issue, '_id');
            assert.property(issue, 'issue_title');
            assert.property(issue, 'issue_text');
            assert.property(issue, 'created_by');
            assert.property(issue, 'created_on');
            assert.property(issue, 'updated_on');
            assert.property(issue, 'open');
          });
          done();
        });
    });

    test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
      chai.request(server)
        .get('/api/issues/testproject?open=true')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.equal(issue.project, 'testproject');
            assert.equal(issue.open, true);
          });
          done();
        });
    });

    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
      chai.request(server)
        .get('/api/issues/testproject?open=true&created_by=Test User')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.equal(issue.project, 'testproject');
            assert.equal(issue.open, true);
            assert.equal(issue.created_by, 'Test User');
          });
          done();
        });
    });
  });

  suite('PUT /api/issues/{project} => Update issues', function() {
    test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
      chai.request(server)
        .put('/api/issues/testproject')
        .send({
          _id: testIssueId,
          status_text: 'Updated Status'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testIssueId);
          done();
        });
    });

    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
      chai.request(server)
        .put('/api/issues/testproject')
        .send({
          _id: testIssueId,
          issue_title: 'Updated Title',
          assigned_to: 'New Assigned User',
          open: false
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testIssueId);
          done();
        });
    });

    test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
      chai.request(server)
        .put('/api/issues/testproject')
        .send({
          issue_title: 'No ID provided'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    test('Update an issue with no update fields: PUT request to /api/issues/{project}', function(done) {
      chai.request(server)
        .put('/api/issues/testproject')
        .send({
          _id: testIssueId
          // No fields to update
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no update field(s) sent');
          assert.equal(res.body._id, testIssueId);
          done();
        });
    });

    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
      chai.request(server)
        .put('/api/issues/testproject')
        .send({
          _id: 'invalid-id-123',
          issue_title: 'Invalid ID'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not update');
          assert.equal(res.body._id, 'invalid-id-123');
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project} => Delete issues', function() {
    test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
      chai.request(server)
        .delete('/api/issues/testproject')
        .send({
          _id: testIssueId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, testIssueId);
          done();
        });
    });

    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
      chai.request(server)
        .delete('/api/issues/testproject')
        .send({
          _id: 'invalid-id-456'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, 'invalid-id-456');
          done();
        });
    });

    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
      chai.request(server)
        .delete('/api/issues/testproject')
        .send({
          // No _id provided
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
  });
});
