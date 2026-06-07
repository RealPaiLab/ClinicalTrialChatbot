from __future__ import annotations

from urllib.parse import quote

import httpx

from core.config import get_settings
from core.logger import get_logger
from schemas.glossary import GlossaryDefinition, GlossarySource

logger = get_logger(__name__)

_GLOSSARY_PATH = {
    GlossarySource.CANCER_TERMS: "Cancer.gov/Patient/en",
    GlossarySource.GENETICS: "Genetics/HealthProfessional/en",
}


def _definition_text(definition: object) -> str | None:
    if not isinstance(definition, dict):
        return None
    text = definition.get("text")
    return text.strip() if isinstance(text, str) and text.strip() else None


def _first_definition(
    payload: object, source: GlossarySource, name_key: str
) -> list[GlossaryDefinition]:
    if not isinstance(payload, dict):
        return []
    results = payload.get("results")
    if not isinstance(results, list):
        return []
    for item in results:
        if not isinstance(item, dict):
            continue
        name = item.get(name_key)
        text = _definition_text(item.get("definition"))
        if isinstance(name, str) and text:
            return [GlossaryDefinition(source=source, term=name, definition=text)]
    return []


class GlossaryRepository:
    """Looks up plain-language definitions from the NCI dictionaries."""

    def __init__(
        self,
        *,
        transport: httpx.AsyncBaseTransport | None = None,
        timeout: float = 5.0,
    ) -> None:
        settings = get_settings()
        self._transport = transport
        self._glossary_base = settings.nci_glossary_base_url.rstrip("/")
        self._drug_base = settings.nci_drug_dictionary_base_url.rstrip("/")
        self._timeout = timeout

    async def define(
        self, term: str, source: GlossarySource
    ) -> list[GlossaryDefinition]:
        term = term.strip()
        if not term:
            return []
        try:
            async with httpx.AsyncClient(
                transport=self._transport, timeout=self._timeout
            ) as client:
                return await self._lookup(client, term, source)
        except (httpx.HTTPError, ValueError) as exc:
            logger.warning(
                "Glossary lookup failed for %r (%s): %s", term, source.value, exc
            )
            return []

    async def _lookup(
        self, client: httpx.AsyncClient, term: str, source: GlossarySource
    ) -> list[GlossaryDefinition]:
        if source is GlossarySource.DRUGS:
            return await self._lookup_drugs(client, term)
        return await self._lookup_glossary(client, term, source)

    async def _lookup_glossary(
        self, client: httpx.AsyncClient, term: str, source: GlossarySource
    ) -> list[GlossaryDefinition]:
        url = (
            f"{self._glossary_base}/Terms/search/{_GLOSSARY_PATH[source]}/{quote(term)}"
        )
        response = await client.get(url, params={"size": 1})
        response.raise_for_status()
        return _first_definition(response.json(), source, "termName")

    async def _lookup_drugs(
        self, client: httpx.AsyncClient, term: str
    ) -> list[GlossaryDefinition]:
        params: dict[str, str | int] = {
            "query": term,
            "matchType": "Begins",
            "size": 1,
        }
        response = await client.get(f"{self._drug_base}/Drugs/search", params=params)
        response.raise_for_status()
        return _first_definition(response.json(), GlossarySource.DRUGS, "name")
