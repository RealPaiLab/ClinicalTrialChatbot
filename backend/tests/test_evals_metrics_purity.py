import ast
from collections.abc import Iterator
from pathlib import Path

FORBIDDEN_TOP_LEVEL = (
    "schemas",
    "agents",
    "services",
    "repository",
    "models",
    "core",
    "routes",
)

METRICS_DIR = Path(__file__).resolve().parent.parent / "evals" / "metrics" / "generic"


def _imported_modules(path: Path) -> Iterator[str]:
    tree = ast.parse(path.read_text())
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                yield alias.name
        elif isinstance(node, ast.ImportFrom) and node.module is not None:
            yield node.module


def test_metrics_package_is_domain_blind() -> None:
    offenders: list[str] = []
    for path in METRICS_DIR.rglob("*.py"):
        for module in _imported_modules(path):
            if module.split(".")[0] in FORBIDDEN_TOP_LEVEL:
                offenders.append(f"{path.name} imports {module}")
    assert not offenders, offenders
