const { exec } = require('child_process');
const { keyboard, Key, mouse, Button } = require('@nut-tree-fork/nut-js');

// 1. COMPLEX SEARCH (Open X and Search Y) - [UNCHANGED]
async function executeCompoundCommand(command, speak) {
    speak("Initiating browser automation protocol.");
    
    const parts = command.split(" and ");
    const actionPart = parts[0].toLowerCase(); 
    const queryPart = parts[1]; 

    let url = "";
    let waitTime = 3000;

    if (actionPart.includes("chatgpt")) {
        url = "https://chatgpt.com";
        waitTime = 6000; 
    } else if (actionPart.includes("youtube")) {
        url = "https://youtube.com";
        waitTime = 4000;
    } else if (actionPart.includes("google")) {
        url = "https://google.com";
        waitTime = 2000;
    } else {
        const site = actionPart.replace("open ", "").trim();
        url = `https://${site}.com`;
    }

    speak(`Accessing ${url}...`);
    exec(`start chrome "${url}"`);

    await new Promise(r => setTimeout(r, waitTime));

    let query = queryPart
        .replace("ask ", "")
        .replace("search for ", "")
        .replace("write ", "")
        .replace("type ", "")
        .trim();

    speak(`Typing: ${query}`);

    await new Promise(r => setTimeout(r, 500)); 
    await keyboard.type(query);
    await new Promise(r => setTimeout(r, 500));
    await keyboard.pressKey(Key.Enter);
    await keyboard.releaseKey(Key.Enter);
}

// 2. YOUTUBE MUSIC PLAYER (UPGRADED SMART CLEANING)
async function playOnYouTube(command, speak) {
    let song = command.toLowerCase();

    // A. Define Filler Words (English & Hinglish)
    // These are words we want to ignore so we can find the actual song name
    const removeWords = [
        "play", "bajao", "sunao", "jarvis", "on youtube", 
        "song", "gaana", "music", "kuch", "mast", "yaar", 
        "kar", "please", "bhai", "idhar"
    ];

    // B. Clean the String
    // We use Regex to remove whole words only (\bword\b) so we don't break song titles
    removeWords.forEach(word => {
        song = song.replace(new RegExp(`\\b${word}\\b`, 'gi'), "");
    });

    // Remove extra spaces left behind
    song = song.replace(/\s+/g, " ").trim();

    // C. Fallback for Generic Requests
    // If the user said "Play kuch mast music" -> Result is empty string -> Play Trending
    if (song.length === 0) {
        song = "Trending Hindi Songs"; 
        speak("Playing some trending music for you.");
    } else {
        speak(`Playing ${song} on YouTube.`);
    }

    // STRATEGY A: Direct Search
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`;
    exec(`start chrome "${searchUrl}"`);

    // Wait for load
    await new Promise(r => setTimeout(r, 5000));

    console.log("Attempting to click first video...");

    // STRATEGY B: MOUSE CLICK
    try {
        // Move mouse to approximate location of first video thumbnail
        // Adjust these coordinates if your screen is different (Current: 1920x1080)
        // X: 640 (Left-ish), Y: 350 (Top-ish) matches standard YouTube list view
        await mouse.setPosition({ x: 640, y: 350 }); 
        
        await new Promise(r => setTimeout(r, 500));
        await mouse.click(Button.LEFT);
        
        // Double check click
        await new Promise(r => setTimeout(r, 200));
        await mouse.click(Button.LEFT);
        
    } catch (e) {
        console.error("Mouse click failed:", e);
        speak("I could not auto-click the video, sir.");
    }
}

module.exports = { executeCompoundCommand, playOnYouTube };