"""What one U-Link listing entry says, verbatim. This is the raw capture."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class Frozen(BaseModel):
    model_config = ConfigDict(frozen=True)


class UlinkContact(Frozen):
    role: str
    name: str | None = None
    email: str | None = None


class UlinkCentre(Frozen):
    id: str
    name: str
    lat: float | None = None
    lon: float | None = None
    contacts: list[UlinkContact] = Field(default_factory=list)


class UlinkRecord(Frozen):
    nid: str
    protocol_id: str | None
    title: str
    status: str | None
    diagnosis: str | None
    phase: str | None
    age: str | None
    randomisation: str | None
    treatment_lines: str | None
    routes: str | None
    last_posted: str | None
    nct_number: str | None
    sponsor: str | None
    investigators: str | None
    description: str | None
    inclusion_criteria: str | None
    exclusion_criteria: str | None
    centres: list[UlinkCentre] = Field(default_factory=list)
    # Filled from the pathology index, not the entry itself.
    cancer_types: list[str] = Field(default_factory=list)
