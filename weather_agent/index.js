import { config } from "dotenv";
config();
import {GoogleGenerativeAI} from "@google/generative-ai";
import readlineSync from "readline-sync";

// AI agents step by step 
// 1. real time weather integration with ai 
// 2. query with databases(CRUD)
// 3. AI Calendar assisstant

const fetchWeatherForecast = async (location) => {
   const weather_API_KEY =  process.env.Weather_API_KEY;
   //console.log(weather_API_KEY);
    const url = `https://api.tomorrow.io/v4/weather/realtime?location=${location}&apikey=${weather_API_KEY}`;
  
    try {
      const response = await fetch(url, {
        method: 'GET',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data); 
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
    }
  };
  
 //fetchWeatherForecast("Srinagar");
  
// AI PROMPT TO HANDLE REQUESTS
// Here we will instruct in what steps our AI model should handle the requests- Start -> Plan-> Observe->Output
const SYSTEM_PROMPT = `
  You are an AI Assistant with START , PLAN , OBSERVATION and Output STATE.
  Wait for the user prompt and first PLAN using available tools.
  After Planning, Take the action with appropriate tools and wait for Observation based on Action.
  Once you get teh observations, Return the AI response based on START prompt and OBSERVATION.

  Available tools:
  - function getWeatherForecast: This function will fetch the weather forecast for a given location.

  Example:
  START
  {"type":"user"."user":"What is sum of weather of Jammu and Srinagar? "}
  {"type":"plan","plan":"I will call the fetchWeatherForecast for jammu "}
  {"type":"action","function":"getWeatherForecast","params":{"location":"jammu"}}
  {"type":"observation","observation":"{
    data: {
      time: '2025-02-08T16:44:00Z',
      values: {
        cloudBase: 0.8,
        cloudCeiling: 0.8,
        cloudCover: 100,
        dewPoint: 4.6,
        freezingRainIntensity: 0,
        hailProbability: 71.6,
        hailSize: 6.65,
        humidity: 64,
        precipitationProbability: 0,
        pressureSurfaceLevel: 961,
        rainIntensity: 0,
        sleetIntensity: 0,
        snowIntensity: 0,
        temperature: 14,
        temperatureApparent: 14,
        uvHealthConcern: 0,
        uvIndex: 0,
        visibility: 16,
        weatherCode: 1001,
        windDirection: 66,
        windGust: 1.8,
        windSpeed: 0.6
      }
    },
    location: {
      lat: 32.768184661865234,
      lon: 74.92113494873047,
      name: 'Jammu, Jammu and Kashmir, India',
      type: 'administrative'
    }
  }"}
  {"type":"plan","plan":"I will call fetchWeatherForecast for Srinagar"}
  {"type":"action","function":"getWeatherForecast","params":{"location":"Srinagar"}}
  {"type":"observation","observation":"{
    data: {
      time: '2025-02-08T17:13:00Z',
      values: {
        cloudBase: 0.9,
        cloudCeiling: 0.9,
        cloudCover: 100,
        dewPoint: -10.2,
        freezingRainIntensity: 0,
        hailProbability: 74.1,
        hailSize: 6.84,
        humidity: 57,
        precipitationProbability: 0,
        pressureSurfaceLevel: 758,
        rainIntensity: 0,
        sleetIntensity: 0,
        snowIntensity: 0,
        temperature: 2.3,
        temperatureApparent: 0.2,
        uvHealthConcern: 0,
        uvIndex: 0,
        visibility: 16,
        weatherCode: 1001,
        windDirection: 57,
        windGust: 2,
        windSpeed: 2
      }
    },
    location: {
      lat: 34.11787796020508,
      lon: 74.9659194946289,
      name: 'Srinagar, Jammu and Kashmir, India',
      type: 'administrative'
    }
  }"}
  {"type":"Output","output":"The sum of temperature of Jammu and Srinagar is 2.3 + 14 = 16.3"}

`;

function extractFinalOutput(text) {
  // Regex to capture code blocks that start with ```json and end with ```
  const regex = /```json\s*([\s\S]*?)\s*```/g;
  let match;
  let finalOutput = null;
  while ((match = regex.exec(text)) !== null) {
    try {
      const jsonBlock = match[1];
      const obj = JSON.parse(jsonBlock);
      if (obj.type === "output") {
        finalOutput = obj.output;
      }
    } catch (err) {
      console.error("Error parsing JSON block:", err);
    }
  }
  return finalOutput;
}

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = client.getGenerativeModel({ model: "gemini-1.5-flash",systemInstruction: SYSTEM_PROMPT, });

async function runChat() {
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });

  console.log("Type your messages below. (Press Ctrl+C to exit.)\n");

  while (true) {
    const userInput = readlineSync.question("You: ");
    try {
      const result = await chat.sendMessage(userInput);
      const fullResponse = result.response.text();
      const finalOutput = extractFinalOutput(fullResponse);
      if (finalOutput) {
        console.log("AI:", finalOutput);
      } else {
        console.log("AI:", fullResponse);
      }
    } catch (error) {
      console.error("Error during chat:", error);
      break;
    }
  }
}

runChat();