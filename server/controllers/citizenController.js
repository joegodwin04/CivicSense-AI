const fs = require('fs');
const axios = require('axios');
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
  const { description, category: manualCategory } = req.body;

  // Validate we have a description (or a voice file / image which contains visual description)
  const hasPhoto = req.files && req.files['photo'] && req.files['photo'][0];
  const hasAudio = req.files && req.files['audio'] && req.files['audio'][0];

  if (!description && !hasAudio && !hasPhoto) {
    throw new AppError('Please provide a description, image, or voice recording.', 400);
  }

  // Reject garbage/empty whitespace descriptions
  if (description && !description.trim()) {
    throw new AppError('Description cannot consist only of whitespace.', 400);
  }
  if (description && description.trim().length < 5 && !hasPhoto && !hasAudio) {
    throw new AppError('Description must be at least 5 characters long.', 400);
  }

  // Parse location or use Bangalore center defaults for testing
  const lat = parseFloat(req.body.latitude) || 12.9716;
  const lng = parseFloat(req.body.longitude) || 77.5946;
  const address = req.body.address || 'MG Road, Ward 4, Bengaluru';

  // Find critical infrastructure within 1km
  const nearbyInfra = infrastructureList
    .filter((infra) => getDistance(lat, lng, infra.lat, infra.lng) <= 1000)
    .map((infra) => `${infra.name} (${infra.type})`);

  let aiResult = {
    category: 'other',
    sentiment: 'neutral',
    urgencyScore: 1,
    priorityScore: 0,
    aiRecommendation: 'Pending AI Analysis due to service unavailability'
  };
  let inputMethod = 'text';
  let imageUrl = null;
  let audioTranscript = null;
  const language = req.body.language || 'auto';
  const textContext = language !== 'auto' ? `(Language: ${language}) ${description || ''}` : (description || 'Civic issue report');

  // 1. Process Multimodal Inputs
  if (hasPhoto) {
    inputMethod = 'image';
    const photoFile = req.files['photo'][0];

    // Validate image format
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedImageTypes.includes(photoFile.mimetype)) {
      try { fs.unlinkSync(photoFile.path); } catch (err) {}
      throw new AppError('Invalid image file format. Only JPEG, PNG, WEBP, and GIF are allowed.', 400);
    }

    imageUrl = `/uploads/${photoFile.filename}`;

    // Read photo as base64
    const photoBuffer = fs.readFileSync(photoFile.path);
    const photoBase64 = photoBuffer.toString('base64');
    const mimeType = photoFile.mimetype;

    // Run Gemini image analysis
    try {
      aiResult = await analyzeCitizenImage(
        photoBase64,
        mimeType,
        textContext,
        nearbyInfra,
        0
      );
    } catch (err) {
      console.error('Image AI analysis failed:', err.message);
    }
  } else if (hasAudio) {
    inputMethod = 'voice';
    const audioFile = req.files['audio'][0];

    // Validate audio format
    const allowedAudioTypes = [
      'audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp3', 
      'audio/ogg', 'audio/m4a', 'audio/x-m4a'
    ];
    if (!allowedAudioTypes.includes(audioFile.mimetype)) {
      try { fs.unlinkSync(audioFile.path); } catch (err) {}
      throw new AppError('Invalid audio file format. Only webm, wav, mp3, ogg, and m4a are allowed.', 400);
    }

    // Read audio as base64
    const audioBuffer = fs.readFileSync(audioFile.path);
    const audioBase64 = audioBuffer.toString('base64');
    const mimeType = audioFile.mimetype || 'audio/webm';

    // Transcribe audio using Gemini
    try {
      audioTranscript = await transcribeAudio(audioBase64, mimeType);
    } catch (err) {
      console.error('Audio transcription failed:', err.message);
    }

    // Analyze transcribed text
    try {
      aiResult = await analyzeCitizenRequest(
        audioTranscript || textContext,
        nearbyInfra,
        0
      );
    } catch (err) {
      console.error('Audio AI analysis failed:', err.message);
    }
  } else {
    // Text-only submission
    try {
      aiResult = await analyzeCitizenRequest(
        textContext,
        nearbyInfra,
        0
      );
    } catch (err) {
      console.error('Text AI analysis failed:', err.message);
    }
  }

  // Resolve final category BEFORE the duplicate check so the search is consistent
  // with what will actually be saved.  Manual > AI > default('other').
  const resolvedCategory = (manualCategory && manualCategory.trim() && manualCategory !== '')
    ? manualCategory.trim().toLowerCase()
    : (aiResult.category || 'other');

  // 2. Geospatial Duplicate/Cluster Check
  // Same category, within last 14 days, and within 150m
  const dateLimit = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const duplicate = await Request.findOne({
    category: resolvedCategory,
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
    try {
      const recomputeResult = await analyzeCitizenRequest(
        duplicate.description,
        duplicate.nearbyInfrastructure || [],
        duplicate.duplicateCount
      );

      duplicate.priorityScore = recomputeResult.priorityScore;
      duplicate.aiRecommendation = recomputeResult.aiRecommendation;
    } catch (err) {
      console.error('AI Recompute failed for duplicate:', err.message);
    }
    await duplicate.save();

    return res.status(200).json({
      success: true,
      message: `${duplicate.duplicateCount} other citizens reported this same issue nearby.`,
      isDuplicate: true,
      data: duplicate
    });
  }

  // 3. Save new Request
  const finalTitle = req.body.title || `${resolvedCategory.charAt(0).toUpperCase() + resolvedCategory.slice(1)} Issue`;

  let finalDescription = description;
  if (audioTranscript) finalDescription = audioTranscript;
  if (language !== 'auto' && finalDescription) {
    finalDescription = `(Language: ${language}) ${finalDescription}`;
  } else if (!finalDescription) {
    finalDescription = 'Civic issue report';
  }

  const newRequest = await Request.create({
    title: finalTitle,
    description: finalDescription,
    location: {
      type: 'Point',
      coordinates: [lng, lat],
      address: address
    },
    category: resolvedCategory,
    sentiment: aiResult.sentiment,
    urgencyScore: aiResult.urgencyScore,
    priorityScore: aiResult.priorityScore,
    aiRecommendation: aiResult.aiRecommendation,
    imageUrl: imageUrl,
    audioTranscript: audioTranscript,
    inputMethod: inputMethod,
    duplicateCount: 0,
    nearbyInfrastructure: nearbyInfra,
    status: 'pending',
    user: req.user ? req.user._id : null
  });

  res.status(201).json({
    success: true,
    message: 'Request submitted and analyzed successfully by AI.',
    isDuplicate: false,
    data: newRequest
  });
});

