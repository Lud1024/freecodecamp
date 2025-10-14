const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testBookId;

  test('#example Test GET /api/books', function(done){
    chai.request(server).get('/api/books').end((err, res)=>{
      assert.equal(res.status, 200);
      assert.isArray(res.body);
      if (res.body.length) {
        assert.property(res.body[0], 'commentcount');
        assert.property(res.body[0], 'title');
        assert.property(res.body[0], '_id');
      }
      done();
    });
  });

  suite('POST /api/books with title', function() {
    test('POST /api/books with title', function(done) {
      chai.request(server).post('/api/books').send({ title: 'Test Book' }).end((err, res)=>{
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.property(res.body, 'title');
        assert.equal(res.body.title, 'Test Book');
        testBookId = res.body._id;
        done();
      });
    });

    test('POST /api/books with no title given', function(done) {
      chai.request(server).post('/api/books').send({}).end((err, res)=>{
        assert.equal(res.status, 200);
        assert.equal(res.text, 'missing required field title');
        done();
      });
    });
  });

  suite('GET /api/books', function(){
    test('GET /api/books', function(done){
      chai.request(server).get('/api/books').end((err, res)=>{
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        if (res.body.length) {
          assert.property(res.body[0], 'commentcount');
          assert.property(res.body[0], 'title');
          assert.property(res.body[0], '_id');
        }
        done();
      });
    });
  });

  suite('GET /api/books/[id]', function(){
    test('GET /api/books/[id] with id not in db', function(done){
      chai.request(server).get('/api/books/507f1f77bcf86cd799439011').end((err, res)=>{
        assert.equal(res.status, 200);
        assert.equal(res.text, 'no book exists');
        done();
      });
    });

    test('GET /api/books/[id] with valid id in db', function(done){
      chai.request(server).get('/api/books/' + testBookId).end((err, res)=>{
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.property(res.body, 'title');
        assert.property(res.body, 'comments');
        assert.isArray(res.body.comments);
        done();
      });
    });
  });

  suite('POST /api/books/[id] add comment', function(){
    test('POST /api/books/[id] with comment', function(done){
      chai.request(server).post('/api/books/' + testBookId).send({ comment: 'Nice!' }).end((err, res)=>{
        assert.equal(res.status, 200);
        assert.property(res.body, '_id');
        assert.property(res.body, 'title');
        assert.isArray(res.body.comments);
        assert.include(res.body.comments, 'Nice!');
        done();
      });
    });

    test('POST /api/books/[id] without comment field', function(done){
      chai.request(server).post('/api/books/' + testBookId).send({}).end((err, res)=>{
        assert.equal(res.status, 200);
        assert.equal(res.text, 'missing required field comment');
        done();
      });
    });

    test('POST /api/books/[id] with id not in db', function(done){
      chai.request(server).post('/api/books/507f1f77bcf86cd799439011').send({ comment: 'x' }).end((err, res)=>{
        assert.equal(res.status, 200);
        assert.equal(res.text, 'no book exists');
        done();
      });
    });
  });

  suite('DELETE /api/books', function() {
    test('DELETE /api/books/[id] with valid id in db', function(done){
      chai.request(server).delete('/api/books/' + testBookId).end((err, res)=>{
        assert.equal(res.status, 200);
        assert.equal(res.text, 'delete successful');
        done();
      });
    });

    test('DELETE /api/books/[id] with id not in db', function(done){
      chai.request(server).delete('/api/books/507f1f77bcf86cd799439011').end((err, res)=>{
        assert.equal(res.status, 200);
        assert.equal(res.text, 'no book exists');
        done();
      });
    });

    test('DELETE /api/books (all)', function(done){
      chai.request(server).delete('/api/books').end((err, res)=>{
        assert.equal(res.status, 200);
        assert.equal(res.text, 'complete delete successful');
        done();
      });
    });
  });

});
