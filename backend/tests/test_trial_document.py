from services.documents import compose_trial_document
from tests.factories import make_orm_trial


def test_composes_labeled_sections_with_deduped_cancer_types() -> None:
    trial = make_orm_trial(
        "NCT1",
        sites=(
            ("Montréal", "Quebec", ("Breast Cancer", "Lung Cancer")),
            ("Toronto", "Ontario", ("Breast Cancer",)),
        ),
    )
    doc = compose_trial_document(trial)
    assert "Title: A trial" in doc
    assert "Cancer types: Breast Cancer, Lung Cancer" in doc
    assert "Inclusion criteria: Adults with the condition." in doc


def test_omits_missing_and_blank_sections() -> None:
    trial = make_orm_trial("NCT1")
    trial.description_en = "   "
    doc = compose_trial_document(trial)
    assert "Description:" not in doc
    assert "Official title:" not in doc
