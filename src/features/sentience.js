const moodHistory = require('./mood_history');
const weatherFeature = require('./weather');
const memoryFeature = require('./memory');

let lastActionTime = 0;
const COOLDOWN = 30 * 60 * 1000; // 30 Minutes cooldown between autonomous ideas

async function startAutonomousLoop(speak, weatherKey) {
    console.log("🧠 Sentience Loop Started...");

    setInterval(async () => {
        const now = new Date();
        const hour = now.getHours();
        const timeSinceLast = Date.now() - lastActionTime;

        // PREVENT SPAM: Only speak if 30 mins passed since last autonomous thought
        if (timeSinceLast < COOLDOWN) return;

        // 1. SLEEP SUGGESTION (Real-World Awareness)
        if (hour >= 2 && hour < 5) {
            speak("Sir, it is very late. Research suggests coding efficiency drops after 2 AM. Perhaps some sleep?");
            lastActionTime = Date.now();
            return;
        }

        // 2. MORNING BRIEFING (Context Awareness)
        if (hour === 8) {
            // Check weather silently
            const wData = await weatherFeature.executeWeather(weatherKey, () => {}); 
            if (wData) {
                speak(`Good morning. Current temperature is ${wData.temp}. ${wData.desc}. Have a productive day.`);
                lastActionTime = Date.now();
                return;
            }
        }

        // 3. EMOTIONAL FOLLOW-UP (Long-Term Memory)
        const history = moodHistory.loadHistory(); // You might need to export 'loadHistory' from mood_history.js
        if (history.length > 0) {
            const lastEntry = history[history.length - 1];
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            // If user was stressed yesterday and we haven't asked yet
            if (lastEntry.date === yesterday.toISOString().split('T')[0] && 
               (lastEntry.mood === 'sad' || lastEntry.mood === 'angry')) {
                speak("Sir, I noted you were quite stressed yesterday. I hope today is going better?");
                lastActionTime = Date.now();
                return;
            }
        }

    }, 60000); // Check every 60 seconds
}

module.exports = { startAutonomousLoop };