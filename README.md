# AI-Agents

This repository contains several AI agents built using Gemini models. Currently, the implemented agent is the **Weather AI Agent**. Future planned agents include a **Todo AI Agent** and an **AI Calendar Assistant**.

## 1. Weather AI Agent

The Weather AI Agent is designed to process user queries through a chain-of-thought approach. It retrieves real-time weather data using the Tomorrow.io API and generates a final, consolidated output. The agent works by following these steps:

- **Plan:** The AI plans which data to fetch.
- **Action:** It calls the weather fetching function.
- **Observation:** The fetched weather data is used to inform the final answer.
- **Output:** Only the final output (e.g., "The sum of the temperatures is ...") is shown to the user.

### Key Features

- **Real-Time Data:** Fetches current weather information using the Tomorrow.io API.
- **Chain-of-Thought Reasoning:** Uses a structured process (Plan → Action → Observation → Output) to generate responses.
- **Continuous Chat:** Maintains a chat session where only the final output is displayed.

## 2. Todo AI Agent
### Key Features vision:
- Google tasks integration
- Voice integration

## 3. Calendar AI Agent
### Key Features vision:
- Integration with zapier and google calendar 
- Should work as personal assistant for scheduling meetings and reminders