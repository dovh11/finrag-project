import os

# Prevent transformers from importing TensorFlow (avoids Keras 3 compatibility crash)
os.environ["TRANSFORMERS_NO_TF"] = "1"

from dotenv import load_dotenv

load_dotenv()

from qdrant_client import QdrantClient
from llama_index.core import Settings, VectorStoreIndex
from llama_index.vector_stores.qdrant import QdrantVectorStore
from llama_index.embeddings.huggingface import HuggingFaceInferenceAPIEmbedding

# Configure the embedding model globally using HF Inference API to save RAM
Settings.embed_model = HuggingFaceInferenceAPIEmbedding(
    model_name="BAAI/bge-m3",
    token=os.getenv("HF_TOKEN")
)

# Connect to Qdrant Cloud
qdrant_client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
)

# Initialize the vector store and index
vector_store = QdrantVectorStore(
    client=qdrant_client,
    collection_name="finrag_fpt",
    enable_hybrid=False,
    fastembed_sparse_model=None,
)
index = VectorStoreIndex.from_vector_store(vector_store=vector_store)


def retrieve_financial_context(query: str) -> str:
    """Retrieve the top 5 relevant financial document chunks for a given query.

    Args:
        query: The user's financial question or search query.

    Returns:
        A single string of the top 5 retrieved nodes, concatenated with separators.
    """
    retriever = index.as_retriever(similarity_top_k=5)
    nodes = retriever.retrieve(query)
    context = "\n\n---\n\n".join([node.get_content() for node in nodes])
    return context
