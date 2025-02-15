process.env.TAVILY_API_KEY = "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";

import { Ollama } from "@langchain/ollama";
import { Tool } from "langchain/tools";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fetch from "node-fetch";
import { MemorySaver } from "@langchain/langgraph";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage, SystemMessage  } from "@langchain/core/messages";

// -----------------------------------------------------------------------------
// 0. Create a Custom Tool Subclass
// -----------------------------------------------------------------------------
class MyTool extends Tool {
  constructor(options) {
    super(options);
    // Explicitly assign the provided function to _call
    this._call = options.func;
  }
}

// -----------------------------------------------------------------------------
// 1. Define Your Custom Tools Using MyTool
// -----------------------------------------------------------------------------

// Tool for web searching
const webSearchTool = new MyTool({
  name: "WebSearch",
  description: "Use this tool to search the web for up-to-date information.",
  func: async (query) => {
    console.log(`Searching the web for: ${query}`);
    try {
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`
      );
      
      // Log the raw response (for debugging)
      const rawData = await response.text();
      console.log("Raw response from search API:", rawData);

      // Attempt to parse the response as JSON
      const data = JSON.parse(rawData);
      
      let result = "No results found.";
      if (data.Results && data.Results.length > 0 && data.Results[0].Text) {
        result = data.Results[0].Text;
      } else if (data.AbstractText) {
        result = data.AbstractText;
      } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        const first = data.RelatedTopics[0];
        if (first.Text) {
          result = first.Text;
        }
      }
      return result;
    } catch (error) {
      console.error("Error during web search:", error);
      return "Error performing web search.";
    }
  },
});

// Tool for reading PDFs
const pdfReaderTool = new MyTool({
  name: "PDFReader",
  description: "Use this tool to read and extract information from a PDF file.",
  func: async (filePath) => {
    try {
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();
      if (docs && docs.length > 0) {
        return docs[0].pageContent;
      }
      return "No content found in PDF.";
    } catch (error) {
      return "Error reading PDF file.";
    }
  },
});

// All tools used in the workflow
const tools = [webSearchTool, pdfReaderTool,new TavilySearchResults({ maxResults: 3 })];

// -----------------------------------------------------------------------------
// 2. Initialize the LLM (Ollama) and Bind the Tools
// -----------------------------------------------------------------------------

const llm = new Ollama({
  model: "deepseek-r1:1.5b" ,
  temperature: 0.9,
  streaming: true,
});

// For compatibility: if bindTools is not available, add it.
if (typeof llm.bindTools !== "function") {
  llm.bindTools = (tools) => {
    llm.tools = tools;
    return llm;
  };
}

// Bind the tools to the LLM.
llm.bindTools(tools);

// -----------------------------------------------------------------------------
// 3. Define Workflow Nodes and Edges
// -----------------------------------------------------------------------------

// Node: Agent (calls the LLM with current messages)
async function callAgent(state) {
  const response = await llm.invoke(state.messages);
  return { messages: [response] };
}

// Node: Tools (executes any tool calls from the LLM)
const toolNode = new ToolNode(tools);

// Conditional: Determine whether to route to the tools node.
function shouldContinue({ messages }) {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  return "__end__";
}

// Create the workflow graph.
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callAgent)
  .addEdge("__start__", "agent")
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

// Compile the workflow.
const app = workflow.compile();

// -----------------------------------------------------------------------------
// 4. Test Direct Tool Invocation (for Debugging)
// -----------------------------------------------------------------------------

(async () => {
    // Define a system prompt that instructs the assistant to use tools when appropriate.
    const systemPrompt = new SystemMessage(
      "You are an AI assistant that has access to external tools. " +
      "When a user asks for a pdfReaderTool summary,Do not ask for permission directly use the PDFReader tool with the file path given by user to extract and summarize the text and then provide the summary. " +
      "When the query requires up-to-date information or a web search, use the appropriate web search tool. " +
      "Always provide accurate and concise responses using the output from these tools when applicable."
    );
  
    // Start a conversation with the system message and a user query.
    const initialState = await app.invoke({
      messages: [
        systemPrompt,
        new HumanMessage("Can you summarize the pdf in ./sample.pdf?")
      ],
    });
    console.log("Initial Response:", initialState.messages[initialState.messages.length - 1].content);
  
    // Follow up with another question.
    const followupState = await app.invoke({
      messages: [
        ...initialState.messages,
        new HumanMessage("Yes I give you all the permssions. But directly using the tool Can you summarize the pdf in './sample.pdf'. the file path is './sample.pdf'?")
      ],
    });
    console.log("Follow-up Response:", followupState.messages[followupState.messages.length - 1].content);
  
  // const pdfResult = await pdfReaderTool.invoke("sample.pdf");
  // console.log("Direct PDF reader invocation result:", pdfResult);
})();