// @desc    Submit a new citizen request via WhatsApp (Twilio Webhook)
// @route   POST /api/citizen/whatsapp
// @access  Public
const handleWhatsAppWebhook = asyncHandler(async (req, res, next) => {
  const { From, Body, NumMedia, MediaUrl0, MediaContentType0 } = req.body;

  const senderNumber = From || 'whatsapp:anonymous';
  const messageBody = Body || '';
  const numMedia = parseInt(NumMedia) || 0;

  // Use Bangalore Central defaults for geocoding boundaries
  const lat = 12.9716;
  const lng = 77.5946;
  const address = 'WhatsApp Submission, Ward 4, Bengaluru';

  // Find critical infrastructure within 1km
  const nearbyInfra = infrastructureList
    .filter((infra) => getDistance(lat, lng, infra.lat, infra.lng) <= 1000)
    .map((infra) => `${infra.name} (${infra.type})`);

  let aiResult = {
    category: 'other',
    sentiment: 'neutral',
    urgencyScore: 1,
    priorityScore: 0,
    aiRecommendation: 'Pending AI Analysis due to service unavailability'
  };
  let inputMethod = 'whatsapp_text';
  let imageUrl = null;

  if (numMedia > 0 && MediaUrl0) {
    inputMethod = 'whatsapp_image';
    imageUrl = MediaUrl0;
    
    // Attempt to download image for multimodal classification
    try {
      const response = await axios.get(MediaUrl0, { responseType: 'arraybuffer' });
      const photoBase64 = Buffer.from(response.data, 'binary').toString('base64');
      const mimeType = MediaContentType0 || 'image/jpeg';
      
      aiResult = await analyzeCitizenImage(
        photoBase64,
        mimeType,
        messageBody || 'Civic issue report via WhatsApp',
        nearbyInfra,
        0
      );
    } catch (err) {
      console.error('Failed to parse Twilio media image with Gemini. Falling back to text-only analysis.');
      try {
        aiResult = await analyzeCitizenRequest(
          messageBody || 'Civic issue report with image attachment via WhatsApp',
          nearbyInfra,
          0
        );
      } catch (innerErr) {
        console.error('Text fallback for WhatsApp also failed:', innerErr.message);
      }
    }
  } else {
    try {
      aiResult = await analyzeCitizenRequest(
        messageBody || 'Civic issue report via WhatsApp',
        nearbyInfra,
        0
      );
    } catch (err) {
      console.error('Text AI analysis for WhatsApp failed:', err.message);
    }
  }

  // Duplicate Check (150m, 14 days, same category)
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
        $maxDistance: 150
      }
    }
  });

  if (duplicate) {
    duplicate.duplicateCount += 1;
    try {
      const recomputeResult = await analyzeCitizenRequest(
        duplicate.description,
        duplicate.nearbyInfrastructure || [],
        duplicate.duplicateCount
      );
      duplicate.priorityScore = recomputeResult.priorityScore;
      duplicate.aiRecommendation = recomputeResult.aiRecommendation;
    } catch (err) {
      console.error('AI Recompute failed for WhatsApp duplicate:', err.message);
    }
    await duplicate.save();
  } else {
    await Request.create({
      title: `WhatsApp: ${aiResult.category.charAt(0).toUpperCase() + aiResult.category.slice(1)}`,
      description: messageBody || 'Image report',
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
      inputMethod: inputMethod,
      duplicateCount: 0,
      nearbyInfrastructure: nearbyInfra,
      phone: senderNumber.replace('whatsapp:', ''),
      status: 'pending'
    });
  }

  // Respond with TwiML XML
  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>
