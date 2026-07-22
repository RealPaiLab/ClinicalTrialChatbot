import os

from dotenv import load_dotenv
from langfuse import Langfuse, get_client
from pydantic_ai import Agent, InstrumentationSettings
from pydantic_ai.embeddings import Embedder

from core.config import get_settings
from core.logger import get_logger

load_dotenv()

logger = get_logger(__name__)


def setup_langfuse() -> bool:
    """Initialise Langfuse tracing and instrument all pydantic-ai agents."""
    settings = get_settings()
    os.environ["LANGFUSE_TRACING_ENVIRONMENT"] = settings.environment.value
    capture_content = settings.capture_patient_text
    langfuse = get_client()
    try:
        connected = langfuse.auth_check()
        instrumentation = InstrumentationSettings(
            include_content=capture_content,
            include_binary_content=capture_content,
        )
        Agent.instrument_all(instrument=instrumentation)
        Embedder.instrument_all(instrument=instrumentation)
        if connected:
            logger.info(
                "Langfuse client is authenticated and ready! "
                "(environment=%s, trace content capture=%s)",
                settings.environment.value,
                "on" if capture_content else "off",
            )
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
