'use strict';

const Issue = require('../models/Issue');

module.exports = function (app) {

  // Helper function for boolean conversion
  const toBool = v => (v === true || v === 'true') ? true :
                    (v === false || v === 'false') ? false : v;

  app.route('/api/issues/:project')

    // CREATE
    .post(async (req, res) => {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        // FCC expects 200 with exact JSON for all responses
        return res.json({ error: 'required field(s) missing' });
      }

      const now = new Date();
      const doc = new Issue({
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open: true,
        created_on: now,
        updated_on: now
      });

      const saved = await doc.save();
      return res.json({
        issue_title: saved.issue_title,
        issue_text : saved.issue_text,
        created_by : saved.created_by,
        assigned_to: saved.assigned_to,
        status_text: saved.status_text,
        project    : saved.project,
        open       : saved.open,
        created_on : saved.created_on,
        updated_on : saved.updated_on,
        _id        : saved._id
      });
    })

    // READ (with filters)
    .get(async (req, res) => {
      const project = req.params.project;
      const filter = { project };

      // Build filter from query parameters
      for (const [k, v] of Object.entries(req.query)) {
        if (v !== '') filter[k] = (k === 'open') ? toBool(v) : v;
      }

      const docs = await Issue.find(filter).lean();
      return res.json(docs);
    })

    // UPDATE
    .put(async (req, res) => {
      const { _id, ...body } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' }); // 200 with error JSON
      }

      // Build updates from non-empty values
      const updates = {};
      for (const [k, v] of Object.entries(body)) {
        if (v !== undefined && v !== '') {
          updates[k] = (k === 'open') ? toBool(v) : v;
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id }); // 200 with error JSON
      }

      updates.updated_on = new Date();

      try {
        const updated = await Issue.findByIdAndUpdate(_id, updates, { new: true });
        if (!updated) {
          return res.json({ error: 'could not update', _id }); // 200 with error JSON
        }
        return res.json({ result: 'successfully updated', _id }); // 200 with success JSON
      } catch (e) {
        return res.json({ error: 'could not update', _id }); // 200 with error JSON
      }
    })

    // DELETE
    .delete(async (req, res) => {
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' }); // 200 with error JSON
      }

      try {
        const del = await Issue.findByIdAndDelete(_id);
        if (!del) {
          return res.json({ error: 'could not delete', _id }); // 200 with error JSON
        }
        return res.json({ result: 'successfully deleted', _id }); // 200 with success JSON
      } catch (e) {
        return res.json({ error: 'could not delete', _id }); // 200 with error JSON
      }
    });
};
