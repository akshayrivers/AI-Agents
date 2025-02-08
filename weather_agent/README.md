# Weather Agent AI Chatbot

This project is an AI-powered chatbot that integrates real-time weather data with Google's Generative AI (Gemini-1.5-flash) using a chain-of-thought approach. The agent processes user queries through multiple steps—planning, taking action (e.g., fetching weather data), observing results, and finally providing a consolidated output.

The project demonstrates:
- **Real-Time Weather Integration:** Uses the Tomorrow.io API to fetch current weather data.
- **Chain-of-Thought Reasoning:** The AI is instructed via a custom system prompt to follow steps (Start → Plan → Action → Observation → Output) to generate its final answer.
- **Continuous Chat Session:** A persistent chat session is maintained, and only the final output is displayed to the user.
- **Environment Variable Configuration:** Uses the `dotenv` package to securely load API keys.

## Features

- **Real-Time Weather Data:** Retrieves weather details using the Tomorrow.io API.
- **AI Chain-of-Thought:** The agent plans and executes actions based on a multi-step reasoning process.
- **Output Extraction:** Only the final output is extracted and shown to the user, keeping intermediate steps hidden.
- **Continuous Chat:** Users can continuously interact with the bot through a command-line interface.

## Prerequisites

- Node.js
- npm 

## Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/akshayrivers/AI-Agents
   cd AI-Agents/weather_agent
2. **Install Dependencies:**
    ``` bash
    npm install
    ````
3. **Configure Environment Variables:**
Create a .env file in the project root with the following content:
    ``` bash
    GOOGLE_API_KEY: Your API key for accessing the Google Generative AI service.
    Weather_API_KEY: Your API key for the Tomorrow.io weather API.
    ```
4. **Running the Chatbot**

Start the application by running:
```
node index.js
```
You will see a prompt:

```
Type your messages below. (Press Ctrl+C to exit.)
Enter your query (e.g., "what is sum of weather of jammu and delhi?") 
```` 
and the bot will process your request using its multi-step reasoning process. Only the final output (e.g., "The sum of temperature of Jammu and Delhi is ...") will be displayed.

