FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Trỏ đúng file server (src/api/server.py)
CMD ["python", "src/api/server.py"]