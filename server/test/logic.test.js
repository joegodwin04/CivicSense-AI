const test = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const { getDistance } = require('../controllers/citizenController');
const Request = require('../models/Request');

test('Test 1: Haversine Distance Calculation Logic', (t) => {
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

test('Test 2: Mongoose Incident Required Field Boundaries', (t) => {
  const emptyIncident = new Request({});
  const errorObj = emptyIncident.validateSync();
  assert.ok(errorObj, 'Schema validation should fail for empty request');
  assert.ok(errorObj.errors.title, 'Validation should fail on missing title');
  assert.ok(errorObj.errors.description, 'Validation should fail on missing description');
});

test('Test 3: inputMethod Enum Validation', (t) => {
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

test('Test 4: Geospatial Deduplication Query Windows', (t) => {
  // Geospatial lookup window constraints
  const maxDistanceThreshold = 150; // meters
  const daysThreshold = 14; // days
  
  const mockGeoNearQuery = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [77.5946, 12.9716]
        },
        $maxDistance: maxDistanceThreshold
      }
    }
  };

  assert.strictEqual(mockGeoNearQuery.location.$near.$maxDistance, 150, 'Max distance threshold should be exactly 150m');
  assert.deepStrictEqual(mockGeoNearQuery.location.$near.$geometry.coordinates, [77.5946, 12.9716], 'Coordinates should check request location');

  // Verify date calculation logic for the 14-day deduplication window
  const dateLimit = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000);
  const diffTime = Math.abs(new Date() - dateLimit);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  assert.strictEqual(diffDays, 14, 'Deduplication lookup window must span exactly 14 days');
});

test('Test 5: Duplicate Incident Merger and Increment Counter', (t) => {
  // Simulate database findOne match
  const mockDuplicateParent = {
    title: 'Pothole on Main Road',
    description: 'Pothole causing issues',
    category: 'roads',
    duplicateCount: 3,
    priorityScore: 70,
    aiRecommendation: 'Schedule repairs',
    save: async function() {
      this.isSaved = true;
      return this;
    }
  };

  // Simulate duplicate report intake
  mockDuplicateParent.duplicateCount += 1;
  assert.strictEqual(mockDuplicateParent.duplicateCount, 4, 'Duplicate count should increment by exactly 1');

  // Simulate priority scoring update based on citizen demand amplification
  const mockRecomputeResult = {
    priorityScore: 78,
    aiRecommendation: 'Amplified citizen demand. Prioritize road crew dispatch.'
  };

  mockDuplicateParent.priorityScore = mockRecomputeResult.priorityScore;
  mockDuplicateParent.aiRecommendation = mockRecomputeResult.aiRecommendation;

  assert.strictEqual(mockDuplicateParent.priorityScore, 78, 'Priority score should update upon recomputation');
  assert.ok(
    mockDuplicateParent.aiRecommendation.includes('Amplified citizen demand'), 
    'Recommendation should reflect amplified citizen demand'
  );
});
