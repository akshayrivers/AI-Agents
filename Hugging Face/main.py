from asyncio import Task
from smolagents import load_tool, CodeAgent, LiteLLMModel,DuckDuckGoSearchTool,GradioUI, PromptTemplates, Tool
import os
import re 
# Load Image Generation Tool
image_generation_tool = Tool.from_space(
    "black-forest-labs/FLUX.1-schnell",
    name="image_generator",
    description="Generate an image from a prompt"
)

# Initialize the Llama 3 model running locally via Ollama
model = LiteLLMModel(
    model_id="ollama_chat/llama3.2",
    api_base="http://localhost:11434",
    api_key=None,  
    num_ctx=8192,  # Context size
)

# Custom Web Search Tool based on DuckDuckGo
class CustomDuckDuckGoSearchTool(Tool):
    name = "wiki"   # Rename so that generated code calling wiki() will work.
    description = "Searches the web using DuckDuckGo and returns a concise result as a string."
    inputs = {
        "query": {
            "type": "string",
            "description": "The search query."
        }
    }
    output_type = "string"
    
    def forward(self, query: str):
        # Use the original DuckDuckGoSearchTool and wrap its output.
        original_tool = DuckDuckGoSearchTool()
        result = original_tool(query)
        # Process the markdown output to extract the first search result.
        matches = re.findall(r'\[(.*?)\]\((.*?)\)', result)
        if matches:
            title, url = matches[0]
            return f"{title}: {url}"
        else:
            return result

# Create an instance of the custom web search tool.
custom_web_search_tool = CustomDuckDuckGoSearchTool()

# Image Generation Agent
image_generation_agent = CodeAgent(
    tools=[image_generation_tool],
    model=model,
    name="image_generation",
    description="Generates images from text descriptions.",
    additional_authorized_imports=["PIL.Image", "PIL.ImageDraw", "os","json","wiki"],
    

)

# Web Search Agent using our custom web search tool.
# We add "json" to additional_authorized_imports and use our custom tool to ensure proper output handling.
web_search_agent = CodeAgent(
    tools=[custom_web_search_tool],
    model=model,
    name="web_search",
    description="Runs web searches for you. Give it your query as an argument.",
    additional_authorized_imports=["json"],
    max_steps=3
)

manager_prompt_templates = {
    "system_prompt": (
        "You are a manager agent. Your job is to analyze the user's query and directly delegate it to the appropriate specialized agent. "
        "If the query contains any of the keywords 'generate', 'create', 'draw', or 'picture', delegate it to the image_generation_agent. "
        "Do not add any commentary—output only the code snippet that directly calls the appropriate agent with the provided prompt."
    ),
    "planning": {
        "initial_plan": (
            "1. Check if the query includes visual keywords such as 'generate', 'create', 'draw', or 'picture'.\n"
            "2. If yes, delegate to the image_generation_agent.\n"
            "3. Produce a single Python code snippet that directly calls the image_generation_agent with the provided prompt."
        ),
        "initial_facts": "The query is for image generation if it contains visual descriptive keywords.",
        "update_facts_pre_messages": "Retain only facts related to visual image generation.",
        "update_facts_post_messages": "No additional facts are required; proceed to delegation.",
        "update_plan_pre_messages": "Ensure the plan only involves delegating to the correct agent.",
        "update_plan_post_messages": "Finalize the plan and produce a single concise code snippet for delegation."
    },
    "managed_agent": (
        "Delegate the task by outputting only one Python code snippet that calls the appropriate tool. "
        "For an image generation task, use this exact format:\n\n"
        "```py\n"
        "result = image_generation_agent.run(\"<prompt>\")\n"
        "result.show()\n"
        "```\n\n"
        "Replace `<prompt>` with the user's intended image description."
    ),
    "final_answer": (
        "Your final answer must be a single Python code snippet that directly delegates the task. "
        "For image generation, output only the following code snippet:\n\n"
        "```py\n"
        "result = image_generation_agent.run(\"<prompt>\")\n"
        "result.show()\n"
        "```\n\n"
        "Replace `<prompt>` with the user's intended image description. Do not include any extra text or analysis."
    )
}

manager_agent = CodeAgent(
    tools=[],
    model=model,
    # prompt_templates=manager_prompt_templates,
    name="manager_agent",
    description="Decides whether to run image generation based on the query.",
    managed_agents=[image_generation_agent],
    planning_interval=3,
)


# testing search tool - passed (it works)
# You can test the custom web search tool directly to see its output:
# query = "virat kohli"
# print("Web Search Result:", custom_web_search_tool("virat kohli"))

# testing image generation tool - passed (this works)
# prompt_text = "A white monkey holding a sword in a fantasy setting."
# result = image_generation_tool(prompt=prompt_text)
# result.show()



# Test individual  agents
# web_search_agent.run("virat kohli")

# To test individual  agents with Gradio UI
# GradioUI(image_generation_agent).launch()

# final test
# image_generation_agent.run("generate a picture of a brave warrior from India")
manager_agent.initialize_system_prompt()
manager_agent.run("generate a picture of a brave warrior from India")