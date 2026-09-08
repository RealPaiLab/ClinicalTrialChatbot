"""Site coordinator contacts."""

from __future__ import annotations

from pydantic import BaseModel, Field

from schemas.trial import TrialSiteInfo


class SiteContact(BaseModel):
    """One research coordinator at a site."""

    full_name: str | None = None
    email: str | None = None
    phone_number: str | None = None
    phone_extension: str | None = None


class SiteContacts(BaseModel):
    """A site and the coordinators reachable there; the list may be empty."""

    site: TrialSiteInfo
    contacts: list[SiteContact] = Field(default_factory=list)


class TrialContacts(BaseModel):
    """Every site of a trial, with its contacts."""

    trial_ref: str
    sites: list[SiteContacts] = Field(default_factory=list)
