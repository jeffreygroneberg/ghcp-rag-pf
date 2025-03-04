import { Octokit } from "@octokit/core";
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { createAckEvent, createDoneEvent, createTextEvent } from "@copilot-extensions/preview-sdk";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("I am a GitHub Copilot extension using a RAG PromptFlow endpoint to ask questions about Endeavor the Boardgame");
});

app.post("/", async (req, res) => {
  // Identify the user via GitHub
  const tokenForUser = req.get("X-GitHub-Token");
  const octokit = new Octokit({ auth: tokenForUser });
  const user = await octokit.request("GET /user");
  console.log("User:", user.data.login);

  // Parse the request payload
  const payload = req.body;
  console.log("Payload:", payload);

  const messages = payload.messages;
  const userMessage = messages[messages.length - 1].content;

  // Load environment variables
  const apiKey = process.env.API_KEY;
  const url = process.env.API_URL;
  const llm_deployment_name = process.env.LLM_DEPLOYMENT_NAME;

  if (!apiKey || !url) {
    throw new Error("API_KEY and API_URL must be provided via environment variables");
  }

  // Prepare request
  const requestHeaders = new Headers({ "Content-Type": "application/json" });
  requestHeaders.append("Authorization", "Bearer " + apiKey);
  requestHeaders.append("azureml-model-deployment", llm_deployment_name); // Optional explicit model deployment

  const requestBody = JSON.stringify({
    query: userMessage,
    chat_history: []
  });

  console.log("Request body:", requestBody);

  // Call the PromptFlow endpoint
  let promptFlowResponse;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: requestBody
    });

    if (!response.ok) {
      console.debug(...response.headers);
      console.debug(response.body);
      throw new Error("Request failed with status code " + response.status);
    }

    promptFlowResponse = await response.json();
  } catch (error) {
    console.error(error);
    return res.status(500).send("An error occurred while processing your request.");
  }

  // Send events
  const ackEvent = createAckEvent();
  const textEvent = createTextEvent(promptFlowResponse.reply);
  const doneEvent = createDoneEvent();

  res.write(ackEvent);
  res.write(textEvent);
  res.end(doneEvent);
});

const port = Number(process.env.PORT || "3000");
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export function convertMessagesFormat(messages) {
  const result = [];
  for (let i = 0; i < messages.length - 1; i += 2) {
    if (messages[i].role === "user" && messages[i + 1].role === "assistant") {
      result.push({
        inputs: { question: messages[i].content },
        outputs: { answer: messages[i + 1].content }
      });
    }
  }
  return result;
}