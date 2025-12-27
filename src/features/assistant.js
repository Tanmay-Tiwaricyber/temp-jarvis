const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule'); // Reusing the library we installed earlier

// DATABASE FILE
const DATA_FILE = path.join(process.cwd(), 'assistant_data.json');

// Default Data Structure
const defaultData = {
    todos: [],
    schedule: [],
    alarms: []
};

// 1. LOAD / SAVE DATABASE
function loadData() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 2. TO-DO LIST MANAGER
function handleToDo(command, speak) {
    const data = loadData();
    const lower = command.toLowerCase();

    // ADD ITEM
    if (lower.includes("add to my list") || lower.includes("add task")) {
        const item = command.replace(/add to my list|add task|add/gi, "").trim();
        data.todos.push(item);
        saveData(data);
        speak(`Added "${item}" to your to-do list.`);
    } 
    // READ LIST
    else if (lower.includes("read my list") || lower.includes("what is on my list")) {
        if (data.todos.length === 0) {
            speak("Your to-do list is empty, sir.");
        } else {
            speak(`You have ${data.todos.length} items. They are: ${data.todos.join(", ")}.`);
        }
    }
    // CLEAR LIST
    else if (lower.includes("clear list") || lower.includes("delete list")) {
        data.todos = [];
        saveData(data);
        speak("To-do list cleared.");
    }
}

// 3. ALARM & REMINDER SYSTEM
function setAlarm(command, speak) {
    // "Set alarm for 14:30"
    const timeMatch = command.match(/(\d{1,2})[:.](\d{2})/);
    if (!timeMatch) {
        speak("Please specify the time like 14:30.");
        return;
    }

    let hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    
    // Simple PM logic
    if (command.includes("pm") && hour < 12) hour += 12;

    const data = loadData();
    data.alarms.push({ time: `${hour}:${minute}`, active: true });
    saveData(data);

    speak(`Alarm set for ${hour}:${minute}.`);

    // Schedule the job immediately
    const rule = new schedule.RecurrenceRule();
    rule.hour = hour;
    rule.minute = minute;

    schedule.scheduleJob(rule, function(){
        speak("Attention sir! This is your alarm.");
        console.log("⏰ ALARM RINGING!");
        // Optional: Play a sound file here using 'exec'
    });
}

// 4. DAILY SCHEDULE
// "My schedule is meeting at 10, lunch at 2"
function manageSchedule(command, speak) {
    const data = loadData();
    
    if (command.toLowerCase().includes("read schedule")) {
        if (data.schedule.length === 0) speak("Your schedule is clear.");
        else speak(`Here is your schedule: ${data.schedule.join(". ")}`);
    } else {
        // "Add to schedule: Meeting at 5pm"
        const item = command.replace(/add to schedule|schedule/gi, "").trim();
        data.schedule.push(item);
        saveData(data);
        speak("Schedule updated.");
    }
}

module.exports = { handleToDo, setAlarm, manageSchedule };