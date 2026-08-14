"""Rendering the conversation scratchpad into the agent's instructions."""

from __future__ import annotations

from schemas.memory import ConversationMemory

_MEMORY_HEADER = """\
# Your notes on this patient

Facts you recorded earlier in this conversation, oldest first, with the turn they \
came from. Treat them as things the patient has already told you: never ask again \
for anything here. Where two notes conflict, the LATER one is current. If the \
patient's newest message contradicts a note, the message wins and you record the \
correction."""


def render_memory(memory: ConversationMemory) -> str | None:
    """Render the scratchpad as an instruction block, or None while it is empty."""
    if not memory.notes:
        return None
    lines = [
        f"{i}. (turn {note.turn}) {note.text}"
        for i, note in enumerate(memory.notes, start=1)
    ]
    return "\n\n".join([_MEMORY_HEADER, "\n".join(lines)])
