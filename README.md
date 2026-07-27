# FinRAG 📈 - Corporate & Financial AI Analyst

> **An Agentic RAG System for Deep Analysis of Vietnamese Corporate Annual Reports**

[![Frontend Status](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://finrag-assistant.vercel.app/)
[![Backend Status](https://img.shields.io/badge/Backend-Render-purple?logo=render)](https://finrag-backend-sdny.onrender.com/docs)
[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)

## 🌐 Live Demo

- **Frontend App**: [https://finrag-assistant.vercel.app/](https://finrag-assistant.vercel.app/)
- **Backend API Docs**: [https://finrag-backend-sdny.onrender.com/docs](https://finrag-backend-sdny.onrender.com/docs)

---

## 📖 Overview

FinRAG is an advanced AI-powered assistant designed to parse, understand, and analyze complex annual reports. Built as an end-to-end **Agentic RAG (Retrieval-Augmented Generation) pipeline**, it allows users to chat seamlessly with the corporate data of top-tier Vietnamese corporations.

### 📊 Supported Data Sources (2025 Annual Reports)
The system currently hosts the complete annual reports of the following major corporations, encompassing financial metrics, strategic goals, and ESG (Environmental, Social, Governance) directions:
- **Vinamilk** (VNM)
- **Vingroup** (VIC)
- **Hoa Phat** (HPG)
- **MB Bank** (MBB)
- **FPT Corporation** (FPT)

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **Complex Table Parsing** | Utilizes **LlamaParse** to accurately extract and preserve complex financial tables from raw PDF reports. |
| **Agentic State Orchestration** | Employs **LangGraph** for intelligent routing, ensuring robust state management between retrieval and generation. |
| **High-Performance Retrieval** | Uses **Qdrant Cloud** for blazing-fast vector similarity search, enabling instantaneous context fetching. |
| **Rapid AI Inference** | Powered by the highly capable **Llama-3.3-70B-Versatile** model via **Groq's** ultra-fast API architecture. |
| **Memory-Optimized Deployment** | HuggingFace Inference API completely eliminates local PyTorch overhead, running easily within 512MB RAM constraints on Render. |
| **Sleek, Responsive UI** | Modern frontend built with **React** and **Tailwind CSS**, featuring dark mode, system theme detection, and rich markdown rendering. |

---

## 🏗️ System Architecture & Workflow

The system relies on a decoupled frontend and backend, using LangGraph to orchestrate Retrieval and Generation intelligently.

```mermaid
graph TD
    User([User]) -->|Asks Question| UI[Frontend: React + Vite on Vercel]
    UI -->|POST /chat| API[Backend: FastAPI on Render]
    
    subgraph LangGraph RAG Agent
        API -->|Query| Agent[LangGraph StateGraph]
        Agent --> Retriever[Retrieve Node]
        Agent --> Generator[Generate Node]
    end

    Retriever -->|Embed Query| HF[HuggingFace API: BAAI/bge-m3]
    HF -->|Vector| Qdrant[(Qdrant Vector DB)]
    Qdrant -->|Return Top-K Nodes| Retriever
    
    Retriever -->|Pass Context| Generator
    Generator -->|Generate Analysis| Groq[Groq API: Llama-3.3-70b]
    Groq -->|Return Answer| Generator
    
    Generator -->|Final Response| API
    API -->|Display Answer| UI
```

### How It Works:
1. **Data Ingestion (Offline)**: PDF annual reports are processed via LlamaParse, vectorized using the `bge-m3` embedding model, and ingested into **Qdrant Cloud**.
2. **Query Processing**: The user submits a natural language question via the React UI.
3. **Retrieval**: The FastAPI backend receives the query. LangGraph routes the state to the `retrieve_node`, which hits the Qdrant database to find the 5 most relevant document chunks.
4. **Generation**: The context is passed to the `generate_node`. The LLM (Llama-3.3-70B) is instructed with a strict system prompt to act as a Senior Corporate & Financial Analyst, citing specific numbers and strategies from the context.
5. **Response**: The final AI response is streamed back to the frontend and rendered elegantly using markdown.

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React, Vite, Tailwind CSS | UI components, state management, and styling. |
| **Backend** | FastAPI, Python 3.10+ | High-performance async API routing. |
| **Orchestration** | LangGraph, LangChain | Managing agent states and LLM wrappers. |
| **RAG Pipeline** | LlamaIndex | Core retrieval logic and vector store integration. |
| **Vector DB** | Qdrant Cloud | Scalable cloud database for storing document embeddings. |
| **Embeddings** | HuggingFace Inference API (`BAAI/bge-m3`) | Serverless generation of highly accurate text embeddings. |
| **LLM Provider** | Groq API (`llama-3.3-70b-versatile`) | Lightning-fast inference generation. |

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Accounts/API keys for **Groq**, **Qdrant Cloud**, and **HuggingFace**.

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Create your environment variables file
cp .env.example .env 
```

**Required `.env` variables:**
```env
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
GROQ_API_KEY=your_groq_api_key
HF_TOKEN=your_huggingface_token
```

```bash
# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*The backend API will run on `http://localhost:8000`*

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend will run on `http://localhost:5173`*

---

**Developed for technical demonstration and portfolio showcasing.**
