#!/bin/bash

echo "🔍 Checking Python requirements..."

pip install -r requirements.txt

echo "🚀 Starting Observability Stack..."
docker compose -f docker-compose.observability.yml up -d --build

