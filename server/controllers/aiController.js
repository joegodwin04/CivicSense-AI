const { GoogleGenAI } = require('@google/genai');
const Request = require('../models/Request');
const asyncHandler = require('express-async-handler');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const handleChat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  // Get active issues counts to provide local context to the chatbot
  const total = await Request.countDocuments({ isDuplicate: { $ne: true } });
  const pending = await Request.countDocuments({ status: 'pending', isDuplicate: { $ne: true } });
  const resolved = await Request.countDocuments({ status: 'resolved', isDuplicate: { $ne: true } });
  
  const categoryCounts = await Request.aggregate([
    { $match: { isDuplicate: { $ne: true } } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const context = {
    totalReports: total,
    pendingReports: pending,
    resolvedReports: resolved,
    categories: categoryCounts.map(c => `${c._id}: ${c.count}`).join(', ')
  };

  const prompt = `
    You are the CivicSense AI Chatbot, a friendly, professional AI assistant for a local Member of Parliament's Office in India.
    Your goal is to assist citizens with filing grievances, checking their status, or understanding what the constituency is doing.
    
    Constituency Context:
    - Total reports in queue: ${context.totalReports}
    - Pending representative review: ${context.pendingReports}
    - Successfully resolved issues: ${context.resolvedReports}
    - Categories distribution: ${context.categories}
    
    User Query: "${message}"
    
    Answer the user politely, concisely, and with accurate guidelines. Keep it friendly and Indian context-specific.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7
      }
    });

    res.status(200).json({
      success: true,
      reply: response.text.trim()
    });
  } catch (error) {
    console.error('Chat AI Error:', error.message);
    res.status(500).json({
      success: false,
      reply: "I'm sorry, I'm experiencing connectivity issues to my neural network right now. Please try again in a few moments."
    });
  }
});

module.exports = {
  handleChat
};
