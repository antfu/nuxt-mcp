#!/bin/bash

# Release script for Nuxt Fullstack MCP
# Usage: ./scripts/release.sh [version]
# Example: ./scripts/release.sh 2.0.0

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

# Check if version is provided
if [ -z "$1" ]; then
    log_error "Version not provided. Usage: ./scripts/release.sh [version]"
    exit 1
fi

VERSION="$1"
TAG="v$VERSION"

log_info "Starting release process for version $VERSION"

# Validate version format (semver)
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*)?$ ]]; then
    log_error "Invalid version format. Please use semantic versioning (e.g., 2.0.0, 2.0.0-beta.1)"
    exit 1
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    log_warning "You're not on the main branch (current: $CURRENT_BRANCH)"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Release cancelled"
        exit 0
    fi
fi

# Check if working directory is clean
if [[ -n $(git status --porcelain) ]]; then
    log_error "Working directory is not clean. Please commit or stash your changes."
    exit 1
fi

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
    log_error "Tag $TAG already exists"
    exit 1
fi

# Pull latest changes
log_info "Pulling latest changes..."
git pull origin main

# Run tests
log_info "Running tests..."
if ! pnpm test; then
    log_error "Tests failed"
    exit 1
fi

# Run integration tests
log_info "Running integration tests..."
if ! pnpm test:integration; then
    log_error "Integration tests failed"
    exit 1
fi

# Run linting
log_info "Running linting..."
if ! pnpm lint; then
    log_error "Linting failed"
    exit 1
fi

# Run type checking
log_info "Running type check..."
if ! pnpm typecheck; then
    log_error "Type checking failed"
    exit 1
fi

# Build packages
log_info "Building packages..."
if ! pnpm build; then
    log_error "Build failed"
    exit 1
fi

# Update version in package.json files
log_info "Updating version in package.json files..."
npm version "$VERSION" --no-git-tag-version
cd packages/nuxt-mcp && npm version "$VERSION" --no-git-tag-version && cd ../..
cd packages/vite-plugin-mcp && npm version "$VERSION" --no-git-tag-version && cd ../..

# Update CHANGELOG.md with release date
log_info "Updating CHANGELOG.md..."
if [ -f CHANGELOG.md ]; then
    sed -i.bak "s/## \[$VERSION\] - .*$/## [$VERSION] - $(date +%Y-%m-%d)/" CHANGELOG.md
    rm CHANGELOG.md.bak
    log_success "CHANGELOG.md updated"
else
    log_warning "CHANGELOG.md not found"
fi

# Commit version changes
log_info "Committing version changes..."
git add .
git commit -m "chore: release v$VERSION

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Cloud <noreply@anthropic.com>"

# Create and push tag
log_info "Creating and pushing tag $TAG..."
git tag -a "$TAG" -m "Release $TAG

This release includes:
- Enhanced fullstack development capabilities
- Professional UI/UX design expert integration
- Complete accessibility compliance tools
- Advanced design system creation
- Landing page conversion optimization
- Dashboard UX patterns and best practices

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin main
git push origin "$TAG"

log_success "Tag $TAG created and pushed"

# Test Docker build locally
log_info "Testing Docker build locally..."
if ! docker build -t "nuxt-fullstack-mcp:$VERSION" .; then
    log_error "Docker build failed"
    exit 1
fi

log_success "Docker build successful"

# Cleanup test image
docker rmi "nuxt-fullstack-mcp:$VERSION" 2>/dev/null || true

log_success "Release process completed!"
log_info "GitHub Actions will now:"
log_info "  1. Run full test suite"
log_info "  2. Publish to NPM"
log_info "  3. Build and push Docker images"
log_info "  4. Create GitHub release with changelog"
log_info ""
log_info "Monitor the release at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
log_info "Docker images will be available at: https://hub.docker.com/r/nuxt-fullstack-mcp"