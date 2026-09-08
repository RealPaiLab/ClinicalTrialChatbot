"""Per-session conversation scratchpad the agent writes to."""

from __future__ import annotations

from pydantic import BaseModel, Field

MAX_NOTES = 25


class MemoryNote(BaseModel):
    """One free-text fact the agent recorded, stamped with the turn it came from."""

    turn: int
    text: str


class ConversationMemory(BaseModel):
    """Append-only notes; the newest note about a subject is the current one."""

    notes: list[MemoryNote] = Field(default_factory=list)

    def record(self, turn: int, text: str) -> None:
        """Append one note, ignoring blanks and notes already stored verbatim."""
        cleaned = text.strip()
        if not cleaned:
            return
        if any(note.text.casefold() == cleaned.casefold() for note in self.notes):
            return
        self.notes.append(MemoryNote(turn=turn, text=cleaned))
        del self.notes[:-MAX_NOTES]
