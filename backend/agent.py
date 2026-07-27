import os
from typing import TypedDict

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, START, END

from retriever import retrieve_financial_context

load_dotenv()

def get_llm():
    return ChatGroq(
        temperature=0,
        model_name="llama-3.3-70b-versatile",
        api_key=os.getenv("GROQ_API_KEY"),
    )


# Define the graph state
class GraphState(TypedDict):
    query: str
    context: str
    response: str


def retrieve_node(state: GraphState) -> dict:
    """Retrieve relevant financial context for the user's query."""
    context = retrieve_financial_context(state["query"])
    return {"context": context}


def generate_node(state: GraphState) -> dict:
    """Generate an analytical response using the retrieved context."""
    system_prompt = (
        "You are a Senior Corporate & Financial Analyst expert in Top Vietnamese Corporations. "
        "You have access to context extracted from the 2025 Annual Reports of 5 specific companies: "
        "Vinamilk, MB Bank, Hoa Phat, FPT, and Vingroup. "
        "Analyze the following context from their annual reports and answer the user's question with precision, clarity, and professional insight. "
        "Always base your answers strictly on the retrieved context. Cite specific numbers, strategic goals, or initiatives when available. "
        "If the user asks a general question (e.g., 'What is the revenue?' or 'What is the strategy?'), you must clarify which company they are asking about. "
        "If the user asks for a comparison between companies, handle it smoothly based on the provided context.\n\n"
        f"### Annual Report Context:\n{state['context']}"
    )

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=state["query"]),
    ]

    result = get_llm().invoke(messages)
    return {"response": result.content}


# Build and compile the LangGraph state graph
workflow = StateGraph(GraphState)

workflow.add_node("retrieve_node", retrieve_node)
workflow.add_node("generate_node", generate_node)

workflow.add_edge(START, "retrieve_node")
workflow.add_edge("retrieve_node", "generate_node")
workflow.add_edge("generate_node", END)

graph = workflow.compile()
