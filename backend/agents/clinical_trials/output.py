"""Structured output for the clinical-trials agent."""

from __future__ import annotations

from pydantic import BaseModel, Field


class AgentResponse(BaseModel):
    """The agent's final answer for one turn."""

    message: str = Field(
        description=(
            "Natural-language answer for the patient, written in warm, plain, "
            "everyday language and rendered as Markdown. Re-explain trial "
            "information in your own words rather than copying raw technical text. "
            "When presenting or comparing trials, structure it to scan: short "
            "headers, bold for key facts, a table only when comparing three or "
            "more trials; emojis are rare (at most one or two per answer). The "
            "first time a technical term appears (e.g. a phase code, ECOG, "
            "metastatic), mark it up inline as [[term||a short lay meaning]] "
            "instead of a parenthetical; define each term inline only once. "
            "Explain what terms mean and who a trial is for; do not judge whether "
            "the patient personally qualifies. Cite each referenced trial inline "
            "by its NCT number in square brackets, e.g. [NCT01234567]."
        )
    )
    used_nct_numbers: list[str] = Field(
        default_factory=list,
        description=(
            "NCT numbers of the trials actually used to answer this turn "
            "(not every trial a tool returned)."
        ),
    )
    follow_up_questions: list[str] = Field(
        default_factory=list,
        description=(
            "OPTIONAL. Leave empty during early open-ended gathering (before the "
            "cancer type is known, or when you are only asking the patient what "
            "cancer they have). Populate with 2-4 short suggested replies ONLY once "
            "you know at least the cancer type and are presenting or refining "
            "trials. When populated, each is a quick prompt in the patient's own "
            "voice that helps them refine toward the right trial: add a missing "
            "detail, go deeper on a trial, or clarify their diagnosis (e.g. 'Only "
            "recruiting trials', 'Trials closer to me', 'Tell me about the first "
            "one'). These are options for the patient to send next, NOT questions "
            "you ask them."
        ),
    )
