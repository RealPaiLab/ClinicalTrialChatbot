import os

from dotenv import load_dotenv
from langfuse import Langfuse, get_client
from pydantic_ai import Agent, InstrumentationSettings
from pydantic_ai.embeddings import Embedder

from core.logger import get_logger

load_dotenv()

logger = get_logger(__name__)


def setup_langfuse(environment: str) -> bool:
    """Initialise Langfuse tracing and instrument all pydantic-ai agents."""
    os.environ["LANGFUSE_TRACING_ENVIRONMENT"] = environment
    langfuse = get_client()
    try:
        connected = langfuse.auth_check()
        instrumentation = InstrumentationSettings(include_content=True)
        Agent.instrument_all(instrument=instrumentation)
        Embedder.instrument_all(instrument=instrumentation)
        if connected:
            logger.info("Langfuse client is authenticated and ready!")
        else:
            logger.warning(
                "Langfuse authentication failed. "
                "Please check your credentials and host."
            )
        return connected
    except Exception as ex:
        logger.warning(
            "Langfuse authentication failed. "
            f"Please check your credentials and host. {ex}"
        )
        return False


def get_langfuse_client() -> Langfuse:
    """FastAPI dependency that returns the shared Langfuse client."""
    return get_client()


def trace_id_from_session(session_id: str) -> str:
    """Deterministic trace id for a session, so all its turns share one trace."""
    return get_client().create_trace_id(seed=session_id)
