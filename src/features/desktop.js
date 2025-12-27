const { mouse, left, right, up, down, Button, keyboard, Key } = require('@nut-tree-fork/nut-js');

// 1. MOUSE CONTROL (Preserved)
async function controlMouse(command, speak) {
    const distance = 100; // Pixels to move per command
    
    try {
        if (command.includes("move up")) {
            await mouse.move(up(distance));
        } else if (command.includes("move down")) {
            await mouse.move(down(distance));
        } else if (command.includes("move left")) {
            await mouse.move(left(distance));
        } else if (command.includes("move right")) {
            await mouse.move(right(distance));
        } 
        else if (command.includes("click") || command.includes("select")) {
            await mouse.click(Button.LEFT);
        } 
        else if (command.includes("right click")) {
            await mouse.click(Button.RIGHT);
        }
        else if (command.includes("double click")) {
            await mouse.doubleClick(Button.LEFT);
        }
    } catch (e) {
        console.error("Mouse Error:", e);
    }
}

// 2. SCROLLING (Preserved)
async function controlScroll(command) {
    if (command.includes("scroll down")) {
        await mouse.scrollDown(500); 
    } else if (command.includes("scroll up")) {
        await mouse.scrollUp(500);
    }
}

// 3. KEYBOARD SHORTCUTS (UPGRADED for VS Code & Productivity)
async function controlKeyboard(command, speak) {
    const lowerCmd = command.toLowerCase();

    // --- WINDOW MANAGEMENT ---
    if (lowerCmd.includes("switch window")) {
        if(speak) speak("Switching application.");
        await keyboard.pressKey(Key.LeftAlt, Key.Tab);
        await keyboard.releaseKey(Key.LeftAlt, Key.Tab);
    }
    else if (lowerCmd.includes("close window") || lowerCmd.includes("close app")) {
        if(speak) speak("Closing application.");
        await keyboard.pressKey(Key.LeftAlt, Key.F4);
        await keyboard.releaseKey(Key.LeftAlt, Key.F4);
    }
    
    // --- EDITING SHORTCUTS ---
    else if (lowerCmd.includes("select all")) {
        await keyboard.pressKey(Key.LeftControl, Key.A);
        await keyboard.releaseKey(Key.LeftControl, Key.A);
    }
    else if (lowerCmd.includes("copy")) {
        if(speak) speak("Copied.");
        await keyboard.pressKey(Key.LeftControl, Key.C);
        await keyboard.releaseKey(Key.LeftControl, Key.C);
    }
    else if (lowerCmd.includes("paste")) {
        if(speak) speak("Pasted.");
        await keyboard.pressKey(Key.LeftControl, Key.V);
        await keyboard.releaseKey(Key.LeftControl, Key.V);
    }
    else if (lowerCmd.includes("undo")) {
        if(speak) speak("Undoing last action.");
        await keyboard.pressKey(Key.LeftControl, Key.Z);
        await keyboard.releaseKey(Key.LeftControl, Key.Z);
    }

    // --- VS CODE / EDITOR SPECIFIC COMMANDS ---
    else if (lowerCmd.includes("save file") || lowerCmd.includes("save code")) {
        if(speak) speak("File saved.");
        await keyboard.pressKey(Key.LeftControl, Key.S);
        await keyboard.releaseKey(Key.LeftControl, Key.S);
    }
    else if (lowerCmd.includes("new file")) {
        if(speak) speak("Creating new file.");
        await keyboard.pressKey(Key.LeftControl, Key.N);
        await keyboard.releaseKey(Key.LeftControl, Key.N);
    }
    else if (lowerCmd.includes("terminal") || lowerCmd.includes("console")) {
        // Ctrl + ` (Backtick) opens terminal in VS Code
        await keyboard.pressKey(Key.LeftControl, Key.Grave);
        await keyboard.releaseKey(Key.LeftControl, Key.Grave);
    }
    else if (lowerCmd.includes("run code") || lowerCmd.includes("run program")) {
        // F5 is standard for running code in most IDEs
        if(speak) speak("Running program.");
        await keyboard.pressKey(Key.F5);
        await keyboard.releaseKey(Key.F5);
    }

    // --- NAVIGATION ---
    else if (lowerCmd.includes("enter")) {
        await keyboard.pressKey(Key.Enter);
        await keyboard.releaseKey(Key.Enter);
    }
}

// 4. TEXT TYPING (Preserved)
async function typeText(text, speak) {
    // Clean the command to get just the content to type
    const cleanText = text
        .toLowerCase()
        .replace("jarvis", "")
        .replace("open notepad", "")
        .replace("and", "")
        .replace("write", "")
        .replace("type", "")
        .replace("dictate", "")
        .replace("about", "")
        .trim();

    if (!cleanText) {
        if (speak) speak("I didn't hear any text to type.");
        return;
    }

    try {
        await keyboard.type(cleanText);
    } catch (e) {
        console.error("Typing Error:", e);
    }
}

// EXPORT ALL FUNCTIONS
module.exports = { 
    controlMouse, 
    controlScroll, 
    controlKeyboard, 
    typeText 
};