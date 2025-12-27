const axios = require('axios');

async function executeWeather(apiKey, speak) {
    if (!apiKey) {
        speak("Weather API key missing.");
        return "Error: No API Key";
    }
    speak("Scanning local atmosphere...");
    try {
        const CITY = "kanpur"; // CHANGE THIS to your city
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${apiKey}&units=metric`;
        
        const res = await axios.get(url);
        const temp = Math.round(res.data.main.temp);
        const desc = res.data.weather[0].description;
        
        const report = `It is ${temp} degrees celsius with ${desc}.`;
        speak(report);
        return { text: report, temp: `${temp}`, desc: desc.toUpperCase() };
    } catch (e) {
        speak("Weather satellite offline.");
        return null;
    }
}

module.exports = { executeWeather };