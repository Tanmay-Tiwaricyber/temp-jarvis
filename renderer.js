const { ipcRenderer } = require('electron');

// --- UI ELEMENTS ---
const statusDisplay = document.getElementById('status');
const reactor = document.getElementById('reactor');
const chatWindow = document.getElementById('chatWindow');
const commandInput = document.getElementById('commandInput');
const micBtn = document.getElementById('micBtn');

// --- CHESS UI ELEMENTS (MARK XXI) ---
const centerPanel = document.getElementById('centerPanel');
const chessBoard = document.getElementById('chessBoard');

// --- AUDIO ELEMENTS ---
const sndStart = document.getElementById('snd-start');
const sndListen = document.getElementById('snd-listen');
const sndSuccess = document.getElementById('snd-success');

// --- HELPER: SAFE SOUND PLAYER ---
function playSound(audioElement) {
    if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.warn("Audio blocked:", e.message));
    }
}

// ==================================================
// 1. BOOT SEQUENCE
// ==================================================
window.onload = () => {
    runBootSequence();
};

function runBootSequence() {
    // 1. Play Startup Sound
    if (sndStart) {
        sndStart.volume = 0.5;
        playSound(sndStart);
    }

    // 2. Simulated System Logs
    const logs = [
        "Initializing Core Systems...",
        "Loading Neural Engine...",
        "Connecting to Secure Server...",
        "Calibrating Visual Sensors...",
        "Memory Modules: OPTIMAL",
        "Network: SECURE",
        "System Online."
    ];

    let delay = 0;
    logs.forEach((log) => {
        setTimeout(() => {
            addToChat(log, 'log');
        }, delay);
        delay += 600; // 0.6s delay between logs
    });

    // 3. Final Welcome
    setTimeout(() => {
        addToChat("Welcome back, Sir. All systems are operational.", 'ai');
        statusDisplay.innerText = "ONLINE";
        
        // Announce via Voice
        speak("Welcome back, Sir. Systems Online.");
        
        // Start Listening
        try { recognition.start(); } catch(e) {}
    }, delay + 500);
}

// ==================================================
// 2. DASHBOARD UPDATES
// ==================================================

ipcRenderer.on('update-stats', (event, data) => {
    document.getElementById('cpu').innerText = data.cpu + "%";
    document.getElementById('ram').innerText = data.mem + "%";

    const cpuBar = document.getElementById('cpu-bar');
    const ramBar = document.getElementById('ram-bar');
    
    if (cpuBar) {
        cpuBar.style.width = data.cpu + "%";
        cpuBar.style.background = data.cpu > 80 ? "#ff0055" : "#00f3ff";
    }
    if (ramBar) {
        ramBar.style.width = data.mem + "%";
    }
});

ipcRenderer.on('update-weather', (event, data) => {
    document.getElementById('weather').innerText = `${data.temp}°C`;
});

ipcRenderer.on('update-mood', (event, mood) => {
    const moodDisplay = document.getElementById('mood-display');
    if (moodDisplay) moodDisplay.innerText = mood.toUpperCase();
});

// ==================================================
// MARK XXI: CHESS UI LOGIC
// ==================================================

const chessPieces = {
    'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', // Black
    'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'  // White
};

ipcRenderer.on('update-chess', (event, fen) => {
    if (!fen) {
        centerPanel.classList.remove('mode-chess');
        statusDisplay.innerText = "ONLINE";
        return;
    }
    centerPanel.classList.add('mode-chess');
    statusDisplay.innerText = "CHESS ACTIVE";
    renderBoard(fen);
});

function renderBoard(fen) {
    chessBoard.innerHTML = "";
    const rows = fen.split(" ")[0].split("/");
    let isWhite = true;

    rows.forEach((row, rowIndex) => {
        let colIndex = 0;
        for (let char of row) {
            if (!isNaN(char)) {
                for (let i = 0; i < parseInt(char); i++) {
                    createSquare(rowIndex, colIndex, "", isWhite);
                    isWhite = !isWhite;
                    colIndex++;
                }
            } else {
                createSquare(rowIndex, colIndex, chessPieces[char], isWhite);
                isWhite = !isWhite;
                colIndex++;
            }
        }
        isWhite = !isWhite;
    });
}

