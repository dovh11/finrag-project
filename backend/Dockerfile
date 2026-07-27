FROM python:3.10-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend source code
COPY . .

# Expose port 8000 for the FastAPI server
EXPOSE 8000

# Command to run the application (Uses Render's dynamic $PORT or defaults to 8000)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
