const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const { getDistance } = require('../controllers/citizenController');
const Request = require('../models/Request');

test('Haversine Distance Calculation Logic', (t) => {
  // Distance from MG Road, Bangalore (12.9716, 77.5946) to Indiranagar, Bangalore (12.9719, 77.6412)
  // Expected distance is approximately ~5.07 km (5070 meters)
  const calculatedDistance = getDistance(12.9716, 77.5946, 12.9719, 77.6412);
  assert.ok(
    calculatedDistance > 4500 && calculatedDistance < 5500, 
    `Calculated distance was ${calculatedDistance}m, expected approximately ~5000m`
  );
  
  // Distance to the exact same coordinates should be zero
  const selfDistance = getDistance(12.9716, 77.5946, 12.9716, 77.5946);
  assert.strictEqual(Math.round(selfDistance), 0);
});

test('Mongoose Incident Schema Boundaries', (t) => {
  // Verify required fields (validation fails if title/description are missing)
  const emptyIncident = new Request({});
  const errorObj = emptyIncident.validateSync();
  assert.ok(errorObj, 'Schema validation should fail for empty request');
  assert.ok(errorObj.errors.title, 'Validation should fail on missing title');
  assert.ok(errorObj.errors.description, 'Validation should fail on missing description');

  // Verify inputMethod enum validation
  const invalidMethodIncident = new Request({
    title: 'Water clogging',
    description: 'Main pipeline leak',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716]
    },
    inputMethod: 'invalid_method_value'
  });
  
  const enumErrorObj = invalidMethodIncident.validateSync();
  assert.ok(enumErrorObj, 'Schema validation should fail on invalid enum values');
  assert.ok(enumErrorObj.errors.inputMethod, 'Validation should fail for non-enum inputMethod value');
});
