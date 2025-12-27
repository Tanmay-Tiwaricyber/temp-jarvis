const { exec } = require('child_process');
const { keyboard, Key, mouse, Button } = require('@nut-tree-fork/nut-js');

async function spotifyHandler(command, speak) {
    const lower = command.toLowerCase();

    // SCENARIO 1: "Search [Song] and Play"
    if (lower.includes("search") && (lower.includes("play") || lower.includes("song"))) {
        // Extract Song Name
        // Remove "open spotify", "and", "search", "play", "it", "song"
        let song = lower
            .replace("open spotify", "")
            .replace("web", "")
            .replace("and", "")
            .replace("search", "")
            .replace("for", "")
            .replace("play", "")
            .replace("it", "")
            .replace("song", "")
            .trim();

        speak(`Searching for ${song} on Spotify.`);

        // 1. Open Search URL directly
        const url = `https://open.spotify.com/search/${encodeURIComponent(song)}`;
        exec(`start chrome "${url}"`);

        // 2. Wait for Load (Spotify is heavy)
        await new Promise(r => setTimeout(r, 6000));

        // 3. Click "Top Result" Play Button
        // On 1920x1080, Top Result Green Play Button is usually around: X=850, Y=350
        // We will try a "Best Guess" click + "Enter" key hack
        console.log("Attempting to play top result...");
        
        try {
            // Move to center-ish area where "Top Result" usually is
            await mouse.setPosition({ x: 850, y: 350 });
            await new Promise(r => setTimeout(r, 500));
            await mouse.click(Button.LEFT);
            
            // Backup: Press 'Enter' just in case focus is right
            await new Promise(r => setTimeout(r, 500));
            await keyboard.pressKey(Key.Enter);
            await keyboard.releaseKey(Key.Enter);

        } catch (e) {
            console.error(e);
            speak("I opened the search, but couldn't auto-click play.");
        }
    }

    // SCENARIO 2: "Play Recent" or "Resume"
    else if (lower.includes("recent") || lower.includes("resume") || (lower.includes("open") && lower.includes("play"))) {
        speak("Opening Spotify Web Player.");
        
        exec(`start chrome "https://open.spotify.com"`);
        
        // Wait for load
        await new Promise(r => setTimeout(r, 7000));

        // Press 'Space' to resume last song (works if Spotify Web was used recently)
        speak("Resuming playback.");
        await keyboard.pressKey(Key.Space);
        await keyboard.releaseKey(Key.Space);
    }
}

module.exports = { spotifyHandler };