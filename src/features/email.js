const { exec } = require('child_process');
const { keyboard, Key } = require('@nut-tree-fork/nut-js');

async function sendEmail(to, subject, body, speak) {
    // 1. FORMAT THE EMAIL ADDRESS
    // Voice input usually says "at" and "dot". We fix that here.
    const cleanEmail = to.toLowerCase()
        .replace(/ at /g, "@")
        .replace(/ dot /g, ".")
        .replace(/\s/g, ""); // Remove spaces

    speak(`Preparing email to ${cleanEmail}`);

    // 2. OPEN GMAIL COMPOSE WINDOW
    // We use a special URL that fills the 'To' field automatically
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${cleanEmail}`;
    exec(`start chrome "${gmailUrl}"`);

    // 3. WAIT FOR GMAIL TO LOAD
    // Gmail is heavy, let's give it 7 seconds to be safe
    await new Promise(r => setTimeout(r, 7000));

    // 4. TYPE SUBJECT
    // (Focus usually starts in the 'Subject' field automatically with this URL)
    speak("Typing subject.");
    await keyboard.type(subject);
    await new Promise(r => setTimeout(r, 1000));

    // 5. MOVE TO BODY (Press Tab)
    await keyboard.pressKey(Key.Tab);
    await keyboard.releaseKey(Key.Tab);
    await new Promise(r => setTimeout(r, 500));

    // 6. TYPE MESSAGE
    speak("Typing message.");
    await keyboard.type(body);
    await new Promise(r => setTimeout(r, 1000));

    // 7. SEND (Ctrl + Enter)
    speak("Sending email now.");
    await keyboard.pressKey(Key.LeftControl, Key.Enter);
    await keyboard.releaseKey(Key.LeftControl, Key.Enter);
}

module.exports = { sendEmail };