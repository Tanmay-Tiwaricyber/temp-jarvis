const axios = require('axios');
const assistantFeature = require('./assistant'); // Access schedule

async function analyzeDecision(query, apiKey) {
    // 1. GET USER CONTEXT (Schedule/Tasks)
    // We mock reading the assistant data to help make decisions
    // In real usage, you'd read assistant_data.json here
    
    const prompt = `
    ACT AS A DECISION ENGINE.
    User Query: "${query}"
    
    Task: Analyze options, pros/cons, and give a recommendation based on logic.
    If the user asks for a simulation ("What if?"), predict the outcome.
    
    Format:
    1. Analysis
    2. Options
    3. Recommendation (The Best Choice)
    `;

    // Simple AI call specifically for Logic
    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "meta-llama/llama-3.3-70b-instruct:free", // Good for logic
            messages: [{ role: "user", content: prompt }]
        }, { headers: { "Authorization": `Bearer ${apiKey}` } });

        return response.data.choices[0]?.message?.content;
    } catch (e) {
        return "I cannot calculate the probabilities right now.";
    }
}

module.exports = { analyzeDecision };