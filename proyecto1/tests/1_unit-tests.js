const chai = require('chai');
let assert = chai.assert;
const ConvertHandler = require('../controllers/convertHandler.js');

let convertHandler = new ConvertHandler();

suite('Unit Tests', function(){
  // Test 1: convertHandler should correctly read an integer input
  test('convertHandler should correctly read an integer input.', function() {
    assert.equal(convertHandler.getNum('5gal'), 5);
  });

  // Test 2: convertHandler should correctly read a decimal input
  test('convertHandler should correctly read a decimal number input.', function() {
    assert.equal(convertHandler.getNum('5.5gal'), 5.5);
  });

  // Test 3: convertHandler should correctly read a fractional input
  test('convertHandler should correctly read a fractional input.', function() {
    assert.equal(convertHandler.getNum('1/2gal'), 0.5);
  });

  // Test 4: convertHandler should correctly read a fractional input with a decimal
  test('convertHandler should correctly read a fractional input with a decimal.', function() {
    assert.equal(convertHandler.getNum('2.5/5gal'), 0.5);
  });

  // Test 5: convertHandler should correctly return an error on a double-fraction
  test('convertHandler should correctly return an error on a double-fraction (i.e. 3/2/3).', function() {
    assert.equal(convertHandler.getNum('3/2/3kg'), 'invalid number');
  });

  // Test 6: convertHandler should correctly default to a numerical input of 1 when no numerical input is provided
  test('convertHandler should correctly default to a numerical input of 1 when no numerical input is provided.', function() {
    assert.equal(convertHandler.getNum('gal'), 1);
  });

  // Test 7: convertHandler should correctly read each valid unit input
  test('convertHandler should correctly read each valid unit input.', function() {
    assert.equal(convertHandler.getUnit('5gal'), 'gal');
    assert.equal(convertHandler.getUnit('5GAL'), 'gal');
    assert.equal(convertHandler.getUnit('5l'), 'L');
    assert.equal(convertHandler.getUnit('5L'), 'L');
    assert.equal(convertHandler.getUnit('5lbs'), 'lbs');
    assert.equal(convertHandler.getUnit('5LBS'), 'lbs');
    assert.equal(convertHandler.getUnit('5kg'), 'kg');
    assert.equal(convertHandler.getUnit('5KG'), 'kg');
    assert.equal(convertHandler.getUnit('5mi'), 'mi');
    assert.equal(convertHandler.getUnit('5MI'), 'mi');
    assert.equal(convertHandler.getUnit('5km'), 'km');
    assert.equal(convertHandler.getUnit('5KM'), 'km');
  });

  // Test 8: convertHandler should correctly return an error for invalid unit input
  test('convertHandler should correctly return an error for invalid unit input.', function() {
    assert.equal(convertHandler.getUnit('5g'), 'invalid unit');
    assert.equal(convertHandler.getUnit('5invalid'), 'invalid unit');
  });

  // Test 9: convertHandler should return the correct return unit for each valid input unit
  test('convertHandler should return the correct return unit for each valid input unit.', function() {
    assert.equal(convertHandler.getReturnUnit('gal'), 'L');
    assert.equal(convertHandler.getReturnUnit('L'), 'gal');
    assert.equal(convertHandler.getReturnUnit('lbs'), 'kg');
    assert.equal(convertHandler.getReturnUnit('kg'), 'lbs');
    assert.equal(convertHandler.getReturnUnit('mi'), 'km');
    assert.equal(convertHandler.getReturnUnit('km'), 'mi');
  });

  // Test 10: convertHandler should correctly return the spelled-out string unit for each valid input unit
  test('convertHandler should correctly return the spelled-out string unit for each valid input unit.', function() {
    assert.equal(convertHandler.spellOutUnit('gal'), 'gallons');
    assert.equal(convertHandler.spellOutUnit('L'), 'liters');
    assert.equal(convertHandler.spellOutUnit('lbs'), 'pounds');
    assert.equal(convertHandler.spellOutUnit('kg'), 'kilograms');
    assert.equal(convertHandler.spellOutUnit('mi'), 'miles');
    assert.equal(convertHandler.spellOutUnit('km'), 'kilometers');
  });

  // Test 11: convertHandler should correctly convert gal to L
  test('convertHandler should correctly convert gal to L.', function() {
    assert.approximately(convertHandler.convert(1, 'gal'), 3.78541, 0.00001);
  });

  // Test 12: convertHandler should correctly convert L to gal
  test('convertHandler should correctly convert L to gal.', function() {
    assert.approximately(convertHandler.convert(1, 'L'), 0.26417, 0.00001);
  });

  // Test 13: convertHandler should correctly convert mi to km
  test('convertHandler should correctly convert mi to km.', function() {
    assert.approximately(convertHandler.convert(1, 'mi'), 1.60934, 0.00001);
  });

  // Test 14: convertHandler should correctly convert km to mi
  test('convertHandler should correctly convert km to mi.', function() {
    assert.approximately(convertHandler.convert(1, 'km'), 0.62137, 0.00001);
  });

  // Test 15: convertHandler should correctly convert lbs to kg
  test('convertHandler should correctly convert lbs to kg.', function() {
    assert.approximately(convertHandler.convert(1, 'lbs'), 0.45359, 0.00001);
  });

  // Test 16: convertHandler should correctly convert kg to lbs
  test('convertHandler should correctly convert kg to lbs.', function() {
    assert.approximately(convertHandler.convert(1, 'kg'), 2.20462, 0.00001);
  });
});