'use strict';

const expect = require('chai').expect;
const ConvertHandler = require('../controllers/convertHandler.js');

module.exports = function (app) {

   let convertHandler = new ConvertHandler();

   app.route('/api/convert')
     .get(function (req, res) {
       const input = req.query.input;

       if (!input) {
         return res.json({ error: 'No input provided' });
       }

       const initNum = convertHandler.getNum(input);
       const initUnit = convertHandler.getUnit(input);

       // Check for invalid number and unit (both invalid)
       if (initNum === 'invalid number' && initUnit === 'invalid unit') {
         return res.json({ error: 'invalid number and unit' });
       }

       // Check for invalid number
       if (initNum === 'invalid number') {
         return res.json({ error: 'invalid number' });
       }

       // Check for invalid unit
       if (initUnit === 'invalid unit') {
         return res.json({ error: 'invalid unit' });
       }

       const returnNum = convertHandler.convert(initNum, initUnit);
       const returnUnit = convertHandler.getReturnUnit(initUnit);
       const string = convertHandler.getString(initNum, initUnit, returnNum, returnUnit);

       res.json({
         initNum: initNum,
         initUnit: initUnit,
         returnNum: returnNum,
         returnUnit: returnUnit,
         string: string
       });
     });

 };
