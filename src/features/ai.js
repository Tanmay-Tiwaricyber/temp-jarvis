const axios = require('axios');
const memoryFeature = require('./memory');
const emotionFeature = require('./emotion'); 
const learningFeature = require('./learning');
const conversationFeature = require('./conversation'); 

const AI_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "meta-llama/llama-3-8b-instruct:free",
    "google/gemini-2.0-flash-exp:free"
];

async function fetchAIResponse(prompt, apiKey, systemInstruction = null) {
    if (!apiKey) return "API Key missing.";
    
    // 1. ADD USER TO HISTORY (Context)
    conversationFeature.addMessage("user", prompt);

    let messages = [];

    // 2. BUILD SYSTEM PROMPT
    if (systemInstruction) {
        // Direct instruction overrides persona (e.g., used by Coding module)
        messages.push({ role: "system", content: systemInstruction });
    } 
    else {
        // --- DYNAMIC PERSONA GENERATION ---

        // A. GET LEARNING STYLE 
        // We still fetch this for tone (casual/professional), but we will override the language below
        const learnedStyle = learningFeature.getEvolutionaryPrompt();

        // B. ANALYZE MOOD (Emotion)
        const { mood, style } = emotionFeature.analyzeMood(prompt);

        // C. GET MEMORY CONTEXT (Facts)
        const memoryContext = memoryFeature.getMemoryContext();

        // D. BUILD THE ULTIMATE BRAIN PROMPT
        const finalSystemPrompt = `
        ${learnedStyle} 
        
        [CURRENT USER MOOD]: ${mood.toUpperCase()}
        [RESPONSE GUIDELINE]: ${style}
        
        [LONG TERM MEMORY]:
        ${memoryContext}
        
        Instructions:
        1. **LANGUAGE PROTOCOL:** Speak ONLY in English. Even if the user's past style suggests Hindi/Hinglish, you must ignore it and respond in clear, professional English.
        2. Use the [LONG TERM MEMORY] to answer context questions.
        3. Be precise, logical, and helpful like Iron Man's Jarvis.
        4. Maintain conversation context from the history provided.
        `;

        messages.push({ role: "system", content: finalSystemPrompt });
    }

    // 3. INJECT CONVERSATION HISTORY
    const history = conversationFeature.getHistory();
    messages = messages.concat(history);

    // 4. SEND REQUEST TO AI
    for (const modelID of AI_MODELS) {
        try {
            const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
                model: modelID, 
                messages: messages 
            }, { 
                headers: { "Authorization": `Bearer ${apiKey}` }, 
                timeout: 20000 
            });
            
            let txt = response.data.choices[0]?.message?.content || "";
            // Clean up "Thinking" tags from reasoning models
            txt = txt.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
            
            if (txt) {
                // 5. ADD AI RESPONSE TO HISTORY
                conversationFeature.addMessage("assistant", txt);
                return txt;
            }

        } catch (e) {
            console.warn(`⚠️ ${modelID} failed.`);
        }
    }
    return "I cannot reach the AI servers, sir.";
}

module.exports = { fetchAIResponse };