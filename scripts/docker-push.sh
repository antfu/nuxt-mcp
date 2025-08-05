#!/bin/bash

# Docker push script for Nuxt Fullstack MCP
# Usage: ./scripts/docker-push.sh [version] [tag]
# Example: ./scripts/docker-push.sh 2.0.0 latest

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuration
REGISTRY="docker.io"
IMAGE_NAME="nuxt-fullstack-mcp"
VERSION=${1:-"latest"}
ADDITIONAL_TAG=${2:-""}

log_info "Starting Docker build and push process"
log_info "Version: $VERSION"
log_info "Registry: $REGISTRY"
log_info "Image: $IMAGE_NAME"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if logged in to Docker Hub
if ! docker info | grep -q "Username:"; then
    log_warning "Not logged in to Docker Hub"
    log_info "Please run: docker login"
    exit 1
fi

# Build multi-platform image
log_info "Building multi-platform Docker image..."
docker buildx create --use --name multiplatform-builder 2>/dev/null || docker buildx use multiplatform-builder

TAGS="$REGISTRY/$IMAGE_NAME:$VERSION"
if [ -n "$ADDITIONAL_TAG" ]; then
    TAGS="$TAGS,$REGISTRY/$IMAGE_NAME:$ADDITIONAL_TAG"
fi

log_info "Building and pushing with tags: $TAGS"

docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --tag "$REGISTRY/$IMAGE_NAME:$VERSION" \
    $([ -n "$ADDITIONAL_TAG" ] && echo "--tag $REGISTRY/$IMAGE_NAME:$ADDITIONAL_TAG") \
    --push \
    .

log_success "Docker image built and pushed successfully!"

# Test the pushed image
log_info "Testing the pushed image..."
docker pull "$REGISTRY/$IMAGE_NAME:$VERSION"

# Run a quick test
log_info "Running quick container test..."
CONTAINER_ID=$(docker run -d -p 3001:3000 "$REGISTRY/$IMAGE_NAME:$VERSION")

# Wait for container to start
sleep 10

# Check if container is running
if docker ps | grep -q "$CONTAINER_ID"; then
    log_success "Container is running successfully"
    
    # Test health check if available
    if curl -f http://localhost:3001/__mcp/health 2>/dev/null || curl -f http://localhost:3001 2>/dev/null; then
        log_success "Health check passed"
    else
        log_warning "Health check endpoint not available (this might be expected)"
    fi
else
    log_error "Container failed to start"
    docker logs "$CONTAINER_ID"
fi

# Cleanup
docker stop "$CONTAINER_ID" 2>/dev/null || true
docker rm "$CONTAINER_ID" 2>/dev/null || true

log_success "Docker push process completed!"
log_info ""
log_info "Image available at:"
log_info "  docker pull $REGISTRY/$IMAGE_NAME:$VERSION"
if [ -n "$ADDITIONAL_TAG" ]; then
    log_info "  docker pull $REGISTRY/$IMAGE_NAME:$ADDITIONAL_TAG"
fi
log_info ""
log_info "Run with:"
log_info "  docker run -p 3000:3000 $REGISTRY/$IMAGE_NAME:$VERSION"
log_info ""
log_info "Or use docker-compose:"
log_info "  docker-compose up -d"