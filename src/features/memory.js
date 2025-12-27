const fs = require('fs');
const path = require('path');

// FIX: Use process.cwd() to find memory.json in the main project folder
const MEMORY_FILE = path.join(process.cwd(), 'memory.json');

// INTERNAL HELPER: Create file if it doesn't exist
function ensureMemoryFile() {
    if (!fs.existsSync(MEMORY_FILE)) {
        console.log("📂 Memory file missing. Creating new one at:", MEMORY_FILE);
        fs.writeFileSync(MEMORY_FILE, JSON.stringify([], null, 2));
    }
}

// 1. READ MEMORIES
function loadMemories() {
    ensureMemoryFile();
    try {
        const data = fs.readFileSync(MEMORY_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error("❌ Error loading memory:", e);
        return [];
    }
}

// 2. SAVE MEMORY
function saveMemory(text, speak) {
    ensureMemoryFile();
    console.log(`💾 Attempting to save: "${text}"`);

    const memories = loadMemories();
    const newMemory = {
        text: text,
        date: new Date().toLocaleString()
    };
    
    memories.push(newMemory);
    
    try {
        fs.writeFileSync(MEMORY_FILE, JSON.stringify(memories, null, 2));
        console.log("✅ Memory saved successfully!");
        speak("Memory stored successfully, sir.");
    } catch (e) {
        console.error("❌ Write Error:", e);
        speak("I encountered an error writing to my database.");
    }
}

// 3. READ MEMORY CONTEXT (For AI)
function getMemoryContext() {
    const memories = loadMemories();
    if (memories.length === 0) return "";
    
    // Format the memories into a text block for the AI
    const memoryBlock = memories.map(m => `- ${m.text} (Added: ${m.date})`).join("\n");
    return `\n[USER MEMORIES]:\n${memoryBlock}\n[END MEMORIES]\n`;
}

module.exports = { saveMemory, getMemoryContext };