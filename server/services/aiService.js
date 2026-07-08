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

/**
 * Generates detailed insights for an issue details view using Gemini.
 */
const generateDetailedInsights = async (title, description, category) => {
  try {
    const prompt = `
      You are an expert advisor for a civic grievance and public works department.
      Analyze the following reported issue in standard English:
      
      Title: "${title}"
      Description: "${description}"
      Category: "${category}"
      
      Perform the following tasks:
      1. Provide a detailed "impactEstimate" of this issue if left unresolved (e.g. traffic congestion, health risk, child safety). Max 2 sentences.
      2. Suggest 2-3 specific Indian government / civic schemes ("suggestedSchemes") that fund or address this type of problem (e.g. Jal Jeevan Mission, PMGSY, Swachh Bharat Mission, AMRUT, etc.).
      
      Return ONLY a valid JSON object with the following keys:
      {
        "impactEstimate": "String",
        "suggestedSchemes": ["Scheme A: Description", "Scheme B: Description"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    logger.error(`Failed to generate detailed insights: ${error.message}`);
    return {
      impactEstimate: 'Potential public safety risk and degradation of neighborhood usability.',
      suggestedSchemes: [`Civic Infrastructure Maintenance Fund (CIMF): Local municipal budget allocations`, `Municipal Ward Development Scheme: Local counselor development grants`]
    };
  }
};

/**
 * Generates constituency-level summaries and recommended action plans.
 */
const generateConstituencyInsights = async (constituency, metrics, topRequests) => {
  try {
    const prompt = `
      You are an expert civic analyst advising a Member of Parliament (MP) in India.
      Constituency: "${constituency}"
      
      Active Metrics:
      ${JSON.stringify(metrics)}
      
      Top Critical Grievances:
      ${JSON.stringify(topRequests.map(r => ({
        title: r.title,
        description: r.description,
        category: r.category,
        priorityScore: r.priorityScore,
        duplicates: r.duplicateCount,
        address: r.location?.address
      })))}
      
      Perform the following tasks:
      1. Write a brief 2-3 sentence executive "constituencySummary" addressing the current problem areas.
      2. Provide 3 specific, highly-actionable "recommendedActions" for the representative's office.
      3. Suggest 3 relevant Indian government/public funding schemes ("suggestedSchemes") with a brief 1-sentence note for each.
      4. Write a 1-sentence "heatAnalysis" identifying the category/geographic hotspots.
      
      Return ONLY a valid JSON object with the following keys:
      {
        "constituencySummary": "String",
        "recommendedActions": ["Action 1", "Action 2", "Action 3"],
        "suggestedSchemes": [
          { "name": "Scheme A Name", "description": "How it helps" },
          { "name": "Scheme B Name", "description": "How it helps" },
          { "name": "Scheme C Name", "description": "How it helps" }
        ],
        "heatAnalysis": "String"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    logger.error(`Failed to generate constituency insights: ${error.message}`);
    return {
      constituencySummary: `Development requests show significant focus on local infrastructure and municipal utilities inside ${constituency}.`,
      recommendedActions: [
        'Deploy engineering teams to investigate top-priority roads complaints.',
        'Review sanitation and waste collection frequency in high density spots.',
        'Initiate public health/drainage audits ahead of monsoon/heavy rains.'
      ],
      suggestedSchemes: [
        { name: 'Pradhan Mantri Gram Sadak Yojana (PMGSY)', description: 'Funding road development projects.' },
        { name: 'Swachh Bharat Mission (SBM)', description: 'Allocating grants for public sanitation facilities.' },
        { name: 'Jal Jeevan Mission', description: 'Providing functional household tap connections.' }
      ],
      heatAnalysis: 'A high density of infrastructure grievances is clustered near primary municipal roadways.'
    };
  }
};

module.exports = {
  analyzeCitizenRequest,
  analyzeCitizenImage,
  transcribeAudio,
  generateDetailedInsights,
  generateConstituencyInsights
};
