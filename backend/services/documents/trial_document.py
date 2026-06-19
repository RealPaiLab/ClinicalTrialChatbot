from __future__ import annotations

from models.trial import Trial


def _text(value: str | None) -> str | None:
    return (value or "").strip() or None


def _site_cancer_types(trial: Trial) -> str | None:
    names = sorted({name for site in trial.sites for name in site.cancer_type_names})
    return ", ".join(names) or None


def compose_trial_document(trial: Trial) -> str:
    """One labeled-section document per trial (requires trial.sites loaded)."""
    sections: list[tuple[str, str | None]] = [
        ("Title", _text(trial.short_title_en)),
        ("Official title", _text(trial.official_title_en)),
        ("Cancer types", _site_cancer_types(trial)),
        ("Phases", ", ".join(trial.phases or []) or None),
        ("Treatment types", ", ".join(trial.treatment_type_names or []) or None),
        ("Interventions", ", ".join(trial.intervention_names or []) or None),
        ("Treatment lines", ", ".join(trial.treatment_lines or []) or None),
        ("Study type", _text(trial.study_type)),
        ("Purpose", _text(trial.purpose)),
        ("Description", _text(trial.description_en)),
        ("Inclusion criteria", _text(trial.inclusion_criteria_en)),
        ("Exclusion criteria", _text(trial.exclusion_criteria_en)),
    ]
    return "\n\n".join(f"{label}: {value}" for label, value in sections if value)
