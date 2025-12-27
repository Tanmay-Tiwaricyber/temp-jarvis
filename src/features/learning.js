const fs = require('fs');
const path = require('path');

// DATA FILES
const STYLE_FILE = path.join(process.cwd(), 'user_style.json');
const MISTAKES_FILE = path.join(process.cwd(), 'learned_mistakes.json');

// Default Profile (RESET TO ENGLISH)
let userProfile = {
    interactionCount: 0,
    slangScore: 0,     
    languagePref: "English" // Forced English
};

let mistakes = [];

// 1. LOAD DATA
function loadProfile() {
    if (fs.existsSync(STYLE_FILE)) {
        userProfile = JSON.parse(fs.readFileSync(STYLE_FILE, 'utf8'));
    }
    // FORCE RESET LANGUAGE TO ENGLISH EVERY TIME
    userProfile.languagePref = "English"; 
    
    if (fs.existsSync(MISTAKES_FILE)) {
        mistakes = JSON.parse(fs.readFileSync(MISTAKES_FILE, 'utf8'));
    }
    return userProfile;
}

// 2. LEARN FROM INPUT
function learnFromInput(command) {
    let profile = loadProfile();
    profile.interactionCount++;

    const lowerCmd = command.toLowerCase();

    // A. MISTAKE CORRECTION
    if (lowerCmd.includes("that was wrong") || lowerCmd.includes("incorrect")) {
        mistakes.push({ timestamp: new Date().toISOString(), correction: "User flagged error." });
        fs.writeFileSync(MISTAKES_FILE, JSON.stringify(mistakes, null, 2));
        return "CORRECTION_LOGGED";
    }

    // B. STYLE LEARNING (Only Slang, NO HINDI)
    if (profile.slangScore > 50) profile.slangScore = 50;
    if (profile.slangScore < -50) profile.slangScore = -50;

    // Save
    fs.writeFileSync(STYLE_FILE, JSON.stringify(profile, null, 2));
    return "OK";
}

// 3. GET PROMPT (STRICT ENGLISH)
function getEvolutionaryPrompt() {
    let profile = loadProfile();
    
    // Strict English Persona
    let persona = "You are J.A.R.V.I.S. You speak in clear, professional English. Be helpful, concise, and intelligent.";

    if (profile.slangScore > 10) {
        persona += " You can be slightly casual.";
    }

    let finalPrompt = `[SYSTEM PERSONA]: ${persona}\n`;

    if (mistakes.length > 0) {
        finalPrompt += `[WARNING]: Avoid past mistakes. \n`;
    }

    return finalPrompt;
}

module.exports = { learnFromInput, getEvolutionaryPrompt };