function ConvertHandler() {

  const conversionRates = {
    galToL: 3.78541,
    lbsToKg: 0.453592,
    miToKm: 1.60934
  };

  this.getNum = function(input) {
    let unitStart = input.length;
    for (let i = 0; i < input.length; i++) {
      if (/[a-zA-Z]/.test(input[i])) {
        unitStart = i;
        break;
      }
    }

    const numStr = input.substring(0, unitStart);

    // If no number part, it's valid (defaults to 1)
    if (!numStr) {
      return 1;
    }

    // Check if numStr contains only valid characters
    if (!/^[0-9.\/]+$/.test(numStr)) {
      return 'invalid number';
    }

    if (numStr.includes('/')) {
      const parts = numStr.split('/');
      if (parts.length === 2) {
        const numerator = parseFloat(parts[0]);
        const denominator = parseFloat(parts[1]);
        if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
          return numerator / denominator;
        }
      }
      if (parts.length > 2) return 'invalid number';
      return 'invalid number'; // Invalid fraction format
    }

    const num = parseFloat(numStr);
    if (isNaN(num)) return 'invalid number';

    // Additional check: ensure the parsed number matches the original string
    // This catches cases like "5.5.5" which parseFloat converts to 5.5
    if (numStr.includes('.') && numStr.split('.').length > 2) {
      return 'invalid number';
    }

    return num;
  };

  this.getUnit = function(input) {
    let unitStart = input.length;
    for (let i = 0; i < input.length; i++) {
      if (/[a-zA-Z]/.test(input[i])) {
        unitStart = i;
        break;
      }
    }

    const unit = input.substring(unitStart);

    // If no unit part, it's invalid
    if (!unit) {
      return 'invalid unit';
    }

    // Check if unit contains only letters
    if (!/^[a-zA-Z]+$/.test(unit)) {
      return 'invalid unit';
    }

    const unitLower = unit.toLowerCase();
    const validUnits = ['gal', 'l', 'lbs', 'kg', 'mi', 'km'];

    if (validUnits.includes(unitLower)) {
      // Special case: liter should be returned as uppercase 'L'
      return unitLower === 'l' ? 'L' : unitLower;
    }

    return 'invalid unit';
  };

  this.getReturnUnit = function(initUnit) {
    // Only process valid units
    const validUnits = ['gal', 'L', 'l', 'lbs', 'kg', 'mi', 'km'];
    if (!validUnits.includes(initUnit)) {
      return 'invalid unit';
    }

    const unitMap = {
      'gal': 'L',    // galones se convierte a litros (uppercase L)
      'L': 'gal',    // litros se convierte a galones
      'l': 'gal',    // litros se convierte a galones
      'lbs': 'kg',   // libras se convierte a kilogramos
      'kg': 'lbs',   // kilogramos se convierte a libras
      'mi': 'km',    // millas se convierte a kilómetros
      'km': 'mi'     // kilómetros se convierte a millas
    };

    return unitMap[initUnit];
  };

  this.spellOutUnit = function(unit) {
    const unitLower = unit.toLowerCase();
    const unitNames = {
      'gal': 'gallons',
      'l': 'liters',
      'lbs': 'pounds',
      'kg': 'kilograms',
      'mi': 'miles',
      'km': 'kilometers'
    };
    return unitNames[unitLower] || 'invalid unit';
  };

  this.convert = function(initNum, initUnit) {
    // Validate inputs
    if (typeof initNum !== 'number' || isNaN(initNum)) {
      return 'invalid number';
    }

    if (typeof initUnit !== 'string') {
      return 'invalid unit';
    }

    // Caso especial para 'L' (litro)
    if (initUnit === 'L') {
      return parseFloat((initNum / conversionRates.galToL).toFixed(5));
    }

    const unit = initUnit.toLowerCase(); // Convertimos a minúsculas
    let result;

    switch(unit) {
      case 'gal':
        result = initNum * conversionRates.galToL;
        break;
      case 'l':
        result = initNum / conversionRates.galToL;
        break;
      case 'lbs':
        result = initNum * conversionRates.lbsToKg;
        break;
      case 'kg':
        result = initNum / conversionRates.lbsToKg;
        break;
      case 'mi':
        result = initNum * conversionRates.miToKm;
        break;
      case 'km':
        result = initNum / conversionRates.miToKm;
        break;
      default:
        return 'invalid unit';
    }

    return parseFloat(result.toFixed(5)); // Retorna con 5 decimales
  };

  this.getString = function(initNum, initUnit, returnNum, returnUnit) {
    const initUnitString = this.spellOutUnit(initUnit);
    const returnUnitString = this.spellOutUnit(returnUnit);

    return `${initNum} ${initUnitString} converts to ${returnNum} ${returnUnitString}`;
  };

}

module.exports = ConvertHandler;
