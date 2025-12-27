const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const aiFeature = require('./ai'); 
const { keyboard, Key } = require('@nut-tree-fork/nut-js'); 

// 1. SETUP WORKSPACE
// This creates a folder named "jarvis_workspace" in your project root
const WORKSPACE_DIR = path.join(process.cwd(), 'jarvis_workspace');

if (!fs.existsSync(WORKSPACE_DIR)) {
    console.log("📂 Creating workspace folder...");
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

// 2. MAIN FUNCTION
async function handleCodeGeneration(prompt, speak, apiKey) {
    speak("Initializing Architect Protocol. Generating code...");
    console.log(`\n🏗️ WORKSPACE: ${WORKSPACE_DIR}`);

    // A. STRICT PROMPT FOR AI
    const systemPrompt = `You are a Professional Code Generator. 
    Output ONLY valid code. 
    NO explanations. NO markdown blocks (like \`\`\`python). 
    Just the raw code text.`;
    
    // B. FETCH CODE FROM AI
    try {
        const rawCode = await aiFeature.fetchAIResponse(`${prompt}. Write the full code.`, apiKey, systemPrompt);
        
        // Cleanup response (remove markdown backticks if AI adds them)
        let cleanCode = rawCode
            .replace(/```python/g, "")
            .replace(/```javascript/g, "")
            .replace(/```html/g, "")
            .replace(/```/g, "")
            .trim();

        // C. DETERMINE FILE EXTENSION & NAME
        let filename = "script_" + Date.now() + ".js"; // Default unique name

        if (prompt.toLowerCase().includes("python")) {
            filename = "script_" + Date.now() + ".py";
        } else if (prompt.toLowerCase().includes("html")) {
            filename = "index_" + Date.now() + ".html";
        }

        const filePath = path.join(WORKSPACE_DIR, filename);

        // D. SAVE THE FILE
        fs.writeFileSync(filePath, cleanCode);
        console.log(`💾 Saved to: ${filePath}`);
        
        speak(`Code generated. Opening Visual Studio Code.`);

        // E. OPEN VS CODE AND RUN
        // 1. Open the Workspace Folder first
        exec(`code "${WORKSPACE_DIR}"`, (err) => {
            if (err) {
                console.error("Error opening VS Code:", err);
                return;
            }
            
            // 2. Wait 1.5s for window to appear, then Open the specific File
            setTimeout(() => {
                exec(`code "${filePath}"`);
                
                // 3. Wait 4s for extensions (Code Runner) to load, then Run
                speak("Running code now.");
                setTimeout(async () => {
                    console.log("⌨️ Triggering Code Runner (Ctrl + Alt + N)...");
                    
                    try {
                        // Press Ctrl + Alt + N
                        await keyboard.pressKey(Key.LeftControl, Key.LeftAlt, Key.N);
                        await keyboard.releaseKey(Key.LeftControl, Key.LeftAlt, Key.N);
                    } catch (kErr) {
                        console.error("Keyboard Error:", kErr);
                    }
                    
                }, 4000); // 4 seconds delay to be safe
                
            }, 1500);
        });

    } catch (e) {
        console.error("❌ CRITICAL ERROR:", e);
        speak("I encountered an error generating the code.");
    }
}

module.exports = { handleCodeGeneration };