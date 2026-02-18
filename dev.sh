#!/bin/bash
# Script: dev.sh
# Created: 2026-02-18
# Purpose: Start Docker development environment with BuildKit cache
# Keywords: docker, development, buildkit, hot-reload
# Status: active

set -e

echo "Starting Food Delivery App development environment..."
echo "=================================================="

# Enable BuildKit for better caching
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Check if .env.local exists, create from example if not
if [ ! -f .env.local ]; then
    if [ -f .env.example ]; then
        echo "Creating .env.local from .env.example..."
        cp .env.example .env.local
        echo "Please update .env.local with your configuration"
    fi
fi

# Build and start containers
echo ""
echo "Building and starting containers..."
docker compose -f docker-compose.dev.yml up --build "$@"
