const schedule = require('node-schedule');
const { exec } = require('child_process');
const systemFeature = require('./system');

// Store active jobs so we can cancel them if needed
let scheduledJobs = [];

function setupSchedule(command, speak) {
    // Command format expected: "Schedule [Action] at [Time]"
    // Example: "Schedule open spotify at 9:00" or "Schedule lock pc at 22:00"
    
    // 1. EXTRACT TIME
    // Regex to find HH:MM (24-hour format preferred for simplicity, or we parse AM/PM)
    const timeMatch = command.match(/(\d{1,2})[:.](\d{2})/);
    
    if (!timeMatch) {
        speak("I could not identify the time, sir. Please use format like 9:30 or 22:00.");
        return;
    }

    let hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);

    // Handle "PM" roughly if user says "9 30 pm"
    if (command.toLowerCase().includes("pm") && hour < 12) {
        hour += 12;
    }

    speak(`Scheduling task for ${hour}:${minute}.`);

    // 2. DEFINE THE RULE
    const rule = new schedule.RecurrenceRule();
    rule.hour = hour;
    rule.minute = minute;

    // 3. IDENTIFY ACTION
    const job = schedule.scheduleJob(rule, function(){
        console.log("⏰ Executing Scheduled Task...");
        
        if (command.includes("lock")) {
            systemFeature.executeSecurity("lock", () => {});
        } 
        else if (command.includes("shutdown")) {
            systemFeature.executeSecurity("shutdown", () => {});
        }
        else if (command.includes("wifi off")) {
            // Windows command to turn off WiFi (Requires Admin usually)
            exec('netsh interface set interface "Wi-Fi" admin=disable');
        }
        else if (command.includes("open")) {
            // Extract app name: "schedule open code at..."
            const appName = command.split("open ")[1].split(" at")[0].trim();
            exec(`start ${appName}`); // Tries to launch app
        }
    });

    scheduledJobs.push(job);
    speak("Task confirmed. I will execute it at the designated time.");
}

module.exports = { setupSchedule };