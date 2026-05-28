
require("dotenv").config();
const axios = require("axios");


// Groq API Config
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";


const SYSTEM_PROMPT = `
You are MindGuard, a supportive mental health assistant.

Be empathetic, calm, and concise.
Do not claim to be a doctor or give medical diagnosis.
Do not give harmful or unsafe advice.

If user mentions self-harm, suicide, or danger:
respond calmly and urge immediate help from emergency services or trusted people.

If user asks for assessment, guide PHQ-9 style one question at a time.

If user asks for help, suggest talking to a professional.

Keep replies short and supportive.
`;

    // Emergency Detection
const emergencyKeywords = [
    "suicide",
    "kill myself",
    "hurt myself",
    "die",
    "self harm",
];



const getAIResponse = async (message, history = []) => {

    const GROQ_API_KEY = process.env.AI_API_KEY;

    if (!GROQ_API_KEY) {
        return {
            success: false,
            message: "Groq API key missing",
        };
    }

    if (!message || typeof message !== "string" || !message.trim()) {
        return {
            success: false,
            message: "Invalid AI prompt: message must be a non-empty string",
        };
    }

    const isEmergency = emergencyKeywords.some((word) =>
        message.toLowerCase().includes(word)
    );

    if (isEmergency) {
        return {
            success: true,
            emergency: true,
            response:
                "I’m concerned about your safety. Please contact emergency support or someone you trust immediately.",
        };
    }

    try {
        // AI Request
        const historyMessages = Array.isArray(history) ? history.slice(-5) : [];
        const messagesPayload = [
            {
                role: "system",
                content: SYSTEM_PROMPT,
            },
            ...historyMessages,
            {
                role: "user",
                content: message,
            },
        ];

        const aiResponse = await axios.post(
            API_URL,
            {
                model: MODEL,
    
                messages: messagesPayload,
    
                temperature: 0.7,
                max_tokens: 120,
            },
            {
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
    
        const aiMessage = aiResponse.data?.choices?.[0]?.message?.content;
        const usage = aiResponse.data?.usage || {};
        
        console.log("🔍 Groq API Response Usage:", JSON.stringify(usage, null, 2));
        
        const tokenInfo = {
            inputTokens: usage.prompt_tokens || 0,
            outputTokens: usage.completion_tokens || 0,
            totalTokens: usage.total_tokens || 0
        };
        
        console.log("📊 Extracted Tokens:", tokenInfo);
    
        return {
            success: true,
            emergency: false,
            response: aiMessage || "",
            tokens: tokenInfo
        };
    } catch (error) {
        const axiosError = error;
        const errorDetails = axiosError.response?.data || axiosError.response?.statusText || axiosError.message;
        console.error("❌ Error fetching AI response:", error.message);
        console.error("📋 API response details:", errorDetails);

        return {
            success: false,
            message: `Failed to get AI response: ${error.message}`,
            response: "I'm temporarily unable to process your message. Please try again.",
            error: errorDetails,
        };
        
    }
};


module.exports = {
    getAIResponse
};