const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server.js');

chai.use(chaiHttp);

suite('Functional Tests', () => {
  test('Translation with text and locale field: POST to /api/translate', (done) => {
    chai.request(server)
      .post('/api/translate')
      .send({
        text: "Mangoes are my favorite fruit.",
        locale: "american-to-british"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.text, "Mangoes are my favorite fruit.");
        assert.include(res.body.translation, "favourite");
        assert.include(res.body.translation, '<span class="highlight">favourite</span>');
        done();
      });
  });

  test('Translation with text and invalid locale field: POST to /api/translate', (done) => {
    chai.request(server)
      .post('/api/translate')
      .send({
        text: "Test text",
        locale: "invalid-locale"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'Invalid value for locale field');
        done();
      });
  });

  test('Translation with missing text field: POST to /api/translate', (done) => {
    chai.request(server)
      .post('/api/translate')
      .send({
        locale: "american-to-british"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'Required field(s) missing');
        done();
      });
  });

  test('Translation with missing locale field: POST to /api/translate', (done) => {
    chai.request(server)
      .post('/api/translate')
      .send({
        text: "Test text"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'Required field(s) missing');
        done();
      });
  });

  test('Translation with empty text: POST to /api/translate', (done) => {
    chai.request(server)
      .post('/api/translate')
      .send({
        text: "",
        locale: "american-to-british"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'No text to translate');
        done();
      });
  });

  test('Translation with text that does not need translation: POST to /api/translate', (done) => {
    chai.request(server)
      .post('/api/translate')
      .send({
        text: "Hello world",
        locale: "american-to-british"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.text, "Hello world");
        assert.equal(res.body.translation, "Everything looks good to me!");
        done();
      });
  });
});
