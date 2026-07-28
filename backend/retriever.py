import os
import time
import logging

# Prevent transformers from importing TensorFlow (avoids Keras 3 compatibility crash)
os.environ["TRANSFORMERS_NO_TF"] = "1"

from dotenv import load_dotenv

load_dotenv()

# Configure module-level logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

from qdrant_client import QdrantClient
from llama_index.core import Settings, VectorStoreIndex
from llama_index.vector_stores.qdrant import QdrantVectorStore
from llama_index.embeddings.huggingface_api import HuggingFaceInferenceAPIEmbedding

def get_index():
    # Configure the embedding model globally using HF Inference API
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
        collection_name="finrag_assistant_v2",
        enable_hybrid=False,
        fastembed_sparse_model=None,
    )
    return VectorStoreIndex.from_vector_store(vector_store=vector_store)


def retrieve_financial_context(query: str) -> str:
    """Retrieve the top 8 relevant financial document chunks for a given query.

    Includes a retry loop to handle HuggingFace Inference API cold start / 504 timeouts.

    Args:
        query: The user's financial question or search query.

    Returns:
        A single string of the top 8 retrieved nodes, concatenated with separators and sources.
    """
    retriever = get_index().as_retriever(similarity_top_k=8)

    max_attempts = 3
    last_exception = None
    for attempt in range(1, max_attempts + 1):
        try:
            logger.info(f"Retrieval attempt {attempt}/{max_attempts} for query: '{query[:60]}...'")
            nodes = retriever.retrieve(query)
            break  # Success — exit the retry loop
        except Exception as e:
            last_exception = e
            if attempt < max_attempts:
                logger.warning(
                    f"Hugging Face API cold start or timeout detected (attempt {attempt}/{max_attempts}). "
                    f"Waiting 20 seconds before retrying... Error: {e}"
                )
                time.sleep(20)
            else:
                logger.error(f"All {max_attempts} retrieval attempts failed. Raising final exception.")
                raise last_exception

    context_parts = []
    for node in nodes:
        source = node.metadata.get("file_name", "Unknown_Document")
        content = node.get_content().strip()
        context_parts.append(f"---\nSource: [{source}]\nContent: {content}\n---")

    return "\n\n".join(context_parts)
