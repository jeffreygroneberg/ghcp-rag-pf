# GHCP RAG PromptFlow Extension

This repository contains a GitHub Copilot (GHCP) extension that interacts with an existing RAG (Retrieval-Augmented Generation) endpoint using [Azure ML PromptFlow](https://learn.microsoft.com/azure/machine-learning/prompt-flow/overview). The code here demonstrates how to set up a minimal Node.js server, parse incoming requests, and forward them to a PromptFlow endpoint for processing.

---

## Table of Contents
- [GHCP RAG PromptFlow Extension](#ghcp-rag-promptflow-extension)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)

---

## Overview
This project serves as a **starting point (skeleton)** for creating further **GitHub Copilot extensions** that call **existing RAG endpoints**. It demonstrates:
- How to receive and parse requests from GHCP.  
- How to call a remote PromptFlow endpoint.  
- How to parse the response and structure output events.  

---

## Features
- **Express.js Server**: Launches REST endpoints (`GET` and `POST`) to handle requests.  
- **PromptFlow Integration**: Makes POST calls to a remote RAG endpoint using `fetch`.  
- **Event Streaming**: Uses utility methods (`createAckEvent`, `createTextEvent`, `createDoneEvent`) to stream events back to clients.  
- **GitHub Authentication**: Retrieves the GitHub user login via `X-GitHub-Token` header.

---
