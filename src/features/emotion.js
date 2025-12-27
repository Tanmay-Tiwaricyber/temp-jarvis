const Sentiment = require('sentiment');
const sentiment = new Sentiment();

function analyzeMood(text) {
    const result = sentiment.analyze(text);
    const score = result.score; // Positive number = Happy, Negative = Sad/Angry

    let mood = "neutral";
    let style = "Concise and professional.";

    if (score >= 3) {
        mood = "happy";
        style = "Energetic, enthusiastic, and celebratory.";
    } else if (score <= -3) {
        mood = "angry";
        style = "Apologetic, calm, and submissive. Do not argue.";
    } else if (score < 0) {
        mood = "sad";
        style = "Empathetic, supportive, and gentle. Ask if the user needs a break.";
    }

    console.log(`❤️ Detected Mood: ${mood} (Score: ${score})`);
    return { mood, style };
}

module.exports = { analyzeMood };