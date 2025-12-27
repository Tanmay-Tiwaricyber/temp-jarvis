let conversationHistory = [];
const MAX_TURNS = 10; // Remember last 10 messages

function addMessage(role, content) {
    conversationHistory.push({ role, content });
    if (conversationHistory.length > MAX_TURNS) {
        conversationHistory.shift(); // Remove oldest
    }
}

function getHistory() {
    return conversationHistory;
}

function clearHistory() {
    conversationHistory = [];
}

module.exports = { addMessage, getHistory, clearHistory };