'use strict';

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

module.exports = function (app) {
  const mongoUrl = process.env.DB;
  let booksCollection;

  MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
      // Usa este nombre de DB; asegúrate que exista en tu cadena (o se creará)
      const db = client.db('fccpersonallib');
      booksCollection = db.collection('books');
      console.log('Connected to MongoDB');
    })
    .catch(err => console.error('MongoDB connection error:', err));

  // /api/books
  app.route('/api/books')
    .get(async (req, res) => {
      const books = await booksCollection.find({}).toArray();
      res.json(books.map(b => ({
        _id: b._id,
        title: b.title,
        commentcount: Array.isArray(b.comments) ? b.comments.length : 0
      })));
    })

    .post(async (req, res) => {
      const title = req.body.title;
      if (!title) return res.send('missing required field title');   // <- string, no JSON
      const doc = { title, comments: [] };
      const r = await booksCollection.insertOne(doc);
      res.json({ _id: r.insertedId, title });
    })

    .delete(async (req, res) => {
      await booksCollection.deleteMany({});
      res.send('complete delete successful');                       // <- string exacta
    });

  // /api/books/:id
  app.route('/api/books/:id')
    .get(async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) return res.send('no book exists');
      const book = await booksCollection.findOne({ _id: new ObjectId(id) });
      if (!book) return res.send('no book exists');
      res.json({ _id: book._id, title: book.title, comments: book.comments || [] });
    })

    .post(async (req, res) => {
      const { id } = req.params;
      const { comment } = req.body;
      if (!comment) return res.send('missing required field comment'); // <- string exacta
      if (!ObjectId.isValid(id)) return res.send('no book exists');
      const r = await booksCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $push: { comments: comment } },
        { returnOriginal: false }
      );
      if (!r.value) return res.send('no book exists');
      const b = r.value;
      res.json({ _id: b._id, title: b.title, comments: b.comments || [] });
    })

    .delete(async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) return res.send('no book exists');
      const r = await booksCollection.findOneAndDelete({ _id: new ObjectId(id) });
      if (!r.value) return res.send('no book exists');
      res.send('delete successful');                                // <- string exacta
    });
};
