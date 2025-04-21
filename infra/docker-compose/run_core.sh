#!/bin/bash

echo "🔍 Checking Python requirements..."

pip install -r requirements.txt

echo "🚀 Starting Core Services..."
docker compose -f docker-compose.core_services.yml up -d --build

