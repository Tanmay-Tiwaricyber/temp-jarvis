const fs = require('fs');
const path = require('path');
const emotionFeature = require('./emotion');

const MOOD_FILE = path.join(process.cwd(), 'mood_history.json');

// LOAD/SAVE
function loadHistory() {
    if (!fs.existsSync(MOOD_FILE)) return [];
    return JSON.parse(fs.readFileSync(MOOD_FILE, 'utf8'));
}

function logMood(text) {
    const { mood, score } = emotionFeature.analyzeMood(text);
    const history = loadHistory();
    
    const entry = {
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        timestamp: new Date().toISOString(),
        mood: mood,
        score: score,
        trigger: text
    };

    history.push(entry);
    fs.writeFileSync(MOOD_FILE, JSON.stringify(history, null, 2));
    
    // Check for patterns
    const recent = history.slice(-5);
    const stressedCount = recent.filter(x => x.mood === 'sad' || x.mood === 'angry').length;
    
    if (stressedCount >= 3) {
        return "Warning: High stress levels detected over the last few interactions.";
    }
    return null;
}

function getMoodReport() {
    const history = loadHistory();
    if (history.length === 0) return "No mood data available yet.";
    
    const last = history[history.length - 1];
    return `Last recorded mood was ${last.mood}. You have ${history.length} mood entries recorded.`;
}


module.exports = { logMood, getMoodReport, loadHistory };