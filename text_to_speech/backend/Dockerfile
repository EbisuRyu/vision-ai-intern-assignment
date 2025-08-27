FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (git + build tools)
RUN apt-get update && \
    apt-get install -y git build-essential && \
    rm -rf /var/lib/apt/lists/*
    
# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run FastAPI app
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}"]