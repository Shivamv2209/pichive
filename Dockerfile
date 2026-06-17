FROM python:3.12-bookworm

# Install Node 22
RUN apt-get update && apt-get install -y \
    curl \
    libgl1 \
    libglib2.0-0


RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy project files
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r worker/requirements.txt

# Download InsightFace model during build
RUN python worker/download_model.py

EXPOSE 3000

CMD ["node", "server.js"]