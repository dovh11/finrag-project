# FinRAG 📈 - Financial Report AI Assistant

> **An Agentic RAG System for Deep Financial Analysis of Top Vietnamese Corporations**

FinRAG is an AI-powered financial assistant capable of parsing, understanding, and analyzing complex annual reports. Built as an end-to-end Agentic RAG (Retrieval-Augmented Generation) pipeline, it allows users to chat with the financial data of top-tier Vietnamese corporations (FPT, Vinamilk, MB Bank, Hoa Phat, Vingroup).

## 🚀 Key Features

- **Complex Table Parsing**: Utilizes LlamaParse to accurately extract and preserve complex financial tables from PDF reports.
- **Stateful Orchestration**: Employs LangGraph for intelligent agent routing and state management.
- **High-Performance Retrieval**: Uses Qdrant Cloud for blazing-fast vector similarity search and hybrid retrieval capabilities.
- **Rapid Inference**: Powered by the highly capable Llama-3.3-70B model via Groq's ultra-fast API, delivering instantaneous analysis.
- **Sleek UI**: Modern, responsive frontend built with React and Tailwind CSS, featuring rich markdown and table rendering.

## 🛠️ Tech Stack

**Backend**
- Framework: [FastAPI](https://fastapi.tiangolo.com/)
- Orchestration: [LangGraph](https://python.langchain.com/docs/langgraph) & [LangChain](https://python.langchain.com/)
- RAG Pipeline: [LlamaIndex](https://www.llamaindex.ai/)

**Frontend**
- UI Framework: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- Styling: [Tailwind CSS](https://tailwindcss.com/)

**AI / ML**
- Embeddings: `BAAI/bge-m3` via HuggingFace
- Vector Database: [Qdrant Cloud](https://qdrant.tech/)
- LLM Provider: [Groq API](https://groq.com/) (Model: Llama-3.3-70b-versatile)
- Document Parsing: [LlamaParse](https://docs.llamaindex.ai/en/stable/llama_cloud/llama_parse/)

## 🧠 System Architecture

The pipeline is designed for high accuracy and speed:
1. **Data Ingestion**: PDF annual reports are processed using LlamaParse to ensure critical financial tables are preserved in markdown format.
2. **Vectorization**: Chunks are embedded using the robust `bge-m3` model and stored in Qdrant Cloud.
3. **Retrieval**: Upon receiving a query, the LlamaIndex retriever fetches the top 5 most relevant context nodes.
4. **Agentic Generation**: LangGraph orchestrates the flow, feeding the context and user query to the Llama-3.3-70B model with a strict system prompt tailored for senior financial analysis.

## 💻 Local Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- Accounts/API keys for Groq and Qdrant Cloud.

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Create your environment variables file
# Ensure you add QDRANT_URL, QDRANT_API_KEY, and GROQ_API_KEY
cp .env.example .env 

# Start the FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*The backend will run on `http://localhost:8000`*

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
