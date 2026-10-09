FROM python:3.12-slim

ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}
ENV PORT=8080

WORKDIR /app

RUN useradd -m appuser

COPY app.py test_app.py ./

USER appuser

EXPOSE 8080

CMD ["python", "app.py"]
