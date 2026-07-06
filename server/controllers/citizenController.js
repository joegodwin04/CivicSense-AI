const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');
const { AppError } = require('../middleware/errorMiddleware');
const Request = require('../models/Request');
const { analyzeCitizenRequest, analyzeCitizenImage, transcribeAudio } = require('../services/aiService');
const infrastructureList = require('../src/data/infrastructure.json');

// Haversine distance calculator
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

// @desc    Submit a new citizen request (text, voice, or image)
// @route   POST /api/citizen/submit (also mapped to /requests)
// @access  Public
const submitRequest = asyncHandler(async (req, res, next) => {
  const { description } = req.body;

  // Validate we have a description (or a voice file / image which contains visual description)
  const hasPhoto = req.files && req.files['photo'] && req.files['photo'][0];
  const hasAudio = req.files && req.files['audio'] && req.files['audio'][0];

  if (!description && !hasAudio && !hasPhoto) {
    throw new AppError('Please provide a description, image, or voice recording.', 400);
  }

  // Parse location or use Bangalore center defaults for testing
  const lat = parseFloat(req.body.latitude) || 12.9716;
  const lng = parseFloat(req.body.longitude) || 77.5946;
  const address = req.body.address || 'MG Road, Ward 4, Bengaluru';

  // Find critical infrastructure within 1km
  const nearbyInfra = infrastructureList
    .filter((infra) => getDistance(lat, lng, infra.lat, infra.lng) <= 1000)
    .map((infra) => `${infra.name} (${infra.type})`);

  let aiResult;
  let inputMethod = 'text';
  let imageUrl = null;
  let audioTranscript = null;

  // 1. Process Multimodal Inputs
  if (hasPhoto) {
    inputMethod = 'image';
    const photoFile = req.files['photo'][0];
    imageUrl = `/uploads/${photoFile.filename}`;

    // Read photo as base64
    const photoBuffer = fs.readFileSync(photoFile.path);
    const photoBase64 = photoBuffer.toString('base64');
    const mimeType = photoFile.mimetype;

    // Run Gemini image analysis
    aiResult = await analyzeCitizenImage(
      photoBase64,
      mimeType,
      description || 'Civic issue report',
      nearbyInfra,
      0
    );
  } else if (hasAudio) {
    inputMethod = 'voice';
    const audioFile = req.files['audio'][0];

    // Read audio as base64
    const audioBuffer = fs.readFileSync(audioFile.path);
    const audioBase64 = audioBuffer.toString('base64');
    const mimeType = audioFile.mimetype || 'audio/webm';

    // Transcribe audio using Gemini
    audioTranscript = await transcribeAudio(audioBase64, mimeType);

    // Analyze transcribed text
    aiResult = await analyzeCitizenRequest(
      audioTranscript,
      nearbyInfra,
      0
    );
  } else {
    // Text-only submission
    aiResult = await analyzeCitizenRequest(
      description,
      nearbyInfra,
      0
    );
  }

  // 2. Geospatial Duplicate/Cluster Check
  // Same category, within last 14 days, and within 150m
  const dateLimit = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const duplicate = await Request.findOne({
    category: aiResult.category,
    createdAt: { $gte: dateLimit },
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: 150 // 150 meters
      }
    }
  });

  if (duplicate) {
    // Increment duplicate count
    duplicate.duplicateCount += 1;

    // Recompute priority score using updated duplicateCount
    const recomputeResult = await analyzeCitizenRequest(
      duplicate.description,
      duplicate.nearbyInfrastructure || [],
      duplicate.duplicateCount
    );

    duplicate.priorityScore = recomputeResult.priorityScore;
    duplicate.aiRecommendation = recomputeResult.aiRecommendation;
    await duplicate.save();

    return res.status(200).json({
      success: true,
      message: `${duplicate.duplicateCount} other citizens reported this same issue nearby.`,
      isDuplicate: true,
      data: duplicate
    });
  }

  // 3. Save new Request
  const finalTitle = req.body.title || `${aiResult.category.charAt(0).toUpperCase() + aiResult.category.slice(1)} Issue`;

  const newRequest = await Request.create({
    title: finalTitle,
    description: description || audioTranscript || 'Civic issue report',
    location: {
      type: 'Point',
      coordinates: [lng, lat],
      address: address
    },
    category: aiResult.category,
    sentiment: aiResult.sentiment,
    urgencyScore: aiResult.urgencyScore,
    priorityScore: aiResult.priorityScore,
    aiRecommendation: aiResult.aiRecommendation,
    imageUrl: imageUrl,
    audioTranscript: audioTranscript,
    inputMethod: inputMethod,
    duplicateCount: 0,
    nearbyInfrastructure: nearbyInfra,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    message: 'Request submitted and analyzed successfully by AI.',
    isDuplicate: false,
    data: newRequest
  });
});

module.exports = {
  submitRequest
};
