from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent import graph

app = FastAPI(
    title="FinRAG API",
    description="AI-powered Financial Report Analysis System",
)

# Configure CORS to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    query: str


@app.post("/chat")
def chat(request: ChatRequest):
    """Process a financial query through the RAG pipeline and return the analysis."""
    try:
        result = graph.invoke({"query": request.query})
        return {"response": result["response"]}
    except Exception as e:
        error_msg = str(e)
        if "doesn't exist" in error_msg:
            return {
                "response": "⚠️ **Collection not found.** The Qdrant collection `finrag_fpt` has not been created yet. "
                "Please run the data preparation notebook first to ingest documents into Qdrant Cloud."
            }
        return {
            "response": f"⚠️ **Error processing your query:** {error_msg}"
        }

