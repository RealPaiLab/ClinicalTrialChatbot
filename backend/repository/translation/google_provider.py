"""Google Cloud Translation v3, via the async (grpc_asyncio) client."""

from __future__ import annotations

from google.cloud.translate_v3 import (
    TranslateTextRequest,
    TranslationServiceAsyncClient,
)

from repository.translation.batching import batches
from schemas.language import Language

# v3 caps a single request at 30k codepoints and 1024 segments. Stay under both.
_MAX_REQUEST_CODEPOINTS = 25_000
_MAX_REQUEST_SEGMENTS = 512


class GoogleTranslationProvider:
    """Translates through Google Cloud Translation v3."""

    def __init__(
        self,
        *,
        project_id: str,
        timeout: float,
        client: TranslationServiceAsyncClient | None = None,
    ) -> None:
        self._parent = f"projects/{project_id}/locations/global"
        self._timeout = timeout
        self._client = client or TranslationServiceAsyncClient()

    async def translate(self, texts: list[str], target: Language) -> list[str]:
        if not texts:
            return []
        translated: list[str] = []
        for batch in batches(
            texts,
            max_codepoints=_MAX_REQUEST_CODEPOINTS,
            max_segments=_MAX_REQUEST_SEGMENTS,
        ):
            request = TranslateTextRequest(
                parent=self._parent,
                contents=batch,
                target_language_code=target.value,
                source_language_code=Language.EN.value,
                mime_type="text/plain",
            )
            response = await self._client.translate_text(
                request=request, timeout=self._timeout
            )
            translated.extend(t.translated_text for t in response.translations)
        if len(translated) != len(texts):
            raise ValueError(
                f"Translation returned {len(translated)} results "
                f"for {len(texts)} inputs"
            )
        return translated

    async def aclose(self) -> None:
        # The generated transport is untyped; close() hands back the aio channel's
        # close coroutine.
        await self._client.transport.close()  # type: ignore[no-untyped-call]
