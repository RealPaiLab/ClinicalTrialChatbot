FROM python:3.14-slim AS build

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

COPY pyproject.toml .python-version ./

RUN uv sync --no-dev --no-install-project --frozen


FROM python:3.14-slim AS run

WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app --no-create-home app

COPY --from=build /app/.venv /app/.venv

COPY --chown=app:app . .

USER app

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