*CivicSense AI Triage Success*
-----------------------------
Thank you for your report. 
- *Category*: ${aiResult.category.toUpperCase()}
- *Priority Score*: ${aiResult.priorityScore}/100
- *Status*: Pending Representative Review
- *Recommendation*: ${aiResult.aiRecommendation}
  </Message>
</Response>`);
});

// @desc    Get user's requests
// @route   GET /api/citizen/my-requests
// @access  Private
const getMyRequests = asyncHandler(async (req, res, next) => {
  const requests = await Request.find({ user: req.user._id }).sort('-createdAt');
  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});

// @desc    Get user's stats
// @route   GET /api/citizen/my-stats
// @access  Private
const getMyStats = asyncHandler(async (req, res, next) => {
  const stats = await Request.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  const defaultStats = { pending: 0, processing: 0, 'under-review': 0, resolved: 0, rejected: 0 };
  stats.forEach(stat => {
    if (defaultStats[stat._id] !== undefined) {
      defaultStats[stat._id] = stat.count;
    }
  });
  
  const total = Object.values(defaultStats).reduce((acc, curr) => acc + curr, 0);
  
  res.status(200).json({
    success: true,
    data: {
      ...defaultStats,
      total
    }
  });
});

module.exports = {
  submitRequest,
  handleWhatsAppWebhook,
  getDistance,
  getMyRequests,
  getMyStats
};