function createSquare(r, c, pieceChar, isWhite) {
    const div = document.createElement('div');
    div.className = `chess-square ${isWhite ? 'white-sq' : 'black-sq'}`;
    
    if (pieceChar) {
        const span = document.createElement('span');
        span.className = 'piece';
        span.innerText = pieceChar;
        if ("♙♖♘♗♕♔".includes(pieceChar)) {
            span.style.color = "#00f3ff"; 
            span.style.textShadow = "0 0 5px #00f3ff";
        } else {
            span.style.color = "#bc13fe"; 
            span.style.textShadow = "0 0 5px #bc13fe";
        }
        div.appendChild(span);
    }
    chessBoard.appendChild(div);
}

// ==================================================
// 3. CHAT LOGGING
// ==================================================

function addToChat(text, type) {
    const div = document.createElement('div');
    if (type === 'log') {
        div.className = 'msg log';
        div.style.color = '#0ff';
        div.style.opacity = '0.7';
        div.style.fontSize = '11px';
        div.style.fontStyle = 'italic';
        div.innerText = `> ${text}`;
    } else {
        div.className = `msg ${type}`;
        div.innerText = type === 'user' ? `> ${text}` : text;
    }
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ==================================================
// 4. SPEECH RECOGNITION (ENGLISH ONLY)
// ==================================================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false; 
recognition.lang = 'en-US'; // <--- CHANGED TO ENGLISH
recognition.interimResults = false;

let isProcessing = false;
let isManualListen = false; 

recognition.onstart = function() {
    document.body.classList.add('listening');
    statusDisplay.innerText = isManualListen ? "LISTENING..." : "STANDING BY";
};

recognition.onend = function() {
    if (!isProcessing) {
        document.body.classList.remove('listening');
        if (!centerPanel.classList.contains('mode-chess')) {
             statusDisplay.innerText = "ONLINE";
        }
        try { recognition.start(); } catch(e) {}
    }
    isManualListen = false;
};

recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript.toLowerCase();
    
    if (isManualListen) {
        processCommand(transcript);
    } else {
        const wakeWords = ["jarvis", "travis", "service", "system", "computer", "hey jarvis"];
        const isWakeWord = wakeWords.some(w => transcript.includes(w));

        if (isWakeWord) {
            let cleanCmd = transcript;
            wakeWords.forEach(w => { cleanCmd = cleanCmd.replace(w, "") });
            cleanCmd = cleanCmd.trim();

            if (cleanCmd) {
                processCommand(cleanCmd);
            } else {
                playSound(sndListen);
                statusDisplay.innerText = "AWAITING COMMAND...";
            }
        }
    }
};

function processCommand(cmd) {
    isProcessing = true;
    playSound(sndListen);
    statusDisplay.innerText = "PROCESSING...";
    statusDisplay.style.color = "#0ff";
    addToChat(cmd, 'user');
    ipcRenderer.send('run-command', cmd);
}

// ==================================================
// 5. INPUT CONTROLS
// ==================================================

commandInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const text = commandInput.value;
        if (text.trim()) {
            commandInput.value = "";
            processCommand(text);
        }
    }
});

micBtn.addEventListener("mousedown", () => {
    isManualListen = true;
    playSound(sndListen);
    recognition.stop();
});

// ==================================================
// 6. TTS (ENGLISH ONLY)
// ==================================================

function speak(text) {
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.rate = 1.0;
    speech.pitch = 1.0;

    // --- ENGLISH VOICE SELECTION ---
    const voices = window.speechSynthesis.getVoices();
    
    // 1. Try Google US English
    let selectedVoice = voices.find(v => v.name.includes("Google US English"));

    // 2. Fallback: Microsoft David/Mark (Windows Default)
    if (!selectedVoice) {
        selectedVoice = voices.find(v => v.name.includes("David") || v.name.includes("Mark"));
    }

    // 3. Fallback: Any English Voice
    if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith("en"));
    }

    if (selectedVoice) {
        speech.voice = selectedVoice;
    }

    speech.onstart = () => { 
        document.body.classList.add('listening');
        statusDisplay.innerText = "SPEAKING";
    };
    
    speech.onend = () => { 
        document.body.classList.remove('listening');
        if (!centerPanel.classList.contains('mode-chess')) {
            statusDisplay.innerText = "ONLINE";
        } else {
            statusDisplay.innerText = "CHESS ACTIVE";
        }
        isProcessing = false;
    };
    
    window.speechSynthesis.speak(speech);
}

ipcRenderer.on('speak-text', (event, text) => {
    speak(text);
});

ipcRenderer.on('ai-response', (event, text) => {
    addToChat(text, 'ai');
    playSound(sndSuccess);
});