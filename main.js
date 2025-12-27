require('dotenv').config();
const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const osUtils = require('os-utils');

// --- IMPORT FEATURES ---
const aiFeature = require('./src/features/ai');
const browserFeature = require('./src/features/browser');
const systemFeature = require('./src/features/system'); 
const weatherFeature = require('./src/features/weather');
const memoryFeature = require('./src/features/memory');
const desktopFeature = require('./src/features/desktop');
const codingFeature = require('./src/features/coding');
const emailFeature = require('./src/features/email');       
const schedulerFeature = require('./src/features/scheduler'); 
const learningFeature = require('./src/features/learning'); 
const assistantFeature = require('./src/features/assistant');
const moodHistoryFeature = require('./src/features/mood_history');
const visionFeature = require('./src/features/vision');
const strategistFeature = require('./src/features/strategist');
const spotifyFeature = require('./src/features/spotify');
const sentienceFeature = require('./src/features/sentience'); 
const chessFeature = require('./src/features/chess'); 

// KEYS
const AI_KEY = process.env.OPENROUTER_API_KEY;
const WEATHER_KEY = process.env.OPENWEATHER_API_KEY;

let mainWindow;

// --- STATE MANAGEMENT ---
let emailState = { active: false, step: 0, to: "", subject: "", body: "" };

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400, height: 900, backgroundColor: '#000',
        webPreferences: { nodeIntegration: true, contextIsolation: false }
    });
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
    
    // === SENTIENCE ENGINE ACTIVATION ===
    setTimeout(() => {
        sentienceFeature.startAutonomousLoop(speak, WEATHER_KEY);
    }, 5000); 
});

