import {GoogleGenerativeAI} from "@google/generative-ai";
import readlineSync from "readline-sync";
import dotenv from "dotenv";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
dotenv.config();

// AI agents step by step 
// 1. real time weather integration with ai 
// 2. query with databases(CRUD)
// 3. AI Calendar assisstant

const fetchWeatherForecast = async (location) => {
   const weather_API_KEY = process.env.Weather_API_KEY;
   console.log(weather_API_KEY);
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
  
  // Call the function
  fetchWeatherForecast("jammu");
  
// AI PROMPT TO HANDLE REQUESTS
// Here we will instruct in what steps our AI model should handle the requests- Start - Plan-> Execute -> Observe->Return->End
const SYSTEM_PROMPT = ``;

// const result = await model.generateContent(prompt);
// console.log(result.response.text());