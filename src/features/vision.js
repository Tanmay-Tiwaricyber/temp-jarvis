const screenshot = require('screenshot-desktop');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function analyzeScreen(prompt, apiKey, speak) {
    speak("Scanning visual interface...");
    
    try {
        // 1. TAKE SCREENSHOT
        const imgPath = path.join(process.cwd(), 'vision_capture.jpg');
        await screenshot({ filename: imgPath, format: 'jpg' });

        // 2. CONVERT TO BASE64
        const bitmap = fs.readFileSync(imgPath);
        const base64Image = Buffer.from(bitmap).toString('base64');

        // 3. SEND TO VISION MODEL (Using Gemini-2-Flash or Llama Vision)
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "google/gemini-2.0-flash-exp:free", // Supports Vision
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: `Analyze this screen. ${prompt}` },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                    ]
                }
            ]
        }, {
            headers: { "Authorization": `Bearer ${apiKey}` }
        });

        const analysis = response.data.choices[0]?.message?.content || "I cannot see the screen clearly.";
        return analysis;

    } catch (e) {
        console.error("Vision Error:", e);
        return "Visual sensors malfunctioned.";
    }
}

module.exports = { analyzeScreen };