// --- MAIN COMMAND CENTER ---
ipcMain.on('run-command', async (event, command) => {
    const lowerCmd = command.toLowerCase();
    console.log("🎤 Cmd:", lowerCmd);

    // ==================================================
    // 0. SENTIENT EVOLUTION (ALWAYS ACTIVE)
    // ==================================================
    
    // Learning & Mistake Correction
    const learnStatus = learningFeature.learnFromInput(command);
    if (learnStatus === "CORRECTION_LOGGED") {
        speak("Apologies, sir. I have logged that error and will learn from it.");
        return;
    }

    // Mood Tracking
    const stressAlert = moodHistoryFeature.logMood(command);
    if (stressAlert) speak(stressAlert);

    // ==================================================
    // 1. VISION & STRATEGY
    // ==================================================

    // Vision
    if (lowerCmd.includes("analyze screen") || lowerCmd.includes("what is on my screen") || lowerCmd.includes("read screen")) {
        const analysis = await visionFeature.analyzeScreen(command, AI_KEY, speak);
        speak(analysis);
        event.sender.send('ai-response', analysis);
        return; 
    }

    // Decision Engine
    else if (lowerCmd.includes("what should i do") || lowerCmd.includes("decide for me") || lowerCmd.includes("simulate")) {
        speak("Running strategic analysis...");
        const advice = await strategistFeature.analyzeDecision(command, AI_KEY);
        speak(advice);
        event.sender.send('ai-response', advice);
        return;
    }

    // ==================================================
    // 2. CHESS ENGINE (MARK XXI)
    // ==================================================
    else if (lowerCmd.includes("play chess") || lowerCmd.includes("start chess")) {
        chessFeature.startGame(speak, (fen) => {
            event.sender.send('update-chess', fen);
        });
        return;
    }
    else if (lowerCmd.includes("stop chess") || lowerCmd.includes("quit chess")) {
        chessFeature.stopGame(speak, (fen) => {
            event.sender.send('update-chess', fen);
        });
        return;
    }
    else if (chessFeature.isGameActive()) {
        if (lowerCmd.includes("move") || lowerCmd.length < 15) {
            chessFeature.handleMove(command, speak, (fen) => {
                event.sender.send('update-chess', fen);
            });
            return; 
        }
    }

    // ==================================================
    // 3. CONVERSATION INTERCEPTS (EMAIL)
    // ==================================================
    else if (emailState.active) {
        if (lowerCmd.includes("cancel") || lowerCmd.includes("stop")) {
            emailState = { active: false, step: 0, to: "", subject: "", body: "" };
            speak("Email protocol cancelled.");
            return;
        }
        if (emailState.step === 1) {
            emailState.subject = command;
            emailState.step = 2;
            speak("Subject saved. What is the message?");
            return;
        } 
        else if (emailState.step === 2) {
            emailState.body = command;
            emailState.active = false;
            emailState.step = 0;
            speak(`Sending email to ${emailState.to}.`);
            await emailFeature.sendEmail(emailState.to, emailState.subject, emailState.body, speak);
            return;
        }
    }

    // ==================================================
    // 4. NOTEPAD AI WRITER (Intercepts Browser)
    // ==================================================
    else if (lowerCmd.includes("open notepad") && (lowerCmd.includes("write") || lowerCmd.includes("type"))) {
        
        let topic = command.replace(/jarvis|open|notepad|and|write|type|about/gi, "").trim();
        if (!topic) { speak("Write about what?"); return; }

        speak(`Opening Notepad and generating content on ${topic}...`);
        
        // 1. Launch Notepad
        systemFeature.openApp("notepad", (res) => {}); 

        // 2. Generate Content
        const generatedText = await aiFeature.fetchAIResponse(
            `Write a informative summary about "${topic}". No Markdown formatting.`, 
            AI_KEY
        );

        // 3. Wait & Type
        setTimeout(async () => {
            if (generatedText) await desktopFeature.typeText(generatedText, speak);
        }, 2500); 
        return; 
    }

    // ==================================================
    // 5. VS CODE CODING ARCHITECT (UPGRADED)
    // ==================================================
    // "Jarvis open VS Code and write a python script for..."
    // This now links directly to the robust file-system coding feature
    else if (lowerCmd.includes("open vs code") && (lowerCmd.includes("write") || lowerCmd.includes("code"))) {
        console.log("👨‍💻 Architect Protocol Triggered via VS Code command");
        await codingFeature.handleCodeGeneration(command, speak, AI_KEY);
        return;
    }

    // ==================================================
    // 6. PERSONAL ASSISTANT
    // ==================================================
    
    // To-Do List
    else if (lowerCmd.includes("list") && (lowerCmd.includes("add") || lowerCmd.includes("read") || lowerCmd.includes("clear") || lowerCmd.includes("what") || lowerCmd.includes("delete"))) {
        assistantFeature.handleToDo(command, speak);
    }
    // Alarms
    else if (lowerCmd.includes("alarm") || lowerCmd.includes("wake me up")) {
        assistantFeature.setAlarm(lowerCmd, speak);
    }
    // Personal Schedule
    else if (lowerCmd.includes("schedule") && (lowerCmd.includes("read") || lowerCmd.includes("add to") || lowerCmd.includes("what is") || lowerCmd.includes("my"))) { 
        assistantFeature.manageSchedule(command, speak);
    }

    // ==================================================
    // 7. SYSTEM AUTOMATION
    // ==================================================

    // System Scheduler
    else if (lowerCmd.startsWith("schedule") || lowerCmd.includes("daily")) {
        schedulerFeature.setupSchedule(lowerCmd, speak);
    }
    // Email Trigger
    else if (lowerCmd.startsWith("send email to") || lowerCmd.startsWith("send an email to")) {
        const rawEmail = lowerCmd.replace(/send (an )?email to/i, "").trim();
        emailState.active = true;
        emailState.step = 1;
        emailState.to = rawEmail;
        speak(`Initializing email protocol for ${rawEmail}. What is the subject?`);
    }

    // ==================================================
    // 8. ADVANCED APP CONTROL (SPOTIFY & BROWSER)
    // ==================================================

    // Advanced Spotify
    else if (lowerCmd.includes("spotify")) {
        if (lowerCmd.includes("search") || lowerCmd.includes("play") || lowerCmd.includes("web") || lowerCmd.includes(" and ")) {
            await spotifyFeature.spotifyHandler(lowerCmd, speak);
        } else {
            systemFeature.openApp("spotify", speak);
        }
    }

    // Browser Compound ("Open Google and search...")
    else if (lowerCmd.includes("open") && lowerCmd.includes(" and ")) {
        await browserFeature.executeCompoundCommand(lowerCmd, speak);
    }

    // YouTube Music
    else if (
        lowerCmd.includes("play") || 
        lowerCmd.includes("bajao") || 
        lowerCmd.includes("sunao")
    ) {
        if (
            lowerCmd.includes("song") || 
            lowerCmd.includes("music") || 
            lowerCmd.includes("gaana") || 
            lowerCmd.includes("on youtube")
        ) {
            await browserFeature.playOnYouTube(lowerCmd, speak);
        }
    }

    // ==================================================
    // 9. SYSTEM CONTROL & TOOLS
    // ==================================================

    // Direct Dictation ("Type hello world")
    else if (lowerCmd.startsWith("type ") || lowerCmd.startsWith("write ") || lowerCmd.startsWith("dictate ")) {
        await desktopFeature.typeText(command, speak);
    }

    // App Launcher
    else if (lowerCmd.startsWith("open ") && !lowerCmd.includes(" and ") && !lowerCmd.includes("youtube") && !lowerCmd.includes("google")) {
        const appName = lowerCmd.replace("open ", "").trim();
        systemFeature.openApp(appName, speak);
    }
    // File Manager
    else if (
        lowerCmd.includes("create folder") || 
        lowerCmd.includes("make folder") || 
        lowerCmd.includes("create file") || 
        (lowerCmd.includes("delete") && (lowerCmd.includes("file") || lowerCmd.includes("folder")))
    ) {
        systemFeature.manageFiles(lowerCmd, speak);
    }
    // System Stats
    else if (lowerCmd.includes("system status") || lowerCmd.includes("battery") || lowerCmd.includes("cpu")) {
        systemFeature.getSystemInfo(speak);
    }

    // Generic Coding Trigger (Fallback)
    else if (isCodingCommand(lowerCmd)) {
        console.log("👨‍💻 Architect Protocol Triggered");
        await codingFeature.handleCodeGeneration(command, speak, AI_KEY);
    }
    // Mouse
    else if (lowerCmd.includes("move mouse") || lowerCmd.includes("click") || lowerCmd.includes("scroll") || lowerCmd.includes("double click")) {
        if (lowerCmd.includes("scroll")) await desktopFeature.controlScroll(lowerCmd);
        else await desktopFeature.controlMouse(lowerCmd, speak);
    }
    // Keyboard
    else if (lowerCmd.includes("switch window") || lowerCmd.includes("close window") || lowerCmd.includes("copy") || lowerCmd.includes("paste") || lowerCmd.includes("press enter")) {
        await desktopFeature.controlKeyboard(lowerCmd, speak);
    }
    // Volume & Security
    else if (lowerCmd.includes("volume") || lowerCmd.includes("mute")) {
        systemFeature.executeVolume(lowerCmd, speak);
    }
    else if (lowerCmd.includes("lock") || lowerCmd.includes("shutdown")) {
        systemFeature.executeSecurity(lowerCmd, speak);
    }
    // Weather
    else if (lowerCmd.includes("weather")) {
        const data = await weatherFeature.executeWeather(WEATHER_KEY, speak);
        if (data) {
            event.sender.send('update-weather', { temp: data.temp, desc: data.desc });
            event.sender.send('ai-response', data.text);
        }
    }
    // Memory
    else if (lowerCmd.includes("remember that") || lowerCmd.includes("remember to")) {
        let info = lowerCmd.replace(/jarvis|remember that|remember to/gi, "").trim();     
        memoryFeature.saveMemory(info, speak);
    }

    // ==================================================
    // 10. AI FALLBACK
    // ==================================================
    else {
        const response = await aiFeature.fetchAIResponse(command, AI_KEY);
        speak(response);
        event.sender.send('ai-response', response);
    }
});

// --- HELPER FUNCTIONS ---

function isCodingCommand(cmd) {
    const actionWords = ["write", "create", "generate", "make", "code"];
    const targetWords = ["script", "code", "python", "javascript", "html", "program", "app"];
    if (cmd.includes("code a")) return true;
    return actionWords.some(w => cmd.includes(w)) && targetWords.some(w => cmd.includes(w));
}

function speak(text) {
    if (mainWindow) mainWindow.webContents.send('speak-text', text);
}

// DASHBOARD UPDATER
setInterval(() => {
    osUtils.cpuUsage((v) => {
        const cpu = (v * 100).toFixed(0);
        const mem = (100 - (osUtils.freememPercentage() * 100)).toFixed(0);
        if (mainWindow && !mainWindow.isDestroyed()) {
             mainWindow.webContents.send('update-stats', { cpu, mem });
        }
    });
}, 2000);