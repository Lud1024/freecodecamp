// Debug script to test the specific failing cases
const ConvertHandler = require('./controllers/convertHandler.js');
const convertHandler = new ConvertHandler();

function testInput(input) {
  console.log(`\nTesting: "${input}"`);
  console.log('----------------');

  // Show parsing step by step
  let unitStart = input.length;
  for (let i = 0; i < input.length; i++) {
    if (/[a-zA-Z]/.test(input[i])) {
      unitStart = i;
      break;
    }
  }

  const numStr = input.substring(0, unitStart);
  const unit = input.substring(unitStart);

  console.log(`Number part: "${numStr}"`);
  console.log(`Unit part: "${unit}"`);

  const numResult = convertHandler.getNum(input);
  const unitResult = convertHandler.getUnit(input);

  console.log(`getNum result: ${numResult} (type: ${typeof numResult})`);
  console.log(`getUnit result: "${unitResult}" (type: ${typeof unitResult})`);

  // Test API logic exactly as in routes/api.js
  if (numResult === 'invalid number' && unitResult === 'invalid unit') {
    console.log('API result: invalid number and unit');
    return 'invalid number and unit';
  }
  if (numResult === 'invalid number') {
    console.log('API result: invalid number');
    return 'invalid number';
  }
  if (unitResult === 'invalid unit') {
    console.log('API result: invalid unit');
    return 'invalid unit';
  }
  console.log('API result: valid');
  return 'valid';
}

// Test the specific failing cases
console.log('Testing specific failing cases:');
console.log('==============================');

const result1 = testInput('32g');
const result2 = testInput('3/7.2/4kg');
const result3 = testInput('3/7.2/4kilomegagram');

console.log('\nSummary:');
console.log(`"32g": ${result1}`);
console.log(`"3/7.2/4kg": ${result2}`);
console.log(`"3/7.2/4kilomegagram": ${result3}`);

// Test additional edge cases
console.log('\nTesting additional edge cases:');
console.log('==============================');

testInput('abc');
testInput('123');
testInput('kg');
testInput('L');
testInput('l');
testInput('5.5.5kg');