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
 * @returns {Object} Structured JSON with AI insights.
 */
const analyzeCitizenRequest = async (rawText, nearbyInfrastructure = []) => {
  try {
    const prompt = `
      You are an expert AI assistant for a Member of Parliament's Decision Support System.
      Your job is to analyze a citizen's development request or complaint.
      
      Citizen Request: "${rawText}"
      Nearby Infrastructure Context: ${JSON.stringify(nearbyInfrastructure)}

      Perform the following tasks:
      1. Translate the request to standard English if it is in a local language.
      2. Determine the category (e.g., 'Roads', 'Water', 'Power', 'Healthcare', 'Education', 'Sanitation', 'Other').
      3. Analyze the sentiment ('positive', 'neutral', 'negative', 'angry').
      4. Assign an urgency score from 1 to 10 based on the request's tone and potential danger/impact.
      5. Calculate a Priority Score (1-100) combining the urgency and the proximity to critical infrastructure (e.g., if a pothole is near a school, it's higher priority).
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

module.exports = {
  analyzeCitizenRequest
};
