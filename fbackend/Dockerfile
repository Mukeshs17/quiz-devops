# Small official Python image
FROM python:3.12-slim

# the pipeline passes the short commit code here, so the web page shows which version is running
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION
ENV PYTHONUNBUFFERED=1

# Working directory-a container-kulla create panna
WORKDIR /app

# Unga current folder files-a copy panna (. . nu irukkanum)
COPY . .
# run as a normal user (safer than root)
RUN useradd -m appuser
USER appuser

# Render gives its own PORT value; 8080 is the default for local runs
ENV PORT=8080
EXPOSE 8080

CMD ["python", "app.py"]
