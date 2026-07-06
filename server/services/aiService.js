const { GoogleGenAI } = require('@google/genai');
const logger = require('../utils/logger');

// Initialize Gemini Client
// Requires GEMINI_API_KEY in .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Analyzes a citizen request using Gemini to extract structured metadata, 
 * translate content, and assign an initial urgency score.
 * 
 * @param {string} rawText - The raw text (or transcribed voice) submitted by the citizen.
 * @param {Array} nearbyInfrastructure - Array of nearby schools, hospitals, etc. (Context)
 * @param {number} duplicateCount - Number of duplicate reports for this issue.
 * @returns {Object} Structured JSON with AI insights.
 */
const analyzeCitizenRequest = async (rawText, nearbyInfrastructure = [], duplicateCount = 0) => {
  try {
    const prompt = `
      You are an expert AI assistant for a Member of Parliament's Decision Support System.
      Your job is to analyze a citizen's development request or complaint.
      
      Citizen Request: "${rawText}"
      Nearby Infrastructure Context: ${JSON.stringify(nearbyInfrastructure)}
      Duplicate Reports Count (number of other citizens reporting this nearby): ${duplicateCount}

      Perform the following tasks:
      1. Translate the request to standard English if it is in a local language.
      2. Determine the category (must be one of: 'roads', 'water', 'health', 'education', 'electricity', 'sanitation', 'other').
      3. Analyze the sentiment ('positive', 'neutral', 'negative', 'angry').
      4. Assign an urgency score from 1 to 10 based on the request's tone and potential danger/impact.
      5. Calculate a Priority Score (1-100) combining the urgency, proximity to critical infrastructure (higher weight if near schools or hospitals), and duplicate count (more duplicates should increase the priority score).
      6. Provide a 1-sentence recommendation/justification for the Priority Score.

      Return ONLY a valid JSON object with the following keys:
      {
        "translatedText": "String",
        "category": "String",
        "sentiment": "String",
        "urgencyScore": Number,
        "priorityScore": Number,
        "aiRecommendation": "String"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temperature for consistent, analytical responses
      }
    });

    const result = JSON.parse(response.text);
    logger.info(`AI Analysis complete for request category: ${result.category}`);

    return result;
  } catch (error) {
    logger.error(`Gemini API Error: ${error.message}`);
    throw new Error('Failed to analyze request via AI');
  }
};

/**
 * Analyzes an uploaded image using Gemini multimodal capabilities.
 * 
 * @param {string} imageBase64 - Base64 encoded image data.
 * @param {string} mimeType - The mime type of the image (e.g. image/jpeg, image/png).
 * @param {string} description - The citizen's optional text description of the image.
 * @param {Array} nearbyInfrastructure - Array of nearby critical infrastructure.
 * @param {number} duplicateCount - Number of duplicate reports for this issue.
 * @returns {Object} Structured JSON with AI insights.
 */
const analyzeCitizenImage = async (imageBase64, mimeType, description = '', nearbyInfrastructure = [], duplicateCount = 0) => {
  try {
    const prompt = `
      You are an expert AI assistant for a Member of Parliament's Decision Support System.
      Your job is to analyze a citizen's uploaded image reporting a civic issue.
      
      Citizen Description: "${description}"
      Nearby Infrastructure Context: ${JSON.stringify(nearbyInfrastructure)}
      Duplicate Reports Count (number of other citizens reporting this nearby): ${duplicateCount}

      Perform the following tasks:
      1. Analyze the image to detect the civic issue, its category, and severity cues.
      2. Translate the description to standard English if it is in a local language.
      3. Determine the category (must be one of: 'roads', 'water', 'health', 'education', 'electricity', 'sanitation', 'other').
      4. Analyze the sentiment/severity cues ('positive', 'neutral', 'negative', 'angry').
      5. Assign an urgency score from 1 to 10 based on the visual severity (e.g., deep potholes, high danger) and description.
      6. Calculate a Priority Score (1-100) combining the visual urgency, proximity to critical infrastructure, and duplicate count (more duplicates should increase the priority score).
      7. Provide a 1-sentence recommendation/justification for the Priority Score.

      Return ONLY a valid JSON object with the following keys:
      {
        "translatedText": "String",
        "category": "String",
        "sentiment": "String",
        "urgencyScore": Number,
        "priorityScore": Number,
        "aiRecommendation": "String"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        },
        prompt
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const result = JSON.parse(response.text);
    logger.info(`AI Image Analysis complete for category: ${result.category}`);
    return result;
  } catch (error) {
    logger.error(`Gemini API Image Analysis Error: ${error.message}`);
    throw new Error('Failed to analyze image via AI');
  }
};

/**
 * Transcribes audio content using Gemini.
 * 
 * @param {string} audioBase64 - Base64 encoded audio data.
 * @param {string} mimeType - The mime type of the audio file.
 * @returns {string} Transcribed text.
 */
const transcribeAudio = async (audioBase64, mimeType) => {
  try {
    const prompt = `
      You are a translation and transcription assistant for a Member of Parliament's office.
      Transcribe the following audio recording of a citizen submitting a civic issue.
      If the audio is in a local language (e.g. Hindi, Kannada, Telugu, etc.), transcribe and translate it into standard English text.
      Return ONLY the plain transcribed/translated text. Do not add any greeting, preamble, explanations, notes, or metadata.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: audioBase64,
            mimeType: mimeType
          }
        },
        prompt
      ]
    });

    const transcription = response.text.trim();
    logger.info('Audio transcription complete');
    return transcription;
  } catch (error) {
    logger.error(`Audio transcription failed: ${error.message}`);
    throw new Error('Failed to transcribe audio via AI');
  }
};

module.exports = {
  analyzeCitizenRequest,
  analyzeCitizenImage,
  transcribeAudio
};
