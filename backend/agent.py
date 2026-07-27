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


class GraphState(TypedDict):
    query: str
    chat_history: list
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
        "You also have access to the chat history to understand the conversational context (e.g., if the user asks a follow-up question without naming the company, refer to the previous messages). "
        "Always base your answers strictly on the retrieved context. If the data is not in the context, strictly say 'I don't know' or 'The provided context does not contain this information.' "
        "STRICT CITATION RULE: You MUST append a citation badge at the end of ANY sentence containing specific numerical data, strategic claims, or facts. "
        "Format the citation exactly like this, using the source name provided in the context, enclosed in backticks and brackets: `[Source: Filename.pdf]`.\n\n"
        f"### Annual Report Context:\n{state['context']}"
    )

    messages = [SystemMessage(content=system_prompt)]
    
    # Append chat history
    for msg in state.get("chat_history", []):
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        else:
            from langchain_core.messages import AIMessage
            messages.append(AIMessage(content=msg["content"]))
            
    # Append current query
    messages.append(HumanMessage(content=state["query"]))

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
